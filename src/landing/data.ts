import type { AnchorBatch, EventRecord } from "@/lib/types";

export interface LandingData {
  events: EventRecord[];
  total: number;
  anchors: AnchorBatch[];
  anchored: AnchorBatch | null;
}

function baseUrl(): string {
  return (
    process.env.PORTALIDX_PUBLIC_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://127.0.0.1:3000")
  );
}

/**
 * Real chain data for the proof sections. Returns empty evidence when the indexer is quiet.
 *
 * Two stills of the console ride with the page. Both are drawn from the real record and the
 * real anchored batch above (same event names, same block range, abbreviated hashes), because
 * a fragment that looks like the working product beats grey bars. They are labelled as
 * illustrations of the console, never as screenshots.
 */
export async function getLandingData(): Promise<LandingData> {
  const base = baseUrl();
  try {
    const [eventsRes, anchorsRes] = await Promise.all([
      fetch(`${base}/api/v1/events?limit=3`, { cache: "no-store" }),
      fetch(`${base}/api/v1/anchors?limit=6`, { cache: "no-store" }),
    ]);
    if (!eventsRes.ok || !anchorsRes.ok) return { events: [], total: 0, anchors: [], anchored: null };
    const events = (await eventsRes.json()) as { items: EventRecord[]; total: number };
    const anchors = (await anchorsRes.json()) as { items: AnchorBatch[] };
    const anchored = anchors.items.find((a) => a.status === "anchored") ?? null;
    return { events: events.items, total: events.total, anchors: anchors.items, anchored };
  } catch {
    return { events: [], total: 0, anchors: [], anchored: null };
  }
}

export function shortHash(hash: string, chars = 8): string {
  if (!hash || hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}
