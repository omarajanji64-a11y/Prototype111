import { motion } from "motion/react";
import { Camera, AlertTriangle, CheckCircle, Flame } from "lucide-react";

interface CameraFeedCardProps {
  id: string;
  name: string;
  location: string;
  status: "safe" | "warning" | "fire";
  detections?: number;
  imageUrl: string;
}

export function CameraFeedCard({ id, name, location, status, detections = 0, imageUrl }: CameraFeedCardProps) {
  const statusConfig = {
    safe: {
      color: "emerald",
      icon: CheckCircle,
      label: "SAFE",
      glow: "emerald-500",
    },
    warning: {
      color: "amber",
      icon: AlertTriangle,
      label: "WARNING",
      glow: "amber-500",
    },
    fire: {
      color: "[#FF5A1F]",
      icon: Flame,
      label: "FIRE DETECTED",
      glow: "[#FF5A1F]",
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden group hover:border-white/20 transition-all duration-300"
    >
      {/* Status Glow Effect */}
      {status !== "safe" && (
        <div className={`absolute inset-0 bg-gradient-to-br from-${config.glow}/5 to-transparent pointer-events-none`} />
      )}

      {/* Video Feed */}
      <div className="relative aspect-video bg-black/50 overflow-hidden">
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        
        {/* AI Detection Overlay */}
        {detections > 0 && (
          <div className="absolute inset-0">
            {/* Bounding Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
              className={`absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-${config.glow} rounded-lg`}
            >
              <div className={`absolute -top-6 left-0 px-2 py-1 bg-${config.glow} text-white text-xs font-medium rounded`}>
                {status === "fire" ? "Fire Detected" : "Heat Source"}
              </div>
            </motion.div>
            
            {/* Heat Map Overlay */}
            <div className={`absolute inset-0 bg-gradient-radial from-${config.glow}/20 via-transparent to-transparent opacity-60`} />
          </div>
        )}

        {/* Camera ID */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm border border-white/20 rounded text-xs text-gray-300 font-mono">
          {id}
        </div>

        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-3 py-1.5 bg-${config.color}/20 backdrop-blur-sm border border-${config.color}/30 rounded-lg flex items-center gap-1.5`}>
          <StatusIcon className={`w-3.5 h-3.5 text-${config.color}-400`} />
          <span className={`text-xs font-medium text-${config.color}-400`}>{config.label}</span>
        </div>

        {/* Live Indicator */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-sm border border-white/20 rounded">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs text-white font-medium">LIVE</span>
        </div>

        {status !== "safe" && (
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm border border-white/20 rounded text-xs text-white">
            {detections} detection{detections !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-white font-medium mb-0.5">{name}</h3>
            <p className="text-sm text-gray-400">{location}</p>
          </div>
          <Camera className="w-5 h-5 text-gray-500" />
        </div>
      </div>

      {/* Hover Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent" />
      </div>
    </motion.div>
  );
}
