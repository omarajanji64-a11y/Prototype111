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
    border: "border-[var(--border)]",
    overlay: "from-[rgba(34,211,238,0.08)] via-transparent to-transparent",
    scan: "from-transparent via-[rgba(34,211,238,0.24)] to-transparent",
    box: "border-[rgba(34,211,238,0.55)] bg-[rgba(10,42,51,0.4)] text-[var(--text-primary)]",
  },
  warning: {
    border: "border-[rgba(251,191,36,0.2)]",
    overlay: "from-[rgba(251,191,36,0.08)] via-transparent to-transparent",
    scan: "from-transparent via-[rgba(251,191,36,0.24)] to-transparent",
    box: "border-[rgba(251,191,36,0.55)] bg-[rgba(69,26,3,0.4)] text-[var(--text-primary)]",
  },
  fire: {
    border: "border-[rgba(249,115,22,0.2)]",
    overlay: "from-[rgba(249,115,22,0.12)] via-transparent to-transparent",
    scan: "from-transparent via-[rgba(249,115,22,0.26)] to-transparent",
    box: "border-[rgba(249,115,22,0.7)] bg-[rgba(124,58,14,0.4)] text-[var(--text-primary)]",
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
        "group relative overflow-hidden rounded-xl border bg-[var(--bg-card)] text-left transition-[border-color,background-color] duration-200",
        isFocused ? theme.border : "border-[var(--border)] hover:border-[var(--border-hover)]",
      )}
    >
      <div className="relative aspect-[1.32] overflow-hidden rounded-t-xl">
        <ImageWithFallback
          src={camera.imageUrl}
          alt={camera.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,13,20,0.1),rgba(10,13,20,0.2),rgba(10,13,20,0.78))]" />
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", theme.overlay)} />

        <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
          <div className="rounded-md border border-[var(--border)] bg-[rgba(17,24,39,0.88)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-primary)] backdrop-blur-sm">
            {camera.id}
          </div>
          <StatusBadge status={camera.status} />
        </div>

        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-md border border-[rgba(14,165,233,0.24)] bg-[rgba(17,24,39,0.88)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-glow)] backdrop-blur-sm">
          <motion.span
            animate={{
              opacity: [1, 0.4, 1],
            }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="h-2 w-2 rounded-full border border-[var(--accent-glow)]"
          />
          Live tower
        </div>

        <div className="absolute bottom-4 right-4 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-1 text-xs text-[var(--text-secondary)] backdrop-blur-sm">
          {camera.detections > 0 ? `${camera.detections} detections` : "Nominal"}
        </div>

        {camera.boxes.map((box, index) => (
          <motion.div
            key={box.id}
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 + index * 0.08 }}
            className={cn(
              "absolute rounded-xl border-2 backdrop-blur-[1px]",
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
              className="absolute inset-0 rounded-[10px] border border-white/12"
            />
            <div className="absolute -top-3 left-3 rounded-md border border-[var(--border)] bg-[rgba(17,24,39,0.88)] px-2 py-1 text-[10px] font-medium tracking-[0.02em] text-[var(--text-primary)] backdrop-blur-sm">
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

      <div className="relative border-t border-[var(--border)] bg-black/40 p-5 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">{camera.name}</h3>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {camera.location} · {camera.zone}
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.005 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)]"
          >
            <Camera className="h-4.5 w-4.5" />
          </motion.div>
        </div>

        <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{camera.summary}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <ThermometerSun className="h-4 w-4" />
              <span className="command-card-label">Temp</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{camera.temperature}°C</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <Zap className="h-4 w-4" />
              <span className="command-card-label">Fire Prob.</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{camera.confidence}%</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <TimerReset className="h-4 w-4" />
              <span className="command-card-label">Sweep</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{camera.lastSweep}</p>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
