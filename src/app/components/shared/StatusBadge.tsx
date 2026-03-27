import { motion } from "motion/react";

import type { AlertSeverity, CameraStatus } from "../../data/dashboard";
import { cn } from "../ui/utils";

const cameraStyles = {
  safe: {
    label: "SAFE",
    tint: "var(--safe-dim)",
    border: "rgba(34, 211, 238, 0.18)",
    text: "var(--safe)",
  },
  warning: {
    label: "WARNING",
    tint: "var(--warning-dim)",
    border: "rgba(251, 191, 36, 0.18)",
    text: "var(--warning)",
  },
  fire: {
    label: "FIRE DETECTED",
    tint: "var(--fire-dim)",
    border: "rgba(249, 115, 22, 0.2)",
    text: "var(--fire)",
  },
} as const;

const severityStyles = {
  critical: {
    label: "CRITICAL",
    tint: "var(--critical-dim)",
    border: "rgba(239, 68, 68, 0.2)",
    text: "var(--critical)",
  },
  high: {
    label: "WARNING",
    tint: "var(--warning-dim)",
    border: "rgba(251, 191, 36, 0.2)",
    text: "var(--warning)",
  },
  medium: {
    label: "SAFE",
    tint: "var(--safe-dim)",
    border: "rgba(34, 211, 238, 0.18)",
    text: "var(--safe)",
  },
} as const;

interface StatusBadgeProps {
  status?: CameraStatus;
  severity?: AlertSeverity;
  className?: string;
}

export function StatusBadge({ status, severity, className }: StatusBadgeProps) {
  const config = status ? cameraStyles[status] : severity ? severityStyles[severity] : cameraStyles.safe;

  return (
    <motion.span
      layout
      initial={false}
      animate={{
        backgroundColor: config.tint,
        borderColor: config.border,
        color: config.text,
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em]",
        className,
      )}
    >
      {config.label}
    </motion.span>
  );
}
