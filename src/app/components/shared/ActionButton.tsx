import type { LucideIcon } from "lucide-react";
import { motion, type HTMLMotionProps } from "motion/react";

import { buttonHover, buttonTap } from "../../animations/variants";
import { cn } from "../ui/utils";

interface ActionButtonProps extends HTMLMotionProps<"button"> {
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

const variantClasses = {
  primary:
    "border border-transparent bg-[var(--accent-primary)] text-white hover:brightness-110",
  secondary:
    "border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]",
  ghost:
    "border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:bg-[rgba(255,255,255,0.02)] hover:text-[var(--text-primary)]",
  danger:
    "border border-[rgba(230,210,143,0.2)] bg-[var(--critical-dim)] text-[var(--critical)] hover:border-[rgba(230,210,143,0.32)]",
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
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium transition-[background-color,border-color,filter,color] duration-150",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      <span>{children}</span>
    </motion.button>
  );
}
