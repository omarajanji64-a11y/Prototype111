import { Camera, Settings2, Shield } from "lucide-react";
import { motion } from "motion/react";

import { cardVariants, createStagger, listItemVariants } from "../../animations/variants";
import type { AlertItem, CameraFeed } from "../../data/dashboard";
import { ActionButton } from "../shared/ActionButton";
import { GlassPanel } from "../shared/GlassPanel";
import { SectionTitle } from "../shared/SectionTitle";
import { StatusBadge } from "../shared/StatusBadge";

interface HomeQuickActionsProps {
  alerts: AlertItem[];
  tower: CameraFeed;
  onOpenTower: () => void;
  onOpenSetup: () => void;
  onDismissAlert: (alertId: string) => void;
}

export function HomeQuickActions({
  alerts,
  tower,
  onOpenTower,
  onOpenSetup,
  onDismissAlert,
}: HomeQuickActionsProps) {
  return (
    <motion.section
      variants={createStagger(0.08)}
      initial="hidden"
      animate="visible"
      className="grid gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]"
    >
      <GlassPanel variants={cardVariants} className="overflow-hidden p-0">
        <div className="relative">
          <div className="relative min-h-[440px] overflow-hidden">
            <img
              src={tower.imageUrl}
              alt={tower.linkedCamera.name}
              className="h-full min-h-[440px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,16,0.16),rgba(4,8,16,0.26),rgba(4,8,16,0.92))]" />

            <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-3">
              <div className="rounded-full border border-[rgba(141,240,255,0.2)] bg-[rgba(8,18,40,0.8)] px-3 py-1.5 font-sci-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent-glow)]">
                Tower Preview
              </div>
              <StatusBadge status={tower.status} />
            </div>

            <div className="absolute inset-x-5 bottom-5 space-y-4">
              <div className="rounded-[1.2rem] border border-[var(--border)] bg-[rgba(8,18,40,0.84)] p-5 backdrop-blur">
                <SectionTitle
                  eyebrow="Overview"
                  title={tower.name}
                  description={tower.summary}
                />

                <div className="mt-5 flex flex-wrap gap-2 text-xs">
                  <div className="rounded-full border border-[var(--border)] bg-[rgba(8,18,40,0.82)] px-3 py-1.5 text-[var(--text-primary)]">
                    {tower.linkedCamera.name}
                  </div>
                  <div className="rounded-full border border-[var(--border)] bg-[rgba(8,18,40,0.82)] px-3 py-1.5 text-[var(--text-primary)]">
                    {tower.detections > 0 ? `${tower.detections} detections` : "No detections"}
                  </div>
                  <div className="rounded-full border border-[var(--border)] bg-[rgba(8,18,40,0.82)] px-3 py-1.5 text-[var(--text-primary)]">
                    {tower.sensors.length} linked sensors
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <ActionButton icon={Camera} variant="primary" onClick={onOpenTower}>
                    Open Tower
                  </ActionButton>
                  <ActionButton icon={Settings2} variant="secondary" onClick={onOpenSetup}>
                    Configure
                  </ActionButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel variants={cardVariants} className="p-5">
        <div className="space-y-5">
          <SectionTitle
            eyebrow="New Fires"
            title="Latest Alert Stream"
            description="The newest Main Tower detections that need review."
          />

          <motion.div variants={createStagger(0.06, 0.05)} className="space-y-3">
            {alerts.length === 0 ? (
              <div className="command-empty-state flex-col gap-3 px-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-[var(--border-hover)] text-[var(--text-secondary)]">
                  <Shield className="h-5 w-5" />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">No active fire events</p>
              </div>
            ) : null}

            {alerts.slice(0, 4).map((alert) => (
              <motion.div
                key={alert.id}
                variants={listItemVariants}
                className="command-subpanel p-4 transition-colors duration-200 hover:border-[var(--border-hover)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <StatusBadge severity={alert.severity} />
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{alert.type}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {alert.location} · {alert.timestamp}
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.78)] text-[var(--fire)]">
                    <Shield className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ActionButton variant="secondary" className="px-3 py-2 text-xs" onClick={onOpenTower}>
                    Open Tower
                  </ActionButton>
                  <ActionButton
                    className="px-3 py-2 text-xs"
                    variant="secondary"
                    onClick={() => onDismissAlert(alert.id)}
                  >
                    Mark Reviewed
                  </ActionButton>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </GlassPanel>
    </motion.section>
  );
}
