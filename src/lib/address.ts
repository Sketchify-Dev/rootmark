import { createHash } from "node:crypto";
import { hexToBytes } from "./hash";

/**
 * Portaldot account mapping.
 *
 * An EVM address on Portaldot is not the Ethereum address of the same key, and the balance
 * that pays for gas lives in the substrate account it maps to. The runtime maps an H160 to a
 * 32 byte account by keeping the 20 address bytes and padding the rest with 0xEE, which was
 * checked against a worked example from the official V3 testnet guide.
 */

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const PADDING = 0xee;

export function evmToSubstrateAccount(evmAddress: string): Uint8Array {
  const address = hexToBytes(evmAddress);
  if (address.length !== 20) {
    throw new Error(`expected a 20 byte EVM address, received ${address.length} bytes`);
  }
  const account = new Uint8Array(32);
  account.set(address, 0);
  account.fill(PADDING, 20);
  return account;
}

export function base58Encode(bytes: Uint8Array): string {
  let value = 0n;
  for (const byte of bytes) value = value * 256n + BigInt(byte);
  let out = "";
  while (value > 0n) {
    const remainder = Number(value % 58n);
    out = BASE58_ALPHABET[remainder] + out;
    value /= 58n;
  }
  let leadingZeros = 0;
  for (const byte of bytes) {
    if (byte === 0) leadingZeros += 1;
    else break;
  }
  return "1".repeat(leadingZeros) + out;
}

/** SS58 encode a 32 byte account id. */
export function ss58Encode(account: Uint8Array, prefix = 42): string {
  if (account.length !== 32) {
    throw new Error(`expected a 32 byte account, received ${account.length} bytes`);
  }
  const payload = new Uint8Array(1 + account.length);
  payload[0] = prefix;
  payload.set(account, 1);
  const checksum = createHash("blake2b512")
    .update(Buffer.concat([Buffer.from("SS58PRE"), Buffer.from(payload)]))
    .digest()
    .subarray(0, 2);
  const full = new Uint8Array(payload.length + 2);
  full.set(payload, 0);
  full.set(checksum, payload.length);
  return base58Encode(full);
}

/** The substrate address that holds the balance paying for gas on the EVM side. */
export function fundingAddressForEvm(evmAddress: string, prefix = 42): string {
  return ss58Encode(evmToSubstrateAccount(evmAddress), prefix);
}
