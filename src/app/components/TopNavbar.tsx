import { Bell, Search, Activity, Wifi, Clock } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function TopNavbar() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-0 left-20 right-0 h-20 bg-black/40 backdrop-blur-xl border-b border-white/5 px-8 flex items-center justify-between z-40">
      {/* Left: Title & Time */}
      <div className="flex items-center gap-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Fire Detection</h1>
          <p className="text-sm text-gray-400 mt-0.5">Real-time monitoring system</p>
        </div>
        
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Clock className="w-4 h-4" />
          <span>{currentTime.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Right: Status & Actions */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search cameras, alerts..."
            className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#3ABEFF]/50 focus:bg-white/10 transition-all w-64"
          />
        </div>

        {/* System Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-emerald-400">All Systems Online</span>
        </div>

        {/* Connection */}
        <div className="flex items-center gap-2 text-gray-400">
          <Wifi className="w-4 h-4 text-[#3ABEFF]" />
          <span className="text-sm">Connected</span>
        </div>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
        >
          <Bell className="w-5 h-5 text-gray-300" />
          <div className="absolute top-1 right-1 w-2 h-2 bg-[#FF5A1F] rounded-full animate-pulse" />
        </motion.button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right">
            <p className="text-sm text-white font-medium">John Doe</p>
            <p className="text-xs text-gray-400">System Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3ABEFF] to-[#2196F3] flex items-center justify-center text-white text-sm font-medium">
            JD
          </div>
        </div>
      </div>
    </div>
  );
}
