import { LayoutDashboard, Camera, Bell, BarChart3, Map, Settings, Shield } from "lucide-react";
import { motion } from "motion/react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Camera, label: "Cameras" },
  { icon: Bell, label: "Alerts" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Map, label: "Map" },
  { icon: Shield, label: "Security" },
  { icon: Settings, label: "Settings" },
];

export function Sidebar() {
  return (
    <div className="fixed left-0 top-0 h-screen w-20 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col items-center py-6 z-50">
      {/* Logo */}
      <div className="mb-12">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF5A1F] to-[#FF8C42] flex items-center justify-center shadow-lg shadow-[#FF5A1F]/20">
          <Shield className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-4 w-full px-4">
        {navItems.map((item, index) => (
          <motion.button
            key={item.label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 group ${
              item.active
                ? "bg-[#FF5A1F]/20 text-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/10"
                : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.active && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#FF5A1F]/20 to-[#FF8C42]/20 border border-[#FF5A1F]/30"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            {/* Tooltip */}
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {item.label}
            </div>
          </motion.button>
        ))}
      </nav>

      {/* User Avatar */}
      <div className="mt-auto">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3ABEFF] to-[#2196F3] flex items-center justify-center text-white text-sm font-medium">
          JD
        </div>
      </div>
    </div>
  );
}
