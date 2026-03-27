import { LocateFixed, Radar } from "lucide-react";
import { motion } from "motion/react";

import { cardVariants, createStagger, listItemVariants } from "../../animations/variants";
import type { ForestZone } from "../../data/dashboard";
import { ActionButton } from "../shared/ActionButton";
import { GlassPanel } from "../shared/GlassPanel";
import { SectionTitle } from "../shared/SectionTitle";
import { StatusBadge } from "../shared/StatusBadge";

interface MapCardProps {
  zones: ForestZone[];
  onFocusCamera: (cameraId: string) => void;
}

const markerGlow = {
  safe: "#22d3ee",
  warning: "#fbbf24",
  fire: "#f97316",
} as const;

export function MapCard({ zones, onFocusCamera }: MapCardProps) {
  return (
    <GlassPanel variants={cardVariants} className="p-5">
      <div className="space-y-5">
        <SectionTitle
          eyebrow="Forest coverage"
          title="Rural risk map"
          description="Forest, agricultural, and village-edge zones are monitored for early fire intervention."
          action={
            <ActionButton icon={Radar} variant="secondary">
              LoRa positioning
            </ActionButton>
          }
        />

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.1fr)_320px]">
          <div className="relative min-h-[380px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]">
            <div className="command-map-grid pointer-events-none absolute inset-0" />
            <div className="pointer-events-none absolute inset-[8%] rounded-xl border border-[var(--border)]" />
            <div className="pointer-events-none absolute left-[16%] top-[20%] h-[22%] w-[18%] rounded-xl border border-[var(--border)] bg-[rgba(28,36,51,0.28)]" />
            <div className="pointer-events-none absolute left-[44%] top-[18%] h-[24%] w-[22%] rounded-xl border border-[var(--border)] bg-[rgba(28,36,51,0.28)]" />
            <div className="pointer-events-none absolute left-[26%] top-[56%] h-[18%] w-[40%] rounded-xl border border-[var(--border)] bg-[rgba(28,36,51,0.28)]" />

            {zones.map((zone, index) => (
              <motion.button
                key={zone.id}
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.14 + index * 0.08, duration: 0.42 }}
                onClick={() => onFocusCamera(zone.cameraId)}
                className="absolute"
                style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
              >
                {zone.status !== "safe" ? (
                  <motion.span
                    animate={{ scale: [1, 1.85, 1], opacity: [0.75, 0, 0.75] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border"
                    style={{ borderColor: markerGlow[zone.status] }}
                  />
                ) : null}
                <div
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border bg-[rgba(17,24,39,0.92)] backdrop-blur-sm transition-transform duration-200 hover:scale-105"
                  style={{
                    borderColor: `${markerGlow[zone.status]}aa`,
                  }}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{
                      backgroundColor: markerGlow[zone.status],
                    }}
                  />
                </div>
              </motion.button>
            ))}

            <motion.div
              animate={{ y: ["-12%", "110%"] }}
              transition={{ duration: 4.4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(14,165,233,0),rgba(14,165,233,0.12),rgba(14,165,233,0))]"
            />
          </div>

          <motion.div
            variants={createStagger(0.07)}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {zones.map((zone) => (
              <motion.div
                key={zone.id}
                variants={listItemVariants}
                className={`rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 ${
                  zone.status === "fire"
                    ? "border-l-2 border-l-[var(--fire)]"
                    : zone.status === "warning"
                      ? "border-l-2 border-l-[var(--warning)]"
                      : "border-l-2 border-l-[var(--safe)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-[var(--text-primary)]">{zone.name}</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{zone.note}</p>
                  </div>
                  <StatusBadge status={zone.status} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-secondary)]">
                    Tower {zone.cameraId}
                  </div>
                  <div className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-secondary)]">
                    Risk {zone.risk}
                  </div>
                </div>

                <div className="mt-4">
                  <ActionButton icon={LocateFixed} variant="secondary" onClick={() => onFocusCamera(zone.cameraId)}>
                    Focus tower
                  </ActionButton>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </GlassPanel>
  );
}
