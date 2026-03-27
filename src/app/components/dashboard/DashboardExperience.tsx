import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { lazy, Suspense, startTransition, useCallback, useMemo, useState } from "react";

import { pageVariants, transitionDefaults } from "../../animations/variants";
import type { AppBootstrapState } from "../../hooks/useAppBootstrap";
import { AlertPanel } from "./AlertPanel";
import { AnalyticsChart } from "./AnalyticsChart";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { HomeQuickActions } from "./HomeQuickActions";
import { MainTowerConsole } from "./MainTowerConsole";
import { MapCard } from "./MapCard";
import { SystemStatus } from "./SystemStatus";
import { UavResponsePanel } from "./UavResponsePanel";
import { AppShell } from "../layout/AppShell";
import { EmberBackground } from "../layout/EmberBackground";
import {
  cameraFeeds,
  forestZones,
  type NavigationId,
} from "../../data/dashboard";
import {
  buildTowerAlerts,
  EMPTY_MAIN_TOWER_TELEMETRY,
  getTowerConfidence,
  getTowerLastSweep,
  getTowerSensors,
  getTowerStatusFromTelemetry,
  getTowerSummary,
  getTowerTemperature,
  type MainTowerTelemetry,
} from "../../lib/mainTower";

const AIDetection = lazy(() => import("../../../pages/AIDetection.jsx"));

interface DashboardExperienceProps {
  bootstrap: AppBootstrapState;
  selectedModelId: string;
}

export function DashboardExperience({ bootstrap, selectedModelId }: DashboardExperienceProps) {
  const [activeNav, setActiveNav] = useState<NavigationId>("overview");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [towerTelemetry, setTowerTelemetry] = useState<MainTowerTelemetry>(EMPTY_MAIN_TOWER_TELEMETRY);

  const mainTower = cameraFeeds[0];
  const mainTowerStatus = getTowerStatusFromTelemetry(towerTelemetry);
  const allAlerts = useMemo(() => buildTowerAlerts(mainTower, towerTelemetry), [mainTower, towerTelemetry]);
  const alerts = useMemo(
    () => allAlerts.filter((alert) => !dismissedAlertIds.includes(alert.id)),
    [allAlerts, dismissedAlertIds],
  );
  const criticalCount = alerts.filter((alert) => alert.severity === "critical").length;
  const warningCount = mainTowerStatus === "warning" ? 1 : 0;
  const safeCount = mainTowerStatus === "safe" ? 1 : 0;

  const focusedCamera = useMemo(
    () => ({
      ...mainTower,
      status: mainTowerStatus,
      summary: getTowerSummary(mainTower, towerTelemetry),
      imageUrl: towerTelemetry.latestSnapshot || mainTower.imageUrl,
      detections: towerTelemetry.detectionLogs.length,
      temperature: getTowerTemperature(mainTower.temperature, towerTelemetry),
      confidence: getTowerConfidence(mainTower.confidence, towerTelemetry),
      lastSweep: getTowerLastSweep(towerTelemetry),
      sensors: getTowerSensors(mainTower.sensors, towerTelemetry),
    }),
    [mainTower, mainTowerStatus, towerTelemetry],
  );

  const mapZones = useMemo(
    () =>
      forestZones.map((zone) => ({
        ...zone,
        status: mainTowerStatus,
        risk:
          mainTowerStatus === "fire"
            ? "93%"
            : mainTowerStatus === "warning"
              ? "68%"
              : "32%",
        note:
          mainTowerStatus === "fire"
            ? "Main Tower has confirmed a fire signature from the linked camera feed."
            : mainTowerStatus === "warning"
              ? "Main Tower is tracking smoke or runtime anomalies in this corridor."
              : "Main Tower coverage is stable with no active hazard detections.",
      })),
    [mainTowerStatus],
  );

  const handleTelemetryChange = useCallback((nextTelemetry: MainTowerTelemetry) => {
    setTowerTelemetry(nextTelemetry);
  }, []);

  const focusCamera = () => {
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
            setDismissedAlertIds((currentIds) =>
              currentIds.includes(alertId) ? currentIds : [...currentIds, alertId],
            )
          }
        />
      );
    }

    if (activeNav === "cameras") {
      return (
        <MainTowerConsole
          tower={focusedCamera}
          telemetry={towerTelemetry}
          alertCount={alerts.length}
          defaultModelId={selectedModelId}
          onTelemetryChange={handleTelemetryChange}
        />
      );
    }

    if (activeNav === "alerts") {
      return (
        <AlertPanel
          alerts={alerts}
          sticky={false}
          onDismiss={(alertId) =>
            setDismissedAlertIds((currentIds) =>
              currentIds.includes(alertId) ? currentIds : [...currentIds, alertId],
            )
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
      return <MapCard zones={mapZones} onFocusCamera={focusCamera} />;
    }

    if (activeNav === "aiDetection") {
      return (
        <Suspense fallback={<DashboardSkeleton progress={bootstrap.progress} statusLabel={bootstrap.statusLabel} />}>
          <AIDetection defaultModelId={selectedModelId} onTelemetryChange={handleTelemetryChange} />
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
