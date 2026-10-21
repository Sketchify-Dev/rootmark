import type { ReactNode } from "react";
import { Button } from "./button";

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      {icon ? <div className="text-muted">{icon}</div> : null}
      <p className="text-[14px] font-semibold text-ink">{title}</p>
      <p className="max-w-md text-[13px] leading-[1.45] text-muted">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Retry",
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center"
    >
      <p className="text-[14px] font-semibold text-danger">{title}</p>
      <p className="max-w-md text-[13px] leading-[1.45] text-muted">{message}</p>
      {onRetry ? (
        <div className="mt-2">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-[3px] bg-raised ${className}`}
    />
  );
}

export function TableSkeleton({ rows = 8, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="p-3" role="status" aria-label="Loading results">
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-3">
            {Array.from({ length: columns }).map((__, columnIndex) => (
              <Skeleton
                key={columnIndex}
                className={columnIndex === 0 ? "h-3 w-16" : "h-3 flex-1"}
              />
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function Alert({
  tone = "neutral",
  title,
  children,
  action,
}: {
  tone?: "neutral" | "accent" | "success" | "warning" | "danger";
  title?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const border =
    tone === "danger"
      ? "border-[#eebcbc] bg-[#fdefef]"
      : tone === "warning"
        ? "border-[#e6cf9e] bg-[#fdf6e8]"
        : tone === "success"
          ? "border-[#b6ddc7] bg-[#eef8f2]"
          : tone === "accent"
            ? "border-[#bcd0fb] bg-[#eef3fe]"
            : "border-line bg-raised";
  return (
    <div className={`rounded-[var(--radius-control)] border px-3 py-2 ${border}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          {title ? (
            <p className="text-[13px] font-semibold leading-[1.35] text-ink">{title}</p>
          ) : null}
          <div className="text-[13px] leading-[1.45] text-muted">{children}</div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
