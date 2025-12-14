import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { SubjectSummary } from '../types';

interface StatsChartProps {
  data: SubjectSummary[];
}

// Light Brown / Earth Tones Gradient
const COLORS = [
  '#78716c', // Stone 500 (Taupe)
  '#d97706', // Amber 600 (Gold/Caramel)
  '#a8a29e', // Stone 400 (Light Taupe)
  '#b45309', // Amber 700 (Dark Caramel)
  '#fb923c', // Orange 400 (Terracotta)
  '#57534e', // Stone 700 (Coffee)
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel-dark p-3 rounded-lg shadow-xl border border-stone-100">
        <p className="text-stone-800 font-semibold">{payload[0].payload.subject}</p>
        <p className="text-amber-600 text-sm font-medium">
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
      <div className="h-64 flex items-center justify-center text-stone-400 glass-panel rounded-2xl border-dashed border-stone-300">
        No data to display yet
      </div>
    );
  }

  // Sort data for chart to look nice (descending)
  const sortedData = [...data].sort((a, b) => b.totalMinutes - a.totalMinutes);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Bar Chart */}
      <div className="glass-panel p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-white/60">
        <h3 className="text-lg font-semibold text-stone-800 mb-6">Time per Subject</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {/* Cast to any[] to satisfy Recharts data type requirement for index signature */}
            <BarChart data={sortedData as any[]} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" stroke="#a8a29e" hide />
              <YAxis 
                type="category" 
                dataKey="subject" 
                stroke="#78716c" 
                width={80} 
                tick={{fill: '#57534e', fontSize: 12, fontWeight: 500}} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f5f5f4', opacity: 0.8}} />
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
      <div className="glass-panel p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-white/60">
        <h3 className="text-lg font-semibold text-stone-800 mb-6">Distribution</h3>
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.8)" strokeWidth={2} />
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