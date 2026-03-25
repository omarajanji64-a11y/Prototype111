import { motion } from "motion/react";
import { MapPin, Flame, AlertTriangle } from "lucide-react";

const locations = [
  { id: 1, x: 25, y: 30, status: "fire", name: "Warehouse A" },
  { id: 2, x: 60, y: 45, status: "warning", name: "Storage B-12" },
  { id: 3, x: 40, y: 65, status: "safe", name: "Office Wing" },
  { id: 4, x: 75, y: 25, status: "safe", name: "Parking Lot" },
  { id: 5, x: 50, y: 80, status: "warning", name: "Production Floor" },
];

export function MapCard() {
  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg text-white font-bold">Facility Map</h3>
          <p className="text-sm text-gray-400 mt-1">Live camera locations</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#FF5A1F]/20 border border-[#FF5A1F]/30 rounded text-xs text-[#FF5A1F]">
            <div className="w-2 h-2 bg-[#FF5A1F] rounded-full" />
            Fire
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded text-xs text-amber-400">
            <div className="w-2 h-2 bg-amber-500 rounded-full" />
            Warning
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded text-xs text-emerald-400">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            Safe
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[400px] bg-gradient-to-br from-gray-900/50 to-black/50 rounded-xl border border-white/10 overflow-hidden">
        {/* Grid Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Facility Outline */}
        <div className="absolute top-[10%] left-[10%] w-[80%] h-[80%] border-2 border-white/20 rounded-lg">
          <div className="absolute top-0 left-0 px-2 py-1 bg-white/10 backdrop-blur-sm border-r border-b border-white/20 rounded-br text-xs text-white">
            Main Facility
          </div>
        </div>

        {/* Location Markers */}
        {locations.map((location) => {
          const statusConfig = {
            fire: { color: "#FF5A1F", Icon: Flame, glow: "shadow-[#FF5A1F]/50" },
            warning: { color: "#F59E0B", Icon: AlertTriangle, glow: "shadow-amber-500/50" },
            safe: { color: "#10B981", Icon: MapPin, glow: "shadow-emerald-500/50" },
          };
          
          const config = statusConfig[location.status as keyof typeof statusConfig];
          const Icon = config.Icon;

          return (
            <motion.div
              key={location.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: location.id * 0.1 }}
              className="absolute group cursor-pointer"
              style={{ left: `${location.x}%`, top: `${location.y}%` }}
            >
              {/* Ping Animation */}
              {location.status !== "safe" && (
                <motion.div
                  animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 -m-2 rounded-full border-2"
                  style={{ borderColor: config.color }}
                />
              )}

              {/* Marker */}
              <div 
                className={`relative p-2 rounded-full border-2 backdrop-blur-sm shadow-lg ${config.glow} transition-transform group-hover:scale-125`}
                style={{ 
                  backgroundColor: `${config.color}20`,
                  borderColor: config.color 
                }}
              >
                <Icon className="w-4 h-4" style={{ color: config.color }} />
              </div>

              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-12 px-3 py-1.5 bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                <div className="font-medium">{location.name}</div>
                <div className="text-gray-400 text-xs">Camera {location.id}</div>
              </div>
            </motion.div>
          );
        })}

        {/* Scan Line Animation */}
        <motion.div
          animate={{ y: ["0%", "100%"] }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#3ABEFF]/50 to-transparent"
        />
      </div>
    </div>
  );
}
