import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export function Field({
  label,
  htmlFor,
  help,
  error,
  children,
  className = "",
}: {
  label: string;
  htmlFor?: string;
  help?: string;
  error?: string | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[12px] leading-[1.35] text-danger" role="alert">
          {error}
        </p>
      ) : help ? (
        <p className="text-[12px] leading-[1.35] text-muted">{help}</p>
      ) : null}
    </div>
  );
}

const CONTROL =
  "w-full rounded-[var(--radius-control)] border border-line bg-surface px-2.5 text-[14px] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:bg-raised disabled:text-muted";

export function TextInput({
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${CONTROL} h-9 ${className}`} {...rest} />;
}

export function Select({
  className = "",
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${CONTROL} h-9 ${className}`} {...rest}>
      {children}
    </select>
  );
}
