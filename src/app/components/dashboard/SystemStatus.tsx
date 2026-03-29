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
      className="space-y-4"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {systemCards.map((card) => {
          const Icon = iconMap[card.id];

          return (
            <GlassPanel
              key={card.id}
              variants={cardVariants}
              interactive
              className="min-h-[160px] p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="command-section-label">{card.label}</p>
                  {card.id === "confidence" ? (
                    <p className="mt-4 font-display text-[30px] font-bold tracking-[0.04em] text-[var(--text-primary)]">{card.value}</p>
                  ) : (
                    <p className="okab-metric-value mt-4 text-[32px] leading-none">{card.value}</p>
                  )}
                  <p className="mt-3 max-w-[26ch] text-[13px] leading-6 text-[var(--text-secondary)]">{card.detail}</p>
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-[var(--accent)] opacity-50 ${toneClassMap[card.tone]}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </GlassPanel>
          );
        })}
      </div>

      <GlassPanel variants={cardVariants} className="p-6">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="command-section-label">Prototype metrics</p>
              <h3 className="mt-2 font-display text-[20px] font-semibold tracking-[0.04em] text-[var(--text-primary)]">Feasibility and sustainability indicators</h3>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--accent-dim)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-[var(--accent)]">
              <motion.span className="command-live-dot" />
              LoRa network online
            </div>
          </div>

          <motion.div variants={createStagger(0.08)} className="grid gap-4 lg:grid-cols-3">
            {performanceMetrics.map((metric) => {
              const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown;

              return (
                <motion.div
                  key={metric.label}
                  variants={listItemVariants}
                  className="command-subpanel p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="command-section-label">{metric.label}</p>
                      <p className="okab-metric-value mt-4 text-[30px] leading-none">{metric.value}</p>
                    </div>
                    <div
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-sci-mono text-[10px] font-semibold ${
                        metric.trend === "up"
                          ? "border-[var(--border-strong)] bg-[var(--accent-dim)] text-[var(--accent)]"
                          : "border-[rgba(248,113,113,0.3)] bg-[var(--danger-dim)] text-[var(--danger)]"
                      }`}
                    >
                      <TrendIcon className="h-3.5 w-3.5" />
                      {metric.change}
                    </div>
                  </div>
                  <div className="mt-5 h-[2px] overflow-hidden rounded-full bg-[var(--border-subtle)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full rounded-full bg-[var(--accent)]"
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="okab-info-strip flex flex-wrap items-center gap-3 px-4 py-3 text-sm text-[var(--text-secondary)]">
            <Activity className="h-4 w-4 text-[var(--accent)]" />
            <span className="italic">Designed for school-level implementation with low-cost, scalable hardware.</span>
          </div>
        </div>
      </GlassPanel>
    </motion.section>
  );
}
