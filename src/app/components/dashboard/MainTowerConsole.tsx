import { lazy, Suspense, useMemo, useState } from "react";
import { Bot, Camera, ChevronDown, Cpu, Flame, Settings2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cardVariants } from "../../animations/variants";
import type { CameraFeed } from "../../data/dashboard";
import type { MainTowerTelemetry } from "../../lib/mainTower";
import { getOkabModelLabel } from "../../lib/okabModels";
import type { CameraSourceId, TowerSetupConfig, UavSetupConfig } from "../../lib/systemSetup";
import { ActionButton } from "../shared/ActionButton";
import { GlassPanel } from "../shared/GlassPanel";
import { LinkedCameraPreview } from "../shared/LinkedCameraPreview";
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
  previewStream?: MediaStream | null;
  previewSnapshot?: string | null;
  previewError?: string;
  onTelemetryChange: (nextTelemetry: MainTowerTelemetry) => void;
  onOpenSetup: () => void;
  onOpenModelSwitcher: () => void;
}

export function MainTowerConsole({
  tower,
  telemetry,
  alertCount,
  towerSetup,
  uavSetup,
  defaultModelId,
  previewStream,
  previewSnapshot,
  previewError,
  onTelemetryChange,
  onOpenSetup,
  onOpenModelSwitcher,
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

  return (
    <GlassPanel variants={cardVariants} className="p-6">
      <div className="space-y-5">
        <SectionTitle
          eyebrow="Main Tower"
          title="Tower page"
          description="Camera preview stays on the left. Use Open Tower to expand the live view and Configure to change its setup."
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_380px]">
          <div className="overflow-hidden rounded-[12px] border border-[var(--border-subtle)] bg-black">
            <LinkedCameraPreview
              cameraConfigured={towerSetup.cameraConfigured}
              cameraSource={towerSetup.cameraSource as CameraSourceId}
              ipCameraUrl={towerSetup.ipCameraUrl}
              stream={previewStream}
              snapshot={previewSnapshot || previewImage}
              fallbackImageUrl={tower.imageUrl}
              alt={tower.linkedCamera.name}
              className="min-h-[420px]"
              placeholderTitle="No camera linked to Main Tower"
              placeholderDescription="Configure the camera in Setup before opening the expanded tower view."
              errorMessage={previewError}
            />
          </div>

          <div className="space-y-3">
            <div className="command-subpanel p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="command-section-label">Camera Preview</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold tracking-[0.04em] text-[var(--text-primary)]">{tower.name}</h3>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{tower.linkedCamera.name}</p>
                </div>
                <StatusBadge status={tower.status} />
              </div>

              <div className="mt-5 space-y-3 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center justify-between gap-3">
                  <span>Camera link</span>
                  <strong className="font-sci-mono text-[var(--text-data)]">
                    {towerSetup.cameraConfigured ? tower.linkedCamera.streamHint : "Unlinked"}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>AI status</span>
                  <strong className="font-sci-mono text-[var(--text-data)]">{aiLabel}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Detections</span>
                  <strong className="font-sci-mono text-[var(--text-data)]">{detectionLabel}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Model</span>
                  <strong className="font-sci-mono text-[var(--text-data)]">{getOkabModelLabel(towerSetup.modelId)}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>UAV</span>
                  <strong className="font-sci-mono text-[var(--text-data)]">{uavSetup.enabled ? "Linked" : "Unlinked"}</strong>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-[var(--text-secondary)]">{tower.summary}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                <ActionButton
                  icon={Camera}
                  variant="primary"
                  onClick={() => (towerSetup.cameraConfigured ? setIsTowerOpen((current) => !current) : onOpenSetup())}
                >
                  {towerSetup.cameraConfigured ? (isTowerOpen ? "Close Tower" : "Open Tower") : "Configure Camera"}
                </ActionButton>
                <ActionButton icon={Settings2} variant="secondary" onClick={onOpenSetup}>
                  Configure
                </ActionButton>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="command-subpanel p-4">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-[var(--warning)]" />
                  <div>
                    <p className="command-section-label">AI Detection</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{aiLabel}</p>
                  </div>
                </div>
              </div>
              <div className="command-subpanel p-4">
                <div className="flex items-center gap-3">
                  <Flame className="h-5 w-5 text-[var(--danger)]" />
                  <div>
                    <p className="command-section-label">Latest Event</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{latestEventLabel}</p>
                  </div>
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
              className="space-y-4"
            >
              <div className="grid gap-4 xl:grid-cols-4">
                <div className="command-subpanel p-4">
                  <p className="command-section-label">Camera Source</p>
                  <p className="mt-3 font-display text-lg font-semibold tracking-[0.03em] text-[var(--text-primary)]">{tower.linkedCamera.streamHint}</p>
                </div>
                <div className="command-subpanel p-4">
                  <p className="command-section-label">AI Model</p>
                  <p className="mt-3 font-display text-lg font-semibold tracking-[0.03em] text-[var(--text-primary)]">{getOkabModelLabel(towerSetup.modelId)}</p>
                </div>
                <div className="command-subpanel p-4">
                  <p className="command-section-label">Alerts</p>
                  <p className="okab-metric-value mt-3 text-lg">{alertCount}</p>
                </div>
                <div className="command-subpanel p-4">
                  <p className="command-section-label">Sensors</p>
                  <p className="mt-3 font-display text-lg font-semibold tracking-[0.03em] text-[var(--text-primary)]">{sensorSummary}</p>
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
                      lockedStream={previewStream}
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
                    Set up the tower camera before opening the full tower details view.
                  </div>
                </GlassPanel>
              )}

              <div className="flex flex-wrap justify-end gap-3">
                <ActionButton icon={Cpu} variant="secondary" onClick={onOpenModelSwitcher}>
                  Switch Model
                </ActionButton>
                <button
                  type="button"
                  onClick={() => setIsTowerOpen(false)}
                  className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[var(--border-subtle)] bg-transparent px-4 py-2 font-display text-[13px] font-semibold tracking-[0.04em] text-[var(--text-secondary)] transition-colors duration-150 hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
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
