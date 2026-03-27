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
    "border border-[rgba(141,240,255,0.24)] bg-[linear-gradient(135deg,rgba(30,216,255,0.2),rgba(90,140,255,0.34))] text-white shadow-[0_0_28px_rgba(30,216,255,0.12)] hover:brightness-110",
  secondary:
    "border border-[var(--border)] bg-[rgba(8,18,40,0.84)] text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[rgba(10,24,54,0.9)]",
  ghost:
    "border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:bg-[rgba(141,240,255,0.04)] hover:text-[var(--text-primary)]",
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
