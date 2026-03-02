"use client";

import { CONFETTI_PIECES } from "./pomodoro/confetti";
import { formatSeconds } from "./pomodoro/format";
import { EditIcon, GearIcon, ResetIcon, SkipIcon } from "./pomodoro/icons";
import ConfettiOverlay from "./pomodoro/components/ConfettiOverlay";
import ConfirmModal from "./pomodoro/components/ConfirmModal";
import GoalPromptModal from "./pomodoro/components/GoalPromptModal";
import SessionHistoryPanel from "./pomodoro/components/SessionHistoryPanel";
import SettingsView from "./pomodoro/components/SettingsView";
import usePomodoroTimer from "./pomodoro/usePomodoroTimer";

const TEXT = {
  ko: {
    ready: "\uC900\uBE44\uB428",
    running: "\uC9C4\uD589 \uC911",
    paused: "\uC77C\uC2DC\uC815\uC9C0",
    rest: "\uD734\uC2DD",
    focusDone: "\uC9D1\uC911 \uC644\uB8CC. \uD734\uC2DD \uC2DC\uC791",
    breakDone: "\uD734\uC2DD \uC644\uB8CC. \uC9D1\uC911 \uC2DC\uC791",
    settingsSaved: "\uC124\uC815\uC774 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
    appTitle: "\uBF40\uBAA8\uB3C4\uB85C",
    settings: "\uC124\uC815",
    settingsDesc: "\uBF40\uBAA8\uB3C4\uB85C \uC2DC\uAC04, \uC5B8\uC5B4, \uD14C\uB9C8\uB97C \uBCC0\uACBD\uD560 \uC218 \uC788\uC5B4\uC694.",
    focus: "\uC9D1\uC911",
    break: "\uD734\uC2DD",
    minuteUnit: "\uBD84",
    focusMinutes: "\uC9D1\uC911 \uC2DC\uAC04 (\uBD84)",
    breakMinutes: "\uD734\uC2DD \uC2DC\uAC04 (\uBD84)",
    language: "\uC5B8\uC5B4",
    theme: "\uD14C\uB9C8",
    progressBar: "\uC9C4\uD589\uC0C1\uD0DC\uD45C\uC2DC",
    progressBarNone: "\uC5C6\uC74C",
    progressBarRunner: "\uB2EC\uB824\uB77C \uC090\uC57D\uC774",
    light: "\uB77C\uC774\uD2B8",
    dark: "\uB2E4\uD06C",
    save: "\uC800\uC7A5",
    backToTimer: "\uD0C0\uC774\uBA38\uB85C \uB3CC\uC544\uAC00\uAE30",
    start: "\uC2DC\uC791",
    nextSessionStart: "\uB2E4\uC74C \uC138\uC158 \uC2DC\uC791\uD558\uAE30",
    pause: "\uC77C\uC2DC\uC815\uC9C0",
    skip: "\uC2A4\uD0B5",
    skipTitle: "\uC815\uB9D0\uB85C \uC2A4\uD0B5\uD558\uC2DC\uACA0\uC5B4\uC694?",
    skipDescFocus: "\uD604\uC7AC \uC9D1\uC911 \uC138\uC158\uC744 \uC989\uC2DC \uC885\uB8CC\uD558\uACE0 \uD734\uC2DD\uC73C\uB85C \uB118\uC5B4\uAC11\uB2C8\uB2E4.",
    skipDescBreak: "\uD604\uC7AC \uD734\uC2DD\uC744 \uC885\uB8CC\uD558\uACE0 \uB2E4\uC74C \uC138\uC158 \uC900\uBE44 \uC0C1\uD0DC\uB85C \uB118\uC5B4\uAC11\uB2C8\uB2E4.",
    reset: "\uB9AC\uC14B",
    resetTitle: "\uC815\uB9D0\uB85C \uB9AC\uC14B\uD558\uC2DC\uACA0\uC5B4\uC694?",
    resetDesc: "\uD604\uC7AC \uD0C0\uC774\uBA38\uC640 \uC138\uC158 \uD788\uC2A4\uD1A0\uB9AC\uAC00 \uBAA8\uB450 \uCD08\uAE30\uD654\uB429\uB2C8\uB2E4.",
    openSettings: "\uC124\uC815 \uC5F4\uAE30",
    cycle: "\uC138\uC158",
    numbersOnly: "\uC22B\uC790\uB9CC \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
    rangeError: "\uBC94\uC704: \uC9D1\uC911 1~180\uBD84, \uD734\uC2DD 1~60\uBD84",
    langKo: "\uD55C\uAD6D\uC5B4",
    langEn: "\uC601\uC5B4",
    timeEditHint: "\uC2DC\uAC04 \uC124\uC815\uC740 \uC2DC\uC791 \uC804 \uB610\uB294 \uB2E4\uC74C \uC138\uC158 \uB300\uAE30 \uC0C1\uD0DC\uC5D0\uC11C\uB9CC \uBCC0\uACBD\uD560 \uC218 \uC788\uC5B4\uC694.",
    goalTitle: "\uC774\uBC88 \uD0C0\uC784 \uBAA9\uD45C",
    goalDesc: "\uC9D1\uC911 \uC2DC\uAC04 \uC2DC\uC791 \uC804\uC5D0 \uBAA9\uD45C\uB97C \uC785\uB825\uD558\uC138\uC694.",
    goalEditTitle: "\uC9D1\uC911 \uBB38\uAD6C \uC218\uC815",
    goalEditDesc: "\uD604\uC7AC \uC138\uC158 \uBAA9\uD45C \uBB38\uAD6C\uB97C \uC218\uC815\uD560 \uC218 \uC788\uC5B4\uC694.",
    goalLabel: "\uBAA9\uD45C \uBB38\uAD6C",
    goalPlaceholder: "\uC608) 1\uC7A5 \uBB38\uC81C \uB05D\uB0B4\uAE30",
    goalStart: "\uC2DC\uC791\uD558\uAE30",
    goalSave: "\uC800\uC7A5",
    goalCancel: "\uCDE8\uC18C",
    editGoal: "\uC218\uC815",
    goalRequired: "\uBAA9\uD45C\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
    sessionHistory: "\uC138\uC158 \uD788\uC2A4\uD1A0\uB9AC",
    focusElapsed: "\uC9D1\uC911 \uC9C4\uD589\uC2DC\uAC04",
    emptyHistory: "\uC544\uC9C1 \uC644\uB8CC\uB41C \uC138\uC158\uC774 \uC5C6\uC5B4\uC694.",
  },
  en: {
    ready: "Ready",
    running: "Running",
    paused: "Paused",
    rest: "Break",
    focusDone: "Focus done. Break started.",
    breakDone: "Break done. Focus started.",
    settingsSaved: "Settings saved.",
    appTitle: "Pomodoro",
    settings: "Settings",
    settingsDesc: "Update pomodoro durations, language, and theme.",
    focus: "FOCUS",
    break: "BREAK",
    minuteUnit: " min",
    focusMinutes: "Focus minutes",
    breakMinutes: "Break minutes",
    language: "Language",
    theme: "Theme",
    progressBar: "Progress bar",
    progressBarNone: "None",
    progressBarRunner: "Runner bar",
    light: "Light",
    dark: "Dark",
    save: "Save",
    backToTimer: "Back to timer",
    start: "Start",
    nextSessionStart: "Start next session",
    pause: "Pause",
    skip: "Skip",
    skipTitle: "Skip this session?",
    skipDescFocus: "This will end the current focus session and start break.",
    skipDescBreak: "This will end the current break and move to next-session ready state.",
    reset: "Reset",
    resetTitle: "Reset confirmation",
    resetDesc: "The current timer and session history will be cleared.",
    openSettings: "Open settings",
    cycle: "Session",
    numbersOnly: "Please enter numbers only.",
    rangeError: "Range: focus 1-180, break 1-60",
    langKo: "Korean",
    langEn: "English",
    timeEditHint: "Time settings can only be changed before first start or while waiting for the next session.",
    goalTitle: "Goal for this session",
    goalDesc: "Set a goal before starting focus time.",
    goalEditTitle: "Edit focus text",
    goalEditDesc: "You can update this session focus text.",
    goalLabel: "Goal text",
    goalPlaceholder: "e.g. finish chapter 1 exercises",
    goalStart: "Start session",
    goalSave: "Save",
    goalCancel: "Cancel",
    editGoal: "Edit",
    goalRequired: "Please enter a goal.",
    sessionHistory: "Session history",
    focusElapsed: "Focus time",
    emptyHistory: "No completed sessions yet.",
  },
};

const THEMES = {
  light: {
    page: "bg-[radial-gradient(circle_at_top,#ebf8ff_0%,#dff2ff_42%,#d4edff_100%)] text-slate-900",
    shell: "border-white/80 bg-white/65 shadow-[0_30px_60px_rgba(77,162,233,0.25)]",
    panel: "border-white/80 bg-white/70",
    panelSoft: "border-sky-100/90 bg-sky-50/85",
    focusTimeBox: "border-sky-300/95 bg-sky-200/75",
    breakTimeBox: "border-emerald-300/95 bg-emerald-200/75",
    nextSessionTimeBox: "border-rose-200/90 bg-rose-100/65",
    muted: "text-slate-600",
    subtle: "text-slate-500",
    chip: "border-sky-200 bg-sky-100/90 text-sky-700",
    focusMiniChip: "border-sky-200 bg-sky-100/90 text-sky-700",
    breakMiniChip: "border-emerald-200 bg-emerald-100/85 text-emerald-700",
    icon: "border-sky-200/90 bg-white/80 text-sky-700 hover:bg-white",
    resetIcon: "border-rose-300/90 bg-rose-100/90 text-rose-700 hover:bg-rose-200/90",
    primaryBtn: "border-sky-300 bg-sky-200/90 text-sky-900 hover:bg-sky-300/80",
    nextSessionBtn: "border-rose-200/90 bg-rose-100/70 text-rose-700 hover:bg-rose-200/75",
    dangerBtn: "border-rose-300 bg-rose-200/90 text-rose-900 hover:bg-rose-300/85",
    pauseBtn: "border-slate-200 bg-slate-100/90 text-slate-700 hover:bg-slate-200/80",
    secondaryBtn: "border-white/90 bg-white/75 text-slate-700 hover:bg-white",
    input: "border-white/95 bg-white/80 text-slate-900 focus:border-sky-300",
    disabledInput: "disabled:bg-slate-100/95 disabled:border-slate-200/90 disabled:text-slate-400",
    modalBackdrop: "bg-black/30",
    modalCard: "border-white/90 bg-white/95",
    raceTrack: "border-sky-200/90 bg-sky-100/75",
    raceLine: "bg-sky-300/90",
    runnerBadge: "bg-white/85 border-sky-200/90",
  },
  dark: {
    page: "bg-[radial-gradient(circle_at_top,#1c2a36_0%,#10161d_44%,#090c10_100%)] text-white",
    shell: "border-white/15 bg-white/10 shadow-2xl",
    panel: "border-white/15 bg-white/10",
    panelSoft: "border-sky-400/20 bg-sky-400/10",
    focusTimeBox: "border-sky-300/40 bg-sky-300/20",
    breakTimeBox: "border-emerald-300/45 bg-emerald-300/20",
    nextSessionTimeBox: "border-rose-300/55 bg-rose-400/28",
    muted: "text-white/75",
    subtle: "text-white/60",
    chip: "border-sky-400/30 bg-sky-400/15 text-sky-100",
    focusMiniChip: "border-sky-300/35 bg-sky-300/20 text-sky-100",
    breakMiniChip: "border-emerald-300/35 bg-emerald-300/20 text-emerald-100",
    icon: "border-white/20 bg-white/10 text-white/90 hover:bg-white/15",
    resetIcon: "border-rose-300/45 bg-rose-400/20 text-rose-100 hover:bg-rose-400/30",
    primaryBtn: "border-sky-300/35 bg-sky-300/25 text-white hover:bg-sky-300/35",
    nextSessionBtn: "border-rose-300/65 bg-rose-400/38 text-rose-50 hover:bg-rose-400/48",
    dangerBtn: "border-rose-300/45 bg-rose-400/25 text-rose-50 hover:bg-rose-400/35",
    pauseBtn: "border-slate-400/45 bg-slate-400/20 text-slate-100 hover:bg-slate-400/30",
    secondaryBtn: "border-white/20 bg-white/10 text-white/90 hover:bg-white/20",
    input: "border-white/25 bg-white/10 text-white focus:border-sky-300/70",
    disabledInput: "disabled:bg-slate-800/75 disabled:border-slate-600/70 disabled:text-white/45",
    modalBackdrop: "bg-black/70",
    modalCard: "border-white/25 bg-slate-950/95",
    raceTrack: "border-sky-300/25 bg-sky-300/10",
    raceLine: "bg-sky-300/65",
    runnerBadge: "bg-slate-900/90 border-sky-300/45",
  },
};

export default function Page() {
  const {
    language,
    theme,
    isRunning,
    isFocusMode,
    cycle,
    statusKey,
    focusMinutes,
    breakMinutes,
    remainingSeconds,
    showSettings,
    focusInput,
    breakInput,
    languageInput,
    themeInput,
    progressBarType,
    progressBarInput,
    settingsErrorKey,
    showGoalPrompt,
    showResetPrompt,
    showSkipPrompt,
    goalInput,
    goalModalMode,
    currentGoal,
    goalErrorKey,
    sessionHistory,
    showConfetti,
    confettiBurstId,
    canEditTimeSettings,
    progressPercent,
    canEditGoal,
    isWaitingNextSession,
    canShowSkip,
    setFocusInput,
    setBreakInput,
    setLanguageInput,
    setThemeInput,
    setProgressBarInput,
    setGoalInput,
    onStart,
    onPause,
    onReset,
    onSkip,
    cancelResetPrompt,
    cancelSkipPrompt,
    confirmReset,
    confirmSkip,
    openSettings,
    closeSettings,
    cancelGoalPrompt,
    openGoalEditor,
    submitGoal,
    saveSettings,
  } = usePomodoroTimer();

  const t = TEXT[language];
  const th = THEMES[theme];

  if (showSettings) {
    const tSettings = TEXT[languageInput];
    const thSettings = THEMES[themeInput];

    return (
      <SettingsView
        tSettings={tSettings}
        thSettings={thSettings}
        canEditTimeSettings={canEditTimeSettings}
        focusInput={focusInput}
        breakInput={breakInput}
        languageInput={languageInput}
        themeInput={themeInput}
        progressBarInput={progressBarInput}
        settingsErrorKey={settingsErrorKey}
        onFocusInputChange={setFocusInput}
        onBreakInputChange={setBreakInput}
        onLanguageChange={setLanguageInput}
        onThemeChange={setThemeInput}
        onProgressBarChange={setProgressBarInput}
        onClose={closeSettings}
        onSave={saveSettings}
      />
    );
  }

  const focusLabel = statusKey === "rest" ? t.rest : currentGoal || t.focus;
  const startButtonLabel =
    isRunning
      ? t.pause
      : isWaitingNextSession
        ? t.nextSessionStart
        : t.start;
  const startButtonClass = isRunning ? th.pauseBtn : isWaitingNextSession ? th.nextSessionBtn : th.primaryBtn;

  return (
    <main className={`min-h-[100dvh] ${th.page} px-3 py-4 ${th.text}`}>
      <section className={`relative mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-[420px] flex-col rounded-[30px] border p-5 backdrop-blur-2xl ${th.shell}`}>
        <header className="flex items-start justify-between">
          <div>
            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium ${th.chip}`}>{t.appTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onReset} aria-label={t.reset} className={`rounded-xl border p-2.5 transition ${th.icon}`}>
              <ResetIcon />
            </button>
            {canShowSkip ? (
              <button onClick={onSkip} aria-label={t.skip} className={`rounded-xl border p-2.5 transition ${th.icon}`}>
                <SkipIcon />
              </button>
            ) : null}
            <button onClick={openSettings} aria-label={t.openSettings} className={`rounded-xl border p-2.5 transition ${th.icon}`}>
              <GearIcon />
            </button>
          </div>
        </header>

        <div className={`mt-7 rounded-3xl border p-5 ${th.panel}`}>
          <div className="mb-2 flex flex-wrap gap-1.5">
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${th.focusMiniChip}`}>
              {t.focus} {focusMinutes}
              {t.minuteUnit}
            </span>
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${th.breakMiniChip}`}>
              {t.break} {breakMinutes}
              {t.minuteUnit}
            </span>
          </div>
          <div
            className={`rounded-2xl border p-6 text-center transition-colors ${isWaitingNextSession ? th.nextSessionTimeBox : isFocusMode ? th.focusTimeBox : th.breakTimeBox}`}
          >
            <div className="grid grid-cols-[20px_1fr_20px] items-center gap-2">
              <span className="h-5 w-5" aria-hidden="true" />
              <p className={`truncate text-center text-xs font-medium tracking-[0.06em] ${th.subtle}`}>{isFocusMode ? focusLabel : t.break}</p>
              <div className="flex justify-end">
                {canEditGoal ? (
                  <button
                    onClick={openGoalEditor}
                    aria-label={t.editGoal}
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-md border transition ${th.icon}`}
                  >
                    <EditIcon />
                  </button>
                ) : (
                  <span className="h-5 w-5" aria-hidden="true" />
                )}
              </div>
            </div>
            <p className="timer-font mt-3 text-6xl font-medium leading-none sm:text-7xl">{formatSeconds(remainingSeconds)}</p>
            <p className={`mt-3 text-xs ${th.subtle}`}>
              {t.cycle} {cycle}
            </p>
          </div>

          {progressBarType === "runner" ? <div className={`relative mt-4 h-14 rounded-2xl border ${th.raceTrack}`}>
            <div className={`absolute left-10 right-10 top-1/2 h-1 -translate-y-1/2 rounded-full ${th.raceLine}`} />

            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm">{"\u{1F6A9}"}</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-lg">{"\u{1F3C1}"}</span>

            <div
              className={`absolute top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border text-center leading-8 transition-all duration-500 ${th.runnerBadge}`}
              style={{ left: `calc(40px + (100% - 80px) * ${progressPercent / 100})`, transform: "translate(-50%, -50%)" }}
            >
              {isRunning ? "🐥" : "🐣"}
            </div>
          </div> : null}
        </div>

        <SessionHistoryPanel th={th} t={t} sessionHistory={sessionHistory} formatSeconds={formatSeconds} />

        <div className={`mt-auto rounded-2xl border p-2 backdrop-blur-xl ${th.panel}`}>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={isRunning ? onPause : onStart}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${startButtonClass}`}
            >
              {startButtonLabel}
            </button>
          </div>
        </div>

        <ConfettiOverlay showConfetti={showConfetti} confettiBurstId={confettiBurstId} confettiPieces={CONFETTI_PIECES} />

        <GoalPromptModal
          show={showGoalPrompt}
          th={th}
          t={t}
          goalModalMode={goalModalMode}
          goalInput={goalInput}
          goalErrorKey={goalErrorKey}
          onGoalInputChange={setGoalInput}
          onCancel={cancelGoalPrompt}
          onSubmit={submitGoal}
        />

        <ConfirmModal
          show={showResetPrompt}
          th={th}
          title={t.resetTitle}
          description={t.resetDesc}
          confirmLabel={t.reset}
          cancelLabel={t.goalCancel}
          confirmClassName={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${th.dangerBtn}`}
          onConfirm={confirmReset}
          onCancel={cancelResetPrompt}
        />

        <ConfirmModal
          show={showSkipPrompt}
          th={th}
          title={t.skipTitle}
          description={isFocusMode ? t.skipDescFocus : t.skipDescBreak}
          confirmLabel={t.skip}
          cancelLabel={t.goalCancel}
          confirmClassName={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${th.primaryBtn}`}
          onConfirm={confirmSkip}
          onCancel={cancelSkipPrompt}
        />
      </section>
    </main>
  );
}
