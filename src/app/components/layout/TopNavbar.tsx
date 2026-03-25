import { Bell, Radio, Search, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

import type { CameraFeed } from "../../data/dashboard";
import { buttonHover, buttonTap } from "../../animations/variants";
import { useClock } from "../../hooks/useClock";
import { ActionButton } from "../shared/ActionButton";
import { StatusBadge } from "../shared/StatusBadge";
import { cn } from "../ui/utils";

interface TopNavbarProps {
  alertCount: number;
  focusedCamera: CameraFeed;
  isSidebarExpanded: boolean;
}

export function TopNavbar({
  alertCount,
  focusedCamera,
  isSidebarExpanded,
}: TopNavbarProps) {
  const now = useClock();
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(now);
  const timeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-40 border-b border-white/6 bg-[linear-gradient(180deg,rgba(6,11,21,0.9),rgba(6,11,21,0.66),rgba(6,11,21,0))] backdrop-blur-xl transition-[left] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        isSidebarExpanded ? "lg:left-[20rem]" : "lg:left-[8rem]",
      )}
    >
      <div className="mx-auto flex max-w-[1720px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-cyan-100 sm:flex">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="truncate text-xl font-semibold tracking-[-0.05em] text-white sm:text-2xl">
                OKAB Smart Fire Detection
              </h1>
              <div className="hidden items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cyan-100 md:flex">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                Live
              </div>
            </div>
            <p className="mt-1 truncate text-sm text-slate-400">
              {focusedCamera.name} active. {focusedCamera.summary}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden min-w-[260px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-400 xl:flex">
            <Search className="h-4 w-4" />
            <span className="truncate">Search towers, zones, or alert IDs</span>
          </div>

          <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 lg:flex">
            <div className="text-right">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Local Time
              </p>
              <p className="text-sm font-medium text-white">
                {dateLabel} · {timeLabel}
              </p>
            </div>
          </div>

          <div className="hidden md:block">
            <StatusBadge status={focusedCamera.status} />
          </div>

          <ActionButton variant="secondary" className="hidden sm:inline-flex">
            {alertCount} fire alerts
          </ActionButton>

          <motion.button
            whileHover={buttonHover}
            whileTap={buttonTap}
            className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-100"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-orange-400 shadow-[0_0_18px_rgba(251,146,60,0.85)]" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
