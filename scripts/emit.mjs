/**
 * Emit one or more Ping records to the testnet Emitter contract so a judge (or
 * anyone with a funded mnemonic) can produce new records end to end.
 *
 * Usage:
 *   PORTALDOT_MNEMONIC="word word ..." npm run emit
 *   PORTALDOT_MNEMONIC="..." npm run emit -- --note "judge run" --value 1234
 *
 * The indexer picks the new event up within ~6 seconds and the console
 * re-queries on mount, so the landing count and the verify panel update
 * without a restart.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Contract, HDNodeWallet, JsonRpcProvider } from "ethers";
import { EVM_RPC } from "../src/lib/config.js";
const DEPLOYMENTS_PATH = process.env.PORTALIDX_DEPLOYMENTS ?? resolve(root, "contracts/deployments.json");

const root = resolve(import.meta.dirname, "..");
const deployments = JSON.parse(readFileSync(DEPLOYMENTS_PATH, "utf8"));
const emitterAddress = deployments?.contracts?.Emitter?.address;
if (!emitterAddress) {
  console.error("no Emitter address in contracts/deployments.json");
  process.exit(1);
}

const mnemonic = process.env.PORTALDOT_MNEMONIC?.trim();
if (!mnemonic) {
  console.error("PORTALDOT_MNEMONIC is required");
  process.exit(1);
}

const args = process.argv.slice(2);
function arg(name, fallback) {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return fallback;
  return args[i + 1];
}
const note = arg("note", `judge run ${new Date().toISOString()}`);
const value = BigInt(arg("value", "42"));

const artifact = JSON.parse(
  readFileSync(resolve(root, "contracts/evm/artifacts/Emitter.json"), "utf8"),
);

const provider = new JsonRpcProvider(EVM_RPC, { chainId: deployments.chainId, name: "portaldot" });
const wallet = HDNodeWallet.fromPhrase(mnemonic).connect(provider);
const emitter = new Contract(emitterAddress, artifact.abi, wallet);

console.log(`emitter ${emitterAddress}`);
console.log(`from ${wallet.address}`);
const tx = await emitter.ping(value, note);
console.log(`tx ${tx.hash}`);
const receipt = await tx.wait();
console.log(`mined in block ${receipt.blockNumber}`);
console.log("wait ~6s then refresh /console and /anchors");
