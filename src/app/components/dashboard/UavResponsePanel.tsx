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
    <GlassPanel variants={cardVariants} className="p-5 sm:p-6">
      <div className="relative">
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

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[22px] border border-cyan-300/16 bg-cyan-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/90">Active Missions</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">{alerts.length}</p>
          </div>
          <div className="rounded-[22px] border border-orange-300/16 bg-orange-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-orange-100/90">Estimated Launch</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">40s</p>
          </div>
          <div className="rounded-[22px] border border-emerald-300/16 bg-emerald-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/90">Coverage Radius</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">2.4 km</p>
          </div>
        </div>

        <motion.div
          variants={createStagger(0.06, 0.06)}
          initial="hidden"
          animate="visible"
          className="mt-6 space-y-3"
        >
          {alerts.slice(0, 3).map((alert, index) => (
            <motion.div
              key={alert.id}
              variants={listItemVariants}
              className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <StatusBadge severity={alert.severity} className="text-[0.62rem]" />
                  <p className="text-sm font-semibold text-white">
                    Mission {index + 1}: {alert.location}
                  </p>
                  <p className="text-xs text-slate-400">{alert.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton className="px-3 py-2 text-xs" icon={Route} onClick={() => onFocusTower(alert.cameraId)}>
                    Open Route
                  </ActionButton>
                  <ActionButton className="px-3 py-2 text-xs" icon={TimerReset} onClick={onOpenAlerts}>
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
