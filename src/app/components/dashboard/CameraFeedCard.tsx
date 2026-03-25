import { Camera, ThermometerSun, TimerReset, Zap } from "lucide-react";
import { motion } from "motion/react";

import { hoverLift, listItemVariants } from "../../animations/variants";
import type { CameraFeed } from "../../data/dashboard";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { StatusBadge } from "../shared/StatusBadge";
import { cn } from "../ui/utils";

interface CameraFeedCardProps {
  camera: CameraFeed;
  isFocused: boolean;
  onFocus: (cameraId: string) => void;
}

const statusFrame = {
  safe: {
    glow: "shadow-[0_20px_60px_rgba(16,185,129,0.14)]",
    border: "border-emerald-300/16",
    overlay: "from-emerald-400/16 via-transparent to-transparent",
    scan: "from-emerald-300/0 via-emerald-300/35 to-emerald-300/0",
    box: "border-emerald-300/60 bg-emerald-300/10 text-emerald-50",
  },
  warning: {
    glow: "shadow-[0_20px_70px_rgba(245,158,11,0.18)]",
    border: "border-amber-300/18",
    overlay: "from-amber-300/16 via-transparent to-transparent",
    scan: "from-amber-300/0 via-amber-300/35 to-amber-300/0",
    box: "border-amber-300/60 bg-amber-300/10 text-amber-50",
  },
  fire: {
    glow: "shadow-[0_22px_80px_rgba(249,115,22,0.24)]",
    border: "border-orange-300/22",
    overlay: "from-orange-400/20 via-transparent to-transparent",
    scan: "from-orange-300/0 via-orange-300/45 to-orange-300/0",
    box: "border-orange-300/70 bg-orange-300/12 text-orange-50",
  },
} as const;

export function CameraFeedCard({ camera, isFocused, onFocus }: CameraFeedCardProps) {
  const theme = statusFrame[camera.status];

  return (
    <motion.button
      type="button"
      variants={listItemVariants}
      whileHover={hoverLift}
      whileTap={{ scale: 0.99 }}
      onClick={() => onFocus(camera.id)}
      className={cn(
        "group relative overflow-hidden rounded-[28px] border bg-[linear-gradient(180deg,rgba(10,16,30,0.92),rgba(7,11,21,0.92))] text-left transition-[border-color,box-shadow] duration-300",
        theme.glow,
        isFocused ? cn("border-white/20", theme.border) : "border-white/10 hover:border-white/18",
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-px rounded-[27px] border border-white/[0.05]" />

      <div className="relative aspect-[1.32] overflow-hidden rounded-t-[28px]">
        <ImageWithFallback
          src={camera.imageUrl}
          alt={camera.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.18),rgba(2,6,23,0.15),rgba(2,6,23,0.78))]" />
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", theme.overlay)} />

        <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
          <div className="rounded-full border border-white/14 bg-slate-950/55 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-100 backdrop-blur-md">
            {camera.id}
          </div>
          <StatusBadge status={camera.status} />
        </div>

        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/14 bg-slate-950/55 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-md">
          <motion.span
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY }}
            className="h-2.5 w-2.5 rounded-full bg-red-400 shadow-[0_0_18px_rgba(248,113,113,0.92)]"
          />
          Live feed
        </div>

        <div className="absolute bottom-4 right-4 rounded-full border border-white/14 bg-slate-950/55 px-3 py-1.5 text-xs text-slate-100 backdrop-blur-md">
          {camera.detections > 0 ? `${camera.detections} detections` : "Nominal"}
        </div>

        {camera.boxes.map((box, index) => (
          <motion.div
            key={box.id}
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 + index * 0.08 }}
            className={cn(
              "absolute rounded-[18px] border-2 backdrop-blur-[1px]",
              theme.box,
            )}
            style={{
              left: `${box.left}%`,
              top: `${box.top}%`,
              width: `${box.width}%`,
              height: `${box.height}%`,
            }}
          >
            <motion.div
              animate={
                camera.status === "safe"
                  ? { opacity: 0.3 }
                  : {
                      opacity: [0.55, 0.9, 0.55],
                    }
              }
              transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY }}
              className="absolute inset-0 rounded-[16px] border border-white/12"
            />
            <div className="absolute -top-3 left-3 rounded-full border border-white/12 bg-slate-950/70 px-2.5 py-1 text-[0.65rem] font-medium tracking-[0.02em] text-white backdrop-blur-md">
              {box.label} · {box.confidence}%
            </div>
          </motion.div>
        ))}

        {camera.status !== "safe" ? (
          <motion.div
            animate={{ y: ["-18%", "120%"] }}
            transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className={cn("pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b", theme.scan)}
          />
        ) : null}
      </div>

      <div className="relative space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold tracking-[-0.04em] text-white">{camera.name}</h3>
            <p className="mt-1 text-sm text-slate-400">
              {camera.location} · {camera.zone}
            </p>
          </div>
          <motion.div
            whileHover={{ rotate: 10, scale: 1.08 }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.045] text-slate-200"
          >
            <Camera className="h-5 w-5" />
          </motion.div>
        </div>

        <p className="text-sm leading-7 text-slate-300/82">{camera.summary}</p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[20px] border border-white/8 bg-white/[0.04] p-3">
            <div className="flex items-center gap-2 text-slate-400">
              <ThermometerSun className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.18em]">Temp</span>
            </div>
            <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-white">{camera.temperature}°C</p>
          </div>
          <div className="rounded-[20px] border border-white/8 bg-white/[0.04] p-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Zap className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.18em]">AI</span>
            </div>
            <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-white">{camera.confidence}%</p>
          </div>
          <div className="rounded-[20px] border border-white/8 bg-white/[0.04] p-3">
            <div className="flex items-center gap-2 text-slate-400">
              <TimerReset className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.18em]">Sweep</span>
            </div>
            <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-white">{camera.lastSweep}</p>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

