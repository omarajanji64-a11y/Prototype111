import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BellRing,
  Camera,
  ChevronDown,
  Cpu,
  LayoutDashboard,
  MapPinned,
  Palette,
  Search,
  Settings2,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";

import type { CameraFeed, NavigationId } from "../../data/dashboard";
import { buttonHover, buttonTap } from "../../animations/variants";
import { useClock } from "../../hooks/useClock";
import {
  DASHBOARD_THEME_OPTIONS,
  type DashboardThemeId,
} from "../../lib/dashboardThemes";
import { cn } from "../ui/utils";

interface TopNavbarProps {
  activeNav: NavigationId;
  alertCount: number;
  focusedCamera: CameraFeed;
  isSidebarExpanded: boolean;
  onOpenModelSwitcher: () => void;
  selectedThemeId: DashboardThemeId;
  onThemeChange: (themeId: DashboardThemeId) => void;
}

const pageIcons: Record<NavigationId, LucideIcon> = {
  overview: LayoutDashboard,
  cameras: Camera,
  alerts: BellRing,
  analytics: BarChart3,
  map: MapPinned,
  automation: Sparkles,
  setup: Settings2,
  models: Cpu,
};

const pageNames: Record<NavigationId, string> = {
  overview: "Overview",
  cameras: "Main Tower",
  alerts: "Alerts",
  analytics: "Analytics",
  map: "Forest Map",
  automation: "UAV Response",
  setup: "Setup",
  models: "Model Switcher",
};

export function TopNavbar({
  activeNav,
  alertCount,
  focusedCamera,
  isSidebarExpanded,
  onOpenModelSwitcher,
  selectedThemeId,
  onThemeChange,
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
        "command-topbar-shell fixed left-0 right-0 top-0 z-40 transition-[left] duration-300 ease-out",
        isSidebarExpanded ? "lg:left-[220px]" : "lg:left-[68px]",
      )}
    >
      <div className="mx-auto grid h-14 max-w-[1680px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 sm:px-5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="hidden min-w-0 md:block">
            <p className="okab-brand-title truncate">OKAB CORE</p>
            <p className="okab-brand-subtitle truncate">Autonomous Forest Grid</p>
          </div>
          <div className="hidden h-8 w-px bg-[var(--border-subtle)] md:block" />
          <div className="min-w-0 flex-1">
            <p className="command-section-label">System View</p>
            <div className="flex min-w-0 items-center gap-2">
              <PageIcon className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
              <p className="truncate font-display text-[14px] font-semibold tracking-[0.04em] text-[var(--text-primary)]">{pageName}</p>
            </div>
          </div>
        </div>

        <div className="hidden flex-1 justify-center xl:flex">
          <div className="relative w-full max-w-[420px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search main tower, detections, and modules..."
              className="command-topbar-search h-9 w-full rounded-[10px] py-2 pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-self-end gap-2 sm:gap-3">
          <div className="hidden font-sci-mono text-[12px] font-medium text-[var(--text-data)] lg:block">
            {dateLabel} · {timeLabel}
          </div>

          <div className="hidden min-w-[172px] items-center gap-3 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 lg:flex">
            <div className="min-w-0">
              <p className="command-section-label">Forest Zone</p>
              <p className="truncate text-[12px] font-medium text-[var(--text-primary)]">{focusedCamera.zone}</p>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
          </div>

          <label className="command-theme-select-shell relative hidden h-9 min-w-[118px] items-center xl:flex">
            <Palette className="pointer-events-none absolute left-3 h-4 w-4 text-[var(--accent)]" />
            <select
              aria-label="Dashboard view"
              value={selectedThemeId}
              onChange={(event) => onThemeChange(event.target.value as DashboardThemeId)}
              className="command-theme-select h-full w-full appearance-none rounded-[10px] pl-9 pr-8 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-primary)] outline-none"
            >
              {DASHBOARD_THEME_OPTIONS.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-[var(--text-secondary)]" />
          </label>

          <motion.button
            whileHover={buttonHover}
            whileTap={buttonTap}
            onClick={onOpenModelSwitcher}
            className="hidden h-9 items-center gap-2 rounded-[10px] border border-[var(--border-strong)] bg-[var(--accent-dim)] px-3 font-display text-[13px] font-semibold tracking-[0.04em] text-[var(--accent)] transition-colors duration-150 hover:bg-[rgba(74,222,128,0.2)] lg:inline-flex"
          >
            <Cpu className="h-4 w-4 text-[var(--accent)]" />
            <span>Switch Model</span>
          </motion.button>

          <div
            className={cn(
              "hidden md:inline-flex",
              status.label === "SAFE" ? "command-live-chip" : "okab-pill",
              status.label === "WARNING" ? "okab-chip-warning" : status.label === "SAFE" ? "" : "okab-chip-danger",
            )}
            style={{ backgroundColor: status.bg, color: status.text }}
          >
            <span className={status.dotClass} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em]">{status.label}</span>
          </div>

          <div className="hidden h-9 items-center gap-2 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 sm:inline-flex">
            <span className="font-sci-mono text-[12px] font-medium text-[var(--text-data)]">{alertCount}</span>
            <span className="text-[12px] text-[var(--text-secondary)]">alerts</span>
          </div>

          <motion.button
            whileHover={buttonHover}
            whileTap={buttonTap}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-colors duration-150 hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--danger)]" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
