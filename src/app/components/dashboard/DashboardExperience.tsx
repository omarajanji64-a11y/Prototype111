import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";

import { pageVariants, transitionDefaults } from "../../animations/variants";
import type { AppBootstrapState } from "../../hooks/useAppBootstrap";
import type { DashboardThemeId } from "../../lib/dashboardThemes";
import { AlertPanel } from "./AlertPanel";
import { AnalyticsChart } from "./AnalyticsChart";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { HomeQuickActions } from "./HomeQuickActions";
import { MainTowerConsole } from "./MainTowerConsole";
import { MapCard } from "./MapCard";
import { ModelSwitcherPanel } from "./ModelSwitcherPanel";
import { SetupConsole } from "./SetupConsole";
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
import {
  getCameraSourceLabel,
  type CameraSourceId,
  getConfiguredSensors,
  persistSystemSetup,
  readStoredSystemSetup,
  type SensorSetupItem,
  type SystemSetupState,
  type TowerSetupConfig,
  type UavSetupConfig,
} from "../../lib/systemSetup";

interface DashboardExperienceProps {
  bootstrap: AppBootstrapState;
  selectedModelId: string;
  onSelectedModelChange: (modelId: string) => void;
  selectedThemeId: DashboardThemeId;
  onSelectedThemeChange: (themeId: DashboardThemeId) => void;
}

export function DashboardExperience({
  bootstrap,
  selectedModelId,
  onSelectedModelChange,
  selectedThemeId,
  onSelectedThemeChange,
}: DashboardExperienceProps) {
  const [linkedCameraStream, setLinkedCameraStream] = useState<MediaStream | null>(null);
  const [linkedCameraSnapshot, setLinkedCameraSnapshot] = useState<string | null>(null);
  const [cameraLinkError, setCameraLinkError] = useState("");
  const [activeNav, setActiveNav] = useState<NavigationId>("overview");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [towerTelemetry, setTowerTelemetry] = useState<MainTowerTelemetry>(EMPTY_MAIN_TOWER_TELEMETRY);
  const [modelReturnNav, setModelReturnNav] = useState<NavigationId>("setup");

  const mainTower = cameraFeeds[0];
  const [systemSetup, setSystemSetup] = useState<SystemSetupState>(() =>
    readStoredSystemSetup(mainTower, selectedModelId),
  );

  useEffect(() => {
    persistSystemSetup(systemSetup);
  }, [systemSetup]);

  useEffect(() => {
    return () => {
      linkedCameraStream?.getTracks().forEach((track) => track.stop());
    };
  }, [linkedCameraStream]);

  const configuredSensors = useMemo(() => getConfiguredSensors(systemSetup.sensors), [systemSetup.sensors]);
  const mainTowerStatus =
    !systemSetup.tower.cameraConfigured ? "warning" : getTowerStatusFromTelemetry(towerTelemetry);
  const allAlerts = useMemo(() => buildTowerAlerts(mainTower, towerTelemetry), [mainTower, towerTelemetry]);
  const alerts = useMemo(
    () => allAlerts.filter((alert) => !dismissedAlertIds.includes(alert.id)),
    [allAlerts, dismissedAlertIds],
  );
  const criticalCount = alerts.filter((alert) => alert.severity === "critical").length;
  const warningCount = mainTowerStatus === "warning" ? 1 : 0;
  const safeCount = mainTowerStatus === "safe" ? 1 : 0;
  const linkedCamera = useMemo(
    () => ({
      ...mainTower.linkedCamera,
      name: !systemSetup.tower.cameraConfigured
        ? "Camera Not Configured"
        : systemSetup.tower.cameraSource === "ip"
          ? "Main Tower IP Camera"
          : systemSetup.tower.cameraSource === "screen"
            ? "Main Tower Screen Share"
            : "Main Tower Webcam",
      resolution: !systemSetup.tower.cameraConfigured
        ? "Not linked"
        : systemSetup.tower.cameraSource === "ip"
          ? "Network stream"
          : systemSetup.tower.cameraSource === "screen"
            ? "Display dependent"
            : "1920 x 1080",
      coverage: !systemSetup.tower.cameraConfigured
        ? "Configure a source in Setup"
        : systemSetup.tower.cameraSource === "ip"
          ? "Remote camera feed"
          : systemSetup.tower.cameraSource === "screen"
            ? "Shared operator view"
            : "Direct local camera feed",
      streamHint: systemSetup.tower.cameraConfigured
        ? getCameraSourceLabel(systemSetup.tower.cameraSource)
        : "Open Setup to link the tower camera",
    }),
    [mainTower.linkedCamera, systemSetup.tower.cameraConfigured, systemSetup.tower.cameraSource],
  );

  const focusedCamera = useMemo(
    () => ({
      ...mainTower,
      status: mainTowerStatus,
      summary: !systemSetup.tower.cameraConfigured
        ? "Main Tower does not have a linked camera yet. Open Setup to configure the camera feed, sensors, and AI controls."
        : systemSetup.tower.aiEnabled
          ? getTowerSummary(mainTower, towerTelemetry)
          : "Main Tower camera is linked, but OKAB AI detection is turned off in Setup. Turn it on when you want live hazard analysis.",
      imageUrl: towerTelemetry.latestSnapshot || linkedCameraSnapshot || mainTower.imageUrl,
      detections: towerTelemetry.detectionLogs.length,
      temperature: getTowerTemperature(mainTower.temperature, towerTelemetry),
      confidence: getTowerConfidence(mainTower.confidence, towerTelemetry),
      lastSweep: getTowerLastSweep(towerTelemetry),
      linkedCamera,
      sensors: getTowerSensors(configuredSensors, towerTelemetry),
    }),
    [configuredSensors, linkedCamera, linkedCameraSnapshot, mainTower, mainTowerStatus, systemSetup.tower.aiEnabled, systemSetup.tower.cameraConfigured, towerTelemetry],
  );

  const mapZones = useMemo(
    () =>
      forestZones.map((zone) => ({
        ...zone,
        status: mainTowerStatus,
        risk:
          !systemSetup.tower.cameraConfigured
            ? "58%"
            : mainTowerStatus === "fire"
            ? "93%"
            : mainTowerStatus === "warning"
              ? "68%"
              : "32%",
        note:
          !systemSetup.tower.cameraConfigured
            ? "Main Tower camera is not configured yet. Open Setup to link the tower feed."
            : mainTowerStatus === "fire"
            ? "Main Tower has confirmed a fire signature from the linked camera feed."
            : mainTowerStatus === "warning"
              ? "Main Tower is tracking smoke or runtime anomalies in this corridor."
              : "Main Tower coverage is stable with no active hazard detections.",
      })),
    [mainTowerStatus, systemSetup.tower.cameraConfigured],
  );

  const handleTelemetryChange = useCallback((nextTelemetry: MainTowerTelemetry) => {
    setTowerTelemetry(nextTelemetry);
  }, []);

  const handleTowerSetupChange = useCallback((nextTower: TowerSetupConfig) => {
    setSystemSetup((currentSetup) => ({
      ...currentSetup,
      tower: nextTower,
    }));
  }, []);

  const stopLinkedCameraStream = useCallback((stream?: MediaStream | null) => {
    stream?.getTracks().forEach((track) => track.stop());
  }, []);

  const captureLinkedSnapshot = useCallback(async (stream: MediaStream) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;

    await video.play().catch(() => undefined);

    await new Promise<void>((resolve) => {
      if (video.readyState >= 2) {
        resolve();
        return;
      }

      video.onloadeddata = () => resolve();
    });

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) {
      video.pause();
      video.srcObject = null;
      return null;
    }

    context.drawImage(video, 0, 0, width, height);
    video.pause();
    video.srcObject = null;
    return canvas.toDataURL("image/jpeg", 0.86);
  }, []);

  const handleLinkCamera = useCallback(
    async (cameraSource: CameraSourceId, ipCameraUrl: string) => {
      setCameraLinkError("");

      if (cameraSource === "ip") {
        stopLinkedCameraStream(linkedCameraStream);
        setLinkedCameraStream(null);
        setLinkedCameraSnapshot(null);
        setSystemSetup((currentSetup) => ({
          ...currentSetup,
          tower: {
            ...currentSetup.tower,
            cameraConfigured: true,
            cameraSource,
            ipCameraUrl,
          },
        }));
        return;
      }

      const mediaDevices = navigator.mediaDevices;

      if (!mediaDevices) {
        throw new Error("This browser does not support live camera linking.");
      }

      try {
        const nextStream =
          cameraSource === "webcam"
            ? await mediaDevices.getUserMedia({ video: true, audio: false })
            : typeof mediaDevices.getDisplayMedia === "function"
              ? await mediaDevices.getDisplayMedia({ video: true, audio: false })
              : null;

        if (!nextStream) {
          throw new Error("Screen sharing is not available in this browser.");
        }

        const snapshot = await captureLinkedSnapshot(nextStream);

        nextStream.getVideoTracks()[0]?.addEventListener("ended", () => {
          setLinkedCameraStream((currentStream) => (currentStream === nextStream ? null : currentStream));
          setCameraLinkError(
            cameraSource === "screen"
              ? "Screen sharing ended. Relink the camera in Setup to resume the live preview."
              : "The linked webcam disconnected. Relink the camera in Setup to resume the live preview.",
          );
        });

        stopLinkedCameraStream(linkedCameraStream);
        setLinkedCameraStream(nextStream);
        setLinkedCameraSnapshot(snapshot);
        setSystemSetup((currentSetup) => ({
          ...currentSetup,
          tower: {
            ...currentSetup.tower,
            cameraConfigured: true,
            cameraSource,
            ipCameraUrl: "",
          },
        }));
      } catch (error) {
        const fallbackMessage =
          cameraSource === "screen"
            ? "Screen sharing was canceled or blocked."
            : "Camera permission was denied or the source could not start.";
        const nextMessage = error instanceof Error && error.message ? error.message : fallbackMessage;
        setCameraLinkError(nextMessage);
        throw new Error(nextMessage);
      }
    },
    [captureLinkedSnapshot, linkedCameraStream, stopLinkedCameraStream],
  );

  const handleUnlinkCamera = useCallback(() => {
    stopLinkedCameraStream(linkedCameraStream);
    setLinkedCameraStream(null);
    setLinkedCameraSnapshot(null);
    setCameraLinkError("");
    setSystemSetup((currentSetup) => ({
      ...currentSetup,
      tower: {
        ...currentSetup.tower,
        cameraConfigured: false,
        aiEnabled: false,
        ipCameraUrl: "",
      },
    }));
  }, [linkedCameraStream, stopLinkedCameraStream]);

  const handleSensorSetupChange = useCallback((sensorId: string, nextEnabled: boolean) => {
    setSystemSetup((currentSetup) => ({
      ...currentSetup,
      sensors: currentSetup.sensors.map((sensor: SensorSetupItem) =>
        sensor.id === sensorId ? { ...sensor, enabled: nextEnabled } : sensor,
      ),
    }));
  }, []);

  const handleUavSetupChange = useCallback((nextUav: UavSetupConfig) => {
    setSystemSetup((currentSetup) => ({
      ...currentSetup,
      uav: nextUav,
    }));
  }, []);

  const handleOpenModelSwitcher = useCallback((returnNav: NavigationId) => {
    setModelReturnNav(returnNav);
    startTransition(() => {
      setActiveNav("models");
    });
  }, []);

  const handleModelSelection = useCallback(
    (modelId: string) => {
      onSelectedModelChange(modelId);
      setSystemSetup((currentSetup) => ({
        ...currentSetup,
        tower: {
          ...currentSetup.tower,
          modelId,
        },
      }));
      startTransition(() => {
        setActiveNav(modelReturnNav);
      });
    },
    [modelReturnNav, onSelectedModelChange],
  );

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
          tower={focusedCamera}
          cameraConfigured={systemSetup.tower.cameraConfigured}
          cameraSource={systemSetup.tower.cameraSource}
          ipCameraUrl={systemSetup.tower.ipCameraUrl}
          linkedStream={linkedCameraStream}
          linkedSnapshot={linkedCameraSnapshot}
          linkError={cameraLinkError}
          onOpenTower={focusCamera}
          onOpenSetup={() => handleActiveNavChange("setup")}
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
          towerSetup={systemSetup.tower}
          uavSetup={systemSetup.uav}
          defaultModelId={systemSetup.tower.modelId || selectedModelId}
          previewStream={linkedCameraStream}
          previewSnapshot={linkedCameraSnapshot}
          previewError={cameraLinkError}
          onTelemetryChange={handleTelemetryChange}
          onOpenSetup={() => handleActiveNavChange("setup")}
          onOpenModelSwitcher={() => handleOpenModelSwitcher("cameras")}
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

    if (activeNav === "setup") {
      return (
        <SetupConsole
          setup={systemSetup}
          onTowerChange={handleTowerSetupChange}
          onLinkCamera={handleLinkCamera}
          onUnlinkCamera={handleUnlinkCamera}
          onSensorChange={handleSensorSetupChange}
          onUavChange={handleUavSetupChange}
          onOpenModelSwitcher={() => handleOpenModelSwitcher("setup")}
        />
      );
    }

    if (activeNav === "models") {
      return (
        <ModelSwitcherPanel
          selectedModelId={systemSetup.tower.modelId || selectedModelId}
          onSelectModel={handleModelSelection}
          onBack={() => handleActiveNavChange(modelReturnNav)}
        />
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
            onOpenModelSwitcher={() =>
              handleOpenModelSwitcher(activeNav === "models" ? modelReturnNav : activeNav)
            }
            alertCount={alerts.length}
            focusedCamera={focusedCamera}
            selectedThemeId={selectedThemeId}
            onThemeChange={onSelectedThemeChange}
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
