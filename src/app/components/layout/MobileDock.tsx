import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BellRing,
  Camera,
  LayoutDashboard,
  MapPinned,
  Sparkles,
  Video,
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
  aiDetection: Video,
};

export function MobileDock({ activeItem, onActiveChange }: MobileDockProps) {
  return (
    <div className="fixed inset-x-4 bottom-4 z-50 lg:hidden">
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-2 shadow-[var(--shadow-md)] backdrop-blur-xl">
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
                  "relative flex min-w-[80px] flex-col items-center gap-1.5 rounded-lg border border-transparent px-3 py-2 text-[11px] font-medium transition-colors duration-200",
                  isActive ? "bg-[var(--bg-card)] text-[var(--text-primary)]" : "text-[var(--text-secondary)]",
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
