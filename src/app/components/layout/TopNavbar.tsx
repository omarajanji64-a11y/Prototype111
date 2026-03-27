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
        "command-topbar-shell fixed left-0 right-0 top-0 z-40 border-b border-[var(--border)] transition-[left] duration-300 ease-out",
        isSidebarExpanded ? "lg:left-[240px]" : "lg:left-[64px]",
      )}
    >
      <div className="mx-auto flex h-14 max-w-[1720px] items-center justify-between gap-4 px-4 sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[1rem] border border-[var(--border-hover)] bg-[rgba(8,18,40,0.88)] text-[var(--accent-primary)] shadow-[0_0_22px_rgba(30,216,255,0.08)]">
            <PageIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-sci-mono text-[0.58rem] uppercase tracking-[0.28em] text-[var(--text-secondary)]">
              System View
            </p>
            <p className="command-holo-title truncate text-sm font-medium text-[var(--text-primary)]">{pageName}</p>
          </div>
        </div>

        <div className="hidden flex-1 justify-center xl:flex">
          <div className="relative w-full max-w-[360px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search tower streams, anomalies, and modules..."
              className="command-topbar-search h-11 w-full rounded-[1rem] border border-[var(--border)] py-2 pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none transition-colors duration-150 placeholder:text-[var(--text-secondary)] focus:border-[var(--border-hover)]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden text-[13px] uppercase tracking-[0.12em] text-[var(--text-secondary)] md:block">
            {dateLabel} · {timeLabel}
          </div>

          <div
            className="command-live-chip hidden md:inline-flex"
            style={{ backgroundColor: status.bg, color: status.text }}
          >
            <span className={status.dotClass} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">{status.label}</span>
          </div>

          <div className="hidden h-9 items-center gap-2 rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.82)] px-3 shadow-[0_0_20px_rgba(255,139,61,0.06)] sm:inline-flex">
            <Flame className="h-4 w-4 text-[var(--fire)]" />
            <span className="text-[13px] text-[var(--text-primary)]">{alertCount}</span>
            <span className="text-[13px] text-[var(--text-secondary)]">alerts</span>
          </div>

          <motion.button
            whileHover={buttonHover}
            whileTap={buttonTap}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.82)] text-[var(--text-secondary)] transition-colors duration-150 hover:border-[var(--border-hover)] hover:bg-[rgba(10,24,54,0.9)] hover:text-[var(--text-primary)]"
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
