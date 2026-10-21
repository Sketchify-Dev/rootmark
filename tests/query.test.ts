import { describe, expect, it } from "vitest";
import { parseEventQuery, ValidationError } from "../src/lib/api/queries";

const parse = (search: string) => parseEventQuery(new URLSearchParams(search));

describe("parseEventQuery", () => {
  it("accepts an empty query", () => {
    expect(parse("")).toEqual({});
  });

  it("treats vm=all as no filter", () => {
    expect(parse("vm=all")).toEqual({});
  });

  it("accepts both execution environments", () => {
    expect(parse("vm=evm").vm).toBe("evm");
    expect(parse("vm=wasm").vm).toBe("wasm");
  });

  it("rejects an unknown environment", () => {
    expect(() => parse("vm=solana")).toThrow(ValidationError);
  });

  it("accepts a 20 byte hex contract and lowercases it", () => {
    expect(parse(`contract=0x${"AB".repeat(20)}`).contract).toBe(`0x${"ab".repeat(20)}`);
  });

  it("accepts a 32 byte SS58 contract", () => {
    const address = "5Hfmuhj1AHrTBJiC9zUPnJo1cfG2G52LLMwofSigBnjtto8Y";
    expect(parse(`contract=${address}`).contract).toBe(address.toLowerCase());
  });

  it("rejects a malformed address", () => {
    expect(() => parse("contract=0x1234")).toThrow(ValidationError);
    expect(() => parse("address=not-an-address")).toThrow(ValidationError);
  });

  it("rejects a negative block", () => {
    expect(() => parse("fromBlock=-1")).toThrow(ValidationError);
  });

  it("rejects an inverted block range", () => {
    expect(() => parse("fromBlock=10&toBlock=5")).toThrow(ValidationError);
  });

  it("clamps the limit bounds", () => {
    expect(parse("limit=100").limit).toBe(100);
    expect(() => parse("limit=0")).toThrow(ValidationError);
    expect(() => parse("limit=501")).toThrow(ValidationError);
  });

  it("rejects a fractional cursor", () => {
    expect(() => parse("cursor=1.5")).toThrow(ValidationError);
  });
});
