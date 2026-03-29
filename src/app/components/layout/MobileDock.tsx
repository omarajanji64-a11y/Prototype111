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
      <div className="command-dock-shell overflow-x-auto rounded-[14px] p-2">
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
                  "relative flex min-w-[84px] flex-col items-center gap-1.5 rounded-[10px] border border-transparent px-3 py-2 text-[11px] font-normal tracking-[0.06em] transition-colors duration-150",
                  isActive
                    ? "border-l-2 border-l-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]"
                    : "text-[var(--text-secondary)]",
                )}
              >
                <Icon className={cn("relative h-[18px] w-[18px]", isActive && "text-[var(--accent)]")} />
                <span className="relative">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
