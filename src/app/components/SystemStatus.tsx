import { motion } from "motion/react";
import { Cpu, Video, Zap, Clock, TrendingUp, Server } from "lucide-react";

const stats = [
  {
    icon: Cpu,
    label: "AI Model Status",
    value: "Active",
    subvalue: "99.8% accuracy",
    color: "[#3ABEFF]",
    bg: "from-[#3ABEFF]/20 to-[#2196F3]/10",
  },
  {
    icon: Video,
    label: "Active Cameras",
    value: "24/24",
    subvalue: "All online",
    color: "emerald-500",
    bg: "from-emerald-500/20 to-emerald-600/10",
  },
  {
    icon: Zap,
    label: "Response Time",
    value: "1.2s",
    subvalue: "Average detection",
    color: "amber-500",
    bg: "from-amber-500/20 to-amber-600/10",
  },
  {
    icon: Clock,
    label: "System Uptime",
    value: "99.9%",
    subvalue: "Last 30 days",
    color: "purple-500",
    bg: "from-purple-500/20 to-purple-600/10",
  },
];

const detailedStats = [
  { label: "Total Detections Today", value: "47", change: "+12%", trend: "up" },
  { label: "False Positive Rate", value: "0.2%", change: "-0.1%", trend: "down" },
  { label: "Avg. Alert Response", value: "45s", change: "-5s", trend: "down" },
];

export function SystemStatus() {
  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-gradient-to-br ${stat.bg} backdrop-blur-xl border border-white/10 rounded-xl p-4 overflow-hidden group hover:scale-105 transition-transform`}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
              
              <div className="relative">
                <div className={`inline-flex p-2 bg-${stat.color}/20 border border-${stat.color}/30 rounded-lg mb-3`}>
                  <Icon className={`w-4 h-4 text-${stat.color}`} />
                </div>
                
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-gray-400 mb-0.5">{stat.label}</div>
                <div className={`text-xs text-${stat.color}`}>{stat.subvalue}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Stats */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-[#3ABEFF]/20 border border-[#3ABEFF]/30 rounded-lg">
            <Server className="w-5 h-5 text-[#3ABEFF]" />
          </div>
          <div>
            <h3 className="text-lg text-white font-bold">Performance Metrics</h3>
            <p className="text-sm text-gray-400">Real-time system analytics</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {detailedStats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <div className={`flex items-center gap-1 text-xs ${
                  stat.trend === "up" ? "text-emerald-400" : "text-red-400"
                }`}>
                  <TrendingUp className={`w-3 h-3 ${stat.trend === "down" ? "rotate-180" : ""}`} />
                  {stat.change}
                </div>
              </div>
              <p className="text-sm text-gray-400">{stat.label}</p>
              
              {/* Progress Bar */}
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ delay: index * 0.2, duration: 1 }}
                  className="h-full bg-gradient-to-r from-[#3ABEFF] to-[#2196F3]"
                />
              </div>
            </div>
          ))}
        </div>

        {/* AI Processing Indicator */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              </div>
              <span className="text-sm text-gray-400">AI Processing Active</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div>
                <span className="text-white font-medium">2,847</span> frames/sec
              </div>
              <div>
                <span className="text-white font-medium">24</span> cameras monitored
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
