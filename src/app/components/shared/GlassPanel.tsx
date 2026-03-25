import { motion, type HTMLMotionProps } from "motion/react";

import { cn } from "../ui/utils";

interface GlassPanelProps extends HTMLMotionProps<"section"> {
  tone?: "default" | "cyan" | "orange" | "red";
  interactive?: boolean;
}

const toneClasses = {
  default: "from-white/[0.1] via-white/[0.03] to-white/[0.02]",
  cyan: "from-cyan-400/14 via-cyan-300/[0.04] to-transparent",
  orange: "from-orange-400/14 via-amber-300/[0.05] to-transparent",
  red: "from-orange-500/18 via-red-400/[0.06] to-transparent",
};

export function GlassPanel({
  children,
  className,
  tone = "default",
  interactive = false,
  ...props
}: GlassPanelProps) {
  return (
    <motion.section
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,20,35,0.92),rgba(7,11,21,0.9))] shadow-[0_18px_60px_rgba(3,7,18,0.45)] backdrop-blur-2xl",
        interactive &&
          "transition-[transform,border-color,box-shadow] duration-300 hover:border-white/16 hover:shadow-[0_26px_80px_rgba(3,7,18,0.56)]",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_48%)] opacity-90",
          toneClasses[tone],
        )}
      />
      <div className="pointer-events-none absolute inset-px rounded-[27px] border border-white/[0.05]" />
      {children}
    </motion.section>
  );
}

