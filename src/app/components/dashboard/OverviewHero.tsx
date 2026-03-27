import { ArrowRight, Siren, Video } from "lucide-react";
import { motion } from "motion/react";

import { cardVariants, createStagger, listItemVariants } from "../../animations/variants";
import { heroHighlights, type CameraFeed } from "../../data/dashboard";
import { ActionButton } from "../shared/ActionButton";
import { GlassPanel } from "../shared/GlassPanel";
import { StatusBadge } from "../shared/StatusBadge";

interface OverviewHeroProps {
  focusedCamera: CameraFeed;
  alertCount: number;
  criticalCount: number;
  warningCount: number;
  onOpenCameraWall: () => void;
}

const statusAccent = {
  safe: {
    bar: "linear-gradient(90deg, rgba(16,185,129,0.95), rgba(52,211,153,0.72))",
    value: 24,
  },
  warning: {
    bar: "linear-gradient(90deg, rgba(245,158,11,0.95), rgba(251,191,36,0.72))",
    value: 66,
  },
  fire: {
    bar: "linear-gradient(90deg, rgba(249,115,22,0.95), rgba(248,113,113,0.72))",
    value: 94,
  },
} as const;

export function OverviewHero({
  focusedCamera,
  alertCount,
  criticalCount,
  warningCount,
  onOpenCameraWall,
}: OverviewHeroProps) {
  const accent = statusAccent[focusedCamera.status];

  return (
    <motion.section
      variants={createStagger(0.09, 0.04)}
      initial="hidden"
      animate="visible"
      className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.92fr)]"
    >
      <GlassPanel
        variants={cardVariants}
        className="relative p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(141,240,255,0.18),transparent_60%)]" />
        <div className="pointer-events-none absolute -right-18 top-[-20%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(90,140,255,0.2),transparent_72%)] blur-2xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-3">
            <div className="command-live-chip inline-flex">
              <span className="command-live-dot" />
              Ecosystem intelligence live
            </div>
            <div className="rounded-full border border-orange-300/16 bg-orange-300/10 px-3 py-1 font-sci-mono text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-orange-100">
              {alertCount} active fire alerts
            </div>
          </div>

          <div className="mt-6 max-w-3xl">
            <h2 className="command-holo-title text-4xl font-semibold leading-[1.02] text-white sm:text-5xl">
              OKAB detects forest and rural fires early with AI, IoT towers, and UAV support.
            </h2>
            <p className="mt-4 max-w-2xl text-[1.05rem] leading-7 text-slate-300/82">
              The system continuously monitors temperature, gas, and humidity through Main Tower, verifies the
              linked camera feed with OKAB, and triggers fast intervention when a hazard appears.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_280px]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <ActionButton icon={Siren} variant="primary">
                  Simulate UAV dispatch
                </ActionButton>
                <ActionButton icon={Video} variant="secondary" onClick={onOpenCameraWall}>
                  Open Main Tower
                </ActionButton>
                <ActionButton icon={ArrowRight}>Review project scope</ActionButton>
              </div>
            </div>

            <div className="command-subpanel p-4">
              <p className="command-section-label font-sci-mono">Command Pulse</p>
              <div className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center justify-between">
                  <span>Autonomous towers</span>
                  <strong className="font-sci-mono text-[var(--text-primary)]">1 linked</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sensor heartbeat</span>
                  <strong className="font-sci-mono text-[var(--accent-glow)]">Stable</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Response posture</span>
                  <strong className="font-sci-mono text-[var(--warning)]">Armed</strong>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            variants={createStagger(0.08)}
            className="mt-8 grid gap-3 lg:grid-cols-3"
          >
            {heroHighlights.map((highlight) => (
              <motion.div
                key={highlight.label}
                variants={listItemVariants}
                className="command-subpanel p-4"
              >
                <p className="font-sci-mono text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {highlight.label}
                </p>
                <p className="command-holo-title mt-2 text-2xl font-semibold text-white">
                  {highlight.value}
                </p>
                <p className="mt-1 text-sm text-slate-400">{highlight.detail}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </GlassPanel>

      <GlassPanel
        tone={focusedCamera.status === "fire" ? "red" : focusedCamera.status === "warning" ? "orange" : "cyan"}
        variants={cardVariants}
        className="p-6"
      >
        <div className="relative">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-sci-mono text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-slate-500">
                Focused tower
              </p>
              <h3 className="command-holo-title mt-2 text-2xl font-semibold text-white">
                {focusedCamera.name}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                {focusedCamera.location} · {focusedCamera.zone}
              </p>
            </div>
            <StatusBadge status={focusedCamera.status} />
          </div>

          <p className="mt-6 text-sm leading-7 text-slate-300/85">{focusedCamera.summary}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="command-subpanel p-4">
              <p className="font-sci-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Thermal reading
              </p>
              <p className="command-holo-title mt-2 text-3xl font-semibold text-white">
                {focusedCamera.temperature}
                <span className="ml-1 text-lg text-slate-400">°C</span>
              </p>
            </div>
            <div className="command-subpanel p-4">
              <p className="font-sci-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                AI confidence
              </p>
              <p className="command-holo-title mt-2 text-3xl font-semibold text-white">
                {focusedCamera.confidence}
                <span className="ml-1 text-lg text-slate-400">%</span>
              </p>
            </div>
          </div>

          <div className="command-subpanel mt-6 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Fire probability score</span>
              <span className="font-sci-mono font-medium text-white">{accent.value}%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${accent.value}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full"
                style={{ background: accent.bar }}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="rounded-full border border-white/8 bg-white/[0.045] px-3 py-2 font-sci-mono text-sm text-slate-300">
                {criticalCount} critical alerts
              </div>
              <div className="rounded-full border border-white/8 bg-white/[0.045] px-3 py-2 font-sci-mono text-sm text-slate-300">
                {warningCount} warnings in watch mode
              </div>
              <div className="rounded-full border border-white/8 bg-white/[0.045] px-3 py-2 font-sci-mono text-sm text-slate-300">
                Last sweep {focusedCamera.lastSweep}
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>
    </motion.section>
  );
}
