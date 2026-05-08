import { useEffect, useMemo, useRef, useState } from "react";
import { CONFETTI_DURATION_MS } from "./confetti";

const DEFAULT_FOCUS_MINUTES = 50;
const DEFAULT_BREAK_MINUTES = 10;
const PROGRESS_BAR_TYPES = ["circle", "runner", "none"];
const PERSIST_STORAGE_KEY = "pomodoro:persist:v1";
const LANGUAGES = ["ko", "en"];
const THEMES = ["light", "dark"];
const STATUS_KEYS = ["ready", "running", "rest", "focusDone", "breakDone", "paused"];

function clampInteger(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  const intValue = Math.floor(value);
  if (intValue < min || intValue > max) return fallback;
  return intValue;
}

function normalizeHistory(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item, index) => {
      const cycle = clampInteger(item?.cycle, 1, 999999, null);
      if (cycle === null) return null;

      const focusElapsedSeconds = clampInteger(item?.focusElapsedSeconds, 0, 180 * 60, 0);
      const goal = typeof item?.goal === "string" ? item.goal : "";
      const id = item?.id ?? `${Date.now()}-${index}-${Math.random()}`;

      return {
        id,
        cycle,
        goal,
        focusElapsedSeconds,
      };
    })
    .filter(Boolean);
}

function advanceSnapshot(snapshot, focusDurationSeconds, breakDurationSeconds, elapsedSeconds) {
  const initialIsFocusMode = snapshot?.isFocusMode !== false;
  const initialCycle = clampInteger(snapshot?.cycle, 1, 999999, 1);
  const initialRemaining = clampInteger(
    snapshot?.remainingSeconds,
    0,
    initialIsFocusMode ? focusDurationSeconds : breakDurationSeconds,
    initialIsFocusMode ? focusDurationSeconds : breakDurationSeconds
  );
  const initialIsRunning = Boolean(snapshot?.isRunning);
  const initialCurrentGoal = typeof snapshot?.currentGoal === "string" ? snapshot.currentGoal : "";
  const initialStatusKey = STATUS_KEYS.includes(snapshot?.statusKey) ? snapshot.statusKey : initialIsRunning ? "running" : "ready";

  let isFocusMode = initialIsFocusMode;
  let cycle = initialCycle;
  let remainingSeconds = initialRemaining;
  let isRunning = initialIsRunning;
  let currentGoal = initialCurrentGoal;
  let statusKey = initialStatusKey;
  const completedFocusEntries = [];
  let elapsed = Math.max(0, Math.floor(elapsedSeconds));

  if (isRunning) {
    while (isRunning) {
      if (remainingSeconds > 0) {
        if (elapsed < remainingSeconds) {
          remainingSeconds -= elapsed;
          elapsed = 0;
          break;
        }

        elapsed -= remainingSeconds;
      }

      if (isFocusMode) {
        completedFocusEntries.push({
          cycle,
          goal: currentGoal.trim(),
          focusElapsedSeconds: focusDurationSeconds,
        });
        isFocusMode = false;
        statusKey = "focusDone";
        remainingSeconds = breakDurationSeconds;
        if (elapsed <= 0) {
          break;
        }
        continue;
      }

      isFocusMode = true;
      cycle += 1;
      currentGoal = "";
      isRunning = false;
      statusKey = "ready";
      remainingSeconds = focusDurationSeconds;
      break;
    }

    if (isRunning && statusKey !== "focusDone") {
      statusKey = "running";
    }
  } else if (statusKey === "running") {
    statusKey = "rest";
  }

  return {
    isFocusMode,
    cycle,
    remainingSeconds,
    isRunning,
    currentGoal,
    statusKey,
    completedFocusEntries,
  };
}

function restoreSnapshot(snapshot, focusDurationSeconds, breakDurationSeconds) {
  const isRunning = Boolean(snapshot?.isRunning);
  const savedAt = Number.isFinite(snapshot?.savedAt) ? snapshot.savedAt : Date.now();
  const elapsedSeconds = isRunning ? Math.max(0, Math.floor((Date.now() - savedAt) / 1000)) : 0;
  return advanceSnapshot(snapshot, focusDurationSeconds, breakDurationSeconds, elapsedSeconds);
}

export default function usePomodoroTimer() {
  const [language, setLanguage] = useState("ko");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

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
  const [progressBarType, setProgressBarType] = useState("circle");
  const [progressBarInput, setProgressBarInput] = useState("circle");
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
  const lastTickAtRef = useRef(Date.now());
  const hasHydratedRef = useRef(false);

  const focusDurationSeconds = focusMinutes * 60;
  const breakDurationSeconds = breakMinutes * 60;
  const totalSeconds = isFocusMode ? focusDurationSeconds : breakDurationSeconds;
  const canEditTimeSettings = !isRunning && isFocusMode && remainingSeconds === focusDurationSeconds && currentGoal.trim() === "";
  const timerBlocked = showSettings || showGoalPrompt || showResetPrompt || showSkipPrompt;

  const progressPercent = useMemo(() => {
    if (totalSeconds <= 0) return 0;
    return Math.min(100, Math.max(0, ((totalSeconds - remainingSeconds) / totalSeconds) * 100));
  }, [remainingSeconds, totalSeconds]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(PERSIST_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const persistedSettings = parsed?.settings ?? {};

      const nextFocusMinutes = clampInteger(persistedSettings.focusMinutes, 1, 180, DEFAULT_FOCUS_MINUTES);
      const nextBreakMinutes = clampInteger(persistedSettings.breakMinutes, 1, 60, DEFAULT_BREAK_MINUTES);
      const nextLanguage = LANGUAGES.includes(persistedSettings.language) ? persistedSettings.language : "ko";
      const nextTheme = THEMES.includes(persistedSettings.theme) ? persistedSettings.theme : "light";
      const nextProgressBarType = PROGRESS_BAR_TYPES.includes(persistedSettings.progressBarType)
        ? persistedSettings.progressBarType
        : "circle";

      setFocusMinutes(nextFocusMinutes);
      setBreakMinutes(nextBreakMinutes);
      setFocusInput(String(nextFocusMinutes));
      setBreakInput(String(nextBreakMinutes));
      setLanguage(nextLanguage);
      setLanguageInput(nextLanguage);
      setTheme(nextTheme);
      setThemeInput(nextTheme);
      setProgressBarType(nextProgressBarType);
      setProgressBarInput(nextProgressBarType);

      const restoredHistory = normalizeHistory(parsed?.sessionHistory);
      const restoredSnapshot = restoreSnapshot(parsed?.snapshot, nextFocusMinutes * 60, nextBreakMinutes * 60);
      const downtimeHistory = restoredSnapshot.completedFocusEntries.map((entry, index) => ({
        ...entry,
        id: `${Date.now()}-${entry.cycle}-${index}`,
      }));
      const nextSessionHistory = [...restoredHistory, ...downtimeHistory];
      const maxLoggedCycle = nextSessionHistory.reduce((max, entry) => Math.max(max, entry.cycle), 0);

      setSessionHistory(nextSessionHistory);
      lastLoggedCycleRef.current = maxLoggedCycle > 0 ? maxLoggedCycle : null;

      setIsFocusMode(restoredSnapshot.isFocusMode);
      setCycle(restoredSnapshot.cycle);
      setRemainingSeconds(restoredSnapshot.remainingSeconds);
      setIsRunning(restoredSnapshot.isRunning);
      setCurrentGoal(restoredSnapshot.currentGoal);
      setGoalInput(restoredSnapshot.currentGoal);
      setStatusKey(restoredSnapshot.statusKey);
    } catch (error) {
      console.error("Failed to restore persisted pomodoro state", error);
    } finally {
      hasHydratedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !hasHydratedRef.current) return;

    const payload = {
      settings: {
        focusMinutes,
        breakMinutes,
        language,
        theme,
        progressBarType,
      },
      sessionHistory,
      snapshot: {
        isFocusMode,
        cycle,
        remainingSeconds,
        isRunning,
        currentGoal,
        statusKey,
        savedAt: Date.now(),
      },
    };

    try {
      window.localStorage.setItem(PERSIST_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error("Failed to persist pomodoro state", error);
    }
  }, [
    focusMinutes,
    breakMinutes,
    language,
    theme,
    progressBarType,
    sessionHistory,
    isFocusMode,
    cycle,
    remainingSeconds,
    isRunning,
    currentGoal,
    statusKey,
  ]);

  useEffect(() => {
    lastTickAtRef.current = Date.now();
  }, [isRunning, timerBlocked]);

  useEffect(() => {
    if (!isRunning || timerBlocked) return;

    const syncTimer = () => {
      const now = Date.now();
      const elapsedSeconds = Math.max(0, Math.floor((now - lastTickAtRef.current) / 1000));
      if (elapsedSeconds <= 0) return;

      lastTickAtRef.current = now;

      const nextSnapshot = advanceSnapshot(
        {
          isFocusMode,
          cycle,
          remainingSeconds,
          isRunning,
          currentGoal,
          statusKey,
        },
        focusDurationSeconds,
        breakDurationSeconds,
        elapsedSeconds
      );
      const completedFocusEntries = nextSnapshot.completedFocusEntries.filter(
        (entry) => lastLoggedCycleRef.current !== entry.cycle
      );

      if (completedFocusEntries.length > 0) {
        const entryTimestamp = Date.now();
        setSessionHistory((history) => [
          ...history,
          ...completedFocusEntries.map((entry, index) => ({
            ...entry,
            id: `${entryTimestamp}-${entry.cycle}-${index}-${Math.random()}`,
          })),
        ]);
        lastLoggedCycleRef.current = completedFocusEntries[completedFocusEntries.length - 1].cycle;
        setConfettiBurstId((v) => v + 1);
      }

      setIsFocusMode(nextSnapshot.isFocusMode);
      setCycle(nextSnapshot.cycle);
      setRemainingSeconds(nextSnapshot.remainingSeconds);
      setIsRunning(nextSnapshot.isRunning);
      setCurrentGoal(nextSnapshot.currentGoal);
      setStatusKey(nextSnapshot.statusKey);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncTimer();
      }
    };

    const id = setTimeout(syncTimer, 1000);
    window.addEventListener("focus", syncTimer);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(id);
      window.removeEventListener("focus", syncTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    isRunning,
    timerBlocked,
    isFocusMode,
    remainingSeconds,
    currentGoal,
    statusKey,
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
    setStatusKey("paused");
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
    setProgressBarInput(progressBarType);
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
    setGoalInput(currentGoal);
    setGoalModalMode("edit");
    setGoalErrorKey("");
    setShowGoalPrompt(true);
  };

  const submitGoal = () => {
    const trimmed = goalInput.trim();
    if (goalModalMode === "start" && !trimmed) {
      setGoalErrorKey("goalRequired");
      return;
    }
    setCurrentGoal(trimmed);
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
    setProgressBarType(progressBarInput);

    if (canEditTimeSettings) {
      setFocusMinutes(nextFocus);
      setBreakMinutes(nextBreak);
      setRemainingSeconds(nextFocus * 60);
      setCurrentGoal("");
      setGoalInput("");
      setGoalModalMode("start");
      setShowGoalPrompt(false);
      setShowConfetti(false);
    } else {
      setFocusInput(String(focusMinutes));
      setBreakInput(String(breakMinutes));
    }

    setSettingsErrorKey("");
    setShowSettings(false);
  };

  const toggleProgressBarType = () => {
    setProgressBarType((prev) => {
      const currentIndex = PROGRESS_BAR_TYPES.indexOf(prev);
      const safeIndex = currentIndex === -1 ? 0 : currentIndex;
      const nextType = PROGRESS_BAR_TYPES[(safeIndex + 1) % PROGRESS_BAR_TYPES.length];
      setProgressBarInput(nextType);
      return nextType;
    });
  };

  const canEditGoal = isFocusMode && (isRunning || remainingSeconds !== focusDurationSeconds || Boolean(currentGoal.trim()));
  const isWaitingNextSession = !isRunning && isFocusMode && remainingSeconds === focusDurationSeconds && cycle > 1;
  const canShowSkip = canEditGoal || !isFocusMode;

  return {
    language,
    theme,
    progressBarType,
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
    toggleProgressBarType,
  };
}
