const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://rootmark-seven.vercel.app");

export function SiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Rootmark",
    url: SITE_URL,
    description:
      "The verifiable index for the Portaldot V3 chain. One query across EVM and ink! events, every result carries a Merkle proof you check against an on-chain root.",
    inLanguage: "en",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function SoftwareJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Rootmark",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description:
      "Verifiable middleware that indexes both Portaldot V3 execution environments into one record shape and anchors each batch as a Merkle root on chain.",
    url: SITE_URL,
    offers: { "@type": "Offer", price: "0", priceCurrency: "tPOT" },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
