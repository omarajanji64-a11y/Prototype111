import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { lazy, Suspense, startTransition, useState } from "react";

import { pageVariants, transitionDefaults } from "../../animations/variants";
import type { AppBootstrapState } from "../../hooks/useAppBootstrap";
import { AlertPanel } from "./AlertPanel";
import { AnalyticsChart } from "./AnalyticsChart";
import { CameraGrid } from "./CameraGrid";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { HomeQuickActions } from "./HomeQuickActions";
import { MapCard } from "./MapCard";
import { SystemStatus } from "./SystemStatus";
import { UavResponsePanel } from "./UavResponsePanel";
import { AppShell } from "../layout/AppShell";
import { EmberBackground } from "../layout/EmberBackground";
import {
  cameraFeeds,
  type CameraStatus,
  forestZones,
  type NavigationId,
} from "../../data/dashboard";
import { getDashboardWarmupSnapshot } from "../../lib/dashboardWarmup";

const AIDetection = lazy(() => import("../../../pages/AIDetection.jsx"));

const initialFocusedCamera =
  cameraFeeds.find((camera) => camera.status === "safe")?.id ?? cameraFeeds[0]?.id ?? "";

interface DashboardExperienceProps {
  bootstrap: AppBootstrapState;
  selectedModelId: string;
}

export function DashboardExperience({ bootstrap, selectedModelId }: DashboardExperienceProps) {
  const [activeNav, setActiveNav] = useState<NavigationId>("overview");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [focusedCameraId, setFocusedCameraId] = useState(initialFocusedCamera);
  const [alerts, setAlerts] = useState([]);
  const dashboardSnapshot = getDashboardWarmupSnapshot();
  const towerStatusTotals = dashboardSnapshot.towerTopology.statusTotals as Record<CameraStatus, number>;

  const focusedCamera =
    cameraFeeds.find((camera) => camera.id === focusedCameraId) ?? cameraFeeds[0];
  const criticalCount = alerts.filter((alert) => alert.severity === "critical").length;
  const warningCount = towerStatusTotals.warning;
  const safeCount = towerStatusTotals.safe;

  const focusCamera = (cameraId: string) => {
    setFocusedCameraId(cameraId);
    startTransition(() => {
      setActiveNav("cameras");
    });
  };

  const handleActiveNavChange = (nextNav: NavigationId) => {
    startTransition(() => {
      setActiveNav(nextNav);
    });
  };

  const renderTaskView = () => {
    if (activeNav === "overview") {
      return (
        <HomeQuickActions
          alerts={alerts}
          criticalCount={criticalCount}
          warningTowerCount={warningCount}
          safeTowerCount={safeCount}
          onNavigate={handleActiveNavChange}
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

    if (activeNav === "aiDetection") {
      return (
        <Suspense fallback={<DashboardSkeleton progress={bootstrap.progress} statusLabel={bootstrap.statusLabel} />}>
          <AIDetection defaultModelId={selectedModelId} />
        </Suspense>
      );
    }

    return (
      <UavResponsePanel
        alerts={alerts}
        onFocusTower={focusCamera}
        onOpenAlerts={() => handleActiveNavChange("alerts")}
      />
    );
  };

  return (
    <MotionConfig reducedMotion="user" transition={transitionDefaults}>
      <div className="relative min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
        <EmberBackground />

        <div className="relative z-20">
          <AppShell
            activeNav={activeNav}
            onActiveChange={handleActiveNavChange}
            isSidebarExpanded={isSidebarExpanded}
            onSidebarToggle={() => setIsSidebarExpanded((current) => !current)}
            alertCount={alerts.length}
            focusedCamera={focusedCamera}
          >
            <AnimatePresence mode="wait" initial={false}>
              {!bootstrap.isReady ? (
                <motion.div
                  key="dashboard-loading"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <DashboardSkeleton progress={bootstrap.progress} statusLabel={bootstrap.statusLabel} />
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
