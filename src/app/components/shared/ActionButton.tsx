import type { LucideIcon } from "lucide-react";
import { motion, type HTMLMotionProps } from "motion/react";

import { buttonHover, buttonTap } from "../../animations/variants";
import { cn } from "../ui/utils";

interface ActionButtonProps extends HTMLMotionProps<"button"> {
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "ghost";
}

const variantClasses = {
  primary:
    "border border-orange-300/20 bg-[linear-gradient(135deg,rgba(249,115,22,0.26),rgba(251,146,60,0.12))] text-orange-50 shadow-[0_16px_40px_rgba(249,115,22,0.18)] hover:border-orange-200/30",
  secondary:
    "border border-cyan-300/16 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(14,165,233,0.08))] text-cyan-50 hover:border-cyan-200/26",
  ghost:
    "border border-white/10 bg-white/[0.04] text-slate-100 hover:border-white/16 hover:bg-white/[0.07]",
};

export function ActionButton({
  children,
  className,
  icon: Icon,
  variant = "ghost",
  ...props
}: ActionButtonProps) {
  return (
    <motion.button
      whileHover={buttonHover}
      whileTap={buttonTap}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold tracking-[-0.02em] transition-colors duration-300",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span>{children}</span>
    </motion.button>
  );
}
