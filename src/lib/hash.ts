import { keccak256 as keccak256Js } from "js-sha3";

/**
 * keccak256, the hash function Solidity uses.
 *
 * Node ships NIST SHA3 but not the original Keccak padding Ethereum uses, so
 * `crypto.createHash("sha3-256")` would not match a Solidity contract. js-sha3 implements
 * the Ethereum variant.
 */
export function keccak256(input: Uint8Array | string): string {
  return keccak256Js(input as never);
}

export function keccak256Hex(input: Uint8Array | string): string {
  return `0x${keccak256(input)}`;
}

export function utf8(input: string): Uint8Array {
  return new TextEncoder().encode(input);
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const padded = clean.length % 2 === 0 ? clean : `0${clean}`;
  const out = new Uint8Array(padded.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(padded.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (const byte of bytes) out += byte.toString(16).padStart(2, "0");
  return `0x${out}`;
}

/** Stable stringify: object keys sorted, no insignificant whitespace. */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
}
