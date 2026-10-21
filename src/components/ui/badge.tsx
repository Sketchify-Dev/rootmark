import type { ReactNode } from "react";

type Tone = "neutral" | "accent" | "success" | "warning" | "danger";

const TONES: Record<Tone, string> = {
  neutral: "border-line bg-raised text-muted",
  accent: "border-[#bcd0fb] bg-[#eef3fe] text-accent",
  success: "border-[#b6ddc7] bg-[#eef8f2] text-success",
  warning: "border-[#e6cf9e] bg-[#fdf6e8] text-warning",
  danger: "border-[#eebcbc] bg-[#fdefef] text-danger",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[3px] border px-1.5 py-0.5 text-[11px] font-medium leading-[1.35] ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Status is never carried by colour alone. Every badge has a text label. */
export function StatusDot({ tone = "neutral" }: { tone?: Tone }) {
  const color =
    tone === "success"
      ? "bg-success"
      : tone === "warning"
        ? "bg-warning"
        : tone === "danger"
          ? "bg-danger"
          : tone === "accent"
            ? "bg-accent"
            : "bg-muted";
  return <span aria-hidden="true" className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />;
}
