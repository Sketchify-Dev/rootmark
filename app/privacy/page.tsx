import type { Metadata } from "next";
import "@/landing/landing.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Rootmark handles data: it does not track you, it reads the chain.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="rootmark-landing min-h-screen bg-[var(--rm-bg)] text-[var(--rm-ink)]">
      <div className="rm-frame py-10 sm:py-14">
        <p className="rm-section-pill">Privacy</p>
        <h1 className="rm-serif mt-3 text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.02em]">We do not track you. We read the chain.</h1>
        <div className="mt-8 grid gap-6 max-w-[65ch] text-[15px] leading-[1.65]">
          <p>Rootmark is a read-only index for the Portaldot V3 chain. It fetches blocks and events from <code className="rounded bg-white/60 px-1 py-0.5 text-[13px]">https://test-evm-rpc-v3.portaldot.dev</code> and <code className="rounded bg-white/60 px-1 py-0.5 text-[13px]">wss://test-node-v3.portaldot.dev</code>, stores them in SQLite, and commits Merkle roots to the anchor contract. That is the whole data flow.</p>
          <h2 className="text-[16px] font-semibold tracking-[-0.01em] mt-2">What we collect</h2>
          <p>Nothing you type in the console is sent anywhere except the same origin as an API query. There is no analytics, no advertising pixel, no third party tracker on this deployment. No cookies are set beyond what Next.js needs for routing.</p>
          <h2 className="text-[16px] font-semibold tracking-[-0.01em]">What leaves your browser</h2>
          <p>When you click Verify, the Merkle proof is recomputed in your tab and the root is compared with the value read from the anchor contract on chain. No record content is sent to a third party for verification.</p>
          <h2 className="text-[16px] font-semibold tracking-[-0.01em]">Wallets</h2>
          <p>Connecting a wallet is not required to use the landing or console. If you deploy a contract with <code className="rounded bg-white/60 px-1 py-0.5 text-[13px]">npm run deploy:evm</code>, your mnemonic or private key never leaves your machine. Do not paste secrets into chat or issues.</p>
          <h2 className="text-[16px] font-semibold tracking-[-0.01em]">Contact</h2>
          <p>Open an issue on the repo that serves this deployment. For the canonical privacy contact after you set a custom domain, replace this page with your own legal address.</p>
          <p className="text-[13px] opacity-60">Last updated 2026-10-26. This is a hackathon project, not legal advice.</p>
          <p><Link href="/" className="underline underline-offset-4">Back to landing →</Link></p>
        </div>
      </div>
    </div>
  );
}
