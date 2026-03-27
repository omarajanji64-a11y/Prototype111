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
    <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", className)}>
      <div className="min-w-0 space-y-1.5">
        {eyebrow ? (
          <p className="command-section-label font-sci-mono">{eyebrow}</p>
        ) : null}
        <h2 className="command-page-title command-holo-title">{title}</h2>
        {description ? <p className="command-page-description max-w-2xl">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0 self-start">{action}</div> : null}
    </div>
  );
}
