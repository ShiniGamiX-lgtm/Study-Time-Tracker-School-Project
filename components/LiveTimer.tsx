import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Timer, Flag, RotateCcw, History, BellRing, Maximize2, Minimize2, Headphones, VolumeX } from 'lucide-react';
import { SubjectSummary } from '../types';

interface LiveTimerProps {
  onSessionComplete: (subject: string, minutes: number) => void;
  onNotification: (message: string, type: 'success' | 'info' | 'error') => void;
  initialSubject?: string;
  initialGoal?: number;
  autoStart?: boolean;
  allSubjects: SubjectSummary[];
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
  
  // New State for enhancements
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  const intervalRef = useRef<number | null>(null);
  
  // Audio Context Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // --- SOUND ENGINE (Brown Noise) ---
  const toggleSound = () => {
    if (isSoundEnabled) {
      // Stop Sound
      if (noiseSourceRef.current) {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
        noiseSourceRef.current = null;
      }
      setIsSoundEnabled(false);
    } else {
      // Start Sound
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContext();
        }
        const ctx = audioCtxRef.current;
        
        // Resume context if suspended (browser policy)
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate Brown Noise
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5; // Compensate for gain
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        
        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.15; // Volume
        
        // Simple Lowpass filter to make it softer
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        noise.start();
        
        noiseSourceRef.current = noise;
        gainNodeRef.current = gainNode;
        setIsSoundEnabled(true);
      } catch (e) {
        console.error("Audio init failed", e);
        onNotification("Could not start audio. Check permissions.", "error");
      }
    }
  };

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (noiseSourceRef.current) noiseSourceRef.current.stop();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const playSuccessSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1);
      
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

  useEffect(() => {
    if (goal && isActive && !hasFinished) {
        if (Math.floor(seconds / 60) >= goal) {
            setHasFinished(true);
            playSuccessSound();
            onNotification(`🎉 Session Goal Reached: ${goal} mins of ${subject}!`, 'success');
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification("Study Goal Reached! 🎓", {
                    body: `You've completed your ${goal} minute goal for ${subject}. Great job!`,
                    icon: '/favicon.ico'
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
    
    // Stop ambient sound if playing
    if (isSoundEnabled) toggleSound();

    const minutesLogged = seconds > 0 ? Math.max(1, Math.round(seconds / 60)) : 0;
    
    if (minutesLogged > 0 && subject.trim()) {
      onSessionComplete(subject, minutesLogged);
    }
    
    setSeconds(0);
    setGoal(undefined);
    setHasFinished(false);
    setIsFocusMode(false); // Exit focus mode on stop
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setSeconds(0);
    setHasFinished(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const historicalMinutes = allSubjects.find(s => s.subject.toLowerCase() === subject.trim().toLowerCase())?.totalMinutes || 0;
  const historicalSeconds = historicalMinutes * 60;
  const grandTotalSeconds = historicalSeconds + seconds;

  const progressPercent = goal && goal > 0 
    ? Math.min((seconds / (goal * 60)) * 100, 100) 
    : 0;

  // --- FOCUS MODE RENDER ---
  if (isFocusMode) {
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fdfbf7] backdrop-blur-xl animate-pop-in">
            <button 
                onClick={() => setIsFocusMode(false)}
                className="absolute top-8 right-8 text-stone-400 hover:text-stone-600 transition-colors"
                title="Exit Focus Mode"
            >
                <Minimize2 size={32} />
            </button>

            {/* Ambient Sound Toggle in Focus Mode */}
            <button
                onClick={toggleSound}
                className={`absolute top-8 left-8 p-3 rounded-full transition-all ${isSoundEnabled ? 'bg-stone-700 text-white shadow-lg shadow-stone-300' : 'bg-white text-stone-400 hover:bg-stone-100 border border-stone-200'}`}
                title="Toggle Ambient Noise"
            >
                {isSoundEnabled ? <Headphones size={24} /> : <VolumeX size={24} />}
            </button>

            <div className="text-center mb-8">
                <h2 className="text-3xl font-light text-stone-700 tracking-wide mb-2">{subject || 'Studying...'}</h2>
                {goal && <p className="text-amber-600 font-medium">Goal: {goal} min</p>}
            </div>

            {/* Circular Timer */}
            <div className="relative flex items-center justify-center mb-12">
                <svg className="transform -rotate-90 w-[300px] h-[300px]">
                    <circle
                        cx="150"
                        cy="150"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-stone-200"
                    />
                    <circle
                        cx="150"
                        cy="150"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={`${hasFinished ? 'text-green-500' : 'text-stone-600'} transition-all duration-1000 ease-in-out`}
                    />
                </svg>
                <div className="absolute text-5xl font-mono font-bold text-stone-700">
                    {formatTime(seconds)}
                </div>
            </div>

            <div className="flex gap-6">
                 {!isPaused ? (
                     <button onClick={toggleTimer} className="p-6 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-xl hover:scale-105 transition-all">
                        <Pause size={32} fill="currentColor" />
                     </button>
                 ) : (
                    <button onClick={toggleTimer} className="p-6 rounded-full bg-stone-600 hover:bg-stone-700 text-white shadow-xl hover:scale-105 transition-all">
                        <Play size={32} fill="currentColor" />
                     </button>
                 )}
                 <button onClick={stopTimer} className="p-6 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-xl hover:scale-105 transition-all">
                    <Square size={32} fill="currentColor" />
                 </button>
            </div>
        </div>
    );
  }

  // --- STANDARD MODE RENDER ---
  return (
    <div className={`glass-panel p-6 rounded-2xl shadow-sm mb-6 relative overflow-hidden group transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${hasFinished ? 'border-green-400/50 shadow-green-100' : 'border-white/60'}`}>
      {/* Background Pulse Animation when Active */}
      {isActive && !isPaused && !hasFinished && (
        <div className="absolute inset-0 bg-amber-50/30 animate-pulse pointer-events-none" />
      )}
      {hasFinished && (
          <div className="absolute inset-0 bg-green-50/50 pointer-events-none" />
      )}
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-stone-800 flex items-center gap-2">
            {hasFinished ? <BellRing className="text-green-500 animate-bounce" /> : <Timer className={isActive ? "text-amber-600 animate-pulse" : "text-stone-400"} />}
            Live Study Mode
          </h2>
          <div className="flex items-center gap-2">
              {isActive ? (
                <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-red-100 text-red-500 animate-pulse border border-red-200">
                  REC
                </span>
              ) : (
                goal ? (
                   <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-amber-100 text-amber-700 flex items-center gap-1 border border-amber-200">
                     <Flag size={10} /> GOAL: {goal}m
                   </span>
                ) : null
              )}
              {/* Focus Mode Toggle */}
              <button 
                onClick={() => setIsFocusMode(true)}
                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-700 transition-colors"
                title="Enter Focus Mode"
              >
                  <Maximize2 size={16} />
              </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Subject Input */}
          <div className="w-full md:flex-1">
            <label className="block text-xs font-medium text-stone-500 mb-1 uppercase tracking-wide">
              Focus Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What are you studying?"
              disabled={isActive}
              className={`w-full bg-white/50 backdrop-blur-sm text-stone-800 px-4 py-3 rounded-lg border outline-none transition-all
                ${isActive ? 'border-amber-300 bg-amber-50/50 text-amber-900' : 'border-stone-200 focus:border-amber-500'}
              `}
            />
            {subject && (
                <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-100 p-2 rounded-lg border border-stone-200">
                        <History size={12} className="text-stone-400" />
                        <span>Accumulated:</span>
                        <span className="text-stone-700 font-mono font-bold">{formatTime(grandTotalSeconds)}</span>
                    </div>
                    {/* Sound Toggle (Mini) */}
                    <button
                        onClick={toggleSound}
                        className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition-colors ${isSoundEnabled ? 'bg-stone-200 text-stone-700 border border-stone-300' : 'text-stone-400 hover:text-stone-600'}`}
                        title="Brown Noise"
                    >
                        {isSoundEnabled ? <Headphones size={12} /> : <VolumeX size={12} />}
                        {isSoundEnabled ? 'ON' : 'OFF'}
                    </button>
                </div>
            )}
          </div>

          {/* Timer Display */}
          <div className="flex flex-col items-center justify-center min-w-[160px] relative">
             <div className={`text-4xl md:text-5xl font-mono font-bold tracking-wider transition-colors duration-300 relative z-10
              ${hasFinished ? 'text-green-500' : (isActive && !isPaused ? 'text-amber-700' : 'text-stone-300')}
            `}>
              {formatTime(seconds)}
            </div>
            
            {/* Goal Progress Indicator */}
            {goal && isActive && (
                <div className="w-full mt-2 bg-stone-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ${progressPercent >= 100 ? 'bg-green-500' : 'bg-amber-600'}`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            )}
            {goal && isActive && (
                <p className={`text-xs mt-1 transition-colors ${hasFinished ? 'text-green-600 font-bold' : 'text-amber-600'}`}>
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
                className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 disabled:opacity-50 disabled:cursor-not-allowed text-stone-500 hover:text-amber-600 flex items-center justify-center transition-all shadow-sm active:scale-95"
                title="Reset Timer"
            >
                <RotateCcw size={16} />
            </button>

            {!isActive ? (
              <button
                onClick={toggleTimer}
                disabled={!subject.trim()}
                className="w-14 h-14 rounded-full bg-stone-700 hover:bg-stone-800 disabled:bg-stone-200 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg shadow-stone-200 backdrop-blur-sm"
                title="Start Timer"
              >
                <Play fill="currentColor" className="ml-1" />
              </button>
            ) : (
              <>
                <button
                  onClick={toggleTimer}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg backdrop-blur-sm
                    ${isPaused 
                      ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                      : 'bg-stone-500 hover:bg-stone-600 text-white'}
                  `}
                  title={isPaused ? "Resume" : "Pause"}
                >
                  {isPaused ? <Play fill="currentColor" className="ml-1" /> : <Pause fill="currentColor" />}
                </button>
                <button
                  onClick={stopTimer}
                  className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-200 backdrop-blur-sm"
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