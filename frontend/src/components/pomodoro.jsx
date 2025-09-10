import React, { useState, useEffect } from "react";
import "../assets/pomodoro.css";
import { useTranslation } from "react-i18next";

const DURATIONS = {
  pomodoro: 25 * 60,
  short_break: 5 * 60,
  long_break: 30 * 60,
};

function PomodoroTimer() {
  const { t } = useTranslation();
  const [mode, setMode] = useState("pomodoro"); // 'pomodoro' | 'short_break' | 'long_break'
  const [timeLeft, setTimeLeft] = useState(DURATIONS.pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0); // Times that pomodoro completed today
  const [pomodoroStreak, setPomodoroStreak] = useState(0); // Streak of pomodoros completed in current cycle


  useEffect(() => {
    let timer = null;
    if (isRunning) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === 0) {
            handleModeSwitch();
            return getNextTime();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, mode]);

  const handleModeSwitch = () => {
    if (mode === "pomodoro") {
      setSessionCount(prev => prev + 1);
      setPomodoroStreak(prev => prev + 1);
      if ((pomodoroStreak + 1) % 4 === 0) {
        setMode("long_break");
      } else {
        setMode("short_break");
      }
    } else {
      setMode("pomodoro");
    }
  };

  const getNextTime = () => {
    if (mode === "pomodoro") {
      return DURATIONS.short_break;
    } else if (mode === "short_break" && (pomodoroStreak + 1) % 4 === 0) {
      return DURATIONS.long_break;
    } else if (mode === "short_break" || mode === "long_break") {
      return DURATIONS.pomodoro;
    }
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const modeDisplay = {
    pomodoro: t("pomodoro.focus"),
    short_break: t("pomodoro.short"),
    long_break: t("pomodoro.long"),
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(DURATIONS[mode]);
  };

  return (
    <div className="pomodoro-container">
      <h1>{t("pomodoro.title")}</h1>
      <div className="timer">{formatTime(timeLeft)}</div>
      <div className="status">{modeDisplay[mode]}</div>
      <div className="buttons">
        <button onClick={() => setIsRunning(true)}>{t("pomodoro.start")}</button>
        <button onClick={() => setIsRunning(false)}>{t("pomodoro.pause")}</button>
        <button onClick={handleReset}>{t("pomodoro.reset")}</button>
      </div>
      <p className="counter">{t("pomodoro.timer")}{sessionCount}</p>
    </div>
  );
}

export default PomodoroTimer;
