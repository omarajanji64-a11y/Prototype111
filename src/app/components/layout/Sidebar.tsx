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
      animate={{ width: isExpanded ? 220 : 68 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="command-sidebar-shell fixed inset-y-0 left-0 z-50 hidden overflow-hidden lg:flex"
    >
      <div className="flex h-full w-full flex-col px-3 py-4">
        <div className="flex h-16 items-center gap-3 px-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-surface)]">
            <div className="grid grid-cols-2 gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[rgba(74,222,128,0.55)]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[rgba(74,222,128,0.55)]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            </div>
          </div>
          {isExpanded ? (
            <div className="min-w-0">
              <p className="okab-brand-title truncate leading-none">OKAB CORE</p>
              <p className="okab-brand-subtitle truncate">Autonomous Forest Grid</p>
            </div>
          ) : null}
        </div>

        <nav className="mt-5 flex-1 space-y-1.5">
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
                  "relative flex min-h-[42px] w-full items-center rounded-[8px] border border-transparent px-5 py-[10px] text-left transition-[background-color,border-color,color] duration-150",
                  isExpanded ? "justify-start gap-3" : "justify-center",
                  isActive
                    ? "ml-[-1px] border-l-2 border-l-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]",
                )}
              >
                <Icon
                  className={cn(
                    "relative h-[17px] w-[17px] shrink-0",
                    isActive ? "text-[var(--accent)]" : "text-[var(--text-secondary)]",
                  )}
                />
                {isExpanded ? (
                  <span className="relative truncate font-['Inter'] text-[13px] font-normal tracking-[0.06em]">{item.label}</span>
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
            className="flex h-10 w-full items-center justify-center rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-colors duration-150 hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
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
