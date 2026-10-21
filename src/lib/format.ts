/** Presentation helpers shared by the console, the anchors page and the contracts page. */

export function shortHash(value: string, chars = 8): string {
  if (!value) return "none";
  if (value.length <= chars * 2 + 2) return value;
  return `${value.slice(0, chars)}...${value.slice(-chars)}`;
}

export function formatBlock(value: number | null | undefined): string {
  if (value === null || value === undefined) return "unknown";
  return value.toLocaleString("en-US");
}

export function formatRelative(timestamp: number, now = Date.now()): string {
  const seconds = Math.max(0, Math.floor(now / 1000) - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString().replace("T", " ").replace(".000Z", " UTC");
}

export function explorerTx(hash: string): string {
  return `https://portalscan.portaldot.io/tx/${hash}`;
}

export function explorerAddress(address: string): string {
  return `https://portalscan.portaldot.io/address/${address}`;
}

export function vmLabel(vm: string): string {
  return vm === "evm" ? "EVM" : vm === "wasm" ? "WASM" : vm;
}
