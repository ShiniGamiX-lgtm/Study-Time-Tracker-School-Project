import React from 'react';
import { SubjectSummary } from '../types';
import { Layers } from 'lucide-react';

interface HeapVisualizationProps {
  heapData: SubjectSummary[];
}

const HeapVisualization: React.FC<HeapVisualizationProps> = ({ heapData }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Layers className="text-purple-400" />
          Max Heap Structure
        </h2>
        <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded">Root = Max Time</span>
      </div>
      
      {heapData.length === 0 ? (
        <p className="text-slate-500 text-sm">Add a session to build the heap.</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-4 py-4 relative">
             {/* Simple Tree Visualization (Flat Representation with styling implying hierarchy) */}
             {heapData.map((node, index) => {
                 // Determine level roughly by index for coloring/sizing
                 const isRoot = index === 0;
                 return (
                    <div 
                        key={`${node.subject}-${index}`}
                        className={`
                            relative flex flex-col items-center justify-center
                            p-3 rounded-xl border transition-all duration-300
                            ${isRoot 
                                ? 'bg-indigo-600/20 border-indigo-500 scale-110 z-10 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                                : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'}
                        `}
                    >
                        {isRoot && (
                            <div className="absolute -top-3 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                ROOT
                            </div>
                        )}
                        <span className="text-xs text-slate-400 mb-1">Index {index}</span>
                        <span className="font-bold text-slate-100">{node.subject}</span>
                        <span className="text-xs text-indigo-300 font-mono">{node.totalMinutes}m</span>
                    </div>
                 )
             })}
        </div>
      )}
      <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
        <p className="text-xs text-slate-400">
          <span className="font-semibold text-slate-300">How it works:</span> The subject with the highest study time automatically floats to the top (Root/Index 0) using the <span className="text-indigo-400 font-mono">Heapify</span> algorithm. This ensures O(1) access to your most studied subject.
        </p>
      </div>
    </div>
  );
};

export default HeapVisualization;