/**
 * One command to take the project from a fresh clone to a deployed, indexing setup.
 *
 * It compiles the contract, shows which addresses need testnet tokens, and stops with a
 * clear instruction if the wallet is empty. It never prints or stores a mnemonic.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

function has(command) {
  try {
    execFileSync("which", [command], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function step(message) {
  console.log("");
  console.log(message);
  console.log("-".repeat(message.length));
}

step("1/4  Compile the anchor contract");
execFileSync("npm", ["run", "compile:evm"], { cwd: root, stdio: "inherit" });

step("2/4  Check the signing key");
const mnemonic = process.env.PORTALDOT_MNEMONIC?.trim();
if (!mnemonic) {
  console.log("PORTALDOT_MNEMONIC is not set, so nothing can be deployed yet.");
  console.log("");
  console.log("Create a wallet, then:");
  console.log('  export PORTALDOT_MNEMONIC="word word word ..."');
  console.log("  npm run setup");
  console.log("");
  console.log("Run `npm run wallet` at any time to see the addresses that need testnet tokens.");
  process.exit(1);
}

step("3/4  Show the addresses that need testnet tokens");
execFileSync("npm", ["run", "wallet"], { cwd: root, stdio: "inherit", env: process.env });

step("4/4  Deploy");
const deploymentsPath = resolve(root, "contracts/deployments.json");
const already = existsSync(deploymentsPath)
  ? JSON.parse(readFileSync(deploymentsPath, "utf8"))
  : {};

if (!already.evm) {
  console.log("Deploying the EVM anchor contract...");
  execFileSync("npm", ["run", "deploy:evm"], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
} else {
  console.log(`EVM anchor already deployed at ${already.evm.address}`);
}

const bundle = resolve(root, "contracts/wasm/anchor/target/ink/anchor.contract");
if (has("cargo") && existsSync(bundle)) {
  if (!already.wasm) {
    console.log("Deploying the ink! anchor contract...");
    execFileSync("npm", ["run", "deploy:wasm"], {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
  } else {
    console.log(`ink! anchor already deployed at ${already.wasm.address}`);
  }
} else {
  console.log(
    "ink! contract not built yet. Run `npm run build:wasm` then `npm run deploy:wasm`.",
  );
}

console.log("");
console.log("Done. Start the indexer with:");
console.log('  PORTALDOT_MNEMONIC="..." npm run indexer');
