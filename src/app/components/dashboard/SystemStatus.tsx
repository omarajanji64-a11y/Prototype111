import type { LucideIcon } from "lucide-react";
import { Activity, Cpu, Network, ShieldCheck, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";

import { cardVariants, createStagger, listItemVariants } from "../../animations/variants";
import { performanceMetrics, systemCards } from "../../data/dashboard";
import { GlassPanel } from "../shared/GlassPanel";

const toneClassMap = {
  cyan: "text-[var(--accent-primary)]",
  green: "text-[var(--safe)]",
  orange: "text-[var(--warning)]",
  slate: "text-[var(--text-secondary)]",
} as const;

const iconMap: Record<string, LucideIcon> = {
  confidence: Cpu,
  uptime: ShieldCheck,
  latency: Zap,
  sync: Network,
};

export function SystemStatus() {
  return (
    <motion.section
      variants={createStagger(0.08)}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {systemCards.map((card) => {
          const Icon = iconMap[card.id];

          return (
            <GlassPanel
              key={card.id}
              variants={cardVariants}
              interactive
              className="min-h-[144px] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="command-section-label text-[var(--text-muted)]">{card.label}</p>
                  <p className="mt-3 text-[28px] font-bold leading-none text-[var(--text-primary)]">{card.value}</p>
                  <p className="mt-2 max-w-[22ch] text-xs leading-5 text-[var(--text-secondary)]">{card.detail}</p>
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClassMap[card.tone]}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </GlassPanel>
          );
        })}
      </div>

      <GlassPanel variants={cardVariants} className="p-5">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="command-section-label">Prototype metrics</p>
              <h3 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">Feasibility and sustainability indicators</h3>
            </div>

            <div className="inline-flex items-center gap-2 rounded-md border border-[rgba(14,165,233,0.2)] bg-[rgba(14,165,233,0.1)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-glow)]">
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="h-2 w-2 rounded-full bg-[var(--accent-glow)]"
              />
              LoRa network online
            </div>
          </div>

          <motion.div variants={createStagger(0.08)} className="grid gap-3 lg:grid-cols-3">
            {performanceMetrics.map((metric) => {
              const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown;

              return (
                <motion.div
                  key={metric.label}
                  variants={listItemVariants}
                  className="rounded-xl border border-[var(--border)] border-l-2 border-l-[var(--accent-primary)] bg-[var(--bg-card)] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="command-section-label text-[var(--text-muted)]">{metric.label}</p>
                      <p className="mt-3 text-[28px] font-bold leading-none text-[var(--text-primary)]">{metric.value}</p>
                    </div>
                    <div
                      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                        metric.trend === "up"
                          ? "bg-[var(--safe-dim)] text-[var(--safe)]"
                          : "bg-[rgba(14,165,233,0.1)] text-[var(--accent-glow)]"
                      }`}
                    >
                      <TrendIcon className="h-3.5 w-3.5" />
                      {metric.change}
                    </div>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full rounded-full bg-[var(--accent-primary)]"
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            <Activity className="h-4 w-4 text-[var(--accent-primary)]" />
            Designed for school-level implementation with low-cost, scalable hardware.
          </div>
        </div>
      </GlassPanel>
    </motion.section>
  );
}
