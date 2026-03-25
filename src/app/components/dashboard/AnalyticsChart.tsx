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
    <div className="rounded-[20px] border border-white/10 bg-slate-950/88 px-4 py-3 shadow-[0_18px_50px_rgba(2,6,23,0.52)] backdrop-blur-xl">
      <p className="text-sm font-semibold text-white">{label}</p>
      <div className="mt-2 space-y-1.5">
        {payload.map((entry: any) => (
          <p key={entry.name} className="text-xs text-slate-300">
            <span style={{ color: entry.color }}>{entry.name}</span> · {entry.value}
          </p>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsChart() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <GlassPanel variants={cardVariants} className="p-5 sm:p-6">
        <div className="relative">
        <SectionTitle
          eyebrow="Environmental analytics"
          title="Fire probability trend"
          description="Temperature, gas, and humidity anomalies tracked over the last 24 hours."
          action={
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/14 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
              <Activity className="h-4 w-4" />
              24h prototype log
            </div>
          }
        />

          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activitySeries} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="detectionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.42} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb923c" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "rgba(203,213,225,0.7)", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "rgba(203,213,225,0.7)", fontSize: 12 }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(148,163,184,0.22)" }} />
                <Area
                  type="monotone"
                  dataKey="detections"
                  name="Detections"
                  stroke="#22d3ee"
                  strokeWidth={3}
                  fill="url(#detectionsGradient)"
                  isAnimationActive
                  animationDuration={1000}
                  animationBegin={150}
                />
                <Area
                  type="monotone"
                  dataKey="confidence"
                  name="Confidence"
                  stroke="#fb923c"
                  strokeWidth={2}
                  fill="url(#confidenceGradient)"
                  isAnimationActive
                  animationDuration={1200}
                  animationBegin={260}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel variants={cardVariants} className="p-5 sm:p-6">
        <div className="relative">
        <SectionTitle
          eyebrow="Weekly insights"
          title="Alert distribution"
          description="Severity distribution helps teams evaluate intervention load and risk patterns."
          action={
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/14 bg-orange-300/10 px-4 py-2 text-sm text-orange-100">
              <Flame className="h-4 w-4" />
              7-day review
            </div>
          }
        />

          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertFrequency} margin={{ top: 10, right: 8, left: -18, bottom: 0 }} barGap={4}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "rgba(203,213,225,0.7)", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "rgba(203,213,225,0.7)", fontSize: 12 }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148,163,184,0.06)" }} />
                <Bar
                  dataKey="critical"
                  name="Critical"
                  stackId="severity"
                  fill="#f97316"
                  radius={[10, 10, 0, 0]}
                  isAnimationActive
                  animationDuration={850}
                />
                <Bar
                  dataKey="high"
                  name="High"
                  stackId="severity"
                  fill="#fbbf24"
                  radius={[10, 10, 0, 0]}
                  isAnimationActive
                  animationDuration={1000}
                  animationBegin={120}
                />
                <Bar
                  dataKey="medium"
                  name="Medium"
                  stackId="severity"
                  fill="#38bdf8"
                  radius={[10, 10, 0, 0]}
                  isAnimationActive
                  animationDuration={1150}
                  animationBegin={220}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
