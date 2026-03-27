import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BellRing,
  Camera,
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

interface MobileDockProps {
  activeItem: NavigationId;
  onActiveChange: (item: NavigationId) => void;
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

export function MobileDock({ activeItem, onActiveChange }: MobileDockProps) {
  return (
    <div className="fixed inset-x-4 bottom-4 z-50 lg:hidden">
      <div className="command-dock-shell overflow-x-auto rounded-[1.25rem] border border-[var(--border)] p-2">
        <div className="flex min-w-max items-center gap-1.5">
          {navigationItems.map((item) => {
            const Icon = iconMap[item.id];
            const isActive = item.id === activeItem;

            return (
              <motion.button
                key={item.id}
                whileHover={buttonHover}
                whileTap={buttonTap}
                onClick={() => onActiveChange(item.id)}
                className={cn(
                  "relative flex min-w-[84px] flex-col items-center gap-1.5 rounded-[1rem] border border-transparent px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em] transition-colors duration-200",
                  isActive
                    ? "border-[rgba(141,240,255,0.16)] bg-[rgba(9,22,48,0.84)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)]",
                )}
              >
                {isActive ? (
                  <motion.div
                    layoutId="mobile-active-indicator"
                    className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-[var(--accent-primary)]"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  />
                ) : null}
                <Icon className={cn("relative h-[18px] w-[18px]", isActive && "text-[var(--accent-primary)]")} />
                <span className="relative">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
