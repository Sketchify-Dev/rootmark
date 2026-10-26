"use client";

import { useEffect } from "react";

/** Reveal-on-scroll: rise once per element, staggered by section. Content is visible by default. */
export function useRise() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".rm-rise")) as HTMLElement[];
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("rm-in"));
      return;
    }
    // Anything already in view on load reveals on the next frame, without waiting for a
    // scroll event. The observer below handles everything further down the page.
    requestAnimationFrame(() => {
      for (const el of els) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92) {
          const siblings = Array.from(
            el.parentElement?.querySelectorAll(".rm-rise") ?? [],
          );
          const index = Math.max(0, siblings.indexOf(el));
          el.style.transitionDelay = `${Math.min(index, 4) * 70}ms`;
          el.classList.add("rm-in");
        }
      }
    });
    const seen = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const siblings = Array.from(
              target.parentElement?.querySelectorAll(".rm-rise") ?? [],
            );
            const index = Math.max(0, siblings.indexOf(target));
            target.style.transitionDelay = `${Math.min(index, 4) * 70}ms`;
            target.classList.add("rm-in");
            seen.unobserve(target);
          }
        }
      },
      // A small positive margin starts the rise just before an element enters, and the low
      // threshold means tall figures count as visible while still mostly below the fold.
      { rootMargin: "0px 0px 120px 0px", threshold: 0.05 },
    );
    els.forEach((el) => seen.observe(el));
    return () => seen.disconnect();
  }, []);
}
