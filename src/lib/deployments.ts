import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface Deployments {
  chainId: number;
  evm?: {
    address: string;
    txHash: string;
    blockNumber: number;
    deployer: string;
    deployedAt: number;
  };
  wasm?: {
    address: string;
    txHash: string;
    codeHash: string;
    deployer: string;
    deployedAt: number;
  };
}

export const DEPLOYMENTS_PATH = resolve(process.cwd(), "contracts/deployments.json");

/** Read the deployment record written by the deploy scripts. Missing file is not an error. */
export function readDeployments(): Deployments | null {
  try {
    return JSON.parse(readFileSync(DEPLOYMENTS_PATH, "utf8")) as Deployments;
  } catch {
    return null;
  }
}
