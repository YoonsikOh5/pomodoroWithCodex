import { useEffect, useMemo, useRef, useState } from "react";
import { CONFETTI_DURATION_MS } from "./confetti";

const DEFAULT_FOCUS_MINUTES = 50;
const DEFAULT_BREAK_MINUTES = 10;

export default function usePomodoroTimer() {
  const [language, setLanguage] = useState("ko");
  const [theme, setTheme] = useState("light");

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

  const focusDurationSeconds = focusMinutes * 60;
  const breakDurationSeconds = breakMinutes * 60;
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

  const canEditGoal = isFocusMode && (isRunning || remainingSeconds !== focusDurationSeconds || Boolean(currentGoal.trim()));
  const isWaitingNextSession = !isRunning && isFocusMode && remainingSeconds === focusDurationSeconds && cycle > 1;
  const canShowSkip = canEditGoal || !isFocusMode;

  return {
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
  };
}
