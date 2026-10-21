"use client";

import { useCallback, useState } from "react";

export function CopyButton({
  value,
  label = "Copy",
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 1600);
  }, [value]);

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`${label} ${value}`}
      className={`inline-flex h-6 items-center rounded-[3px] border border-line bg-surface px-1.5 text-[11px] font-medium text-muted transition-colors duration-[var(--duration-fast)] hover:bg-raised hover:text-ink ${className}`}
    >
      {state === "copied" ? "Copied" : state === "failed" ? "Failed" : label}
    </button>
  );
}

export function HashText({
  value,
  chars = 10,
  className = "",
}: {
  value: string;
  chars?: number;
  className?: string;
}) {
  if (!value) return <span className="text-muted">none</span>;
  const short =
    value.length > chars * 2 + 2
      ? `${value.slice(0, chars)}...${value.slice(-chars)}`
      : value;
  return (
    <span className={`mono tnum ${className}`} title={value}>
      {short}
    </span>
  );
}
