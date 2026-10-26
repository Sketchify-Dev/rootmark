import Link from "next/link";

export function StickyMobileCta() {
  return (
    <div className="sticky-mobile-cta pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-3 sm:hidden">
      <Link
        href="/console"
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[var(--rm-ink)] px-5 py-3 text-[14px] font-semibold tracking-[-0.01em] text-[#f2ecdd] shadow-[0_12px_32px_rgba(4,26,85,0.35)]"
      >
        Verify a record <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
