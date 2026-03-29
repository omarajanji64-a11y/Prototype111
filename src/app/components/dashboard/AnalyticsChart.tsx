import { Activity, Flame } from "lucide-react";
import { motion } from "motion/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cardVariants } from "../../animations/variants";
import { activitySeries, alertFrequency } from "../../data/dashboard";
import { GlassPanel } from "../shared/GlassPanel";
import { SectionTitle } from "../shared/SectionTitle";

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3">
      <p className="font-sci-mono text-xs text-[var(--text-data)]">{label}</p>
      <div className="mt-2 space-y-1.5">
        {payload.map((entry: any) => (
          <p key={entry.name} className="text-xs text-[var(--text-secondary)]">
            <span style={{ color: entry.color }}>{entry.name}</span> · {entry.value}
          </p>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsChart() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <GlassPanel variants={cardVariants} className="p-6">
        <div className="space-y-5">
          <SectionTitle
            eyebrow="Environmental Analytics"
            title="Fire probability trend"
            description="Temperature, gas, and humidity anomalies tracked over the last 24 hours."
            action={
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--accent-dim)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-[var(--accent)]">
                <Activity className="h-4 w-4" />
                24h prototype log
              </div>
            }
          />

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activitySeries} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="detectionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9de6b2" stopOpacity={0.16} />
                    <stop offset="95%" stopColor="#9de6b2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(74,222,128,0.08)" vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "rgba(122,158,130,1)", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "rgba(122,158,130,1)", fontSize: 12 }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(74,222,128,0.08)" }} />
                <Area
                  type="monotone"
                  dataKey="detections"
                  name="Detections"
                  stroke="#4ade80"
                  strokeWidth={2}
                  fill="url(#detectionsGradient)"
                  isAnimationActive
                  animationDuration={400}
                  animationBegin={80}
                />
                <Area
                  type="monotone"
                  dataKey="confidence"
                  name="Confidence"
                  stroke="#9de6b2"
                  strokeWidth={2}
                  fill="url(#confidenceGradient)"
                  isAnimationActive
                  animationDuration={450}
                  animationBegin={120}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel variants={cardVariants} className="p-6">
        <div className="space-y-5">
          <SectionTitle
            eyebrow="Weekly Insights"
            title="Alert distribution"
            description="Severity distribution helps teams evaluate intervention load and risk patterns."
            action={
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(248,113,113,0.3)] bg-[var(--danger-dim)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-[var(--danger)]">
                <Flame className="h-4 w-4" />
                7-day review
              </div>
            }
          />

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertFrequency} margin={{ top: 10, right: 8, left: -18, bottom: 0 }} barGap={4}>
                <CartesianGrid stroke="rgba(74,222,128,0.08)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "rgba(122,158,130,1)", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "rgba(122,158,130,1)", fontSize: 12 }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(74,222,128,0.03)" }} />
                <Bar
                  dataKey="critical"
                  name="Critical"
                  stackId="severity"
                  fill="#f87171"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive
                  animationDuration={350}
                />
                <Bar
                  dataKey="high"
                  name="High"
                  stackId="severity"
                  fill="#fbbf24"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive
                  animationDuration={400}
                  animationBegin={60}
                />
                <Bar
                  dataKey="medium"
                  name="Medium"
                  stackId="severity"
                  fill="#4ade80"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive
                  animationDuration={450}
                  animationBegin={100}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
