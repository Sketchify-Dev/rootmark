"use client";

import { useEffect } from "react";


/** Cycles one lit name through a run-on sentence of evidence names. */
export function LitNames({ names, lead }: { names: string[]; lead: string }) {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll("[data-lit]"));
    if (items.length === 0) return;
    let current = 0;
    const timer = setInterval(() => {
      items[current]?.removeAttribute("data-lit-on");
      current = (current + 1) % items.length;
      items[current]?.setAttribute("data-lit-on", "true");
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <p className="rm-lit-line rm-serif">
      <span className="rm-lit-lead">{lead} </span>
      {names.map((name, i) => (
        <span key={name} className="rm-lit-item">
          <span
            data-lit={name}
            data-lit-on={i === 0 ? "true" : undefined}
            className="rm-lit-word"
          >
            {name}
          </span>
          <span className="rm-lit-punct">{i < names.length - 1 ? ", " : "."}</span>
        </span>
      ))}
    </p>
  );
}


/**
 * Signature move: the header ink follows the chapter beneath it. The page alternates sand
 * chapters and one ink chapter (the CTA); the fixed header switches ink with a 300ms colour
 * transition exactly as each edge passes under it. Pure transform and opacity elsewhere.
 */
export function useChapterInk() {
  useEffect(() => {
    const header = document.querySelector("[data-rm-header]");
    const cta = document.querySelector(".rm-cta");
    if (!header || !("IntersectionObserver" in window)) return;
    const set = (onInk: boolean) => {
      (header as HTMLElement).style.color = onInk ? "var(--rm-bg)" : "var(--rm-ink)";
      (header as HTMLElement).classList.toggle("rm-on-ink", onInk);
    };
    // The CTA question's cap line sits 32px under the field edge; flip only once the ink
    // chapter covers the bar with margin to spare.
    const seen = new IntersectionObserver(
      ([entry]) => set(entry.isIntersecting),
      { rootMargin: "-120px 0px 0px 0px", threshold: 0 },
    );
    if (cta) seen.observe(cta);
    return () => seen.disconnect();
  }, []);
}
