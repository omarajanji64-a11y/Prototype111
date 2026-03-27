import { SkeletonBlock } from "../shared/SkeletonBlock";

interface DashboardSkeletonProps {
  progress?: number;
  statusLabel?: string;
}

export function DashboardSkeleton({
  progress = 0,
  statusLabel = "Preparing live monitoring resources…",
}: DashboardSkeletonProps) {
  return (
    <div className="space-y-3 lg:space-y-4">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="command-section-label">Initializing</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">OKAB</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{statusLabel}</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm font-medium text-[var(--text-primary)]">
            {progress}%
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--bg-surface)]">
          <div
            className="h-full rounded-full bg-[var(--accent-primary)] transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.92fr)]">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <SkeletonBlock className="h-8 w-36 rounded-full" />
          <SkeletonBlock className="mt-6 h-14 w-full max-w-3xl rounded-xl" />
          <SkeletonBlock className="mt-4 h-14 w-[82%] rounded-xl" />
          <SkeletonBlock className="mt-6 h-5 w-[72%] rounded-full" />
          <div className="mt-8 flex gap-3">
            <SkeletonBlock className="h-10 w-44 rounded-lg" />
            <SkeletonBlock className="h-10 w-40 rounded-lg" />
          </div>
          <div className="mt-8 grid gap-3 lg:grid-cols-3">
            <SkeletonBlock className="h-32 rounded-xl" />
            <SkeletonBlock className="h-32 rounded-xl" />
            <SkeletonBlock className="h-32 rounded-xl" />
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <SkeletonBlock className="h-8 w-40 rounded-full" />
          <SkeletonBlock className="mt-4 h-6 w-56 rounded-full" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <SkeletonBlock className="h-28 rounded-xl" />
            <SkeletonBlock className="h-28 rounded-xl" />
          </div>
          <SkeletonBlock className="mt-6 h-3 w-full rounded-full" />
          <SkeletonBlock className="mt-4 h-16 rounded-xl" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SkeletonBlock className="h-40 rounded-xl" />
        <SkeletonBlock className="h-40 rounded-xl" />
        <SkeletonBlock className="h-40 rounded-xl" />
        <SkeletonBlock className="h-40 rounded-xl" />
      </div>

      <SkeletonBlock className="h-[280px] rounded-xl" />

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.8fr)]">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <SkeletonBlock className="h-8 w-44 rounded-full" />
          <div className="mt-6 grid gap-3 xl:grid-cols-2">
            <SkeletonBlock className="h-[420px] rounded-xl" />
            <SkeletonBlock className="h-[420px] rounded-xl" />
            <SkeletonBlock className="h-[420px] rounded-xl" />
            <SkeletonBlock className="h-[420px] rounded-xl" />
          </div>
        </div>
        <SkeletonBlock className="h-[700px] rounded-xl" />
      </div>

      <div className="grid gap-3 2xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <SkeletonBlock className="h-[420px] rounded-xl" />
        <SkeletonBlock className="h-[420px] rounded-xl" />
      </div>
    </div>
  );
}
