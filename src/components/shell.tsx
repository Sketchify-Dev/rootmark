"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import "@/landing/landing.css";
import { LogoMark } from "@/components/site/logo";
import { Rise } from "@/landing/rise-client";

const NAV = [
  { href: "/console", label: "Console" },
  { href: "/anchors", label: "Anchors" },
  { href: "/contracts", label: "Contracts" },
  { href: "/about", label: "About" },
] as const;

function Wordmark() {
  return (
    <Link href="/" className="rm-app-mark" aria-label="Rootmark home">
      <LogoMark size={26} />
      Rootmark
    </Link>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // close on route change
  useEffect(() => { close(); }, [pathname, close]);

  return (
    <div className="rootmark-landing rootmark-app min-h-screen">
      <header className="rm-app-header">
        <div className="rm-app-header-inner">
          <Wordmark />
          <nav aria-label="Primary" className="rm-app-nav hidden md:flex">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={active ? "rm-app-nav-link rm-app-nav-link-active" : "rm-app-nav-link"}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <span className="rm-app-chain hidden sm:inline-flex">chain 420420777 · tPOT</span>
            <Link href="/" className="rm-app-back inline-flex md:hidden">Landing →</Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
              aria-expanded={open}
              className="rm-app-menu md:hidden"
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="rm-app-drawer md:hidden">
          <button type="button" aria-label="Close navigation" onClick={close} className="rm-app-drawer-backdrop" />
          <div role="dialog" aria-modal="true" aria-label="Navigation" className="rm-app-drawer-panel">
            <div className="flex items-center justify-between">
              <Wordmark />
              <button type="button" onClick={close} aria-label="Close navigation" className="rm-app-menu">Close</button>
            </div>
            <nav aria-label="Primary" className="mt-6 flex flex-col gap-1.5">
              {NAV.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={active ? "rm-app-drawer-link rm-app-drawer-link-active" : "rm-app-drawer-link"}
                    onClick={close}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link href="/" onClick={close} className="rm-app-drawer-link mt-2">← Back to landing</Link>
            </nav>
            <p className="mt-auto pt-6 text-[12px] leading-[1.4] opacity-60">Portaldot V3 testnet · chain 420420777 · one record shape across both VMs.</p>
          </div>
        </div>
      ) : null}

      <Rise><main className="rm-app-main">{children}</main></Rise>
    </div>
  );
}
