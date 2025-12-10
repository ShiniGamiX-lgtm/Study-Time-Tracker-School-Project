import React, { useState } from 'react';
import { PlusCircle, Clock, BookOpen, Zap, Play } from 'lucide-react';

interface AddSessionProps {
  onAdd: (subject: string, minutes: number) => void;
  onStart: (subject: string, minutes?: number) => void;
  existingSubjects: string[];
}

const AddSession: React.FC<AddSessionProps> = ({ onAdd, onStart, existingSubjects }) => {
  const [subject, setSubject] = useState('');
  const [minutes, setMinutes] = useState('');

  const handleLogTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject && minutes) {
      onAdd(subject, parseInt(minutes, 10));
      setSubject('');
      setMinutes('');
    }
  };

  const handleStartTimer = () => {
    if (subject) {
      const mins = minutes ? parseInt(minutes, 10) : undefined;
      onStart(subject, mins);
      setSubject('');
      setMinutes('');
    }
  };

  const handleQuickSelect = (subj: string) => {
    setSubject(subj);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 mb-6 relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2 relative z-10">
        <PlusCircle className="text-indigo-400" />
        Log or Start Session
      </h2>
      
      <form onSubmit={handleLogTime} className="flex flex-col md:flex-row gap-4 items-end relative z-10">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Subject</label>
          <div className="relative group">
            <BookOpen className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Algorithms"
              className="w-full bg-slate-900 text-white pl-10 pr-4 py-3 rounded-lg border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-slate-600"
              required
            />
          </div>
          {/* Quick Add Chips */}
          {existingSubjects.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              <div className="flex items-center text-xs text-slate-500 gap-1">
                <Zap size={12} className="text-yellow-500" /> Quick Add:
              </div>
              {existingSubjects.slice(0, 4).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleQuickSelect(s)}
                  className="text-xs px-2 py-1 bg-slate-700 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-md transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full md:w-40">
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Duration (Goal)</label>
          <div className="relative group">
            <Clock className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="number"
              min="1"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="Min"
              className="w-full bg-slate-900 text-white pl-10 pr-4 py-3 rounded-lg border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-slate-600"
            />
          </div>
        </div>

        <div className="flex w-full md:w-auto gap-2">
            <button
                type="button"
                onClick={handleStartTimer}
                disabled={!subject}
                className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                title="Start a timer for this subject"
            >
                <Play size={18} fill="currentColor" />
                <span>Start</span>
            </button>
            <button
                type="submit"
                className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-6 rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
                title="Log a completed session"
            >
                <PlusCircle size={18} />
                <span>Log</span>
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddSession;