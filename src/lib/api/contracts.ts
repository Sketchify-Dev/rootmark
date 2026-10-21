import { CONTRACTS, EVM_CHAIN_ID, EVM_RPC } from "../config";
import {
  decodeBytes32,
  decodeUint,
  ethCall,
  ethGetBalance,
  ethGetCode,
  functionSelector,
} from "../chain/evm";

export interface ContractReport {
  chainId: number;
  rpc: string;
  evm: {
    address: string | null;
    hasCode: boolean;
    codeSize: number;
    balanceWei: string;
    latestRoot: string | null;
    anchorCount: number | null;
    error: string | null;
  };
  wasm: {
    address: string | null;
    note: string;
  };
}

/**
 * Live state of the deployed anchor contracts, read straight from the chain on each request
 * so the page never shows a cached impression of a contract that has since changed.
 */
export async function contractReport(): Promise<ContractReport> {
  const address = CONTRACTS.evm || null;
  const report: ContractReport = {
    chainId: EVM_CHAIN_ID,
    rpc: EVM_RPC,
    evm: {
      address,
      hasCode: false,
      codeSize: 0,
      balanceWei: "0",
      latestRoot: null,
      anchorCount: null,
      error: null,
    },
    wasm: {
      address: CONTRACTS.wasm || null,
      note: CONTRACTS.wasm
        ? "ink! anchor contract, deployed through pallet_contracts on the substrate side."
        : "No ink! contract address configured.",
    },
  };

  if (!address) {
    report.evm.error = "No EVM anchor address configured. Run the deploy script first.";
    return report;
  }

  try {
    const [code, balance, rootRaw, countRaw] = await Promise.all([
      ethGetCode(address),
      ethGetBalance(address),
      ethCall(address, functionSelector("latestRoot()")),
      ethCall(address, functionSelector("anchorCount()")),
    ]);
    report.evm.hasCode = Boolean(code) && code !== "0x";
    report.evm.codeSize = Math.max(0, (code.length - 2) / 2);
    report.evm.balanceWei = balance.toString();
    report.evm.latestRoot = decodeBytes32(rootRaw);
    const count = decodeUint(countRaw);
    report.evm.anchorCount = count === null ? null : Number(count);
  } catch (error) {
    report.evm.error =
      error instanceof Error ? error.message : "The contract state could not be read.";
  }

  return report;
}
