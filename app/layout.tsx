import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, IBM_Plex_Mono } from "next/font/google";
import { InstrumentSerif, Switzer } from "@/landing/fonts";
import "./globals.css";
import { SiteJsonLd, SoftwareJsonLd } from "@/components/site/json-ld";
import { StickyMobileCta } from "@/components/site/mobile-cta";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const SITE_URL = "https://rootmark.portaldot.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Rootmark, verifiable index for the Portaldot V3 chain",
    template: "%s | Rootmark",
  },
  description:
    "One query surface across EVM and ink! events. Every record carries a Merkle proof checked against an on-chain root.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Rootmark",
    title: "Rootmark, verifiable index for the Portaldot V3 chain",
    description: "One query surface across EVM and ink! events. Every record carries a Merkle proof checked against an on-chain root.",
    images: [
      {
        url: "/landing/ledger-paper.jpg",
        width: 1920,
        height: 1485,
        alt: "Hand-ruled ledger paper, c. 1847, the ruled sheet is older than the chain, the check is new",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rootmark, verifiable index for the Portaldot V3 chain",
    description: "One query surface across EVM and ink! events. Every record carries a Merkle proof checked against an on-chain root.",
    images: ["/landing/ledger-paper.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "technology",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className={`min-h-full bg-bg font-sans text-ink ${Switzer.variable} ${InstrumentSerif.variable}`}>{children}
        <StickyMobileCta />
        <SiteJsonLd />
        <SoftwareJsonLd />
      </body>
    </html>
  );
}
