import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BellRing,
  Camera,
  ChevronLeft,
  LayoutDashboard,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Video,
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
  aiDetection: Video,
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
      className="fixed inset-y-0 left-0 z-50 hidden overflow-hidden border-r border-[var(--border)] bg-[var(--bg-surface)] shadow-[0_16px_40px_rgba(18,18,18,0.05)] backdrop-blur-xl lg:flex"
    >
      <div className="flex h-full w-full flex-col px-3 py-3">
        <div className="flex h-[56px] items-center gap-3 px-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--accent-primary)]">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          {isExpanded ? (
            <div className="min-w-0">
              <p className="truncate text-base font-semibold leading-none">
                <span className="text-[var(--accent-primary)]">OKAB</span>{" "}
                <span className="text-[var(--text-secondary)]">Core</span>
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
                  "relative flex h-10 w-full items-center rounded-lg border border-transparent px-3 text-left transition-[background-color,border-color,color] duration-200",
                  isExpanded ? "justify-start gap-3" : "justify-center",
                  isActive
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[rgba(201,162,39,0.08)] hover:text-[var(--text-primary)]",
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
                  <span className="relative truncate text-[13px] font-medium">{item.label}</span>
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
            className="flex h-10 w-full items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition-colors duration-200 hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
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
