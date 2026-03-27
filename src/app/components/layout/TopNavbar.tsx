import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BellRing,
  Camera,
  Flame,
  LayoutDashboard,
  MapPinned,
  Search,
  Sparkles,
  Video,
} from "lucide-react";
import { motion } from "motion/react";

import type { CameraFeed, NavigationId } from "../../data/dashboard";
import { buttonHover, buttonTap } from "../../animations/variants";
import { useClock } from "../../hooks/useClock";
import { cn } from "../ui/utils";

interface TopNavbarProps {
  activeNav: NavigationId;
  alertCount: number;
  focusedCamera: CameraFeed;
  isSidebarExpanded: boolean;
}

const pageIcons: Record<NavigationId, LucideIcon> = {
  overview: LayoutDashboard,
  cameras: Camera,
  alerts: BellRing,
  analytics: BarChart3,
  map: MapPinned,
  automation: Sparkles,
  aiDetection: Video,
};

const pageNames: Record<NavigationId, string> = {
  overview: "Overview",
  cameras: "Tower Network",
  alerts: "Alerts",
  analytics: "Analytics",
  map: "Forest Map",
  automation: "UAV Response",
  aiDetection: "AI Detection",
};

export function TopNavbar({
  activeNav,
  alertCount,
  focusedCamera,
  isSidebarExpanded,
}: TopNavbarProps) {
  const now = useClock();
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(now);
  const timeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  const PageIcon = pageIcons[activeNav];
  const pageName = pageNames[activeNav];
  const status =
    focusedCamera.status === "fire"
      ? {
          label: "FIRE DETECTED",
          bg: "var(--fire-dim)",
          text: "var(--fire)",
          dotClass: "command-fire-dot",
        }
      : focusedCamera.status === "warning"
        ? {
            label: "WARNING",
            bg: "var(--warning-dim)",
            text: "var(--warning)",
            dotClass: "command-fire-dot",
          }
        : {
            label: "SAFE",
            bg: "var(--safe-dim)",
            text: "var(--safe)",
            dotClass: "command-live-dot",
          };

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-surface)] shadow-[0_8px_24px_rgba(18,18,18,0.04)] backdrop-blur-xl transition-[left] duration-300 ease-out",
        isSidebarExpanded ? "lg:left-[240px]" : "lg:left-[64px]",
      )}
    >
      <div className="mx-auto flex h-14 max-w-[1720px] items-center justify-between gap-4 px-4 sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--accent-primary)]">
            <PageIcon className="h-4 w-4" />
          </div>
          <p className="truncate text-base font-medium text-[var(--text-primary)]">{pageName}</p>
        </div>

        <div className="hidden flex-1 justify-center xl:flex">
          <div className="relative w-full max-w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search..."
              className="command-topbar-search h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] py-2 pl-9 pr-3 text-sm text-[var(--text-primary)] shadow-[var(--shadow-sm)] outline-none transition-colors duration-150 placeholder:text-[var(--text-secondary)] focus:border-[rgba(201,162,39,0.34)]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden text-[13px] text-[var(--text-secondary)] md:block">
            {dateLabel} · {timeLabel}
          </div>

          <div
            className="hidden h-8 items-center gap-2 rounded-full px-3 md:inline-flex"
            style={{ backgroundColor: status.bg, color: status.text }}
          >
            <span className={status.dotClass} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">{status.label}</span>
          </div>

          <div className="hidden h-8 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 sm:inline-flex">
            <Flame className="h-4 w-4 text-[var(--fire)]" />
            <span className="text-[13px] text-[var(--text-primary)]">{alertCount}</span>
            <span className="text-[13px] text-[var(--text-secondary)]">alerts</span>
          </div>

          <motion.button
            whileHover={buttonHover}
            whileTap={buttonTap}
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition-colors duration-150 hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--fire)]" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
