import { motion } from "motion/react";

import type { AlertSeverity, CameraStatus } from "../../data/dashboard";
import { cn } from "../ui/utils";

const cameraStyles = {
  safe: {
    label: "SAFE",
    tint: "var(--safe-dim)",
    border: "var(--border-strong)",
    text: "var(--safe)",
    dotClass: "command-live-dot",
  },
  warning: {
    label: "WARNING",
    tint: "var(--warning-dim)",
    border: "rgba(251, 191, 36, 0.3)",
    text: "var(--warning)",
    dotClass: "okab-status-dot",
  },
  fire: {
    label: "LIVE",
    tint: "var(--fire-dim)",
    border: "rgba(248, 113, 113, 0.3)",
    text: "var(--fire)",
    dotClass: "command-fire-dot",
  },
} as const;

const severityStyles = {
  critical: {
    label: "CRITICAL",
    tint: "var(--critical-dim)",
    border: "rgba(248, 113, 113, 0.3)",
    text: "var(--critical)",
    dotClass: "command-fire-dot",
  },
  high: {
    label: "WARNING",
    tint: "var(--warning-dim)",
    border: "rgba(251, 191, 36, 0.3)",
    text: "var(--warning)",
    dotClass: "okab-status-dot",
  },
  medium: {
    label: "SAFE",
    tint: "var(--safe-dim)",
    border: "var(--border-strong)",
    text: "var(--safe)",
    dotClass: "command-live-dot",
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
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em]",
        className,
      )}
    >
      <span className={config.dotClass} />
      {config.label}
    </motion.span>
  );
}
