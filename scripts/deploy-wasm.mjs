/**
 * Deploy the ink! anchor contract to the Portaldot V3 testnet.
 *
 * Run `npm run build:wasm` first. The bundle is read from contracts/wasm/anchor/target/ink/.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";

const WS = process.env.PORTALIDX_SUBSTRATE_WS ?? "wss://test-node-v3.portaldot.dev";
const root = resolve(import.meta.dirname, "..");
const bundlePath = resolve(root, "contracts/wasm/anchor/target/ink/anchor.contract");
const deploymentPath = resolve(root, "contracts/deployments.json");

const mnemonic = process.env.PORTALDOT_MNEMONIC?.trim();
if (!mnemonic) {
  console.error("PORTALDOT_MNEMONIC is not set.");
  console.error('Try: PORTALDOT_MNEMONIC="word word ..." npm run deploy:wasm');
  process.exit(1);
}
if (!existsSync(bundlePath)) {
  console.error(`No contract bundle at ${bundlePath}`);
  console.error("Run: npm run build:wasm");
  process.exit(1);
}

const bundle = JSON.parse(readFileSync(bundlePath, "utf8"));
const codeHex = bundle.source.hex ?? bundle.source.wasm;
const selector = createHash("blake2b512").update("new").digest().subarray(0, 4);
const data = `0x${selector.toString("hex")}`;

const api = await ApiPromise.create({ provider: new WsProvider(WS, 2500) });
const keyring = new Keyring({ type: "sr25519", ss58Format: 42 });
const signer = keyring.addFromMnemonic(mnemonic);

const balance = await api.query.system.account(signer.address);
console.log(`deployer        ${signer.address}`);
console.log(`free balance    ${balance.data.free.toString()}`);
if (balance.data.free.isZero()) {
  console.error("");
  console.error("This account has no tPOT, so it cannot pay for the deployment.");
  console.error("Request testnet tokens with this SS58 address, then try again.");
  process.exit(1);
}

console.log("instantiating ink! anchor...");
const tx = api.tx.contracts.instantiateWithCode(
  0,
  { refTime: 40_000_000_000, proofSize: 655_360 },
  1_000_000_000_000_000,
  codeHex,
  data,
  "0x",
);

const outcome = await new Promise((resolveOutcome, reject) => {
  tx.signAndSend(signer, ({ status, events, dispatchError }) => {
    if (dispatchError) {
      if (dispatchError.isModule) {
        const decoded = api.registry.findMetaError(dispatchError.asModule);
        reject(new Error(`${decoded.section}.${decoded.name}: ${decoded.docs.join(" ")}`));
      } else {
        reject(new Error(dispatchError.toString()));
      }
      return;
    }
    if (status.isInBlock) {
      for (const { event } of events) {
        if (event.section === "contracts" && event.method === "Instantiated") {
          resolveOutcome({
            address: event.data.contract.toString(),
            block: status.asInBlock.toHex(),
          });
          return;
        }
      }
      resolveOutcome({ address: null, block: status.asInBlock.toHex() });
    }
  }).catch(reject);
});

if (!outcome.address) {
  console.error("The transaction was included but no contracts.Instantiated event was found.");
  process.exit(1);
}

console.log(`contract        ${outcome.address}`);
console.log(`block           ${outcome.block}`);
console.log(`tx              ${tx.hash.toHex()}`);

const existing = existsSync(deploymentPath)
  ? JSON.parse(readFileSync(deploymentPath, "utf8"))
  : { chainId: 420420777 };
existing.wasm = {
  address: outcome.address,
  txHash: tx.hash.toHex(),
  codeHash: api.registry.hash(codeHex).toHex(),
  deployer: signer.address,
  deployedAt: Math.floor(Date.now() / 1000),
};
writeFileSync(deploymentPath, `${JSON.stringify(existing, null, 2)}\n`);
console.log(`wrote ${deploymentPath}`);

await api.disconnect();
