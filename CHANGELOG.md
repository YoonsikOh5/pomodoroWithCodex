# CHANGELOG

이 파일은 날짜별로 변경 사항을 누적 기록합니다.

## 2026-05-08

### 요약
- 앱을 백그라운드에 두거나 다른 앱을 사용한 뒤 돌아왔을 때, 타이머가 실제 경과 시간만큼 즉시 보정되도록 수정했습니다.
- 실제 브라우저 기반 스모크 테스트에 백그라운드 복귀 보정 케이스를 추가했습니다.
- 앞으로 커밋/푸시할 때 이 파일을 패치노트로 계속 갱신하도록 작업 규칙을 추가했습니다.

### 변경 사항

#### 1) 백그라운드 복귀 타이머 보정
- 기존의 `1초마다 남은 시간 -1` 방식만으로는 모바일 브라우저/PWA가 백그라운드에서 멈출 때 실제 시간이 반영되지 않는 문제가 있었습니다.
- 마지막 tick 시각과 현재 시각의 차이를 계산해, 앱으로 돌아온 순간 누락된 경과 시간을 한 번에 반영하도록 변경했습니다.
- `focus`와 `visibilitychange` 이벤트에서 즉시 타이머를 동기화하도록 보강했습니다.
- 백그라운드 중 집중 시간이 끝난 경우에도 복귀 시 휴식 세션으로 정상 전환되도록 기존 복원 로직과 같은 흐름을 재사용했습니다.

#### 2) 테스트 보강
- `tests/cdp_smoke.py`에 시간 오프셋을 이용한 백그라운드 복귀 보정 시나리오를 추가했습니다.
- `docs/test-cases.md`를 `TC-12`까지 갱신했습니다.

#### 3) 패치노트 운영 규칙
- 이 저장소에서는 앞으로 커밋/푸시 전에 `CHANGELOG.md`를 먼저 갱신합니다.
- 각 항목에는 요약, 변경 사항, 검증 결과, 주요 수정 파일을 남깁니다.
- 작업 완료 후 Slack `#codex-dev-briefing`에도 요약을 공유합니다.

### 검증
- `npm run build`
- `python tests/cdp_smoke.py`

### 주요 수정 파일
- `src/app/pomodoro/usePomodoroTimer.js`
- `tests/cdp_smoke.py`
- `docs/test-cases.md`
- `CHANGELOG.md`
- `AGENTS.md`

## 2026-05-03

### 요약
- 실제 앱 사용 흐름 기준 테스트 케이스를 문서화했습니다.
- headless Chrome/CDP 기반 스모크 테스트를 추가했습니다.
- 빈 목표로 시작되는 문제와 일시정지 상태 저장 오류를 수정했습니다.
- 일부 보안 취약점 완화를 위해 의존성을 갱신했습니다.

### 변경 사항

#### 1) 테스트 케이스 문서화
- `docs/test-cases.md`에 초기 렌더링, 설정 검증, 목표 입력, 시작/일시정지/재시작, 스킵, 리셋, PWA 자산 확인 흐름을 정리했습니다.

#### 2) 자동 스모크 테스트 추가
- `tests/cdp_smoke.py`를 추가해 실제 `http://localhost:3000` 앱을 headless Chrome으로 열고 핵심 사용자 흐름을 자동 검증하도록 했습니다.

#### 3) 타이머 흐름 버그 수정
- 시작 목표 모달에서 빈 목표로 시작되지 않도록 검증을 추가했습니다.
- 일시정지 시 `statusKey`가 `rest`로 저장되던 문제를 `paused`로 수정했습니다.

#### 4) 의존성 정리
- `next`를 `14.2.35`, `postcss`를 `8.5.10`으로 갱신했습니다.
- `npm audit fix`로 picomatch/yaml 관련 취약점은 정리했습니다.
- 현재 로컬 Node 18 환경에서는 Next 16 계열 업데이트가 불가해 Next 자체 audit 항목 일부는 남아 있습니다.

### 검증
- `npm run build`
- `python tests/cdp_smoke.py`

### 주요 수정 파일
- `src/app/pomodoro/usePomodoroTimer.js`
- `docs/test-cases.md`
- `tests/cdp_smoke.py`
- `package.json`
- `package-lock.json`

## 2026-03-02

### 요약
- 뽀모도로 타이머 상태/전환 로직을 전용 훅으로 리팩터링했습니다.
- 진행상태표시를 3가지 모드로 확장하고 전환 UX를 개선했습니다.
- 설정, 세션 히스토리, 최근 진행상태에 대한 로컬 영속화를 추가했습니다.
- 일시정지 상태가 더 명확히 보이도록 하단 버튼 UX를 보강했습니다.

### 변경 사항

#### 1) 타이머 구조
- 타이머 상태/전환 로직을 `usePomodoroTimer`로 분리했습니다.
- `ready`, `running`, `rest`, `focusDone` 중심의 상태 흐름을 훅 내부에서 일관되게 관리하도록 정리했습니다.

#### 2) 진행상태표시 모드
- 진행상태표시 3종을 지원하도록 확장했습니다.
- `circle`
- `runner`
- `none`
- 설정 항목 명칭을 "진행바"에서 "진행상태표시"로 변경했습니다.
- 러너 모드 명칭을 "달려라 삐약이"로 반영했습니다.
- 기본 모드를 `circle`(원형 진행바)로 설정했습니다.

#### 3) 원형 진행바 UI
- 원형 모드 선택 시 기존 사각 시간 박스를 원형 진행바로 대체했습니다.
- 원 안에 집중 문구, 타이머, 세션 번호가 표시되도록 구성했습니다.
- 문구 수정 버튼이 원형 바를 가리지 않도록 원 내부 배치로 조정했습니다.
- 긴 세션에서도 진행감이 느껴지도록 1초 단위로 진행률이 반영되게 개선했습니다.

#### 4) 빠른 토글 UX
- 타이머 패널 우측 상단에 진행상태표시 토글 아이콘 버튼을 추가했습니다.
- 버튼 1회 클릭 시 `circle -> runner -> none` 순서로 순환 전환됩니다.
- 초기화 아이콘과 구분되도록 진행 관련 깃발 아이콘으로 교체했습니다.
- 버튼 크기/위치를 집중/휴식 칩 라인과 맞춰 정렬했습니다.

#### 5) 테마 / 모바일 동작
- PWA/웹앱에서 아래로 당겨 새로고침되는 현상을 줄이기 위해 `html, body`에 `overscroll-behavior-y: none`을 적용했습니다.
- 다크모드 중복 적용을 줄이기 위해 색상 스킴 처리를 보강했습니다.
- `:root { color-scheme: light; }`
- 런타임에서 `document.documentElement.style.colorScheme = theme` 동기화

#### 6) 상태 영속화
- `localStorage` 키 `pomodoro:persist:v1` 기반 영속화를 추가했습니다.
- 저장 대상
- 설정(`focusMinutes`, `breakMinutes`, `language`, `theme`, `progressBarType`)
- 세션 히스토리
- 최근 진행 스냅샷(`isFocusMode`, `cycle`, `remainingSeconds`, `isRunning`, `currentGoal`, `statusKey`, `savedAt`)
- 복원 시 동작
- 저장값 유효성 검사 및 보정
- 타이머/세션 상태 복원
- 앱 비활성 시간(`savedAt` 기준)만큼 경과 처리
- 비활성 중 완료된 집중 세션을 히스토리에 자동 반영

#### 7) 일시정지 버튼 UX
- 일시정지 상태에서 하단 메인 버튼을 다음처럼 변경했습니다.
- 문구: `다시 시작하기`
- 색상: `다음 세션 시작하기`와 같은 붉은 계열 스타일

### 검증
- 프로덕션 빌드 확인 완료
- `npm.cmd run build`

### 주요 수정 파일
- `src/app/page.js`
- `src/app/pomodoro/usePomodoroTimer.js`
- `src/app/pomodoro/components/SettingsView.js`
- `src/app/pomodoro/icons.js`
- `src/app/layout.js`
- `src/app/globals.css`
