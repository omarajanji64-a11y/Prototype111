import { cn } from "../ui/utils";

interface SkeletonBlockProps {
  className?: string;
}

export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return <div aria-hidden className={cn("skeleton-block", className)} />;
}

