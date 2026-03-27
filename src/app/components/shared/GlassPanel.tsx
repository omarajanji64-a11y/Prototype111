import { motion, type HTMLMotionProps } from "motion/react";

import { cn } from "../ui/utils";

interface GlassPanelProps extends HTMLMotionProps<"section"> {
  tone?: "default" | "cyan" | "orange" | "red";
  interactive?: boolean;
}

const toneClasses = {
  default: "",
  cyan: "border-l-2 border-l-[var(--accent-primary)]",
  orange: "border-l-2 border-l-[var(--warning)]",
  red: "border-l-2 border-l-[var(--critical)]",
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
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)] backdrop-blur-xl",
        interactive && "transition-[transform,border-color,background-color] duration-200 hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]",
        className,
        toneClasses[tone],
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(240,220,134,0.12),transparent)]" />
      {children}
    </motion.section>
  );
}
