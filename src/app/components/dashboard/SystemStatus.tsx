import type { LucideIcon } from "lucide-react";
import { Activity, Cpu, Network, ShieldCheck, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";

import { cardVariants, createStagger, listItemVariants } from "../../animations/variants";
import { performanceMetrics, systemCards } from "../../data/dashboard";
import { GlassPanel } from "../shared/GlassPanel";

const toneClassMap = {
  cyan: "border-cyan-300/12 bg-cyan-300/10 text-cyan-100",
  green: "border-emerald-300/12 bg-emerald-300/10 text-emerald-100",
  orange: "border-orange-300/12 bg-orange-300/10 text-orange-100",
  slate: "border-slate-300/12 bg-slate-300/10 text-slate-100",
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
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {systemCards.map((card) => {
          const Icon = iconMap[card.id];

          return (
            <GlassPanel
              key={card.id}
              variants={cardVariants}
              interactive
              className="p-5"
            >
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-white">{card.value}</p>
                  <p className="mt-2 text-sm text-slate-400">{card.detail}</p>
                </div>
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${toneClassMap[card.tone]}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </GlassPanel>
          );
        })}
      </div>

      <GlassPanel variants={cardVariants} className="p-6">
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-slate-500">
                Prototype metrics
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">
                Feasibility and sustainability indicators
              </h3>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/14 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100">
              <motion.span
                animate={{ scale: [1, 1.35, 1], opacity: [0.75, 1, 0.75] }}
                transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY }}
                className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]"
              />
              LoRa network online
            </div>
          </div>

          <motion.div variants={createStagger(0.08)} className="mt-8 grid gap-4 lg:grid-cols-3">
            {performanceMetrics.map((metric) => {
              const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown;

              return (
                <motion.div
                  key={metric.label}
                  variants={listItemVariants}
                  className="rounded-[24px] border border-white/8 bg-white/[0.045] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">{metric.label}</p>
                      <p className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-white">
                        {metric.value}
                      </p>
                    </div>
                    <div
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                        metric.trend === "up"
                          ? "bg-emerald-300/10 text-emerald-100"
                          : "bg-cyan-300/10 text-cyan-100"
                      }`}
                    >
                      <TrendIcon className="h-3.5 w-3.5" />
                      {metric.change}
                    </div>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.progress}%` }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full bg-[linear-gradient(90deg,rgba(34,211,238,0.96),rgba(249,115,22,0.88))]"
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[24px] border border-white/8 bg-white/[0.04] px-5 py-4 text-sm text-slate-300">
            <Activity className="h-4 w-4 text-cyan-200" />
            Designed for school-level implementation with low-cost, scalable hardware.
          </div>
        </div>
      </GlassPanel>
    </motion.section>
  );
}
