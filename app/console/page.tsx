import { ConsoleView } from "@/components/console/console-view";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/site/json-ld";

export const metadata: Metadata = {
  title: "Console — query and verify every record · Rootmark",
  description: "One query across EVM and ink! events on Portaldot V3 (420420777). Filter by block, contract, event, address, and verify any result against the Merkle root on chain.",
  alternates: { canonical: "/console" },
};

export default function ConsolePage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Console" }]} />
      <BreadcrumbJsonLd items={[{ name: "Home", url: "https://rootmark-seven.vercel.app/" }, { name: "Console", url: "https://rootmark-seven.vercel.app/console" }]} />
      <ConsoleView />
    </>
  );
}