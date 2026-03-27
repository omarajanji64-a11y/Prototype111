import { lazy, Suspense, useMemo, useState } from "react";
import {
  Bot,
  Camera,
  ChevronDown,
  Flame,
  Radar,
  RadioTower,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cardVariants } from "../../animations/variants";
import type { CameraFeed } from "../../data/dashboard";
import type { MainTowerTelemetry } from "../../lib/mainTower";
import { ActionButton } from "../shared/ActionButton";
import { GlassPanel } from "../shared/GlassPanel";
import { SectionTitle } from "../shared/SectionTitle";
import { StatusBadge } from "../shared/StatusBadge";

const AIDetection = lazy(() => import("../../../pages/AIDetection.jsx"));

interface MainTowerConsoleProps {
  tower: CameraFeed;
  telemetry: MainTowerTelemetry;
  alertCount: number;
  defaultModelId: string;
  onTelemetryChange: (nextTelemetry: MainTowerTelemetry) => void;
}

const sensorStatusClassMap = {
  online: "border-[rgba(34,211,238,0.18)] bg-[rgba(8,18,40,0.78)] text-[var(--safe)]",
  watch: "border-[rgba(251,191,36,0.2)] bg-[rgba(69,26,3,0.34)] text-[var(--warning)]",
  alert: "border-[rgba(239,68,68,0.2)] bg-[rgba(69,10,10,0.34)] text-[var(--critical)]",
} as const;

export function MainTowerConsole({
  tower,
  telemetry,
  alertCount,
  defaultModelId,
  onTelemetryChange,
}: MainTowerConsoleProps) {
  const [isTowerOpen, setIsTowerOpen] = useState(false);

  const previewImage = telemetry.latestSnapshot || tower.imageUrl;
  const aiLabel = telemetry.isAiEnabled
    ? telemetry.isSourceReady
      ? "AI online"
      : "AI initializing"
    : "AI standby";
  const detectionLabel =
    telemetry.detectionLogs.length > 0
      ? `${telemetry.detectionLogs.length} logged detection${telemetry.detectionLogs.length === 1 ? "" : "s"}`
      : "No detections logged";
  const latestEventLabel = telemetry.latestDetection
    ? `${telemetry.latestDetection.type === "fire" ? "Fire" : "Smoke"} · ${Math.round(
        telemetry.latestDetection.confidence * 100,
      )}% confidence`
    : "No hazard event recorded";

  const sensorSummary = useMemo(() => {
    const alertingSensors = tower.sensors.filter((sensor) => sensor.status === "alert").length;
    const watchSensors = tower.sensors.filter((sensor) => sensor.status === "watch").length;

    if (alertingSensors > 0) {
      return `${alertingSensors} linked sensor${alertingSensors === 1 ? "" : "s"} in alert mode`;
    }

    if (watchSensors > 0) {
      return `${watchSensors} linked sensor${watchSensors === 1 ? "" : "s"} in watch mode`;
    }

    return `${tower.sensors.length} linked sensor modules online`;
  }, [tower.sensors]);

  return (
    <GlassPanel variants={cardVariants} className="p-5">
      <div className="space-y-5">
        <SectionTitle
          eyebrow="Main Tower"
          title="Single-tower command view"
          description="One tower, one linked camera, one live sensor stack. Open the tower to view the real camera POV, expand it, and inspect detections as they arrive."
          action={
            <ActionButton
              icon={Camera}
              variant="primary"
              onClick={() => setIsTowerOpen((currentState) => !currentState)}
            >
              {isTowerOpen ? "Close Tower" : "Open Tower"}
            </ActionButton>
          }
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <div className="relative overflow-hidden rounded-[1.4rem] border border-[var(--border)] bg-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,216,255,0.18),transparent_42%)]" />
            <img src={previewImage} alt={tower.linkedCamera.name} className="h-full min-h-[340px] w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,16,0.12),rgba(4,8,16,0.2),rgba(4,8,16,0.88))]" />

            <div className="absolute left-5 right-5 top-5 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(30,216,255,0.22)] bg-[rgba(8,18,40,0.78)] px-3 py-1.5 font-sci-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--accent-glow)] backdrop-blur">
                <RadioTower className="h-4 w-4" />
                {tower.id}
              </div>

              <StatusBadge status={tower.status} />
            </div>

            <div className="absolute left-5 top-20 rounded-xl border border-[var(--border)] bg-[rgba(8,18,40,0.82)] px-4 py-3 text-xs text-[var(--text-secondary)] backdrop-blur">
              <p className="command-section-label text-[var(--text-muted)]">Linked Camera</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{tower.linkedCamera.name}</p>
              <p className="mt-1">{tower.linkedCamera.resolution}</p>
            </div>

            <div className="absolute bottom-5 left-5 right-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(8,18,40,0.82)] px-3 py-1.5 text-xs text-[var(--text-primary)] backdrop-blur">
                  <Bot className="h-4 w-4 text-[var(--accent-primary)]" />
                  {aiLabel}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(8,18,40,0.82)] px-3 py-1.5 text-xs text-[var(--text-primary)] backdrop-blur">
                  <ScanSearch className="h-4 w-4 text-[var(--warning)]" />
                  {detectionLabel}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(8,18,40,0.82)] px-3 py-1.5 text-xs text-[var(--text-primary)] backdrop-blur">
                  <Radar className="h-4 w-4 text-[var(--safe)]" />
                  {sensorSummary}
                </div>
              </div>

              <div className="rounded-[1.2rem] border border-[var(--border)] bg-[rgba(8,18,40,0.84)] p-4 backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="command-section-label text-[var(--text-muted)]">Live Preview</p>
                    <h3 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{tower.name}</h3>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {tower.location} · {tower.zone}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--border)] bg-[rgba(2,6,14,0.45)] px-4 py-3 text-right">
                    <p className="command-section-label text-[var(--text-muted)]">Latest Event</p>
                    <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{latestEventLabel}</p>
                  </div>
                </div>

                <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{tower.summary}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="command-subpanel p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.72)] text-[var(--accent-primary)]">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="command-section-label text-[var(--text-muted)]">Camera Link</p>
                    <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{tower.linkedCamera.name}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-[var(--text-secondary)]">{tower.linkedCamera.coverage}</p>
              </div>

              <div className="command-subpanel p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.72)] text-[var(--warning)]">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="command-section-label text-[var(--text-muted)]">AI Runtime</p>
                    <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{aiLabel}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-[var(--text-secondary)]">
                  {telemetry.modelLabel ? `Running ${telemetry.modelLabel}` : "Waiting for OKAB runtime"}
                </p>
              </div>

              <div className="command-subpanel p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.72)] text-[var(--fire)]">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="command-section-label text-[var(--text-muted)]">Detection State</p>
                    <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                      {telemetry.detectionLogs.length > 0 ? "Detections present" : "All clear"}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-[var(--text-secondary)]">
                  {alertCount > 0 ? `${alertCount} active alert${alertCount === 1 ? "" : "s"} pending review` : "No active tower alerts"}
                </p>
              </div>

              <div className="command-subpanel p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.72)] text-[var(--safe)]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="command-section-label text-[var(--text-muted)]">Linked Sensors</p>
                    <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{tower.sensors.length}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-[var(--text-secondary)]">{sensorSummary}</p>
              </div>
            </div>

            <div className="command-subpanel p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="command-section-label text-[var(--text-muted)]">Tower Sensors</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">Modules currently linked to Main Tower.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTowerOpen((currentState) => !currentState)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[rgba(8,18,40,0.72)] text-[var(--text-secondary)] transition-colors duration-150 hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                  aria-label={isTowerOpen ? "Collapse tower panel" : "Expand tower panel"}
                >
                  <motion.div
                    animate={{ rotate: isTowerOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {tower.sensors.map((sensor) => (
                  <div
                    key={sensor.id}
                    className="rounded-xl border border-[var(--border)] bg-[rgba(8,18,40,0.62)] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{sensor.name}</p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">
                          {sensor.type} · {sensor.location}
                        </p>
                      </div>
                      <div
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] ${
                          sensorStatusClassMap[sensor.status]
                        }`}
                      >
                        {sensor.status}
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-xs text-[var(--text-secondary)]">
                      {sensor.reading}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isTowerOpen ? (
            <motion.div
              key="tower-console"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="command-subpanel overflow-hidden p-4 sm:p-5"
            >
              <Suspense
                fallback={
                  <div className="command-empty-state min-h-[240px] rounded-xl p-6 text-sm">
                    Initializing Main Tower camera console...
                  </div>
                }
              >
                <AIDetection
                  defaultModelId={defaultModelId}
                  embedded
                  heading={`${tower.name} Camera POV`}
                  description="Use the linked camera feed for live OKAB analysis. Expand the POV for a full-screen inspection and review the tower logs and linked sensors in one place."
                  linkedSensors={tower.sensors}
                  onTelemetryChange={onTelemetryChange}
                />
              </Suspense>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </GlassPanel>
  );
}
