import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://rootmark.portaldot.dev";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/console`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/anchors`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/contracts`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
