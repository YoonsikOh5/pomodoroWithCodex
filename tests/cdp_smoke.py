import base64
import json
import os
import random
import shutil
import socket
import struct
import subprocess
import tempfile
import time
import urllib.parse
import urllib.request


APP_URL = os.environ.get("APP_URL", "http://localhost:3000")


class CdpError(RuntimeError):
    pass


class WebSocket:
    def __init__(self, url):
        parsed = urllib.parse.urlparse(url)
        self.sock = socket.create_connection((parsed.hostname, parsed.port), timeout=10)
        key = base64.b64encode(os.urandom(16)).decode("ascii")
        resource = parsed.path + (f"?{parsed.query}" if parsed.query else "")
        request = (
            f"GET {resource} HTTP/1.1\r\n"
            f"Host: {parsed.hostname}:{parsed.port}\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            "Sec-WebSocket-Version: 13\r\n\r\n"
        )
        self.sock.sendall(request.encode("ascii"))
        response = self._recv_until(b"\r\n\r\n")
        if b" 101 " not in response.split(b"\r\n", 1)[0]:
            raise CdpError(f"WebSocket handshake failed: {response[:120]!r}")

    def _recv_until(self, marker):
        chunks = []
        data = b""
        while marker not in data:
            chunk = self.sock.recv(4096)
            if not chunk:
                raise CdpError("Socket closed during handshake")
            chunks.append(chunk)
            data = b"".join(chunks)
        return data

    def send_json(self, payload):
        data = json.dumps(payload).encode("utf-8")
        mask = os.urandom(4)
        header = bytearray([0x81])
        length = len(data)
        if length < 126:
            header.append(0x80 | length)
        elif length < 65536:
            header.append(0x80 | 126)
            header.extend(struct.pack("!H", length))
        else:
            header.append(0x80 | 127)
            header.extend(struct.pack("!Q", length))
        masked = bytes(byte ^ mask[index % 4] for index, byte in enumerate(data))
        self.sock.sendall(bytes(header) + mask + masked)

    def recv_json(self):
        while True:
            first = self._recv_exact(2)
            opcode = first[0] & 0x0F
            masked = first[1] & 0x80
            length = first[1] & 0x7F
            if length == 126:
                length = struct.unpack("!H", self._recv_exact(2))[0]
            elif length == 127:
                length = struct.unpack("!Q", self._recv_exact(8))[0]
            mask = self._recv_exact(4) if masked else b""
            payload = self._recv_exact(length) if length else b""
            if masked:
                payload = bytes(byte ^ mask[index % 4] for index, byte in enumerate(payload))
            if opcode == 8:
                raise CdpError("WebSocket closed")
            if opcode == 9:
                continue
            if opcode in (1, 2):
                return json.loads(payload.decode("utf-8"))

    def _recv_exact(self, length):
        data = b""
        while len(data) < length:
            chunk = self.sock.recv(length - len(data))
            if not chunk:
                raise CdpError("Socket closed")
            data += chunk
        return data

    def close(self):
        try:
            self.sock.close()
        except OSError:
            pass


class CdpClient:
    def __init__(self, ws_url):
        self.ws = WebSocket(ws_url)
        self.next_id = 1

    def call(self, method, params=None, timeout=10):
        request_id = self.next_id
        self.next_id += 1
        self.ws.send_json({"id": request_id, "method": method, "params": params or {}})
        deadline = time.time() + timeout
        while time.time() < deadline:
            message = self.ws.recv_json()
            if message.get("id") != request_id:
                continue
            if "error" in message:
                raise CdpError(f"{method} failed: {message['error']}")
            return message.get("result", {})
        raise CdpError(f"{method} timed out")

    def eval(self, expression):
        result = self.call(
            "Runtime.evaluate",
            {
                "expression": expression,
                "awaitPromise": True,
                "returnByValue": True,
            },
        )
        if "exceptionDetails" in result:
            raise CdpError(json.dumps(result["exceptionDetails"], ensure_ascii=False))
        remote = result.get("result", {})
        return remote.get("value")

    def close(self):
        self.ws.close()


def find_chrome():
    candidates = [
        os.environ.get("CHROME_PATH"),
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    ]
    for candidate in candidates:
        if candidate and os.path.exists(candidate):
            return candidate
    resolved = shutil.which("chrome") or shutil.which("msedge")
    if resolved:
        return resolved
    raise CdpError("Chrome or Edge executable was not found.")


def free_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def wait_for_http(url, timeout=20):
    deadline = time.time() + timeout
    last_error = None
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=2) as response:
                return json.loads(response.read().decode("utf-8"))
        except Exception as error:
            last_error = error
            time.sleep(0.2)
    raise CdpError(f"Timed out waiting for {url}: {last_error}")


def launch_chrome():
    port = free_port()
    user_data_dir = tempfile.mkdtemp(prefix="pomodoro-cdp-")
    chrome = find_chrome()
    process = subprocess.Popen(
        [
            chrome,
            "--headless=new",
            "--disable-gpu",
            "--no-first-run",
            "--disable-default-apps",
            f"--remote-debugging-port={port}",
            f"--user-data-dir={user_data_dir}",
            "about:blank",
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    wait_for_http(f"http://127.0.0.1:{port}/json/version")
    target_url = f"http://127.0.0.1:{port}/json/new?{urllib.parse.quote(APP_URL, safe=':/?=&')}"
    request = urllib.request.Request(target_url, method="PUT")
    with urllib.request.urlopen(request, timeout=5) as response:
        target = json.loads(response.read().decode("utf-8"))
    target_id = target.get("id")
    deadline = time.time() + 5
    while time.time() < deadline:
        targets = wait_for_http(f"http://127.0.0.1:{port}/json/list")
        for item in targets:
            if item.get("id") == target_id or item.get("url", "").startswith(APP_URL):
                ws_url = item.get("webSocketDebuggerUrl")
                if ws_url:
                    return process, user_data_dir, CdpClient(ws_url)
        time.sleep(0.1)
    raise CdpError("Could not find a debuggable page target.")


def js_string(value):
    return json.dumps(value, ensure_ascii=False)


def wait_until(page, expression, timeout=10, message="condition"):
    deadline = time.time() + timeout
    while time.time() < deadline:
        if page.eval(expression):
            return
        time.sleep(0.15)
    raise AssertionError(f"Timed out waiting for {message}")


def body_text(page):
    return page.eval("document.body.innerText")


def click_text(page, text):
    text_literal = js_string(text)
    ok = page.eval(
        f"""
        (() => {{
          const wanted = {text_literal};
          const norm = (value) => value.replace(/\\s+/g, " ").trim();
          const candidates = [...document.querySelectorAll("button")];
          const button = candidates.find((item) => norm(item.innerText) === wanted)
            || candidates.find((item) => norm(item.innerText).includes(wanted));
          if (!button) return false;
          button.click();
          return true;
        }})()
        """
    )
    assert ok, f"Button with text {text!r} not found"


def click_aria(page, label):
    label_literal = js_string(label)
    ok = page.eval(
        f"""
        (() => {{
          const button = document.querySelector(`button[aria-label=${{CSS.escape({label_literal})}}]`);
          if (!button) return false;
          button.click();
          return true;
        }})()
        """
    )
    assert ok, f"Button with aria-label {label!r} not found"


def set_number(page, index, value):
    page.eval(
        f"""
        (() => {{
          const input = document.querySelectorAll('input[type="number"]')[{index}];
          const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
          setter.call(input, {js_string(str(value))});
          input.dispatchEvent(new Event("input", {{ bubbles: true }}));
        }})()
        """
    )


def set_text_input(page, value):
    page.eval(
        f"""
        (() => {{
          const inputs = [...document.querySelectorAll('input[type="text"], input:not([type])')];
          const input = inputs.find((item) => !item.disabled && item.offsetParent !== null);
          const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
          setter.call(input, {js_string(value)});
          input.dispatchEvent(new Event("input", {{ bubbles: true }}));
        }})()
        """
    )


def set_select(page, index, value):
    page.eval(
        f"""
        (() => {{
          const select = document.querySelectorAll("select")[{index}];
          const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set;
          setter.call(select, {js_string(value)});
          select.dispatchEvent(new Event("change", {{ bubbles: true }}));
        }})()
        """
    )


def persisted(page):
    raw = page.eval('window.localStorage.getItem("pomodoro:persist:v1")')
    return json.loads(raw) if raw else {}


def assert_contains(haystack, needle):
    assert needle in haystack, f"Expected to find {needle!r} in page text."


def assert_http_200(path):
    with urllib.request.urlopen(f"{APP_URL}{path}", timeout=5) as response:
        assert response.status == 200, f"{path} returned {response.status}"


def cleanup_chrome_profile_processes(user_data_dir):
    if os.name != "nt":
        return
    try:
        escaped = user_data_dir.replace("'", "''")
        subprocess.run(
            [
                "powershell",
                "-NoProfile",
                "-Command",
                (
                    "Get-CimInstance Win32_Process | "
                    f"Where-Object {{ $_.CommandLine -like '*{escaped}*' }} | "
                    "ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"
                ),
            ],
            check=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except Exception:
        pass


def run():
    process, user_data_dir, page = launch_chrome()
    results = []
    try:
        page.call("Runtime.enable")
        page.call("Page.enable")
        wait_until(page, "document.readyState === 'complete' || document.readyState === 'interactive'", message="page load")
        page.eval("window.localStorage.clear(); location.reload();")
        wait_until(page, "document.readyState === 'complete' || document.readyState === 'interactive'", message="reload")

        text = body_text(page)
        assert_contains(text, "뽀모도로")
        assert_contains(text, "50:00")
        assert_contains(text, "집중 50분")
        assert_contains(text, "휴식 10분")
        assert_contains(text, "아직 완료된 세션이 없어요.")
        results.append("TC-01 initial render")

        click_aria(page, "설정 열기")
        wait_until(page, "document.body.innerText.includes('뽀모도로 시간')", message="settings")
        set_number(page, 0, 0)
        set_number(page, 1, 61)
        click_text(page, "저장")
        wait_until(page, "document.body.innerText.includes('범위: 집중 1~180분, 휴식 1~60분')", message="range error")
        results.append("TC-02 settings validation")

        set_number(page, 0, 1)
        set_number(page, 1, 1)
        set_select(page, 1, "dark")
        set_select(page, 2, "runner")
        click_text(page, "저장")
        wait_until(page, "document.body.innerText.includes('01:00')", message="saved settings")
        assert persisted(page)["settings"]["theme"] == "dark"
        assert persisted(page)["settings"]["progressBarType"] == "runner"
        results.append("TC-03 settings save")

        click_text(page, "시작")
        wait_until(page, "document.body.innerText.includes('이번 타임 목표')", message="goal modal")
        click_text(page, "시작하기")
        wait_until(page, "document.body.innerText.includes('목표를 입력해 주세요.')", message="goal required")
        results.append("TC-04 empty goal validation")

        set_text_input(page, "테스트 케이스 검증")
        click_text(page, "시작하기")
        wait_until(page, "document.body.innerText.includes('일시정지')", message="timer running")
        wait_until(page, "document.body.innerText.includes('00:59')", timeout=3, message="countdown")
        results.append("TC-05 start with goal and countdown")

        page.eval(
            """
            (() => {
              if (!window.__realDateNow) {
                window.__realDateNow = Date.now.bind(Date);
                Date.now = () => window.__realDateNow() + (window.__pomodoroTimeOffset || 0);
              }
              window.__pomodoroTimeOffset = 20000;
              window.dispatchEvent(new Event("focus"));
            })()
            """
        )
        wait_until(
            page,
            "JSON.parse(localStorage.getItem('pomodoro:persist:v1')).snapshot.remainingSeconds <= 40",
            timeout=3,
            message="background elapsed correction",
        )
        results.append("TC-06 background elapsed correction")

        click_text(page, "일시정지")
        wait_until(page, "document.body.innerText.includes('다시 시작하기')", message="paused")
        paused = persisted(page)["snapshot"]["remainingSeconds"]
        time.sleep(1.2)
        assert persisted(page)["snapshot"]["remainingSeconds"] == paused
        assert persisted(page)["snapshot"]["statusKey"] == "paused"
        click_text(page, "다시 시작하기")
        wait_until(page, f"JSON.parse(localStorage.getItem('pomodoro:persist:v1')).snapshot.remainingSeconds < {paused}", timeout=3, message="resume countdown")
        results.append("TC-07 pause and resume")

        click_aria(page, "수정")
        wait_until(page, "document.body.innerText.includes('집중 문구 수정')", message="edit goal modal")
        set_text_input(page, "수정된 목표")
        click_text(page, "저장")
        wait_until(page, "document.body.innerText.includes('수정된 목표')", message="goal edited")
        results.append("TC-08 edit goal")

        click_aria(page, "스킵")
        wait_until(page, "document.body.innerText.includes('정말로 스킵하시겠어요?')", message="skip modal")
        click_text(page, "스킵")
        wait_until(page, "JSON.parse(localStorage.getItem('pomodoro:persist:v1')).sessionHistory.length === 1", message="history after skip")
        assert persisted(page)["snapshot"]["isFocusMode"] is False
        results.append("TC-09 skip focus")

        click_aria(page, "스킵")
        wait_until(page, "document.body.innerText.includes('정말로 스킵하시겠어요?')", message="skip break modal")
        click_text(page, "스킵")
        wait_until(page, "JSON.parse(localStorage.getItem('pomodoro:persist:v1')).snapshot.cycle === 2", message="cycle 2")
        assert persisted(page)["snapshot"]["isRunning"] is False
        assert persisted(page)["snapshot"]["isFocusMode"] is True
        results.append("TC-10 skip break")

        click_aria(page, "리셋")
        wait_until(page, "document.body.innerText.includes('정말로 리셋하시겠어요?')", message="reset modal")
        click_text(page, "리셋")
        wait_until(page, "JSON.parse(localStorage.getItem('pomodoro:persist:v1')).sessionHistory.length === 0", message="reset clears history")
        assert persisted(page)["snapshot"]["cycle"] == 1
        results.append("TC-11 reset")

        for path in [
            "/manifest.webmanifest",
            "/sw.js",
            "/icons/icon-192.png",
            "/icons/icon-512.png",
            "/icons/apple-touch-icon.png",
        ]:
            assert_http_200(path)
        results.append("TC-12 PWA assets")

        print(json.dumps({"ok": True, "results": results}, ensure_ascii=False, indent=2))
    finally:
        page.close()
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
        cleanup_chrome_profile_processes(user_data_dir)
        shutil.rmtree(user_data_dir, ignore_errors=True)


if __name__ == "__main__":
    run()
