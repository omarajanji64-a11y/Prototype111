import { motion, type HTMLMotionProps } from "motion/react";

import { cn } from "../ui/utils";

interface GlassPanelProps extends HTMLMotionProps<"section"> {
  tone?: "default" | "cyan" | "orange" | "red";
  interactive?: boolean;
}

const toneClasses = {
  default: "",
  cyan: "border-[var(--border-default)]",
  orange: "border-[rgba(251,191,36,0.2)]",
  red: "border-[rgba(248,113,113,0.2)]",
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
      className={cn(
        "command-glass-panel relative overflow-hidden rounded-[12px] border border-[var(--border-subtle)]",
        interactive && "transition-[border-color,background-color] duration-200 hover:border-[var(--border-default)] hover:bg-[var(--bg-surface)]",
        className,
        toneClasses[tone],
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </motion.section>
  );
}
