import { LocateFixed, Radar } from "lucide-react";
import { motion } from "motion/react";

import { cardVariants, createStagger, listItemVariants } from "../../animations/variants";
import type { FacilityZone } from "../../data/dashboard";
import { ActionButton } from "../shared/ActionButton";
import { GlassPanel } from "../shared/GlassPanel";
import { SectionTitle } from "../shared/SectionTitle";
import { StatusBadge } from "../shared/StatusBadge";

interface MapCardProps {
  zones: FacilityZone[];
  onFocusCamera: (cameraId: string) => void;
}

const markerGlow = {
  safe: "#34d399",
  warning: "#fbbf24",
  fire: "#fb923c",
} as const;

export function MapCard({ zones, onFocusCamera }: MapCardProps) {
  return (
    <GlassPanel variants={cardVariants} className="p-5 sm:p-6">
      <div className="relative">
        <SectionTitle
          eyebrow="Facility mesh"
          title="Live response map"
          description="Zones pulse and transition smoothly as thermal risk changes across the site."
          action={
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/14 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
              <Radar className="h-4 w-4" />
              Live positioning
            </div>
          }
        />

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_320px]">
          <div className="relative min-h-[380px] overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(5,11,22,0.94),rgba(8,14,26,0.96))]">
            <div className="pointer-events-none absolute inset-0 grid-pattern opacity-40" />
            <div className="pointer-events-none absolute inset-[8%] rounded-[26px] border border-white/10" />
            <div className="pointer-events-none absolute left-[16%] top-[20%] h-[22%] w-[18%] rounded-[24px] border border-white/8 bg-white/[0.03]" />
            <div className="pointer-events-none absolute left-[44%] top-[18%] h-[24%] w-[22%] rounded-[26px] border border-white/8 bg-white/[0.03]" />
            <div className="pointer-events-none absolute left-[26%] top-[56%] h-[18%] w-[40%] rounded-[28px] border border-white/8 bg-white/[0.03]" />

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
                    transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY }}
                    className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border"
                    style={{ borderColor: markerGlow[zone.status] }}
                  />
                ) : null}
                <div
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition-transform duration-300 hover:scale-110"
                  style={{
                    borderColor: `${markerGlow[zone.status]}aa`,
                    backgroundColor: `${markerGlow[zone.status]}2b`,
                    boxShadow: `0 18px 48px ${markerGlow[zone.status]}2a`,
                  }}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{
                      backgroundColor: markerGlow[zone.status],
                      boxShadow: `0 0 16px ${markerGlow[zone.status]}`,
                    }}
                  />
                </div>
              </motion.button>
            ))}

            <motion.div
              animate={{ y: ["-12%", "110%"] }}
              transition={{ duration: 4.4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(34,211,238,0),rgba(34,211,238,0.18),rgba(34,211,238,0))]"
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
                className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold tracking-[-0.04em] text-white">{zone.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{zone.note}</p>
                  </div>
                  <StatusBadge status={zone.status} className="text-[0.62rem]" />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="rounded-full border border-white/8 bg-white/[0.05] px-3 py-2 text-sm text-slate-300">
                    Camera {zone.cameraId}
                  </div>
                  <div className="rounded-full border border-white/8 bg-white/[0.05] px-3 py-2 text-sm text-slate-300">
                    Load {zone.load}
                  </div>
                </div>

                <div className="mt-4">
                  <ActionButton icon={LocateFixed} onClick={() => onFocusCamera(zone.cameraId)}>
                    Focus this zone
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

