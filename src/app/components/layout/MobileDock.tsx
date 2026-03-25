import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BellRing,
  Camera,
  LayoutDashboard,
  MapPinned,
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
};

export function MobileDock({ activeItem, onActiveChange }: MobileDockProps) {
  return (
    <div className="fixed inset-x-4 bottom-4 z-50 lg:hidden">
      <div className="overflow-x-auto rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,17,30,0.92),rgba(5,8,16,0.94))] p-2 shadow-[0_24px_90px_rgba(2,6,23,0.5)] backdrop-blur-2xl">
        <div className="flex min-w-max items-center gap-1">
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
                  "relative flex min-w-[88px] flex-col items-center gap-2 rounded-[22px] px-4 py-3 text-[0.7rem] font-medium tracking-[0.02em] transition-colors duration-300",
                  isActive ? "text-white" : "text-slate-400",
                )}
              >
                {isActive ? (
                  <motion.div
                    layoutId="mobile-active-indicator"
                    className="absolute inset-0 rounded-[22px] border border-cyan-200/12 bg-cyan-400/10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                ) : null}
                <motion.div
                  whileHover={{ rotate: 6, scale: 1.08 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                <span className="relative">{item.shortLabel}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

