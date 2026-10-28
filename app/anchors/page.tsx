import { AnchorsView } from "@/components/anchors-view";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/site/json-ld";

export const metadata: Metadata = {
  title: "Anchors — Merkle batches on chain · Rootmark",
  description: "Every batch Rootmark anchored on the Portaldot V3 chain. Each card is a Merkle root, block range, count, and anchor transaction you can check.",
  alternates: { canonical: "/anchors" },
};

export default function AnchorsPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Anchors" }]} />
      <BreadcrumbJsonLd items={[{ name: "Home", url: "https://rootmark-seven.vercel.app/" }, { name: "Anchors", url: "https://rootmark-seven.vercel.app/anchors" }]} />
      <AnchorsView />
    </>
  );
}