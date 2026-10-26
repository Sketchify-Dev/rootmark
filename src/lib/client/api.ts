import type {
  AnchorBatch,
  EventQuery,
  EventRecord,
  HealthReport,
  ProofPayload,
} from "../types";

/**
 * Browser side API client. Every call surfaces a readable error instead of throwing a bare
 * status code, so the interface can tell the user what actually failed.
 */

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { ...init, cache: "no-store" });
  } catch {
    throw new ApiError(
      "The Rootmark API could not be reached. Check that the server is running.",
      0,
    );
  }
  if (!response.ok) {
    let message = `Request failed with HTTP ${response.status}.`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // keep the generic message
    }
    throw new ApiError(message, response.status);
  }
  return (await response.json()) as T;
}

function toParams(query: EventQuery): string {
  const params = new URLSearchParams();
  if (query.vm) params.set("vm", query.vm);
  if (query.contract) params.set("contract", query.contract);
  if (query.event) params.set("event", query.event);
  if (query.address) params.set("address", query.address);
  if (typeof query.fromBlock === "number") params.set("fromBlock", String(query.fromBlock));
  if (typeof query.toBlock === "number") params.set("toBlock", String(query.toBlock));
  if (typeof query.cursor === "number") params.set("cursor", String(query.cursor));
  if (typeof query.limit === "number") params.set("limit", String(query.limit));
  return params.toString();
}

export function fetchEvents(
  query: EventQuery,
  signal?: AbortSignal,
): Promise<{ items: EventRecord[]; total: number; nextCursor: number | null }> {
  return request(`/api/v1/events?${toParams(query)}`, { signal });
}

export function fetchProof(id: number, signal?: AbortSignal): Promise<ProofPayload> {
  return request(`/api/v1/proof/${id}`, { signal });
}

export function fetchAnchors(limit = 50, signal?: AbortSignal): Promise<{ items: AnchorBatch[] }> {
  return request(`/api/v1/anchors?limit=${limit}`, { signal });
}

export function fetchHealth(signal?: AbortSignal): Promise<HealthReport> {
  return request("/api/v1/health", { signal });
}

export function fetchFacets(
  signal?: AbortSignal,
): Promise<{
  contracts: { contract: string; vm: string; count: number }[];
  events: { event: string; vm: string; count: number }[];
}> {
  return request("/api/v1/filters", { signal });
}
