import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { SubjectSummary } from '../types';

interface StatsChartProps {
  data: SubjectSummary[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#3b82f6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-slate-200 font-semibold">{payload[0].payload.subject}</p>
        <p className="text-indigo-400 text-sm">
          {payload[0].value} mins
        </p>
      </div>
    );
  }
  return null;
};

const StatsChart: React.FC<StatsChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed">
        No data to display yet
      </div>
    );
  }

  // Sort data for chart to look nice (descending)
  const sortedData = [...data].sort((a, b) => b.totalMinutes - a.totalMinutes);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Bar Chart */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-6">Time per Subject</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {/* Cast to any[] to satisfy Recharts data type requirement for index signature */}
            <BarChart data={sortedData as any[]} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" stroke="#94a3b8" hide />
              <YAxis 
                type="category" 
                dataKey="subject" 
                stroke="#94a3b8" 
                width={80} 
                tick={{fill: '#cbd5e1', fontSize: 12}} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#334155', opacity: 0.4}} />
              <Bar dataKey="totalMinutes" radius={[0, 4, 4, 0]}>
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-6">Distribution</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Cast to any[] to satisfy Recharts data type requirement for index signature */}
              <Pie
                data={sortedData as any[]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="totalMinutes"
              >
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsChart;