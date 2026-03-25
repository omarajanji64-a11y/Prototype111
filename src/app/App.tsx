import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useState } from "react";

import { pageVariants, transitionDefaults } from "./animations/variants";
import { AlertPanel } from "./components/dashboard/AlertPanel";
import { AnalyticsChart } from "./components/dashboard/AnalyticsChart";
import { CameraGrid } from "./components/dashboard/CameraGrid";
import { DashboardSkeleton } from "./components/dashboard/DashboardSkeleton";
import { HomeQuickActions } from "./components/dashboard/HomeQuickActions";
import { MapCard } from "./components/dashboard/MapCard";
import { SystemStatus } from "./components/dashboard/SystemStatus";
import { UavResponsePanel } from "./components/dashboard/UavResponsePanel";
import { AppShell } from "./components/layout/AppShell";
import { EmberBackground } from "./components/layout/EmberBackground";
import {
  cameraFeeds,
  forestZones,
  initialAlerts,
  type NavigationId,
} from "./data/dashboard";
import { useDashboardBootstrap } from "./hooks/useDashboardBootstrap";

const initialFocusedCamera =
  cameraFeeds.find((camera) => camera.status === "fire")?.id ?? cameraFeeds[0]?.id ?? "";

export default function App() {
  const [activeNav, setActiveNav] = useState<NavigationId>("overview");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [focusedCameraId, setFocusedCameraId] = useState(initialFocusedCamera);
  const [alerts, setAlerts] = useState(initialAlerts);
  const { isLoading } = useDashboardBootstrap(1100);

  const focusedCamera =
    cameraFeeds.find((camera) => camera.id === focusedCameraId) ?? cameraFeeds[0];
  const criticalCount = alerts.filter((alert) => alert.severity === "critical").length;
  const warningCount = cameraFeeds.filter((camera) => camera.status === "warning").length;
  const safeCount = cameraFeeds.filter((camera) => camera.status === "safe").length;

  const focusCamera = (cameraId: string) => {
    setFocusedCameraId(cameraId);
    setActiveNav("cameras");
  };

  const renderTaskView = () => {
    if (activeNav === "overview") {
      return (
        <HomeQuickActions
          alerts={alerts}
          criticalCount={criticalCount}
          warningTowerCount={warningCount}
          safeTowerCount={safeCount}
          onNavigate={setActiveNav}
          onFocusTower={focusCamera}
          onDismissAlert={(alertId) =>
            setAlerts((currentAlerts) => currentAlerts.filter((alert) => alert.id !== alertId))
          }
        />
      );
    }

    if (activeNav === "cameras") {
      return (
        <CameraGrid
          cameras={cameraFeeds}
          focusedCameraId={focusedCameraId}
          alertCount={alerts.length}
          onFocusCamera={focusCamera}
        />
      );
    }

    if (activeNav === "alerts") {
      return (
        <AlertPanel
          alerts={alerts}
          sticky={false}
          onDismiss={(alertId) =>
            setAlerts((currentAlerts) => currentAlerts.filter((alert) => alert.id !== alertId))
          }
          onFocusCamera={focusCamera}
        />
      );
    }

    if (activeNav === "analytics") {
      return (
        <div className="space-y-6 lg:space-y-8">
          <SystemStatus />
          <AnalyticsChart />
        </div>
      );
    }

    if (activeNav === "map") {
      return <MapCard zones={forestZones} onFocusCamera={focusCamera} />;
    }

    return (
      <UavResponsePanel
        alerts={alerts}
        onFocusTower={focusCamera}
        onOpenAlerts={() => setActiveNav("alerts")}
      />
    );
  };

  return (
    <MotionConfig reducedMotion="user" transition={transitionDefaults}>
      <div className="relative min-h-screen bg-[#050816] text-white">
        <EmberBackground />

        <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
          <div className="aurora-shift absolute -left-[12%] top-[-8%] h-[540px] w-[540px] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.14)_0%,transparent_66%)] blur-3xl" />
          <div className="aurora-shift absolute right-[-12%] top-[12%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.14)_0%,transparent_62%)] blur-3xl" />
          <div className="aurora-shift absolute bottom-[-18%] left-[22%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.1)_0%,transparent_68%)] blur-3xl" />
          <div className="noise-overlay absolute inset-0 opacity-45" />
        </div>

        <div className="relative z-20">
          <AppShell
            activeNav={activeNav}
            onActiveChange={setActiveNav}
            isSidebarExpanded={isSidebarExpanded}
            onSidebarToggle={() => setIsSidebarExpanded((current) => !current)}
            alertCount={alerts.length}
            focusedCamera={focusedCamera}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isLoading ? (
                <motion.div
                  key="dashboard-loading"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <DashboardSkeleton />
                </motion.div>
              ) : (
                <motion.div
                  key={`dashboard-${activeNav}`}
                  variants={pageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6 lg:space-y-8"
                >
                  {renderTaskView()}
                </motion.div>
              )}
            </AnimatePresence>
          </AppShell>
        </div>
      </div>
    </MotionConfig>
  );
}
