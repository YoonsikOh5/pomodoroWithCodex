"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_FOCUS_MINUTES = 50;
const DEFAULT_BREAK_MINUTES = 10;

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
    quickMode: "\uBE60\uB978 \uD14C\uC2A4\uD2B8 \uBAA8\uB4DC",
    quickModeDesc: "\uC9D1\uC911 10\uCD08 / \uD734\uC2DD 5\uCD08",
    timeEditHint: "\uC2DC\uAC04 \uC124\uC815\uC740 \uC2DC\uC791 \uC804 \uB610\uB294 \uB2E4\uC74C \uC138\uC158 \uB300\uAE30 \uC0C1\uD0DC\uC5D0\uC11C\uB9CC \uBCC0\uACBD\uD560 \uC218 \uC788\uC5B4\uC694.",
    quickModeOn: "\uCF1C\uAE30",
    quickModeOff: "\uB044\uAE30",
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
    quickMode: "Quick test mode",
    quickModeDesc: "Focus 10s / Break 5s",
    timeEditHint: "Time settings can only be changed before first start or while waiting for the next session.",
    quickModeOn: "On",
    quickModeOff: "Off",
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

const CONFETTI_DURATION_MS = 7000;
const CONFETTI_COLORS = ["#38bdf8", "#60a5fa", "#22d3ee", "#34d399", "#fbbf24", "#fb7185", "#c084fc", "#f97316", "#fde047", "#fca5a5"];
const CONFETTI_COUNT = 96;
const CONFETTI_EMITTERS = [22, 50, 78];
const CONFETTI_PIECES = Array.from({ length: CONFETTI_COUNT }, (_, idx) => {
  const emitter = CONFETTI_EMITTERS[idx % CONFETTI_EMITTERS.length];
  const theta = (((idx * 137) % 360) * Math.PI) / 180;
  const spread = 90 + (idx % 9) * 15;
  return {
    left: emitter + ((idx % 5) - 2) * 1.1,
    top: 7 + (idx % 6) * 0.45,
    tx: Math.cos(theta) * spread,
    ty: Math.abs(Math.sin(theta)) * (spread + 90) + 90,
    rotate: 120 + ((idx * 53) % 720),
    width: 6 + (idx % 4) * 2,
    height: 10 + (idx % 5) * 2,
    delay: (idx % 8) * 0.04,
    duration: 6 + (idx % 6) * 0.2,
    color: CONFETTI_COLORS[idx % CONFETTI_COLORS.length],
  };
});

function formatSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.572c1.756.427 1.756 2.925 0 3.351a1.724 1.724 0 00-1.066 2.573c.94 1.543-.827 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.827-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.827-3.31 2.37-2.37.996.607 2.296.07 2.573-1.066z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

export default function Page() {
  const [language, setLanguage] = useState("ko");
  const [theme, setTheme] = useState("light");
  const [quickMode, setQuickMode] = useState(false);

  const t = TEXT[language];
  const th = THEMES[theme];

  const [isRunning, setIsRunning] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(true);
  const [cycle, setCycle] = useState(1);
  const [statusKey, setStatusKey] = useState("ready");

  const [focusMinutes, setFocusMinutes] = useState(DEFAULT_FOCUS_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_FOCUS_MINUTES * 60);

  const [showSettings, setShowSettings] = useState(false);
  const [focusInput, setFocusInput] = useState(String(DEFAULT_FOCUS_MINUTES));
  const [breakInput, setBreakInput] = useState(String(DEFAULT_BREAK_MINUTES));
  const [languageInput, setLanguageInput] = useState("ko");
  const [themeInput, setThemeInput] = useState("light");
  const [quickModeInput, setQuickModeInput] = useState(false);
  const [settingsErrorKey, setSettingsErrorKey] = useState("");
  const [showGoalPrompt, setShowGoalPrompt] = useState(false);
  const [showResetPrompt, setShowResetPrompt] = useState(false);
  const [showSkipPrompt, setShowSkipPrompt] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [goalModalMode, setGoalModalMode] = useState("start");
  const [currentGoal, setCurrentGoal] = useState("");
  const [goalErrorKey, setGoalErrorKey] = useState("");
  const [sessionHistory, setSessionHistory] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiBurstId, setConfettiBurstId] = useState(0);
  const lastLoggedCycleRef = useRef(null);

  const focusDurationSeconds = quickMode ? 10 : focusMinutes * 60;
  const breakDurationSeconds = quickMode ? 5 : breakMinutes * 60;
  const totalSeconds = isFocusMode ? focusDurationSeconds : breakDurationSeconds;
  const canEditTimeSettings = !isRunning && isFocusMode && remainingSeconds === focusDurationSeconds && currentGoal.trim() === "";

  const progressPercent = useMemo(() => {
    if (totalSeconds <= 0) return 0;
    return Math.round(Math.min(100, Math.max(0, ((totalSeconds - remainingSeconds) / totalSeconds) * 100)));
  }, [remainingSeconds, totalSeconds]);

  useEffect(() => {
    if (!isRunning || showSettings || showGoalPrompt || showResetPrompt || showSkipPrompt) return;

    const id = setTimeout(() => {
      if (remainingSeconds <= 0) {
        if (isFocusMode) {
          if (lastLoggedCycleRef.current !== cycle) {
            const goalForHistory = currentGoal.trim();
            const elapsedFocusSeconds = Math.max(0, focusDurationSeconds - remainingSeconds);
            setSessionHistory((history) => [
              ...history,
              {
                id: Date.now() + Math.random(),
                cycle,
                goal: goalForHistory,
                focusElapsedSeconds: elapsedFocusSeconds,
              },
            ]);
            lastLoggedCycleRef.current = cycle;
            setConfettiBurstId((v) => v + 1);
          }
          setIsFocusMode(false);
          setStatusKey("focusDone");
          setRemainingSeconds(breakDurationSeconds);
          return;
        }

        setIsFocusMode(true);
        setCycle((v) => v + 1);
        setCurrentGoal("");
        setIsRunning(false);
        setStatusKey("ready");
        setRemainingSeconds(focusDurationSeconds);
        return;
      }

      setRemainingSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(id);
  }, [
    isRunning,
    isFocusMode,
    remainingSeconds,
    focusMinutes,
    breakMinutes,
    quickMode,
    showSettings,
    showGoalPrompt,
    showResetPrompt,
    showSkipPrompt,
    currentGoal,
    cycle,
    focusDurationSeconds,
    breakDurationSeconds,
  ]);

  useEffect(() => {
    if (confettiBurstId === 0) return;
    setShowConfetti(true);
    const id = setTimeout(() => {
      setShowConfetti(false);
    }, CONFETTI_DURATION_MS);
    return () => clearTimeout(id);
  }, [confettiBurstId]);

  const onStart = () => {
    if (isRunning) return;
    if (isFocusMode && remainingSeconds === focusDurationSeconds) {
      setGoalInput(currentGoal);
      setGoalModalMode("start");
      setGoalErrorKey("");
      setShowGoalPrompt(true);
      return;
    }
    setIsRunning(true);
    setStatusKey("running");
  };

  const onPause = () => {
    setIsRunning(false);
    setStatusKey("rest");
  };

  const onReset = () => {
    setShowGoalPrompt(false);
    setShowSkipPrompt(false);
    setGoalModalMode("start");
    setGoalErrorKey("");
    setShowResetPrompt(true);
  };

  const onSkip = () => {
    setShowGoalPrompt(false);
    setShowResetPrompt(false);
    setGoalModalMode("start");
    setGoalErrorKey("");
    setShowSkipPrompt(true);
  };

  const cancelResetPrompt = () => {
    setShowResetPrompt(false);
  };

  const cancelSkipPrompt = () => {
    setShowSkipPrompt(false);
  };

  const confirmReset = () => {
    setShowResetPrompt(false);
    setShowSkipPrompt(false);
    setIsRunning(false);
    setIsFocusMode(true);
    setCycle(1);
    setRemainingSeconds(focusDurationSeconds);
    setSessionHistory([]);
    setGoalInput("");
    setCurrentGoal("");
    setShowGoalPrompt(false);
    setGoalModalMode("start");
    setGoalErrorKey("");
    setShowConfetti(false);
    lastLoggedCycleRef.current = null;
    setStatusKey("ready");
  };

  const confirmSkip = () => {
    setShowSkipPrompt(false);

    if (isFocusMode) {
      if (lastLoggedCycleRef.current !== cycle) {
        const goalForHistory = currentGoal.trim();
        const elapsedFocusSeconds = Math.max(0, focusDurationSeconds - remainingSeconds);
        setSessionHistory((history) => [
          ...history,
          {
            id: Date.now() + Math.random(),
            cycle,
            goal: goalForHistory,
            focusElapsedSeconds: elapsedFocusSeconds,
          },
        ]);
        lastLoggedCycleRef.current = cycle;
      }
      setIsFocusMode(false);
      setStatusKey("focusDone");
      setRemainingSeconds(breakDurationSeconds);
      return;
    }

    setIsFocusMode(true);
    setCycle((v) => v + 1);
    setCurrentGoal("");
    setGoalInput("");
    setIsRunning(false);
    setStatusKey("ready");
    setRemainingSeconds(focusDurationSeconds);
  };

  const openSettings = () => {
    setIsRunning(false);
    setShowGoalPrompt(false);
    setShowResetPrompt(false);
    setShowSkipPrompt(false);
    setShowConfetti(false);
    setFocusInput(String(focusMinutes));
    setBreakInput(String(breakMinutes));
    setLanguageInput(language);
    setThemeInput(theme);
    setQuickModeInput(quickMode);
    setSettingsErrorKey("");
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
    setSettingsErrorKey("");
  };

  const cancelGoalPrompt = () => {
    setShowGoalPrompt(false);
    setGoalModalMode("start");
    setGoalErrorKey("");
  };

  const openGoalEditor = () => {
    if (!isFocusMode) return;
    const initialGoal = currentGoal === t.focus ? "" : currentGoal;
    setGoalInput(initialGoal);
    setGoalModalMode("edit");
    setGoalErrorKey("");
    setShowGoalPrompt(true);
  };

  const submitGoal = () => {
    const trimmed = goalInput.trim();
    setCurrentGoal(trimmed || t.focus);
    setGoalInput(trimmed);
    setShowGoalPrompt(false);
    setGoalModalMode("start");
    setGoalErrorKey("");
    if (goalModalMode === "start") {
      setIsRunning(true);
      setStatusKey("running");
    }
  };

  const saveSettings = () => {
    let nextFocus = focusMinutes;
    let nextBreak = breakMinutes;
    const nextQuickMode = canEditTimeSettings ? quickModeInput : quickMode;

    if (canEditTimeSettings) {
      nextFocus = Number.parseInt(focusInput, 10);
      nextBreak = Number.parseInt(breakInput, 10);

      if (Number.isNaN(nextFocus) || Number.isNaN(nextBreak)) {
        setSettingsErrorKey("numbersOnly");
        return;
      }

      if (nextFocus < 1 || nextFocus > 180 || nextBreak < 1 || nextBreak > 60) {
        setSettingsErrorKey("rangeError");
        return;
      }
    }

    setLanguage(languageInput);
    setTheme(themeInput);

    if (canEditTimeSettings) {
      setQuickMode(nextQuickMode);
      setFocusMinutes(nextFocus);
      setBreakMinutes(nextBreak);
      setRemainingSeconds(nextQuickMode ? 10 : nextFocus * 60);
      setCurrentGoal("");
      setGoalInput("");
      setGoalModalMode("start");
      setShowGoalPrompt(false);
      setShowConfetti(false);
    } else {
      setFocusInput(String(focusMinutes));
      setBreakInput(String(breakMinutes));
      setQuickModeInput(quickMode);
    }

    setSettingsErrorKey("");
    setShowSettings(false);
  };

  if (showSettings) {
    const tSettings = TEXT[languageInput];
    const thSettings = THEMES[themeInput];

    return (
      <main className={`min-h-[100dvh] ${thSettings.page} px-3 py-4 ${thSettings.text}`}>
        <section className={`mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-[420px] flex-col rounded-[30px] border p-5 backdrop-blur-2xl ${thSettings.shell}`}>
          <div className="mb-4 flex items-center justify-between gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{tSettings.settings}</h1>
            <button onClick={closeSettings} className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${thSettings.secondaryBtn}`}>
              {tSettings.backToTimer}
            </button>
          </div>

          <p className={`text-sm ${thSettings.subtle}`}>{tSettings.settingsDesc}</p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <div className={`mb-2 flex items-center gap-1 text-sm ${thSettings.muted}`}>
                <span>{tSettings.focusMinutes}</span>
                {!canEditTimeSettings ? (
                  <span className={thSettings.subtle} aria-hidden="true">
                    <LockIcon />
                  </span>
                ) : null}
              </div>
              <input
                type="number"
                min="1"
                max="180"
                value={focusInput}
                onChange={(e) => setFocusInput(e.target.value)}
                disabled={!canEditTimeSettings}
                className={`w-full rounded-xl border px-3 py-3 outline-none disabled:cursor-not-allowed ${thSettings.input} ${thSettings.disabledInput}`}
              />
            </label>

            <label className="block">
              <div className={`mb-2 flex items-center gap-1 text-sm ${thSettings.muted}`}>
                <span>{tSettings.breakMinutes}</span>
                {!canEditTimeSettings ? (
                  <span className={thSettings.subtle} aria-hidden="true">
                    <LockIcon />
                  </span>
                ) : null}
              </div>
              <input
                type="number"
                min="1"
                max="60"
                value={breakInput}
                onChange={(e) => setBreakInput(e.target.value)}
                disabled={!canEditTimeSettings}
                className={`w-full rounded-xl border px-3 py-3 outline-none disabled:cursor-not-allowed ${thSettings.input} ${thSettings.disabledInput}`}
              />
              {!canEditTimeSettings ? <p className={`mt-1 text-xs ${thSettings.subtle}`}>{tSettings.timeEditHint}</p> : null}
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className={`mb-2 block text-sm ${thSettings.muted}`}>{tSettings.language}</span>
                <select
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-3 outline-none ${thSettings.input}`}
                >
                  <option value="ko" className="text-black">
                    {tSettings.langKo}
                  </option>
                  <option value="en" className="text-black">
                    {tSettings.langEn}
                  </option>
                </select>
              </label>

              <label className="block">
                <span className={`mb-2 block text-sm ${thSettings.muted}`}>{tSettings.theme}</span>
                <select
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-3 outline-none ${thSettings.input}`}
                >
                  <option value="light" className="text-black">
                    {tSettings.light}
                  </option>
                  <option value="dark" className="text-black">
                    {tSettings.dark}
                  </option>
                </select>
              </label>
            </div>

            <label className="block">
              <div className={`mb-2 flex items-center gap-1 text-sm ${thSettings.muted}`}>
                <span>{tSettings.quickMode}</span>
                {!canEditTimeSettings ? (
                  <span className={thSettings.subtle} aria-hidden="true">
                    <LockIcon />
                  </span>
                ) : null}
              </div>
              <select
                value={quickModeInput ? "on" : "off"}
                onChange={(e) => setQuickModeInput(e.target.value === "on")}
                disabled={!canEditTimeSettings}
                className={`w-full rounded-xl border px-3 py-3 outline-none disabled:cursor-not-allowed ${thSettings.input} ${thSettings.disabledInput}`}
              >
                <option value="off" className="text-black">
                  {tSettings.quickModeOff}
                </option>
                <option value="on" className="text-black">
                  {tSettings.quickModeOn}
                </option>
              </select>
              <p className={`mt-1 text-xs ${thSettings.subtle}`}>{tSettings.quickModeDesc}</p>
            </label>
          </div>

          {settingsErrorKey ? <p className="mt-3 text-sm text-red-400">{tSettings[settingsErrorKey]}</p> : null}

          <button onClick={saveSettings} className={`mt-auto rounded-xl border px-4 py-3 text-sm font-semibold transition ${thSettings.primaryBtn}`}>
            {tSettings.save}
          </button>
        </section>
      </main>
    );
  }

  const focusLabel = statusKey === "rest" ? t.rest : currentGoal || t.focus;
  const canEditGoal = isFocusMode && (isRunning || remainingSeconds !== focusDurationSeconds || Boolean(currentGoal.trim()));
  const isWaitingNextSession = !isRunning && isFocusMode && remainingSeconds === focusDurationSeconds && cycle > 1;
  const canShowSkip = canEditGoal || !isFocusMode;
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
            {quickMode ? <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${th.chip}`}>{t.quickModeDesc}</span> : null}
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

          <div className={`relative mt-4 h-14 rounded-2xl border ${th.raceTrack}`}>
            <div className={`absolute left-10 right-10 top-1/2 h-1 -translate-y-1/2 rounded-full ${th.raceLine}`} />

            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm">{"\u{1F6A9}"}</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-lg">{"\u{1F3C1}"}</span>

            <div
              className={`absolute top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border text-center leading-8 transition-all duration-500 ${th.runnerBadge}`}
              style={{ left: `calc(40px + (100% - 80px) * ${progressPercent / 100})`, transform: "translate(-50%, -50%)" }}
            >
              {isRunning ? "🐥" : "🐣"}
            </div>
          </div>
        </div>

        <div className={`mt-4 rounded-2xl border p-3 ${th.panel}`}>
          <p className={`text-sm font-semibold ${th.muted}`}>{t.sessionHistory}</p>
          {sessionHistory.length === 0 ? (
            <p className={`mt-2 text-xs ${th.subtle}`}>{t.emptyHistory}</p>
          ) : (
            <ul className="mt-2 max-h-28 space-y-2 overflow-y-auto pr-1">
              {sessionHistory.map((item) => (
                <li key={item.id} className={`rounded-lg border px-2 py-2 text-xs ${th.panelSoft}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className={`mr-2 font-medium ${th.muted}`}>
                        {t.cycle} {item.cycle}
                      </span>
                      <span className={`${th.subtle}`}>{item.goal || t.focus}</span>
                    </div>
                    <span className={`timer-font shrink-0 font-medium ${th.muted}`}>{formatSeconds(item.focusElapsedSeconds ?? 0)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

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

        {showConfetti ? (
          <div className="confetti-overlay absolute inset-0 z-10 overflow-hidden rounded-[30px] pointer-events-none">
            {CONFETTI_PIECES.map((piece, index) => (
              <span
                key={`${confettiBurstId}-${index}`}
                className="confetti-piece confetti-burst"
                style={{
                  left: `${piece.left}%`,
                  top: `${piece.top}%`,
                  width: `${piece.width}px`,
                  height: `${piece.height}px`,
                  backgroundColor: piece.color,
                  "--tx": `${piece.tx}px`,
                  "--ty": `${piece.ty}px`,
                  "--rot": `${piece.rotate}deg`,
                  "--dur": `${piece.duration}s`,
                  "--delay": `${piece.delay}s`,
                }}
              />
            ))}
          </div>
        ) : null}

        {showGoalPrompt ? (
          <div className={`absolute inset-0 z-20 grid place-items-center rounded-[30px] p-4 backdrop-blur-sm ${th.modalBackdrop}`}>
            <div className={`w-full rounded-2xl border p-4 ${th.modalCard}`}>
              <h2 className="text-lg font-semibold">{goalModalMode === "edit" ? t.goalEditTitle : t.goalTitle}</h2>
              <p className={`mt-1 text-sm ${th.subtle}`}>{goalModalMode === "edit" ? t.goalEditDesc : t.goalDesc}</p>

              <label className="mt-4 block">
                <span className={`mb-2 block text-sm ${th.muted}`}>{t.goalLabel}</span>
                <input
                  autoFocus
                  type="text"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitGoal();
                  }}
                  placeholder={t.goalPlaceholder}
                  className={`w-full rounded-xl border px-3 py-3 outline-none ${th.input}`}
                />
              </label>

              {goalErrorKey ? <p className="mt-2 text-sm text-red-400">{t[goalErrorKey]}</p> : null}

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={cancelGoalPrompt} className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${th.secondaryBtn}`}>
                  {t.goalCancel}
                </button>
                <button onClick={submitGoal} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${th.primaryBtn}`}>
                  {goalModalMode === "edit" ? t.goalSave : t.goalStart}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {showResetPrompt ? (
          <div className={`absolute inset-0 z-30 grid place-items-center rounded-[30px] p-4 backdrop-blur-sm ${th.modalBackdrop}`}>
            <div className={`w-full rounded-2xl border p-4 ${th.modalCard}`}>
              <h2 className="text-lg font-semibold">{t.resetTitle}</h2>
              <p className={`mt-1 text-sm ${th.subtle}`}>{t.resetDesc}</p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={confirmReset} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${th.dangerBtn}`}>
                  {t.reset}
                </button>
                <button onClick={cancelResetPrompt} className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${th.secondaryBtn}`}>
                  {t.goalCancel}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {showSkipPrompt ? (
          <div className={`absolute inset-0 z-30 grid place-items-center rounded-[30px] p-4 backdrop-blur-sm ${th.modalBackdrop}`}>
            <div className={`w-full rounded-2xl border p-4 ${th.modalCard}`}>
              <h2 className="text-lg font-semibold">{t.skipTitle}</h2>
              <p className={`mt-1 text-sm ${th.subtle}`}>{isFocusMode ? t.skipDescFocus : t.skipDescBreak}</p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={confirmSkip} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${th.primaryBtn}`}>
                  {t.skip}
                </button>
                <button onClick={cancelSkipPrompt} className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${th.secondaryBtn}`}>
                  {t.goalCancel}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 0 1 14.13-7.4L21 8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 3v5h-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 0 1-14.13 7.4L3 16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-5h5" />
    </svg>
  );
}

function SkipIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 6l8 6-8 6V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 6l8 6-8 6V6z" />
    </svg>
  );
}
