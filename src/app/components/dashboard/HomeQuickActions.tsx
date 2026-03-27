import {
  BarChart3,
  BellRing,
  Camera,
  Flame,
  MapPinned,
  Plane,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";

import { cardVariants, createStagger, listItemVariants } from "../../animations/variants";
import type { AlertItem, NavigationId } from "../../data/dashboard";
import { ActionButton } from "../shared/ActionButton";
import { GlassPanel } from "../shared/GlassPanel";
import { SectionTitle } from "../shared/SectionTitle";
import { StatusBadge } from "../shared/StatusBadge";

interface HomeQuickActionsProps {
  alerts: AlertItem[];
  criticalCount: number;
  warningTowerCount: number;
  safeTowerCount: number;
  onNavigate: (target: NavigationId) => void;
  onFocusTower: (cameraId: string) => void;
  onDismissAlert: (alertId: string) => void;
}

export function HomeQuickActions({
  alerts,
  criticalCount,
  warningTowerCount,
  safeTowerCount,
  onNavigate,
  onFocusTower,
  onDismissAlert,
}: HomeQuickActionsProps) {
  return (
    <motion.section
      variants={createStagger(0.08)}
      initial="hidden"
      animate="visible"
      className="grid gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]"
    >
      <GlassPanel variants={cardVariants} className="p-5">
        <div className="space-y-5">
          <SectionTitle
            title="Quick Actions"
            description="Jump into the Main Tower console, review live hazard signals, and move between the core OKAB control modules."
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="command-metric-tile p-5" data-tone="critical">
              <p className="command-section-label text-[var(--text-muted)]">Critical Fires</p>
              <p className="command-holo-title mt-2 text-[36px] font-bold leading-none text-[var(--text-primary)]">{criticalCount}</p>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">Immediate intervention required</p>
            </div>
            <div className="command-metric-tile p-5" data-tone="warning">
              <p className="command-section-label text-[var(--text-muted)]">Watch State</p>
              <p className="command-holo-title mt-2 text-[36px] font-bold leading-none text-[var(--text-primary)]">{warningTowerCount}</p>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">Main Tower needs operator attention</p>
            </div>
            <div className="command-metric-tile p-5" data-tone="safe">
              <p className="command-section-label text-[var(--text-muted)]">Tower Safe State</p>
              <p className="command-holo-title mt-2 text-[36px] font-bold leading-none text-[var(--text-primary)]">{safeTowerCount}</p>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">Main Tower is reading nominal conditions</p>
            </div>
          </div>

          <motion.div
            variants={createStagger(0.06, 0.04)}
            initial="hidden"
            animate="visible"
            className="grid gap-3 sm:grid-cols-2"
          >
            <motion.div variants={listItemVariants}>
              <ActionButton icon={Camera} variant="secondary" className="w-full" onClick={() => onNavigate("cameras")}>
                Open Main Tower
              </ActionButton>
            </motion.div>
            <motion.div variants={listItemVariants}>
              <ActionButton icon={BellRing} variant="secondary" className="w-full" onClick={() => onNavigate("alerts")}>
                Review Fire Alerts
              </ActionButton>
            </motion.div>
            <motion.div variants={listItemVariants}>
              <ActionButton icon={BarChart3} variant="secondary" className="w-full" onClick={() => onNavigate("analytics")}>
                Open Analytics
              </ActionButton>
            </motion.div>
            <motion.div variants={listItemVariants}>
              <ActionButton icon={MapPinned} variant="secondary" className="w-full" onClick={() => onNavigate("map")}>
                Open Forest Map
              </ActionButton>
            </motion.div>
            <motion.div variants={listItemVariants} className="sm:col-span-2">
              <ActionButton icon={Plane} variant="primary" className="w-full" onClick={() => onNavigate("automation")}>
                Open UAV Response Tasks
              </ActionButton>
            </motion.div>
          </motion.div>
        </div>
      </GlassPanel>

      <GlassPanel variants={cardVariants} className="p-5">
        <div className="space-y-5">
          <SectionTitle
            eyebrow="New Fires"
            title="Latest Alert Stream"
            description="The newest Main Tower detections that need review."
            action={
              <div className="inline-flex items-center gap-2 rounded-md border border-[rgba(249,115,22,0.2)] bg-[var(--fire-dim)] px-3 py-1.5 font-sci-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--fire)]">
                <Flame className="h-4 w-4" />
                {alerts.length} total
              </div>
            }
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
                  <ActionButton variant="secondary" className="px-3 py-2 text-xs" onClick={() => onFocusTower(alert.cameraId)}>
                    Open Main Tower
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
