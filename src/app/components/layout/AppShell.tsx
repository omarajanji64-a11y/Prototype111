import type { ReactNode } from "react";

import type { CameraFeed, NavigationId } from "../../data/dashboard";
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
      />
      <MobileDock activeItem={activeNav} onActiveChange={onActiveChange} />

      <main
        className={cn(
          "relative pb-24 pt-[72px] transition-[padding-left] duration-300 ease-out lg:pb-8 lg:pr-4",
          isSidebarExpanded ? "lg:pl-[240px]" : "lg:pl-[64px]",
        )}
      >
        <div className="mx-auto max-w-[1720px] px-4 sm:px-5 lg:px-6">
          <div className="command-shell-main">{children}</div>
        </div>
      </main>
    </div>
  );
}
