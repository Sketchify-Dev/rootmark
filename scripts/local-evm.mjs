/**
 * Run a local EVM that speaks the same chain id as the Portaldot V3 testnet.
 *
 * The testnet needs tokens before a contract can be deployed, so this script stands in while
 * those are on the way. It starts a local JSON RPC endpoint, deploys the anchor contract and
 * the event emitter, and sends a few transactions so there is something real to index.
 *
 * Usage: node scripts/local-evm.mjs [port]
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import ganache from "ganache";
import { ContractFactory, HDNodeWallet, JsonRpcProvider } from "ethers";

const port = Number(process.argv[2] ?? 8545);
const CHAIN_ID = 420420777;
const MNEMONIC =
  process.env.PORTALDOT_MNEMONIC?.trim() ??
  "test test test test test test test test test test test junk";
const root = resolve(import.meta.dirname, "..");

function artifact(name) {
  return JSON.parse(
    readFileSync(resolve(root, "contracts/evm/artifacts", `${name}.json`), "utf8"),
  );
}

const server = ganache.server({
  chain: { chainId: CHAIN_ID, networkId: CHAIN_ID, hardfork: "shanghai" },
  wallet: { mnemonic: MNEMONIC, totalAccounts: 10, defaultBalance: 1000 },
  logging: { quiet: true },
  miner: { blockTime: 0, defaultGasPrice: "0x3b9aca00" },
});

await server.listen(port);
const rpc = `http://127.0.0.1:${port}`;
console.log(`local evm listening on ${rpc}, chain ${CHAIN_ID}`);
console.log(`mnemonic ${MNEMONIC}`);

const deploymentPath = resolve(
  process.env.PORTALIDX_DEPLOYMENTS ?? resolve(root, "contracts/deployments.json"),
);

const provider = new JsonRpcProvider(rpc, { chainId: CHAIN_ID, name: "portaldot-local" });
const wallet = HDNodeWallet.fromPhrase(MNEMONIC).connect(provider);

const anchorArtifact = artifact("PortalAnchor");
const anchorFactory = new ContractFactory(
  anchorArtifact.abi,
  anchorArtifact.bytecode,
  wallet,
);
const anchor = await anchorFactory.deploy();
const anchorReceipt = await anchor.deploymentTransaction().wait();
console.log(`anchor contract ${await anchor.getAddress()}`);

const emitterArtifact = artifact("Emitter");
const emitterFactory = new ContractFactory(
  emitterArtifact.abi,
  emitterArtifact.bytecode,
  wallet,
);
const emitter = await emitterFactory.deploy();
const emitterReceipt = await emitter.deploymentTransaction().wait();
console.log(`emitter contract ${await emitter.getAddress()}`);

const notes = [
  ["supply position opened", 4200n],
  ["supply position adjusted", 1800n],
  ["supply position closed", 900n],
];
// The nonce is tracked here rather than by the provider, because the local chain mines
// instantly and the provider can hand out the same nonce twice.
let nonce = await provider.getTransactionCount(wallet.address);
for (const [note, value] of notes) {
  const tx = await emitter.ping(value, note, { nonce: nonce++ });
  await tx.wait();
}
console.log(`sent ${notes.length} events`);

// The emitter is recorded so the indexer decodes its events by name instead of treating
// them as an anonymous topic hash.
const existing = existsSync(deploymentPath)
  ? JSON.parse(readFileSync(deploymentPath, "utf8"))
  : { chainId: CHAIN_ID };
existing.chainId = CHAIN_ID;
existing.evm = {
  address: await anchor.getAddress(),
  txHash: anchorReceipt?.hash,
  blockNumber: anchorReceipt?.blockNumber,
  deployer: wallet.address,
  deployedAt: Math.floor(Date.now() / 1000),
};
existing.contracts = {
  ...(existing.contracts ?? {}),
  Emitter: {
    address: await emitter.getAddress(),
    txHash: emitterReceipt?.hash,
    blockNumber: emitterReceipt?.blockNumber,
  },
};
writeFileSync(deploymentPath, `${JSON.stringify(existing, null, 2)}\n`);
console.log(`wrote ${deploymentPath}`);

console.log("");
console.log("Point the project at this chain:");
console.log(`  export PORTALIDX_EVM_RPC=${rpc}`);
console.log(`  export PORTALIDX_EVM_ANCHOR_CONTRACT=${await anchor.getAddress()}`);
console.log(`  export PORTALDOT_MNEMONIC="${MNEMONIC}"`);
console.log("");

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await server.close();
    process.exit(0);
  });
}

// Keep the process alive so the indexer and the app can talk to it.
await new Promise(() => {});
