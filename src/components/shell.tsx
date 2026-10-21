"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";

const NAV = [
  { href: "/", label: "Console", hint: "Query and verify" },
  { href: "/anchors", label: "Anchors", hint: "Merkle batches on chain" },
  { href: "/contracts", label: "Contracts", hint: "Deployed and chain state" },
] as const;

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="PortalIndex home">
      <span
        aria-hidden="true"
        className="inline-block h-4 w-4 rounded-[3px] border border-accent bg-accent/10"
      />
      <span className="text-[14px] font-semibold tracking-[-0.01em] text-ink">PortalIndex</span>
    </Link>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawerState, setDrawerState] = useState<{ open: boolean; route: string }>({
    open: false,
    route: "",
  });

  // A route change closes the drawer. Comparing during render keeps the state update out of
  // an effect body.
  const drawerOpen = drawerState.open && drawerState.route === pathname;
  const setDrawerOpen = useCallback(
    (open: boolean) => setDrawerState({ open, route: pathname }),
    [pathname],
  );

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, setDrawerOpen]);

  const nav = (
    <nav aria-label="Primary" className="flex flex-col gap-0.5">
      {NAV.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col rounded-[var(--radius-control)] px-2 py-1.5 transition-colors duration-[var(--duration-fast)] ${
              active ? "bg-raised text-ink" : "text-muted hover:bg-raised hover:text-ink"
            }`}
          >
            <span className="text-[13px] font-medium leading-[1.35]">{item.label}</span>
            <span className="text-[11px] leading-[1.35] text-muted">{item.hint}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-line bg-surface px-3 lg:hidden">
        <Wordmark />
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation"
          aria-expanded={drawerOpen}
          className="inline-flex h-11 min-w-11 items-center justify-center rounded-[var(--radius-control)] border border-line px-3 text-[13px] text-ink hover:bg-raised"
        >
          Menu
        </button>
      </header>

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-ink/30"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-64 flex-col gap-4 border-r border-line bg-surface p-3"
          >
            <div className="flex items-center justify-between">
              <Wordmark />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
                className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] border border-line text-ink hover:bg-raised"
              >
                <span aria-hidden="true">x</span>
              </button>
            </div>
            {nav}
          </div>
        </div>
      ) : null}

      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col gap-4 border-r border-line bg-surface p-3 lg:flex">
          <Wordmark />
          {nav}
          <div className="mt-auto border-t border-line pt-3">
            <p className="label">Chain</p>
            <p className="mono tnum mt-1 text-[12px] text-ink">420420777</p>
            <p className="mt-0.5 text-[12px] leading-[1.35] text-muted">
              Portaldot V3 testnet
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <main className="px-3 py-4 sm:px-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
