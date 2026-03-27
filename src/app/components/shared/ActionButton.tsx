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
    "border border-[var(--theme-primary-button-border)] bg-[var(--theme-primary-button-bg)] text-white shadow-[var(--theme-primary-button-shadow)] hover:brightness-110",
  secondary:
    "border border-[var(--border)] bg-[var(--chrome-surface)] text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--chrome-surface-hover)]",
  ghost:
    "border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:bg-[var(--theme-ghost-hover)] hover:text-[var(--text-primary)]",
  danger:
    "border border-[rgba(255,88,116,0.2)] bg-[var(--critical-dim)] text-[var(--critical)] hover:border-[rgba(255,88,116,0.32)]",
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
        "inline-flex h-11 items-center justify-center gap-2 rounded-[1rem] px-4 py-2 font-sci-mono text-[12px] font-medium uppercase tracking-[0.18em] transition-[background-color,border-color,filter,color,box-shadow] duration-150",
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
