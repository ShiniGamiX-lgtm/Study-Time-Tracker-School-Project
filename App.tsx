import React, { useState, useEffect } from 'react';
import { SubjectSummary } from './types';
import { linearSearch, MaxHeap } from './utils/dsa';
import { getStudyInsight } from './services/geminiService';
import AddSession from './components/AddSession';
import StatsChart from './components/StatsChart';
import Toast, { ToastMessage } from './components/Toast';
import LiveTimer from './components/LiveTimer';
import { BrainCircuit, Trophy, RotateCcw, Sparkles, Clock, Medal, Target, Play } from 'lucide-react';

const App: React.FC = () => {
  // Raw Data (Single source of truth for calculations)
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  
  // Sorted Results (Derived from Heap)
  const [sortedLeaderboard, setSortedLeaderboard] = useState<SubjectSummary[]>([]);
  
  // Dashboard Metrics
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [userLevel, setUserLevel] = useState({ title: 'Novice', color: 'text-emerald-400', percent: 0 });

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

    // Level Logic - Colors updated to Green/Teal/Lime spectrum
    let level = { title: 'Novice Learner', color: 'text-teal-400', percent: 0 };
    if (total >= 1200) {
       level = { title: 'Grand Scholar', color: 'text-lime-400', percent: 100 };
    } else if (total >= 600) {
       level = { title: 'Subject Master', color: 'text-emerald-300', percent: (total / 1200) * 100 };
    } else if (total >= 300) {
       level = { title: 'Knowledge Seeker', color: 'text-teal-300', percent: (total / 600) * 100 };
    } else if (total >= 120) {
       level = { title: 'Dedicated Student', color: 'text-cyan-400', percent: (total / 300) * 100 };
    } else {
       level = { title: 'Novice Learner', color: 'text-teal-400/80', percent: (total / 120) * 100 };
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
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-200 to-lime-200 flex items-center gap-3 drop-shadow-sm">
            <BrainCircuit className="w-10 h-10 text-emerald-400" />
            Study Time Tracker
          </h1>
          <p className="text-teal-200/60 mt-2 font-light tracking-wide">
            Success is the sum of small efforts repeated day-in and day-out
          </p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={resetData}
                className="px-4 py-2 glass-panel hover:bg-red-900/20 text-teal-200/70 hover:text-red-300 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium active:scale-95 border-teal-800/30"
            >
                <RotateCcw size={16} /> Reset
            </button>
            <button
                onClick={handleGetInsight}
                disabled={loadingInsight || subjects.length === 0}
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-lg shadow-lg shadow-teal-900/20 transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
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
        <div className="glass-panel p-5 rounded-2xl shadow-lg flex items-center justify-between transition-all hover:scale-[1.01] hover:shadow-2xl hover:border-emerald-500/20">
           <div>
              <p className="text-teal-200/70 text-xs uppercase font-bold tracking-wider mb-1">Total Focus Time</p>
              <div className="text-3xl font-bold text-emerald-50 flex items-baseline gap-1">
                 {Math.floor(totalMinutes / 60)}<span className="text-lg text-teal-500/80 font-normal">h</span>
                 {totalMinutes % 60}<span className="text-lg text-teal-500/80 font-normal">m</span>
              </div>
           </div>
           <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
              <Clock className="text-teal-400" />
           </div>
        </div>

        {/* Level Card */}
        <div className="glass-panel p-5 rounded-2xl shadow-lg relative overflow-hidden transition-all hover:scale-[1.01] hover:shadow-2xl hover:border-lime-500/20">
           <div className="relative z-10 flex items-center justify-between">
              <div>
                 <p className="text-teal-200/70 text-xs uppercase font-bold tracking-wider mb-1">Current Level</p>
                 <h3 className={`text-2xl font-bold ${userLevel.color} drop-shadow-sm`}>{userLevel.title}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-lime-500/10 flex items-center justify-center border border-lime-500/20">
                 <Medal className={userLevel.color} />
              </div>
           </div>
           {/* Progress Bar for Level */}
           <div className="mt-3 w-full bg-teal-950/50 rounded-full h-1.5 relative z-10">
              <div 
                className="h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-lime-400 transition-all duration-1000 shadow-[0_0_10px_rgba(132,204,22,0.3)]" 
                style={{ width: `${Math.min(userLevel.percent, 100)}%` }}
              ></div>
           </div>
           <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-lime-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* AI Insight Banner */}
      {insight && (
        <div className="mb-8 p-4 glass-panel border-teal-500/30 rounded-xl flex items-start gap-3 animate-slide-in">
             <Sparkles className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
             <div>
                <h4 className="text-lime-200/90 font-semibold text-sm mb-1">Coach Gemini says:</h4>
                <p className="text-emerald-100/90 leading-relaxed">{insight}</p>
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
            <div className="glass-panel rounded-2xl shadow-xl overflow-hidden sticky top-8 flex flex-col max-h-[600px] transition-all duration-300 hover:shadow-2xl">
                <div className="p-5 border-b border-white/5 bg-teal-900/30 backdrop-blur-sm z-10">
                    <h2 className="text-lg font-bold text-emerald-50 flex items-center gap-2">
                        <Trophy className="text-lime-400" />
                        Leaderboard
                    </h2>
                    <p className="text-xs text-teal-300/60 mt-1 flex items-center gap-1">
                        <Target size={12} />
                        Sorted via Max Heap Algorithm
                    </p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {sortedLeaderboard.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center gap-3 text-teal-500/50">
                            <div className="w-16 h-16 rounded-full bg-teal-900/30 border border-teal-800/30 flex items-center justify-center">
                                <Trophy size={24} className="text-teal-700" />
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
                            
                            let rankIcon = <span className="text-teal-600 font-mono text-sm">#{idx + 1}</span>;
                            let rowBg = "bg-teal-900/10";
                            
                            if (isTop) {
                                rankIcon = <span className="text-lime-400 text-lg drop-shadow-md">🥇</span>;
                                rowBg = "bg-lime-900/10 border-lime-500/20";
                            } else if (isSecond) {
                                rankIcon = <span className="text-emerald-300 text-lg drop-shadow-md">🥈</span>;
                            } else if (isThird) {
                                rankIcon = <span className="text-teal-400 text-lg drop-shadow-md">🥉</span>;
                            }

                            return (
                                <div 
                                    key={subj.subject} 
                                    className={`relative p-3 rounded-xl border border-transparent hover:border-teal-500/30 transition-all group overflow-hidden ${rowBg}`}
                                >
                                    {/* Progress Bar Background */}
                                    <div 
                                        className="absolute left-0 top-0 bottom-0 bg-emerald-900/30 -z-10 transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                    
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 flex justify-center">{rankIcon}</div>
                                            <div>
                                                <h3 className="font-semibold text-emerald-50 group-hover:text-white transition-colors">
                                                    {subj.subject}
                                                </h3>
                                                <p className="text-xs text-teal-300/60">
                                                    {Math.round(percentage)}% of top
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <span className="text-lime-200/80 font-mono font-bold bg-teal-950/40 px-2 py-1 rounded text-sm backdrop-blur-sm">
                                                {formatTime(subj.totalMinutes)}
                                            </span>
                                            {/* Play Button for Quick Start */}
                                            <button 
                                                onClick={() => handleStartTimerForSubject(subj.subject)}
                                                className="w-8 h-8 rounded-full bg-teal-800/60 hover:bg-emerald-600 text-teal-300 hover:text-white flex items-center justify-center transition-all border border-teal-700/50 hover:border-emerald-500 shadow-lg active:scale-90"
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