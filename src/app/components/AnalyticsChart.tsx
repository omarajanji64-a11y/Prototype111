import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, Activity } from "lucide-react";

const detectionData = [
  { time: "00:00", detections: 2, temperature: 22 },
  { time: "04:00", detections: 1, temperature: 21 },
  { time: "08:00", detections: 4, temperature: 24 },
  { time: "12:00", detections: 3, temperature: 26 },
  { time: "16:00", detections: 7, temperature: 28 },
  { time: "20:00", detections: 5, temperature: 25 },
  { time: "23:59", detections: 3, temperature: 23 },
];

const alertFrequency = [
  { day: "Mon", critical: 2, high: 4, medium: 6 },
  { day: "Tue", critical: 1, high: 3, medium: 5 },
  { day: "Wed", critical: 3, high: 6, medium: 8 },
  { day: "Thu", critical: 1, high: 2, medium: 4 },
  { day: "Fri", critical: 2, high: 5, medium: 7 },
  { day: "Sat", critical: 0, high: 1, medium: 2 },
  { day: "Sun", critical: 1, high: 2, medium: 3 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-3 shadow-xl">
        <p className="text-white text-sm font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`${label}-${entry.name}-${index}`} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AnalyticsChart() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Detection Frequency */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg text-white font-bold">Detection Activity</h3>
            <p className="text-sm text-gray-400 mt-1">Last 24 hours</p>
          </div>
          <div className="p-2 bg-[#3ABEFF]/20 border border-[#3ABEFF]/30 rounded-lg">
            <Activity className="w-5 h-5 text-[#3ABEFF]" />
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={detectionData}>
            <defs>
              <linearGradient id="colorDetections" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3ABEFF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3ABEFF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="time" 
              stroke="rgba(255,255,255,0.3)" 
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.3)" 
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="detections" 
              stroke="#3ABEFF" 
              strokeWidth={2}
              fill="url(#colorDetections)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Alert Frequency */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg text-white font-bold">Alert Frequency</h3>
            <p className="text-sm text-gray-400 mt-1">Last 7 days</p>
          </div>
          <div className="p-2 bg-[#FF5A1F]/20 border border-[#FF5A1F]/30 rounded-lg">
            <TrendingUp className="w-5 h-5 text-[#FF5A1F]" />
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={alertFrequency}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="day" 
              stroke="rgba(255,255,255,0.3)" 
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.3)" 
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="critical" stackId="alerts" fill="#FF5A1F" radius={[0, 0, 0, 0]} />
            <Bar dataKey="high" stackId="alerts" fill="#F59E0B" radius={[0, 0, 0, 0]} />
            <Bar dataKey="medium" stackId="alerts" fill="#EAB308" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}