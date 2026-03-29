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
  const activeZone = zones[0];

  return (
    <GlassPanel variants={cardVariants} className="p-6">
      <div className="space-y-5">
        <SectionTitle
          eyebrow="Forest Coverage"
          title="Main tower coverage map"
          description="The map centers on the single zone currently watched by Main Tower and its linked sensor stack."
          action={
            <ActionButton icon={Radar} variant="secondary">
              Main Tower uplink
            </ActionButton>
          }
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_320px]">
          <div className="relative min-h-[420px] overflow-hidden rounded-[12px] border border-[var(--border-subtle)] bg-[#0a1a0f]">
            <div className="command-map-grid pointer-events-none absolute inset-0" />
            <div className="pointer-events-none absolute inset-[8%] rounded-[12px] border border-[var(--border-default)]" />
            <div className="pointer-events-none absolute left-[16%] top-[20%] h-[22%] w-[18%] rounded-[10px] border border-[var(--border-default)] bg-[rgba(74,222,128,0.04)]" />
            <div className="pointer-events-none absolute left-[44%] top-[18%] h-[24%] w-[22%] rounded-[10px] border border-[var(--border-default)] bg-[rgba(74,222,128,0.04)]" />
            <div className="pointer-events-none absolute left-[26%] top-[56%] h-[18%] w-[40%] rounded-[10px] border border-[var(--border-default)] bg-[rgba(74,222,128,0.04)]" />

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
                <span className="okab-map-ripple" />
                <div
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border bg-[rgba(7,16,10,0.92)] backdrop-blur-sm"
                  style={{
                    borderColor: "rgba(74,222,128,0.45)",
                  }}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{
                      backgroundColor: "var(--accent)",
                    }}
                  />
                </div>
              </motion.button>
            ))}
          </div>

          {activeZone ? (
            <motion.div
              variants={createStagger(0.07)}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              <motion.div key={activeZone.id} variants={listItemVariants} className="command-subpanel p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-[22px] font-bold tracking-[0.04em] text-[var(--text-primary)]">{activeZone.name}</p>
                    <p className="mt-3 text-[13px] leading-7 text-[var(--text-secondary)]">{activeZone.note}</p>
                  </div>
                  <StatusBadge status={activeZone.status} />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="okab-pill okab-chip-neutral">{activeZone.cameraId}</span>
                  <span className="okab-pill okab-chip-neutral">Risk {activeZone.risk}</span>
                </div>

                <div className="mt-5">
                  <ActionButton icon={LocateFixed} variant="primary" onClick={() => onFocusCamera(activeZone.cameraId)}>
                    Open Main Tower
                  </ActionButton>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </GlassPanel>
  );
}
