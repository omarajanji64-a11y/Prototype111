import { AlertTriangle, Flame, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

import type { AlertSeverity, CameraStatus } from "../../data/dashboard";
import { easings } from "../../animations/variants";
import { cn } from "../ui/utils";

const cameraStyles = {
  safe: {
    label: "Safe",
    Icon: ShieldCheck,
    tint: "rgba(16, 185, 129, 0.16)",
    border: "rgba(52, 211, 153, 0.28)",
    text: "#8df7ca",
    glow: "rgba(16, 185, 129, 0.22)",
  },
  warning: {
    label: "Warning",
    Icon: AlertTriangle,
    tint: "rgba(245, 158, 11, 0.16)",
    border: "rgba(251, 191, 36, 0.28)",
    text: "#ffd479",
    glow: "rgba(245, 158, 11, 0.24)",
  },
  fire: {
    label: "Fire Detected",
    Icon: Flame,
    tint: "rgba(249, 115, 22, 0.18)",
    border: "rgba(251, 146, 60, 0.34)",
    text: "#ffbf88",
    glow: "rgba(249, 115, 22, 0.26)",
  },
} as const;

const severityStyles = {
  critical: {
    label: "Critical",
    Icon: Flame,
    tint: "rgba(249, 115, 22, 0.18)",
    border: "rgba(251, 146, 60, 0.34)",
    text: "#ffbf88",
    glow: "rgba(249, 115, 22, 0.26)",
  },
  high: {
    label: "High",
    Icon: AlertTriangle,
    tint: "rgba(245, 158, 11, 0.16)",
    border: "rgba(251, 191, 36, 0.28)",
    text: "#ffd479",
    glow: "rgba(245, 158, 11, 0.24)",
  },
  medium: {
    label: "Medium",
    Icon: AlertTriangle,
    tint: "rgba(56, 189, 248, 0.14)",
    border: "rgba(103, 232, 249, 0.24)",
    text: "#8be7ff",
    glow: "rgba(34, 211, 238, 0.18)",
  },
} as const;

interface StatusBadgeProps {
  status?: CameraStatus;
  severity?: AlertSeverity;
  className?: string;
}

export function StatusBadge({ status, severity, className }: StatusBadgeProps) {
  const config = status ? cameraStyles[status] : severity ? severityStyles[severity] : cameraStyles.safe;
  const Icon = config.Icon;
  const shouldPulse = status ? status !== "safe" : severity === "critical";

  return (
    <motion.span
      layout
      initial={false}
      animate={{
        backgroundColor: config.tint,
        borderColor: config.border,
        color: config.text,
        boxShadow: `0 14px 36px ${config.glow}`,
      }}
      transition={{ duration: 0.35, ease: easings.standard }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em]",
        className,
      )}
    >
      <motion.span
        animate={
          shouldPulse
            ? {
                scale: [1, 1.28, 1],
                opacity: [0.8, 1, 0.8],
              }
            : { scale: 1, opacity: 1 }
        }
        transition={{ duration: 1.8, repeat: shouldPulse ? Number.POSITIVE_INFINITY : 0, ease: "easeInOut" }}
        className="relative inline-flex"
      >
        <Icon className="h-3.5 w-3.5" />
      </motion.span>
      {config.label}
    </motion.span>
  );
}

