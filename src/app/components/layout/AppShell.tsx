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
  alertCount: number;
  focusedCamera: CameraFeed;
}

export function AppShell({
  children,
  activeNav,
  onActiveChange,
  isSidebarExpanded,
  onSidebarToggle,
  alertCount,
  focusedCamera,
}: AppShellProps) {
  return (
    <div className="relative min-h-screen text-white">
      <Sidebar
        activeItem={activeNav}
        isExpanded={isSidebarExpanded}
        onActiveChange={onActiveChange}
        onToggle={onSidebarToggle}
      />
      <TopNavbar
        alertCount={alertCount}
        focusedCamera={focusedCamera}
        isSidebarExpanded={isSidebarExpanded}
      />
      <MobileDock activeItem={activeNav} onActiveChange={onActiveChange} />

      <main
        className={cn(
          "relative pb-28 pt-28 transition-[padding-left] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:pb-10 lg:pr-6",
          isSidebarExpanded ? "lg:pl-[20rem]" : "lg:pl-[8rem]",
        )}
      >
        <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
