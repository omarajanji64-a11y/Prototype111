import {
  BarChart3,
  BellRing,
  Camera,
  Flame,
  MapPinned,
  Plane,
  ShieldAlert,
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
      className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]"
    >
      <GlassPanel variants={cardVariants} className="p-5 sm:p-6">
        <div className="relative">
          <SectionTitle
            eyebrow="Home"
            title="Quick Actions"
            description="Use the sidebar to open each module. Home now focuses on immediate actions and newest fire events."
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] border border-orange-300/16 bg-orange-300/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-orange-100/90">Critical Fires</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">{criticalCount}</p>
            </div>
            <div className="rounded-[22px] border border-amber-300/16 bg-amber-300/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-amber-100/90">Warning Towers</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">{warningTowerCount}</p>
            </div>
            <div className="rounded-[22px] border border-emerald-300/16 bg-emerald-300/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/90">Safe Towers</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">{safeTowerCount}</p>
            </div>
          </div>

          <motion.div
            variants={createStagger(0.06, 0.04)}
            initial="hidden"
            animate="visible"
            className="mt-6 grid gap-3 sm:grid-cols-2"
          >
            <motion.div variants={listItemVariants}>
              <ActionButton icon={Camera} variant="secondary" className="w-full" onClick={() => onNavigate("cameras")}>
                Open Tower Network
              </ActionButton>
            </motion.div>
            <motion.div variants={listItemVariants}>
              <ActionButton icon={BellRing} className="w-full" onClick={() => onNavigate("alerts")}>
                Review Fire Alerts
              </ActionButton>
            </motion.div>
            <motion.div variants={listItemVariants}>
              <ActionButton icon={BarChart3} className="w-full" onClick={() => onNavigate("analytics")}>
                Open Analytics
              </ActionButton>
            </motion.div>
            <motion.div variants={listItemVariants}>
              <ActionButton icon={MapPinned} className="w-full" onClick={() => onNavigate("map")}>
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

      <GlassPanel variants={cardVariants} className="p-5 sm:p-6">
        <div className="relative">
          <SectionTitle
            eyebrow="New Fires"
            title="Latest Alert Stream"
            description="Newest detections requiring immediate review."
            action={
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/16 bg-orange-300/10 px-3 py-2 text-sm text-orange-100">
                <Flame className="h-4 w-4" />
                {alerts.length} total
              </div>
            }
          />

          <motion.div variants={createStagger(0.06, 0.05)} className="mt-6 space-y-3">
            {alerts.slice(0, 4).map((alert) => (
              <motion.div
                key={alert.id}
                variants={listItemVariants}
                className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <StatusBadge severity={alert.severity} className="text-[0.62rem]" />
                    <div>
                      <p className="text-sm font-semibold text-white">{alert.type}</p>
                      <p className="text-xs text-slate-400">
                        {alert.location} · {alert.timestamp}
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                    <ShieldAlert className="h-4 w-4 text-orange-100" />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ActionButton className="px-3 py-2 text-xs" onClick={() => onFocusTower(alert.cameraId)}>
                    Focus Tower
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

