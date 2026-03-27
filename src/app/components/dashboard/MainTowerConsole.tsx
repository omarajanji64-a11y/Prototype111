import { lazy, Suspense, useMemo, useState } from "react";
import {
  Bot,
  Camera,
  ChevronDown,
  Flame,
  RadioTower,
  Settings2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cardVariants } from "../../animations/variants";
import type { CameraFeed } from "../../data/dashboard";
import type { MainTowerTelemetry } from "../../lib/mainTower";
import { getOkabModelLabel } from "../../lib/okabModels";
import type { TowerSetupConfig, UavSetupConfig } from "../../lib/systemSetup";
import { ActionButton } from "../shared/ActionButton";
import { GlassPanel } from "../shared/GlassPanel";
import { SectionTitle } from "../shared/SectionTitle";
import { StatusBadge } from "../shared/StatusBadge";

const AIDetection = lazy(() => import("../../../pages/AIDetection.jsx"));

interface MainTowerConsoleProps {
  tower: CameraFeed;
  telemetry: MainTowerTelemetry;
  alertCount: number;
  towerSetup: TowerSetupConfig;
  uavSetup: UavSetupConfig;
  defaultModelId: string;
  onTelemetryChange: (nextTelemetry: MainTowerTelemetry) => void;
  onOpenSetup: () => void;
}

export function MainTowerConsole({
  tower,
  telemetry,
  alertCount,
  towerSetup,
  uavSetup,
  defaultModelId,
  onTelemetryChange,
  onOpenSetup,
}: MainTowerConsoleProps) {
  const [isTowerOpen, setIsTowerOpen] = useState(false);

  const previewImage = telemetry.latestSnapshot || tower.imageUrl;
  const aiLabel = !towerSetup.aiEnabled
    ? "AI off"
    : telemetry.isAiEnabled
      ? telemetry.isSourceReady
        ? "AI active"
        : "AI arming"
      : "AI armed";
  const detectionLabel =
    telemetry.detectionLogs.length > 0
      ? `${telemetry.detectionLogs.length} detection${telemetry.detectionLogs.length === 1 ? "" : "s"}`
      : "No detections";
  const latestEventLabel = telemetry.latestDetection
    ? `${telemetry.latestDetection.type === "fire" ? "Fire" : "Smoke"} · ${Math.round(
        telemetry.latestDetection.confidence * 100,
      )}% confidence`
    : towerSetup.aiEnabled
      ? "Waiting for a logged event"
      : "AI detection disabled";
  const sensorSummary = useMemo(() => {
    if (tower.sensors.length === 0) {
      return "No linked sensors";
    }

    return `${tower.sensors.length} linked sensor${tower.sensors.length === 1 ? "" : "s"}`;
  }, [tower.sensors.length]);
  const openButtonLabel = towerSetup.cameraConfigured
    ? isTowerOpen
      ? "Close Tower"
      : "Open Tower"
    : "Open Setup";

  return (
    <GlassPanel variants={cardVariants} className="p-5">
      <div className="space-y-5">
        <SectionTitle
          eyebrow="Main Tower"
          title="Tower preview"
          description="The preview card shows the linked camera, whether AI is on, and whether the tower has any detections. Open the tower to inspect full details."
          action={
            <ActionButton icon={Settings2} variant="secondary" onClick={onOpenSetup}>
              Open Setup
            </ActionButton>
          }
        />

        <div className="relative overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-black">
          {towerSetup.cameraConfigured ? (
            <img src={previewImage} alt={tower.linkedCamera.name} className="h-full min-h-[380px] w-full object-cover" />
          ) : (
            <div className="flex min-h-[380px] items-center justify-center bg-[radial-gradient(circle_at_top,rgba(30,216,255,0.16),transparent_46%)] px-6 text-center">
              <div className="max-w-lg space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-[var(--border)] bg-[rgba(8,18,40,0.82)] text-[var(--accent-primary)]">
                  <Camera className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">No camera linked to Main Tower</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    Open Setup to configure the tower camera, choose the source, and control whether OKAB AI should run.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,16,0.12),rgba(4,8,16,0.22),rgba(4,8,16,0.88))]" />

          <div className="absolute left-5 right-5 top-5 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(30,216,255,0.22)] bg-[rgba(8,18,40,0.8)] px-3 py-1.5 font-sci-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--accent-glow)] backdrop-blur">
              <RadioTower className="h-4 w-4" />
              {tower.id}
            </div>
            <StatusBadge status={tower.status} />
          </div>

          <div className="absolute inset-x-5 bottom-5 space-y-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
              <div className="rounded-[1.2rem] border border-[var(--border)] bg-[rgba(8,18,40,0.84)] p-4 backdrop-blur">
                <p className="command-section-label text-[var(--text-muted)]">Preview</p>
                <h3 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{tower.name}</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {tower.location} · {tower.zone}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(8,18,40,0.82)] px-3 py-1.5 text-[var(--text-primary)]">
                    <Camera className="h-4 w-4 text-[var(--accent-primary)]" />
                    {tower.linkedCamera.name}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(8,18,40,0.82)] px-3 py-1.5 text-[var(--text-primary)]">
                    <Bot className="h-4 w-4 text-[var(--warning)]" />
                    {aiLabel}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(8,18,40,0.82)] px-3 py-1.5 text-[var(--text-primary)]">
                    <Flame className="h-4 w-4 text-[var(--fire)]" />
                    {detectionLabel}
                  </div>
                </div>

                <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{tower.summary}</p>
              </div>

              <div className="rounded-[1.2rem] border border-[var(--border)] bg-[rgba(8,18,40,0.84)] p-4 backdrop-blur">
                <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                  <div className="flex items-center justify-between gap-3">
                    <span>Linked camera</span>
                    <strong className="font-sci-mono text-[var(--text-primary)]">{towerSetup.cameraConfigured ? "Ready" : "Not set"}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>AI detection</span>
                    <strong className="font-sci-mono text-[var(--text-primary)]">{towerSetup.aiEnabled ? "On" : "Off"}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Last event</span>
                    <strong className="font-sci-mono text-[var(--text-primary)]">{latestEventLabel}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Linked sensors</span>
                    <strong className="font-sci-mono text-[var(--text-primary)]">{sensorSummary}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>UAV status</span>
                    <strong className="font-sci-mono text-[var(--text-primary)]">{uavSetup.enabled ? "Armed" : "Standby"}</strong>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <ActionButton
                    icon={Camera}
                    variant="primary"
                    onClick={() => (towerSetup.cameraConfigured ? setIsTowerOpen((currentState) => !currentState) : onOpenSetup())}
                  >
                    {openButtonLabel}
                  </ActionButton>
                  <ActionButton icon={Settings2} variant="secondary" onClick={onOpenSetup}>
                    Configure
                  </ActionButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isTowerOpen ? (
            <motion.div
              key="tower-details"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="space-y-3"
            >
              <div className="grid gap-3 xl:grid-cols-4">
                <div className="command-subpanel p-4">
                  <p className="command-section-label text-[var(--text-muted)]">Camera Source</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{tower.linkedCamera.streamHint}</p>
                </div>
                <div className="command-subpanel p-4">
                  <p className="command-section-label text-[var(--text-muted)]">AI Model</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{getOkabModelLabel(towerSetup.modelId)}</p>
                </div>
                <div className="command-subpanel p-4">
                  <p className="command-section-label text-[var(--text-muted)]">Alerts</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{alertCount}</p>
                </div>
                <div className="command-subpanel p-4">
                  <p className="command-section-label text-[var(--text-muted)]">UAV</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{uavSetup.callsign}</p>
                </div>
              </div>

              {towerSetup.cameraConfigured ? (
                <GlassPanel variants={cardVariants} className="overflow-hidden p-4 sm:p-5">
                  <Suspense
                    fallback={
                      <div className="command-empty-state min-h-[240px] rounded-xl p-6 text-sm">
                        Initializing Main Tower details...
                      </div>
                    }
                  >
                    <AIDetection
                      defaultModelId={towerSetup.modelId || defaultModelId}
                      embedded
                      configurationLocked
                      lockedSource={towerSetup.cameraSource}
                      lockedIpCameraUrl={towerSetup.ipCameraUrl}
                      lockedAiEnabled={towerSetup.aiEnabled}
                      heading={`${tower.name} Details`}
                      description="Camera POV, fullscreen expansion, detection logs, and linked sensors are all driven by the Setup configuration."
                      linkedSensors={tower.sensors}
                      onTelemetryChange={onTelemetryChange}
                    />
                  </Suspense>
                </GlassPanel>
              ) : (
                <GlassPanel variants={cardVariants} className="p-5">
                  <div className="command-empty-state min-h-[220px] rounded-xl px-6 text-center">
                    Set up the tower camera in Setup before opening the full tower details view.
                  </div>
                </GlassPanel>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsTowerOpen(false)}
                  className="inline-flex items-center gap-2 rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.82)] px-4 py-2 font-sci-mono text-[12px] uppercase tracking-[0.16em] text-[var(--text-secondary)] transition-colors duration-150 hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                >
                  Close Tower
                  <motion.div animate={{ rotate: 180 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </GlassPanel>
  );
}
