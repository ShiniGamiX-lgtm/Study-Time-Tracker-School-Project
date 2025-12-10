import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Timer, Flag, RotateCcw, History, BellRing } from 'lucide-react';
import { SubjectSummary } from '../types';

interface LiveTimerProps {
  onSessionComplete: (subject: string, minutes: number) => void;
  onNotification: (message: string, type: 'success' | 'info' | 'error') => void;
  initialSubject?: string;
  initialGoal?: number;
  autoStart?: boolean;
  allSubjects: SubjectSummary[]; // Needed to calculate historical total
}

const LiveTimer: React.FC<LiveTimerProps> = ({ 
  onSessionComplete, 
  onNotification,
  initialSubject = '', 
  initialGoal,
  autoStart = false,
  allSubjects
}) => {
  const [subject, setSubject] = useState(initialSubject);
  const [goal, setGoal] = useState<number | undefined>(initialGoal);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  
  const intervalRef = useRef<number | null>(null);

  // Play a pleasant "ding" sound using Web Audio API (no external assets needed)
  const playSuccessSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // A nice major chord arpeggio or simple ding
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1); // C6
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  // Handle incoming props changes
  useEffect(() => {
    if (initialSubject) {
      setSubject(initialSubject);
      setGoal(initialGoal); 
      if (autoStart) {
        setSeconds(0);
        setIsActive(true);
        setIsPaused(false);
        setHasFinished(false);
        requestNotificationPermission();
      }
    }
  }, [initialSubject, initialGoal, autoStart]);

  // Timer Interval
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused]);

  // Check for Goal Completion
  useEffect(() => {
    if (goal && isActive && !hasFinished) {
        // Check if we just crossed the goal threshold
        // Using >= ensures we catch it even if logic skips a split second, 
        // but hasFinished prevents spamming.
        if (Math.floor(seconds / 60) >= goal) {
            setHasFinished(true);
            playSuccessSound();
            
            // In-App Toast
            onNotification(`🎉 Session Goal Reached: ${goal} mins of ${subject}!`, 'success');

            // Browser Notification (if user is in another tab)
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification("Study Goal Reached! 🎓", {
                    body: `You've completed your ${goal} minute goal for ${subject}. Great job!`,
                    icon: '/favicon.ico' // Falls back gracefully if missing
                });
            }
        }
    }
  }, [seconds, goal, isActive, hasFinished, subject, onNotification]);

  const toggleTimer = () => {
    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
      setHasFinished(false);
      requestNotificationPermission();
    } else {
      setIsPaused(!isPaused);
    }
  };

  const stopTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Calculate minutes (minimum 1 minute if some seconds passed)
    const minutesLogged = seconds > 0 ? Math.max(1, Math.round(seconds / 60)) : 0;
    
    if (minutesLogged > 0 && subject.trim()) {
      onSessionComplete(subject, minutesLogged);
    }
    
    setSeconds(0);
    setGoal(undefined);
    setHasFinished(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setSeconds(0);
    setHasFinished(false);
    // We do NOT clear the subject or goal, just the time, allowing a restart.
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Find historical data for the currently typed subject
  const historicalMinutes = allSubjects.find(s => s.subject.toLowerCase() === subject.trim().toLowerCase())?.totalMinutes || 0;
  const historicalSeconds = historicalMinutes * 60;
  const grandTotalSeconds = historicalSeconds + seconds;

  // Calculate progress percentage if goal is set
  const progressPercent = goal && goal > 0 
    ? Math.min((seconds / (goal * 60)) * 100, 100) 
    : 0;

  return (
    <div className={`bg-slate-800 p-6 rounded-2xl shadow-xl border mb-6 relative overflow-hidden group transition-colors duration-500 ${hasFinished ? 'border-green-500/50 shadow-green-900/20' : 'border-indigo-500/30'}`}>
      {/* Background Pulse Animation when Active */}
      {isActive && !isPaused && !hasFinished && (
        <div className="absolute inset-0 bg-indigo-500/5 animate-pulse pointer-events-none" />
      )}
      {hasFinished && (
          <div className="absolute inset-0 bg-green-500/10 pointer-events-none" />
      )}
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            {hasFinished ? <BellRing className="text-green-400 animate-bounce" /> : <Timer className={isActive ? "text-green-400 animate-pulse" : "text-indigo-400"} />}
            Live Study Mode
          </h2>
          {isActive ? (
            <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-red-500/20 text-red-400 animate-pulse">
              REC
            </span>
          ) : (
            goal ? (
               <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                 <Flag size={10} /> GOAL: {goal}m
               </span>
            ) : null
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Subject Input */}
          <div className="w-full md:flex-1">
            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">
              Focus Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What are you studying?"
              disabled={isActive}
              className={`w-full bg-slate-900 text-white px-4 py-3 rounded-lg border outline-none transition-all
                ${isActive ? 'border-indigo-500/50 text-indigo-200' : 'border-slate-700 focus:border-indigo-500'}
              `}
            />
            {/* Live Historical Data Monitor */}
            {subject && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                    <History size={12} className="text-indigo-400" />
                    <span>Total Accumulated:</span>
                    <span className="text-indigo-300 font-mono font-bold">{formatTime(grandTotalSeconds)}</span>
                </div>
            )}
          </div>

          {/* Timer Display */}
          <div className="flex flex-col items-center justify-center min-w-[160px] relative">
             <div className={`text-4xl md:text-5xl font-mono font-bold tracking-wider transition-colors duration-300 relative z-10
              ${hasFinished ? 'text-green-400' : (isActive && !isPaused ? 'text-white' : 'text-slate-500')}
            `}>
              {formatTime(seconds)}
            </div>
            
            {/* Goal Progress Indicator */}
            {goal && isActive && (
                <div className="w-full mt-2 bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ${progressPercent >= 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            )}
            {goal && isActive && (
                <p className={`text-xs mt-1 transition-colors ${hasFinished ? 'text-green-400 font-bold' : 'text-slate-400'}`}>
                    {hasFinished ? 'GOAL COMPLETED!' : `Target: ${goal}m`}
                </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-center">
            {/* Reset Button */}
            <button
                onClick={resetTimer}
                disabled={seconds === 0 && !isActive}
                className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-lg"
                title="Reset Timer"
            >
                <RotateCcw size={16} />
            </button>

            {!isActive ? (
              <button
                onClick={toggleTimer}
                disabled={!subject.trim()}
                className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg shadow-indigo-500/30"
                title="Start Timer"
              >
                <Play fill="currentColor" className="ml-1" />
              </button>
            ) : (
              <>
                <button
                  onClick={toggleTimer}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg
                    ${isPaused 
                      ? 'bg-green-600 hover:bg-green-500 text-white' 
                      : 'bg-yellow-600 hover:bg-yellow-500 text-white'}
                  `}
                  title={isPaused ? "Resume" : "Pause"}
                >
                  {isPaused ? <Play fill="currentColor" className="ml-1" /> : <Pause fill="currentColor" />}
                </button>
                <button
                  onClick={stopTimer}
                  className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-500/30"
                  title="Stop & Save"
                >
                  <Square fill="currentColor" size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTimer;