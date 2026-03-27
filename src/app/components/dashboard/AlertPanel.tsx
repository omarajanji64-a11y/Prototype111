import { Bell, Info, LocateFixed, Siren, X } from "lucide-react";
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
  sticky?: boolean;
}

const severityBorder = {
  critical: "border-[rgba(239,68,68,0.2)]",
  high: "border-[rgba(251,191,36,0.2)]",
  medium: "border-[rgba(34,211,238,0.18)]",
} as const;

export function AlertPanel({
  alerts,
  onDismiss,
  onFocusCamera,
  sticky = true,
}: AlertPanelProps) {
  const criticalCount = alerts.filter((alert) => alert.severity === "critical").length;

  return (
    <GlassPanel
      variants={cardVariants}
      className={`h-full p-5 ${sticky ? "lg:sticky lg:top-[72px]" : ""}`}
    >
      <div className="space-y-4">
        <SectionTitle
          eyebrow="Emergency queue"
          title="Real-time alert rail"
          description="Main Tower detections are converted into operator alerts for fast hazard review."
          action={
            <div className="rounded-lg bg-[var(--critical-dim)] px-4 py-2 text-lg font-bold text-[var(--critical)]">
              {criticalCount}
            </div>
          }
        />

        <div className="flex items-start gap-3 rounded-lg border border-[rgba(14,165,233,0.2)] bg-[rgba(14,165,233,0.05)] p-4 text-sm text-[var(--text-secondary)]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-glow)]" />
          <p>Main Tower alerts are generated directly from the live detection log and linked camera analysis.</p>
        </div>

        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="command-empty-state flex-col gap-3 px-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-[var(--border-hover)] text-[var(--text-secondary)]">
                <Bell className="h-5 w-5" />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">All clear — no active alerts</p>
            </div>
          ) : null}

          <AnimatePresence mode="popLayout">
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, x: 14, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -12, scale: 0.96 }}
                transition={{ delay: index * 0.04, duration: 0.25, ease: "easeOut" }}
                className={`relative overflow-hidden rounded-xl border bg-[var(--bg-card)] p-4 ${severityBorder[alert.severity]} ${
                  alert.severity === "critical" ? "command-alert-flash" : ""
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <StatusBadge severity={alert.severity} />
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{alert.type}</h3>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                          {alert.location} · {alert.cameraId}
                        </p>
                      </div>
                    </div>

                    <motion.button
                      whileHover={buttonHover}
                      whileTap={buttonTap}
                      onClick={() => onDismiss(alert.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-colors duration-150 hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                      aria-label={`Dismiss ${alert.id}`}
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{alert.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-[var(--text-secondary)]">
                    <div className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2">
                      {alert.timestamp}
                    </div>
                    <div className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2">
                      Owner: {alert.responseOwner}
                    </div>
                    <div className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2">
                      ETA: {alert.eta}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <ActionButton
                      icon={LocateFixed}
                      variant="secondary"
                      onClick={() => onFocusCamera(alert.cameraId)}
                    >
                      Open Main Tower
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
      </div>
    </GlassPanel>
  );
}
