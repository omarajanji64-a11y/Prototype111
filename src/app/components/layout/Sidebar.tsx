import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BellRing,
  Camera,
  ChevronLeft,
  Cpu,
  LayoutDashboard,
  MapPinned,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";

import { navigationItems, type NavigationId } from "../../data/dashboard";
import { buttonHover, buttonTap } from "../../animations/variants";
import { cn } from "../ui/utils";

interface SidebarProps {
  activeItem: NavigationId;
  isExpanded: boolean;
  onActiveChange: (item: NavigationId) => void;
  onToggle: () => void;
}

const iconMap: Record<NavigationId, LucideIcon> = {
  overview: LayoutDashboard,
  cameras: Camera,
  alerts: BellRing,
  analytics: BarChart3,
  map: MapPinned,
  automation: Sparkles,
  setup: Settings2,
  models: Cpu,
};

export function Sidebar({
  activeItem,
  isExpanded,
  onActiveChange,
  onToggle,
}: SidebarProps) {
  return (
    <motion.aside
      animate={{ width: isExpanded ? 240 : 64 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="command-sidebar-shell fixed inset-y-0 left-0 z-50 hidden overflow-hidden border-r border-[var(--border)] lg:flex"
    >
      <div className="command-sidebar-aura pointer-events-none absolute inset-0" />
      <div className="flex h-full w-full flex-col px-3 py-3">
        <div className="flex h-[56px] items-center gap-3 px-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-[var(--border-hover)] bg-[var(--chrome-surface)] text-[var(--accent-primary)] shadow-[var(--theme-glow-shadow)]">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          {isExpanded ? (
            <div className="min-w-0">
              <p className="command-holo-title truncate text-base font-semibold leading-none">
                <span className="text-[var(--accent-primary)]">OKAB</span>{" "}
                <span className="text-[var(--text-secondary)]">Core</span>
              </p>
              <p className="mt-1 font-sci-mono text-[0.62rem] uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                Autonomous Forest Grid
              </p>
            </div>
          ) : null}
        </div>

        <nav className="mt-4 flex-1 space-y-2">
          {navigationItems.map((item) => {
            const Icon = iconMap[item.id];
            const isActive = item.id === activeItem;

            return (
              <motion.button
                key={item.id}
                whileHover={buttonHover}
                whileTap={buttonTap}
                onClick={() => onActiveChange(item.id)}
                title={!isExpanded ? item.label : undefined}
                className={cn(
                  "relative flex h-11 w-full items-center rounded-[1rem] border border-transparent px-3 text-left transition-[background-color,border-color,color,box-shadow] duration-200",
                  isExpanded ? "justify-start gap-3" : "justify-center",
                  isActive
                    ? "border-[var(--nav-active-border)] bg-[var(--nav-active-bg)] text-[var(--text-primary)] shadow-[var(--nav-active-shadow)]"
                    : "text-[var(--text-secondary)] hover:border-[var(--nav-hover-border)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--text-primary)]",
                )}
              >
                {isActive ? (
                  <motion.span
                    layoutId="sidebar-active-indicator"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-[var(--accent-primary)]"
                  />
                ) : null}
                <Icon
                  className={cn(
                    "relative h-[18px] w-[18px] shrink-0",
                    isActive ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)]",
                  )}
                />
                {isExpanded ? (
                  <span className="relative truncate text-[13px] font-medium uppercase tracking-[0.08em]">{item.label}</span>
                ) : null}
              </motion.button>
            );
          })}
        </nav>

        <div className="mt-auto pt-3">
          <motion.button
            whileHover={buttonHover}
            whileTap={buttonTap}
            onClick={onToggle}
            className="flex h-11 w-full items-center justify-center rounded-[1rem] border border-[var(--border)] bg-[var(--chrome-surface)] text-[var(--text-secondary)] transition-colors duration-200 hover:border-[var(--border-hover)] hover:bg-[var(--chrome-surface-hover)] hover:text-[var(--text-primary)]"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <motion.div animate={{ rotate: isExpanded ? 0 : 180 }} transition={{ duration: 0.2, ease: "easeOut" }}>
              <ChevronLeft className="h-4 w-4" />
            </motion.div>
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
}
