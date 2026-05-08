const COMPLETION_VIBRATION_PATTERN = [240, 120, 240];

export function formatClockTime(timestamp) {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function focusNotificationSubject(goal) {
  const trimmed = typeof goal === "string" ? goal.trim() : "";
  return trimmed || "집중";
}

export function focusStartMessage(goal, endsAt) {
  return `${focusNotificationSubject(goal)} 시작, 종료 예정 ${formatClockTime(endsAt)}`;
}

export function focusCompleteMessage(goal) {
  return `${focusNotificationSubject(goal)} 완료`;
}

export function remainingMessage(minutes) {
  return `${minutes}분 남음`;
}

export async function requestPomodoroNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch {
    return false;
  }
}

export async function showPomodoroNotification(message, options = {}) {
  const canNotify = await requestPomodoroNotificationPermission();
  if (!canNotify) return false;

  const notificationOptions = {
    body: options.body || "뽀모도로",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: options.tag || "pomodoro-timer",
    renotify: Boolean(options.renotify),
    silent: false,
    timestamp: Date.now(),
  };

  if (options.vibrate) {
    notificationOptions.vibrate = COMPLETION_VIBRATION_PATTERN;
  }

  try {
    if ("serviceWorker" in navigator) {
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((resolve) => setTimeout(() => resolve(null), 500)),
      ]);

      if (registration?.showNotification) {
        await registration.showNotification(message, notificationOptions);
        return true;
      }
    }

    new Notification(message, notificationOptions);
    return true;
  } catch {
    return false;
  }
}

export function prepareCompletionSound(audioContextRef) {
  const context = getAudioContext(audioContextRef);
  if (!context) return;

  context.resume?.().catch(() => {});

  try {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.03);
  } catch {
    // Audio feedback is best effort only.
  }
}

export function playCompletionFeedback(audioContextRef) {
  vibrateCompletion();
  playCompletionSound(audioContextRef);
}

function vibrateCompletion() {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;

  try {
    navigator.vibrate(COMPLETION_VIBRATION_PATTERN);
  } catch {
    // Vibration is not available on every mobile browser.
  }
}

function getAudioContext(audioContextRef) {
  if (typeof window === "undefined") return null;
  if (audioContextRef.current) return audioContextRef.current;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;

  try {
    audioContextRef.current = new AudioContext();
    return audioContextRef.current;
  } catch {
    return null;
  }
}

function playCompletionSound(audioContextRef) {
  const context = getAudioContext(audioContextRef);
  if (!context) return;

  context.resume?.().catch(() => {});

  try {
    const firstStart = context.currentTime + 0.02;
    playTone(context, firstStart, 880);
    playTone(context, firstStart + 0.18, 1174.66);
  } catch {
    // Audio feedback is best effort only.
  }
}

function playTone(context, startTime, frequency) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.16);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + 0.18);
}
