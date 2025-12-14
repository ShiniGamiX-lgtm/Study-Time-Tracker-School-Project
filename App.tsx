import React, { useState, useEffect } from 'react';
import { SubjectSummary } from './types';
import { linearSearch, MaxHeap } from './utils/dsa';
import { getStudyInsight } from './services/geminiService';
import AddSession from './components/AddSession';
import StatsChart from './components/StatsChart';
import Toast, { ToastMessage } from './components/Toast';
import LiveTimer from './components/LiveTimer';
import { BrainCircuit, Trophy, RotateCcw, Sparkles, Clock, Medal, Play } from 'lucide-react';

const App: React.FC = () => {
  // Raw Data (Single source of truth for calculations)
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  
  // Sorted Results (Derived from Heap)
  const [sortedLeaderboard, setSortedLeaderboard] = useState<SubjectSummary[]>([]);
  
  // Dashboard Metrics
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [userLevel, setUserLevel] = useState({ title: 'Novice', color: 'text-stone-600', percent: 0 });

  // UI State
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Timer State integration
  const [timerSubject, setTimerSubject] = useState<string>('');
  const [timerGoal, setTimerGoal] = useState<number | undefined>(undefined);
  const [autoStartTimer, setAutoStartTimer] = useState(false);

  // Determine User Level based on total minutes
  useEffect(() => {
    const total = subjects.reduce((acc, curr) => acc + curr.totalMinutes, 0);
    setTotalMinutes(total);

    // Level Logic - Colors updated to Stone/Amber spectrum
    let level = { title: 'Novice Learner', color: 'text-stone-400', percent: 0 };
    if (total >= 1200) {
       level = { title: 'Grand Scholar', color: 'text-amber-800', percent: 100 };
    } else if (total >= 600) {
       level = { title: 'Subject Master', color: 'text-amber-700', percent: (total / 1200) * 100 };
    } else if (total >= 300) {
       level = { title: 'Knowledge Seeker', color: 'text-orange-600', percent: (total / 600) * 100 };
    } else if (total >= 120) {
       level = { title: 'Dedicated Student', color: 'text-stone-600', percent: (total / 300) * 100 };
    } else {
       level = { title: 'Novice Learner', color: 'text-stone-400', percent: (total / 120) * 100 };
    }
    setUserLevel(level);

  }, [subjects]);

  const showToast = (message: string, type: 'success' | 'info' | 'error') => {
    setToast({ id: Date.now(), message, type });
  };

  const handleAddSession = (subjectName: string, minutes: number) => {
    setSubjects(prevSubjects => {
      const newSubjects = [...prevSubjects];
      const index = linearSearch(newSubjects, subjectName);

      if (index !== -1) {
        newSubjects[index] = {
          ...newSubjects[index],
          totalMinutes: newSubjects[index].totalMinutes + minutes
        };
      } else {
        newSubjects.push({ subject: subjectName, totalMinutes: minutes });
      }

      return newSubjects;
    });
    showToast(`Logged ${minutes}m for ${subjectName}`, 'success');
  };

  const handleStartTimerForSubject = (subject: string, goal?: number) => {
    setTimerSubject(subject);
    setTimerGoal(goal);
    setAutoStartTimer(true);
    setTimeout(() => setAutoStartTimer(false), 500);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const tempHeap = new MaxHeap();
    tempHeap.buildHeap(subjects);
    const sorted = tempHeap.getSortedList();
    setSortedLeaderboard(sorted);
  }, [subjects]);

  const handleGetInsight = async () => {
    setLoadingInsight(true);
    const advice = await getStudyInsight(subjects);
    setInsight(advice);
    setLoadingInsight(false);
  };

  const resetData = () => {
    if (window.confirm("Are you sure you want to clear all data?")) {
      setSubjects([]);
      setInsight('');
      showToast("All data cleared", 'info');
    }
  };

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto pb-20">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800 flex items-center gap-3">
            <BrainCircuit className="w-10 h-10 text-stone-600" />
            Study Time Tracker
          </h1>
          <p className="text-stone-500 mt-2 font-medium tracking-wide">
            Success is the sum of small efforts repeated day-in and day-out
          </p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={resetData}
                className="px-4 py-2 bg-white/50 hover:bg-stone-100 text-stone-500 hover:text-red-500 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium active:scale-95 border border-stone-200"
            >
                <RotateCcw size={16} /> Reset
            </button>
            <button
                onClick={handleGetInsight}
                disabled={loadingInsight || subjects.length === 0}
                className="px-4 py-2 bg-stone-700 hover:bg-stone-800 text-stone-50 rounded-lg shadow-md shadow-stone-200 transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
            >
                {loadingInsight ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <Sparkles size={16} />
                )}
                AI Insight
            </button>
        </div>
      </header>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Total Time Card */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between transition-all hover:scale-[1.01] hover:shadow-xl hover:border-amber-100">
           <div>
              <p className="text-stone-400 text-xs uppercase font-bold tracking-wider mb-1">Total Focus Time</p>
              <div className="text-3xl font-bold text-stone-700 flex items-baseline gap-1">
                 {Math.floor(totalMinutes / 60)}<span className="text-lg text-stone-400 font-normal">h</span>
                 {totalMinutes % 60}<span className="text-lg text-stone-400 font-normal">m</span>
              </div>
           </div>
           <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200 text-stone-500">
              <Clock />
           </div>
        </div>

        {/* Level Card */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden transition-all hover:scale-[1.01] hover:shadow-xl hover:border-amber-100">
           <div className="relative z-10 flex items-center justify-between">
              <div>
                 <p className="text-stone-400 text-xs uppercase font-bold tracking-wider mb-1">Current Level</p>
                 <h3 className={`text-2xl font-bold ${userLevel.color}`}>{userLevel.title}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100 text-amber-500">
                 <Medal />
              </div>
           </div>
           {/* Progress Bar for Level */}
           <div className="mt-3 w-full bg-stone-100 rounded-full h-1.5 relative z-10">
              <div 
                className="h-1.5 rounded-full bg-gradient-to-r from-stone-400 to-amber-600 transition-all duration-1000 shadow-sm" 
                style={{ width: `${Math.min(userLevel.percent, 100)}%` }}
              ></div>
           </div>
           {/* Decorative Blur */}
           <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-100 rounded-full blur-3xl pointer-events-none opacity-50" />
        </div>
      </div>

      {/* AI Insight Banner */}
      {insight && (
        <div className="mb-8 p-4 bg-white/80 border border-stone-100 rounded-xl flex items-start gap-3 animate-slide-in shadow-sm">
             <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
             <div>
                <h4 className="text-stone-800 font-semibold text-sm mb-1">Coach Gemini says:</h4>
                <p className="text-stone-600 leading-relaxed">{insight}</p>
             </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Input & Visualization */}
        <div className="xl:col-span-2 space-y-6">
            <LiveTimer 
              onSessionComplete={handleAddSession} 
              onNotification={showToast}
              initialSubject={timerSubject}
              initialGoal={timerGoal}
              autoStart={autoStartTimer}
              allSubjects={subjects}
            />
            <AddSession 
                onAdd={handleAddSession}
                onStart={handleStartTimerForSubject}
                existingSubjects={sortedLeaderboard.map(s => s.subject)}
            />
            <StatsChart data={subjects} />
        </div>

        {/* Right Column: Leaderboard */}
        <div className="xl:col-span-1">
            <div className="glass-panel rounded-2xl overflow-hidden sticky top-8 flex flex-col max-h-[600px] transition-all duration-300 hover:shadow-xl">
                <div className="p-5 border-b border-stone-100 bg-white/50 backdrop-blur-sm z-10">
                    <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                        <Trophy className="text-amber-500" />
                        Leaderboard
                    </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {sortedLeaderboard.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center gap-3 text-stone-400">
                            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center">
                                <Trophy size={24} className="text-stone-300" />
                            </div>
                            <p>No champions yet.<br/>Log a session to start!</p>
                        </div>
                    ) : (
                        sortedLeaderboard.map((subj, idx) => {
                            const maxMinutes = sortedLeaderboard[0].totalMinutes;
                            const percentage = (subj.totalMinutes / maxMinutes) * 100;
                            
                            const isTop = idx === 0;
                            const isSecond = idx === 1;
                            const isThird = idx === 2;
                            
                            let rankIcon = <span className="text-stone-400 font-mono text-sm">#{idx + 1}</span>;
                            let rowBg = "bg-white";
                            let borderClass = "border-transparent";
                            
                            if (isTop) {
                                rankIcon = <span className="text-amber-500 text-lg drop-shadow-sm">🥇</span>;
                                rowBg = "bg-gradient-to-r from-amber-50/50 to-white";
                                borderClass = "border-amber-100";
                            } else if (isSecond) {
                                rankIcon = <span className="text-stone-400 text-lg drop-shadow-sm">🥈</span>;
                            } else if (isThird) {
                                rankIcon = <span className="text-amber-700 text-lg drop-shadow-sm">🥉</span>;
                            }

                            return (
                                <div 
                                    key={subj.subject} 
                                    className={`relative p-3 rounded-xl border ${borderClass} hover:border-amber-200 transition-all group overflow-hidden ${rowBg}`}
                                >
                                    {/* Progress Bar Background */}
                                    <div 
                                        className="absolute left-0 top-0 bottom-0 bg-stone-100 -z-10 transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                    
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 flex justify-center">{rankIcon}</div>
                                            <div>
                                                <h3 className="font-semibold text-stone-700 group-hover:text-stone-900 transition-colors">
                                                    {subj.subject}
                                                </h3>
                                                <p className="text-xs text-stone-500">
                                                    {Math.round(percentage)}% of top
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <span className="text-stone-600 font-mono font-bold bg-white/60 px-2 py-1 rounded text-sm shadow-sm border border-stone-100">
                                                {formatTime(subj.totalMinutes)}
                                            </span>
                                            {/* Play Button for Quick Start */}
                                            <button 
                                                onClick={() => handleStartTimerForSubject(subj.subject)}
                                                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-amber-500 text-stone-400 hover:text-white flex items-center justify-center transition-all border border-stone-200 hover:border-amber-400 shadow-sm active:scale-90"
                                                title="Start Timer for this subject"
                                            >
                                                <Play size={12} fill="currentColor" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;