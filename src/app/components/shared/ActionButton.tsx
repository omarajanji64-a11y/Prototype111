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
    "border border-[var(--border-strong)] bg-[var(--accent-dim)] text-[var(--accent)] hover:border-[var(--border-strong)] hover:bg-[rgba(74,222,128,0.2)]",
  secondary:
    "border border-[var(--border-subtle)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]",
  ghost:
    "border border-[var(--border-subtle)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]",
  danger:
    "border border-[rgba(248,113,113,0.3)] bg-[var(--danger-dim)] text-[var(--danger)] hover:border-[rgba(248,113,113,0.42)] hover:bg-[rgba(248,113,113,0.18)]",
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
        "inline-flex h-9 items-center justify-center gap-2 rounded-[10px] px-4 py-2 font-display text-[13px] font-semibold tracking-[0.04em] transition-[background-color,border-color,color,transform] duration-150",
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
