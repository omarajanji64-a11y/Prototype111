import { LocateFixed, Siren, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { buttonHover, buttonTap, cardVariants } from "../../animations/variants";
import type { AlertItem } from "../../data/dashboard";
import { ActionButton } from "../shared/ActionButton";
import { GlassPanel } from "../shared/GlassPanel";
import { SectionTitle } from "../shared/SectionTitle";
import { StatusBadge } from "../shared/StatusBadge";

interface AlertPanelProps {
  alerts: AlertItem[];
  onDismiss: (alertId: string) => void;
  onFocusCamera: (cameraId: string) => void;
}

const severityTone = {
  critical: "from-orange-400/18 via-red-400/[0.08] to-transparent",
  high: "from-amber-300/16 via-orange-300/[0.08] to-transparent",
  medium: "from-cyan-300/16 via-cyan-200/[0.05] to-transparent",
} as const;

export function AlertPanel({ alerts, onDismiss, onFocusCamera }: AlertPanelProps) {
  const criticalCount = alerts.filter((alert) => alert.severity === "critical").length;

  return (
    <GlassPanel variants={cardVariants} className="h-full p-5 sm:p-6 lg:sticky lg:top-[104px]">
      <div className="relative">
        <SectionTitle
          eyebrow="Emergency queue"
          title="Real-time alert rail"
          description="Multi-tower confirmation and fast notification support early intervention in risk zones."
          action={<ActionButton variant="secondary">{criticalCount} critical</ActionButton>}
        />

        <div className="mt-6 space-y-3">
          <AnimatePresence mode="popLayout">
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, x: 14, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -12, scale: 0.96 }}
                transition={{ delay: index * 0.06, duration: 0.32 }}
                className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.045] p-4"
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${severityTone[alert.severity]}`} />
                {alert.severity === "critical" ? (
                  <motion.div
                    animate={{ opacity: [0.4, 0.72, 0.4] }}
                    transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY }}
                    className="pointer-events-none absolute inset-0 rounded-[24px] border border-orange-300/10"
                  />
                ) : null}

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <StatusBadge severity={alert.severity} />
                      <div>
                        <h3 className="text-lg font-semibold tracking-[-0.04em] text-white">{alert.type}</h3>
                        <p className="mt-1 text-sm text-slate-400">
                          {alert.location} · {alert.cameraId}
                        </p>
                      </div>
                    </div>

                    <motion.button
                      whileHover={buttonHover}
                      whileTap={buttonTap}
                      onClick={() => onDismiss(alert.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-300"
                      aria-label={`Dismiss ${alert.id}`}
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-300/84">{alert.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-300">
                    <div className="rounded-full border border-white/8 bg-white/[0.05] px-3 py-2">
                      {alert.timestamp}
                    </div>
                    <div className="rounded-full border border-white/8 bg-white/[0.05] px-3 py-2">
                      Owner: {alert.responseOwner}
                    </div>
                    <div className="rounded-full border border-white/8 bg-white/[0.05] px-3 py-2">
                      ETA: {alert.eta}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <ActionButton
                      icon={LocateFixed}
                      onClick={() => onFocusCamera(alert.cameraId)}
                    >
                      Focus tower
                    </ActionButton>
                    <ActionButton icon={Siren} variant="primary">
                      Launch UAV task
                    </ActionButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-5 rounded-[24px] border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
          Average sensor-to-alert notification time is currently 11 seconds in prototype tests.
        </div>
      </div>
    </GlassPanel>
  );
}
