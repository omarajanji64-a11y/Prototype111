import { motion, AnimatePresence } from "motion/react";
import { Flame, AlertTriangle, Clock, MapPin, X } from "lucide-react";
import { useState } from "react";

interface Alert {
  id: string;
  severity: "critical" | "high" | "medium";
  type: string;
  location: string;
  camera: string;
  timestamp: string;
  description: string;
}

const mockAlerts: Alert[] = [
  {
    id: "ALT-001",
    severity: "critical",
    type: "Fire Detected",
    location: "Warehouse Section A",
    camera: "CAM-01",
    timestamp: "2 min ago",
    description: "High temperature detected with visible flames",
  },
  {
    id: "ALT-002",
    severity: "high",
    type: "Smoke Detected",
    location: "Storage Room B-12",
    camera: "CAM-04",
    timestamp: "5 min ago",
    description: "Unusual smoke patterns identified by AI",
  },
  {
    id: "ALT-003",
    severity: "medium",
    type: "Heat Anomaly",
    location: "Production Floor 2",
    camera: "CAM-07",
    timestamp: "12 min ago",
    description: "Temperature spike above normal threshold",
  },
];

export function AlertPanel() {
  const [alerts, setAlerts] = useState(mockAlerts);

  const severityConfig = {
    critical: {
      color: "[#FF5A1F]",
      icon: Flame,
      bg: "from-[#FF5A1F]/20 to-red-600/10",
      border: "[#FF5A1F]/40",
    },
    high: {
      color: "amber-500",
      icon: AlertTriangle,
      bg: "from-amber-500/20 to-orange-600/10",
      border: "amber-500/40",
    },
    medium: {
      color: "yellow-500",
      icon: AlertTriangle,
      bg: "from-yellow-500/20 to-yellow-600/10",
      border: "yellow-500/40",
    },
  };

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl text-white font-bold">Active Alerts</h2>
          <p className="text-sm text-gray-400 mt-1">{alerts.length} alerts require attention</p>
        </div>
        <div className="px-3 py-1.5 bg-[#FF5A1F]/20 border border-[#FF5A1F]/30 rounded-lg">
          <span className="text-sm text-[#FF5A1F] font-medium">{alerts.filter(a => a.severity === 'critical').length} Critical</span>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {alerts.map((alert, index) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-gradient-to-br ${config.bg} border border-${config.border} rounded-xl p-4 group hover:scale-[1.02] transition-transform`}
              >
                {/* Pulse Animation for Critical */}
                {alert.severity === "critical" && (
                  <motion.div
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-gradient-to-br from-[#FF5A1F]/10 to-transparent rounded-xl pointer-events-none"
                  />
                )}

                <div className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-2.5 bg-${config.color}/20 border border-${config.color}/30 rounded-lg`}>
                    <Icon className={`w-5 h-5 text-${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-white font-medium">{alert.type}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-400 font-mono">{alert.id}</span>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {alert.timestamp}
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => dismissAlert(alert.id)}
                        className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </motion.button>
                    </div>

                    <p className="text-sm text-gray-300 mb-3">{alert.description}</p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <MapPin className="w-3.5 h-3.5" />
                        {alert.location}
                      </div>
                      <div className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-gray-400 font-mono">
                        {alert.camera}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
