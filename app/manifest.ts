import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rootmark",
    short_name: "Rootmark",
    description: "Verifiable index for the Portaldot V3 chain. One query across EVM and ink! events, every result carries a Merkle proof.",
    start_url: "/",
    display: "standalone",
    background_color: "#e6dbc7",
    theme_color: "#062b8a",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
