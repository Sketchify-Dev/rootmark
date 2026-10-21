import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-on-accent border border-accent hover:bg-[#1d4fd8] active:bg-[#1a45bd] disabled:bg-[#9db6f2] disabled:border-[#9db6f2]",
  secondary:
    "bg-surface text-ink border border-line hover:bg-raised active:bg-[#eef0f4] disabled:text-muted disabled:bg-raised",
  ghost:
    "bg-transparent text-ink border border-transparent hover:bg-raised active:bg-[#eef0f4] disabled:text-muted",
  danger:
    "bg-danger text-on-accent border border-danger hover:bg-[#a82020] active:bg-[#931c1c] disabled:bg-[#e29b9b] disabled:border-[#e29b9b]",
};

// Touch surfaces need 44px targets. Dense pointer surfaces can be tighter.
const SIZES: Record<Size, string> = {
  sm: "h-11 px-3 text-[13px] sm:h-8 sm:px-2.5",
  md: "h-11 px-3 text-[14px] sm:h-9",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  icon,
  children,
  className = "",
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-control)] font-medium transition-colors duration-[var(--duration-fast)] disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}

export function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-3 w-3 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
    />
  );
}
