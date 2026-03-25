import type { ReactNode } from "react";

import { cn } from "../ui/utils";

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  action,
  className,
}: SectionTitleProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-cyan-200/70">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white sm:text-[1.75rem]">
            {title}
          </h2>
          {description ? <p className="max-w-2xl text-sm text-slate-300/78">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

