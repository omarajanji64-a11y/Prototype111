import { Plane, Route, TimerReset } from "lucide-react";
import { motion } from "motion/react";

import { cardVariants, createStagger, listItemVariants } from "../../animations/variants";
import type { AlertItem } from "../../data/dashboard";
import { ActionButton } from "../shared/ActionButton";
import { GlassPanel } from "../shared/GlassPanel";
import { SectionTitle } from "../shared/SectionTitle";
import { StatusBadge } from "../shared/StatusBadge";

interface UavResponsePanelProps {
  alerts: AlertItem[];
  onFocusTower: (cameraId: string) => void;
  onOpenAlerts: () => void;
}

export function UavResponsePanel({
  alerts,
  onFocusTower,
  onOpenAlerts,
}: UavResponsePanelProps) {
  return (
    <GlassPanel variants={cardVariants} className="p-5">
      <div className="space-y-5">
        <SectionTitle
          eyebrow="UAV Response"
          title="Autonomous Mission Tasks"
          description="Mission queue for rapid intervention after multi-tower fire confirmation."
          action={
            <ActionButton icon={Plane} variant="primary">
              Start UAV Simulation
            </ActionButton>
          }
        />

        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] border-l-2 border-l-[var(--accent-primary)] bg-[var(--bg-card)] p-5">
            <p className="command-section-label text-[var(--text-muted)]">Active Missions</p>
            <p className="mt-2 text-[36px] font-bold leading-none text-[var(--text-primary)]">{alerts.length}</p>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">Pending autonomous launches</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] border-l-2 border-l-[var(--warning)] bg-[var(--bg-card)] p-5">
            <p className="command-section-label text-[var(--text-muted)]">Estimated Launch</p>
            <p className="mt-2 text-[36px] font-bold leading-none text-[var(--text-primary)]">40s</p>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">Average response queue time</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] border-l-2 border-l-[var(--safe)] bg-[var(--bg-card)] p-5">
            <p className="command-section-label text-[var(--text-muted)]">Coverage Radius</p>
            <p className="mt-2 text-[36px] font-bold leading-none text-[var(--text-primary)]">2.4 km</p>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">Prototype drone coverage envelope</p>
          </div>
        </div>

        <motion.div
          variants={createStagger(0.06, 0.06)}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {alerts.length === 0 ? (
            <div className="command-empty-state flex-col gap-3 px-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-[var(--border-hover)] text-[var(--text-secondary)]">
                <Plane className="h-5 w-5" />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">No UAV missions active</p>
            </div>
          ) : null}

          {alerts.slice(0, 3).map((alert, index) => (
            <motion.div
              key={alert.id}
              variants={listItemVariants}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <StatusBadge severity={alert.severity} />
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Mission {index + 1}: {alert.location}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">{alert.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton variant="secondary" className="px-3 py-2 text-xs" icon={Route} onClick={() => onFocusTower(alert.cameraId)}>
                    Open Route
                  </ActionButton>
                  <ActionButton variant="secondary" className="px-3 py-2 text-xs" icon={TimerReset} onClick={onOpenAlerts}>
                    Review Alert
                  </ActionButton>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </GlassPanel>
  );
}
