import { ContractsView } from "@/components/contracts-view";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/site/json-ld";

export const metadata: Metadata = {
  title: "Contracts — anchor state live from chain · Rootmark",
  description: "Live anchor contract state on Portaldot V3 EVM 0x92B79C5cD9CC8235e3e2718a739BE825e2bd5430 (chain 420420777): code, balance, anchored count, latest root.",
  alternates: { canonical: "/contracts" },
};

export default function ContractsPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Contracts" }]} />
      <BreadcrumbJsonLd items={[{ name: "Home", url: "https://rootmark-seven.vercel.app/" }, { name: "Contracts", url: "https://rootmark-seven.vercel.app/contracts" }]} />
      <ContractsView />
    </>
  );
}