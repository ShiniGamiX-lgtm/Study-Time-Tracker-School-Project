import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { SubjectSummary } from '../types';

interface StatsChartProps {
  data: SubjectSummary[];
}

// Muted Green/Teal Gradient Spectrum
const COLORS = [
  '#34d399', // emerald-400
  '#2dd4bf', // teal-400
  '#84cc16', // lime-500
  '#10b981', // emerald-500
  '#0d9488', // teal-600
  '#bef264', // lime-300
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel-dark p-3 rounded-lg shadow-xl border border-teal-500/20">
        <p className="text-emerald-50 font-semibold">{payload[0].payload.subject}</p>
        <p className="text-emerald-400 text-sm">
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
      <div className="h-64 flex items-center justify-center text-teal-500/50 glass-panel rounded-2xl border-dashed border-teal-800/50">
        No data to display yet
      </div>
    );
  }

  // Sort data for chart to look nice (descending)
  const sortedData = [...data].sort((a, b) => b.totalMinutes - a.totalMinutes);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Bar Chart */}
      <div className="glass-panel p-6 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-emerald-500/20">
        <h3 className="text-lg font-semibold text-emerald-50 mb-6">Time per Subject</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {/* Cast to any[] to satisfy Recharts data type requirement for index signature */}
            <BarChart data={sortedData as any[]} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" stroke="#2d5e5e" hide />
              <YAxis 
                type="category" 
                dataKey="subject" 
                stroke="#5eead4" 
                width={80} 
                tick={{fill: '#99f6e4', fontSize: 12}} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#115e59', opacity: 0.4}} />
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
      <div className="glass-panel p-6 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-lime-500/20">
        <h3 className="text-lg font-semibold text-emerald-50 mb-6">Distribution</h3>
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