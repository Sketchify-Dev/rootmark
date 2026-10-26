import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, IBM_Plex_Mono } from "next/font/google";
import { InstrumentSerif, Switzer } from "@/landing/fonts";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Rootmark, verifiable index for the Portaldot V3 chain",
    template: "%s | Rootmark",
  },
  description:
    "One query surface across EVM and ink! events. Every record carries a Merkle proof checked against an on-chain root.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className={`min-h-full bg-bg font-sans text-ink ${Switzer.variable} ${InstrumentSerif.variable}`}>{children}</body>
    </html>
  );
}
