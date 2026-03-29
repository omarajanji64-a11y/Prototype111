import type { ReactNode } from "react";

import type { CameraFeed, NavigationId } from "../../data/dashboard";
import type { DashboardThemeId } from "../../lib/dashboardThemes";
import { MobileDock } from "./MobileDock";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";
import { cn } from "../ui/utils";

interface AppShellProps {
  children: ReactNode;
  activeNav: NavigationId;
  onActiveChange: (item: NavigationId) => void;
  isSidebarExpanded: boolean;
  onSidebarToggle: () => void;
  onOpenModelSwitcher: () => void;
  alertCount: number;
  focusedCamera: CameraFeed;
  selectedThemeId: DashboardThemeId;
  onThemeChange: (themeId: DashboardThemeId) => void;
}

export function AppShell({
  children,
  activeNav,
  onActiveChange,
  isSidebarExpanded,
  onSidebarToggle,
  onOpenModelSwitcher,
  alertCount,
  focusedCamera,
  selectedThemeId,
  onThemeChange,
}: AppShellProps) {
  return (
    <div className="relative min-h-screen text-white">
      <div className="command-shell-frame" />
      <Sidebar
        activeItem={activeNav}
        isExpanded={isSidebarExpanded}
        onActiveChange={onActiveChange}
        onToggle={onSidebarToggle}
      />
      <TopNavbar
        activeNav={activeNav}
        alertCount={alertCount}
        focusedCamera={focusedCamera}
        isSidebarExpanded={isSidebarExpanded}
        onOpenModelSwitcher={onOpenModelSwitcher}
        selectedThemeId={selectedThemeId}
        onThemeChange={onThemeChange}
      />
      <MobileDock activeItem={activeNav} onActiveChange={onActiveChange} />

      <main
        className={cn(
          "relative pb-24 pt-[56px] transition-[padding-left] duration-300 ease-out lg:pb-8 lg:pr-6",
          isSidebarExpanded ? "lg:pl-[220px]" : "lg:pl-[68px]",
        )}
      >
        <div className="mx-auto max-w-[1680px] px-4 sm:px-5 lg:px-6">
          <div className="command-shell-main">{children}</div>
        </div>
      </main>
    </div>
  );
}
