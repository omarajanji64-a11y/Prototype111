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
import { buttonHover, buttonTap, sidebarLabelVariants } from "../../animations/variants";
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
      animate={{ width: isExpanded ? 296 : 104 }}
      transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-y-4 left-4 z-50 hidden overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,15,28,0.94),rgba(5,9,18,0.92))] shadow-[0_24px_100px_rgba(2,6,23,0.52)] backdrop-blur-2xl lg:flex"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_42%),radial-gradient(circle_at_bottom,rgba(249,115,22,0.12),transparent_36%)]" />
      <div className="relative flex h-full w-full flex-col p-4">
        <div className="flex items-center justify-between gap-3 rounded-[24px] border border-white/8 bg-white/[0.035] px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(249,115,22,0.9),rgba(251,191,36,0.82))] shadow-[0_16px_40px_rgba(249,115,22,0.24)]">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <motion.div
              animate={isExpanded ? "expanded" : "collapsed"}
              variants={sidebarLabelVariants}
              className={cn("overflow-hidden", !isExpanded && "pointer-events-none")}
            >
              <p className="text-sm font-semibold tracking-[-0.03em] text-white">OKAB Core</p>
              <p className="text-xs text-slate-400">Forest early detection prototype</p>
            </motion.div>
          </div>

          <motion.button
            whileHover={buttonHover}
            whileTap={buttonTap}
            onClick={onToggle}
            className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-200 lg:inline-flex"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <motion.div animate={{ rotate: isExpanded ? 0 : 180 }} transition={{ duration: 0.28 }}>
              <ChevronLeft className="h-4 w-4" />
            </motion.div>
          </motion.button>
        </div>

        <nav className="mt-6 flex-1 space-y-2">
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
                  "relative flex w-full items-center gap-3 overflow-hidden rounded-[22px] px-3 py-3 text-left transition-colors duration-300",
                  isActive ? "text-white" : "text-slate-400 hover:text-white",
                )}
              >
                {isActive ? (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute inset-0 rounded-[22px] border border-cyan-300/14 bg-[linear-gradient(135deg,rgba(14,165,233,0.2),rgba(249,115,22,0.12))]"
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                ) : null}

                <div
                  className={cn(
                    "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-colors duration-300",
                    isActive
                      ? "border-cyan-200/18 bg-cyan-300/10 text-cyan-100"
                      : "border-white/8 bg-white/[0.03] text-slate-400 group-hover:text-white",
                  )}
                >
                  <motion.div whileHover={{ rotate: 8, scale: 1.08 }} transition={{ duration: 0.2 }}>
                    <Icon className="h-5 w-5" />
                  </motion.div>
                </div>

                <motion.div
                  animate={isExpanded ? "expanded" : "collapsed"}
                  variants={sidebarLabelVariants}
                  className={cn("relative min-w-0", !isExpanded && "pointer-events-none")}
                >
                  <p className="truncate text-sm font-medium tracking-[-0.02em]">{item.label}</p>
                  <p className="truncate text-xs text-slate-500">{item.shortLabel}</p>
                </motion.div>
              </motion.button>
            );
          })}
        </nav>

        <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/12 text-cyan-100">
              <Sparkles className="h-5 w-5" />
            </div>
            <motion.div
              animate={isExpanded ? "expanded" : "collapsed"}
              variants={sidebarLabelVariants}
              className={cn("space-y-1", !isExpanded && "pointer-events-none")}
            >
              <p className="text-sm font-medium text-white">Student-Built System</p>
              <p className="text-xs text-slate-400">
                3 mini towers + LoRa + Raspberry Pi + UAV simulation.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
