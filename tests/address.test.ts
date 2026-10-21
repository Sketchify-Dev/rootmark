import { describe, expect, it } from "vitest";
import {
  base58Encode,
  evmToSubstrateAccount,
  fundingAddressForEvm,
  ss58Encode,
} from "../src/lib/address";

/**
 * Known answer test. The official Portaldot V3 testnet guide converts the MetaMask address
 * 0xf7eC65d11e35375A250e474059a917B537804142 to the SS58 account
 * 5Hfmuhj1AHrTBJiC9zUPnJo1cfG2G52LLMwofSigBnjtto8Y. If this test ever fails, the mapping
 * assumption behind `npm run wallet` is wrong.
 */
describe("Portaldot account mapping", () => {
  it("matches the worked example from the official V3 guide", () => {
    expect(fundingAddressForEvm("0xf7eC65d11e35375A250e474059a917B537804142")).toBe(
      "5Hfmuhj1AHrTBJiC9zUPnJo1cfG2G52LLMwofSigBnjtto8Y",
    );
  });

  it("keeps the address bytes and pads with 0xee", () => {
    const account = evmToSubstrateAccount("0xf7ec65d11e35375a250e474059a917b537804142");
    expect(account).toHaveLength(32);
    expect(Array.from(account.slice(0, 20))).toEqual(
      Array.from(Buffer.from("f7ec65d11e35375a250e474059a917b537804142", "hex")),
    );
    expect(Array.from(account.slice(20))).toEqual(Array(12).fill(0xee));
  });

  it("rejects an address of the wrong length", () => {
    expect(() => evmToSubstrateAccount("0xf7ec")).toThrow();
  });

  it("encodes a zero account with base58 leading ones", () => {
    expect(base58Encode(new Uint8Array([0, 0, 1]))).toBe("112");
  });

  it("produces a 48 character SS58 string with prefix 42", () => {
    const address = ss58Encode(evmToSubstrateAccount("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"));
    expect(address).toHaveLength(48);
    expect(address.startsWith("5")).toBe(true);
  });
});
