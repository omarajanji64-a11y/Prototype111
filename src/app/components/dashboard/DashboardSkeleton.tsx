import { SkeletonBlock } from "../shared/SkeletonBlock";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.92fr)]">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-8">
          <SkeletonBlock className="h-8 w-36 rounded-full" />
          <SkeletonBlock className="mt-6 h-14 w-full max-w-3xl rounded-[26px]" />
          <SkeletonBlock className="mt-4 h-14 w-[82%] rounded-[26px]" />
          <SkeletonBlock className="mt-6 h-5 w-[72%] rounded-full" />
          <div className="mt-8 flex gap-3">
            <SkeletonBlock className="h-12 w-44 rounded-2xl" />
            <SkeletonBlock className="h-12 w-40 rounded-2xl" />
          </div>
          <div className="mt-8 grid gap-3 lg:grid-cols-3">
            <SkeletonBlock className="h-32 rounded-[24px]" />
            <SkeletonBlock className="h-32 rounded-[24px]" />
            <SkeletonBlock className="h-32 rounded-[24px]" />
          </div>
        </div>
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <SkeletonBlock className="h-8 w-40 rounded-full" />
          <SkeletonBlock className="mt-4 h-6 w-56 rounded-full" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <SkeletonBlock className="h-28 rounded-[22px]" />
            <SkeletonBlock className="h-28 rounded-[22px]" />
          </div>
          <SkeletonBlock className="mt-6 h-3 w-full rounded-full" />
          <SkeletonBlock className="mt-4 h-16 rounded-[22px]" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SkeletonBlock className="h-40 rounded-[28px]" />
        <SkeletonBlock className="h-40 rounded-[28px]" />
        <SkeletonBlock className="h-40 rounded-[28px]" />
        <SkeletonBlock className="h-40 rounded-[28px]" />
      </div>

      <SkeletonBlock className="h-[280px] rounded-[30px]" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.8fr)]">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <SkeletonBlock className="h-8 w-44 rounded-full" />
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <SkeletonBlock className="h-[420px] rounded-[28px]" />
            <SkeletonBlock className="h-[420px] rounded-[28px]" />
            <SkeletonBlock className="h-[420px] rounded-[28px]" />
            <SkeletonBlock className="h-[420px] rounded-[28px]" />
          </div>
        </div>
        <SkeletonBlock className="h-[700px] rounded-[30px]" />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <SkeletonBlock className="h-[420px] rounded-[30px]" />
        <SkeletonBlock className="h-[420px] rounded-[30px]" />
      </div>
    </div>
  );
}
