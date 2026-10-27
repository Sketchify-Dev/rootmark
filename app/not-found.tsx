import Link from "next/link";
import "@/landing/landing.css";

export default function NotFound() {
  return (
    <div className="rootmark-landing min-h-[100svh] bg-[var(--rm-bg)] text-[var(--rm-ink)] flex flex-col">
      <div className="rm-frame flex flex-1 flex-col items-start justify-center py-16">
        <p className="rm-eyebrow-pill">404</p>
        <h1 className="rm-serif mt-4 text-[clamp(2.5rem,6vw,4rem)] leading-none tracking-[-0.02em]">This page is not on the chain.</h1>
        <p className="mt-3 max-w-[40ch] text-[15px] leading-[1.5] opacity-70">
          The address you asked for has no record. Use the console to query the index, or check the anchored batches.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/console" className="rm-hero-cta !bg-[var(--rm-ink)] !text-[#f2ecdd]">Open console</Link>
          <Link href="/" className="rm-hero-arrow !border-[var(--rm-ink)] !text-[var(--rm-ink)] w-auto px-4 gap-2">Back to landing <span aria-hidden="true">→</span></Link>
        </div>
        <p className="mt-8 text-[12px] opacity-50">chain 420420777 · if you followed a proof link, the record may not be indexed yet.</p>
      </div>
    </div>
  );
}
