import { motion, type HTMLMotionProps } from "motion/react";

import { cn } from "../ui/utils";

interface GlassPanelProps extends HTMLMotionProps<"section"> {
  tone?: "default" | "cyan" | "orange" | "red";
  interactive?: boolean;
}

const toneClasses = {
  default: "",
  cyan: "command-panel-tone-cyan border-l-2 border-l-[var(--accent-primary)]",
  orange: "command-panel-tone-orange border-l-2 border-l-[var(--warning)]",
  red: "command-panel-tone-red border-l-2 border-l-[var(--critical)]",
};

export function GlassPanel({
  children,
  className,
  tone = "default",
  interactive = true,
  ...props
}: GlassPanelProps) {
  return (
    <motion.section
      whileHover={interactive ? { scale: 1.008, y: -3 } : undefined}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn(
        "command-glass-panel relative overflow-hidden rounded-[1.5rem] border border-[var(--border)]",
        interactive && "transition-[transform,border-color,background-color] duration-200 hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]",
        className,
        toneClasses[tone],
      )}
      {...props}
    >
      <div className="command-panel-grid" />
      <div className="command-panel-beam" />
      <div className="command-panel-glow" />
      <div className="relative z-10">{children}</div>
    </motion.section>
  );
}
