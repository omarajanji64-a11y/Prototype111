import { Camera, Settings2, Shield } from "lucide-react";
import { motion } from "motion/react";

import { cardVariants, createStagger, listItemVariants } from "../../animations/variants";
import type { AlertItem, CameraFeed } from "../../data/dashboard";
import type { CameraSourceId } from "../../lib/systemSetup";
import { ActionButton } from "../shared/ActionButton";
import { GlassPanel } from "../shared/GlassPanel";
import { LinkedCameraPreview } from "../shared/LinkedCameraPreview";
import { StatusBadge } from "../shared/StatusBadge";

interface HomeQuickActionsProps {
  alerts: AlertItem[];
  tower: CameraFeed;
  cameraConfigured: boolean;
  cameraSource: CameraSourceId;
  ipCameraUrl?: string;
  linkedStream?: MediaStream | null;
  linkedSnapshot?: string | null;
  linkError?: string;
  onOpenTower: () => void;
  onOpenSetup: () => void;
  onDismissAlert: (alertId: string) => void;
}

export function HomeQuickActions({
  alerts,
  tower,
  cameraConfigured,
  cameraSource,
  ipCameraUrl,
  linkedStream,
  linkedSnapshot,
  linkError,
  onOpenTower,
  onOpenSetup,
  onDismissAlert,
}: HomeQuickActionsProps) {
  return (
    <motion.section
      variants={createStagger(0.08)}
      initial="hidden"
      animate="visible"
      className="grid min-h-[calc(100vh-120px)] gap-4 xl:grid-cols-[minmax(0,58%)_minmax(0,42%)]"
    >
      <GlassPanel variants={cardVariants} className="overflow-hidden p-0" interactive={false}>
        <div className="flex h-full flex-col">
          <div className="relative min-h-[320px] flex-[0_0_55%] overflow-hidden">
            <LinkedCameraPreview
              cameraConfigured={cameraConfigured}
              cameraSource={cameraSource}
              ipCameraUrl={ipCameraUrl}
              stream={linkedStream}
              snapshot={linkedSnapshot}
              fallbackImageUrl={tower.imageUrl}
              alt={tower.linkedCamera.name}
              className="h-full min-h-[320px] w-full"
              placeholderTitle="Main Tower camera is not linked yet"
              placeholderDescription="Use Setup to link the camera source, then the live preview will appear here."
              errorMessage={linkError}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,10,6,0.08),rgba(4,10,6,0.12),rgba(4,10,6,0.48))]" />

            <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-3">
              <div className="rounded-full border border-[var(--border-subtle)] bg-[rgba(7,16,10,0.82)] px-3 py-1.5 text-[11px] font-light uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Tower Preview
              </div>
              <StatusBadge status={tower.status} />
            </div>
          </div>

          <div className="flex flex-1 flex-col p-6">
            <div>
              <p className="command-section-label">Overview</p>
              <h2 className="mt-2 font-display text-[22px] font-bold tracking-[0.04em] text-[var(--text-primary)]">{tower.name}</h2>
              <p className="mt-3 max-w-[64ch] text-[13px] leading-7 text-[var(--text-secondary)]">{tower.summary}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="okab-tag">{tower.linkedCamera.name}</span>
                <span className="okab-tag">{tower.detections > 0 ? `${tower.detections} detections` : "No detections"}</span>
                <span className="okab-tag">{tower.sensors.length} linked sensors</span>
              </div>
            </div>

            <div className="mt-auto flex flex-wrap gap-3 pt-6">
              <ActionButton icon={Camera} variant="primary" onClick={onOpenTower}>
                Open Tower
              </ActionButton>
              <ActionButton icon={Settings2} variant="secondary" onClick={onOpenSetup}>
                Configure
              </ActionButton>
            </div>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel variants={cardVariants} className="flex h-full flex-col p-6" interactive={false}>
        <div>
          <p className="command-section-label">New Fires</p>
          <h2 className="mt-2 font-display text-[20px] font-bold tracking-[0.04em] text-[var(--text-primary)]">Latest Alert Stream</h2>
          <p className="mt-3 max-w-[48ch] text-[13px] leading-7 text-[var(--text-secondary)]">The newest Main Tower detections that need review.</p>
        </div>

        <motion.div variants={createStagger(0.06, 0.05)} className="mt-6 flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-3 rounded-[12px] border border-dashed border-[var(--border-subtle)] p-4">
            {alerts.length === 0 ? (
              <div className="command-empty-state flex-1 flex-col gap-3 px-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-dashed border-[var(--border-subtle)] text-[var(--text-muted)]">
                  <Shield className="h-5 w-5" />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">No active fire events</p>
              </div>
            ) : null}

            {alerts.slice(0, 5).map((alert) => (
              <motion.div
                key={alert.id}
                variants={listItemVariants}
                className="okab-interactive-row flex min-h-[64px] items-center gap-4 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3"
                style={{
                  borderLeftWidth: 3,
                  borderLeftColor:
                    alert.severity === "critical"
                      ? "var(--danger)"
                      : alert.severity === "high"
                        ? "var(--warning)"
                        : "var(--safe)",
                }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">{alert.type}</p>
                  <p className="truncate text-[12px] text-[var(--text-secondary)]">{alert.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-sci-mono text-[12px] text-[var(--text-muted)]">{alert.timestamp}</span>
                  <button
                    type="button"
                    onClick={() => onDismissAlert(alert.id)}
                    className="rounded-[8px] border border-[var(--border-subtle)] px-3 py-1.5 text-[11px] text-[var(--text-secondary)] transition-colors duration-150 hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                  >
                    Review
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </GlassPanel>
    </motion.section>
  );
}
