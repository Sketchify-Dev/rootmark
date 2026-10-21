/**
 * Deploy the PortalAnchor contract to the Portaldot V3 testnet.
 *
 * Needs a funded key. Run `npm run wallet` first to see which address has to hold tPOT.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { ContractFactory, HDNodeWallet, JsonRpcProvider, formatEther } from "ethers";
import { fundingAddressForEvm } from "../src/lib/address.ts";

const RPC = process.env.PORTALIDX_EVM_RPC ?? "https://test-evm-rpc-v3.portaldot.dev";
const CHAIN_ID = 420420777;
const root = resolve(import.meta.dirname, "..");
const deploymentPath = resolve(root, "contracts/deployments.json");

const mnemonic = process.env.PORTALDOT_MNEMONIC?.trim();
const privateKey = process.env.PORTALDOT_PRIVATE_KEY?.trim();

if (!mnemonic && !privateKey) {
  console.error("No signing key. Set PORTALDOT_MNEMONIC or PORTALDOT_PRIVATE_KEY.");
  console.error('Try: PORTALDOT_MNEMONIC="word word ..." npm run deploy:evm');
  process.exit(1);
}

const artifact = JSON.parse(
  readFileSync(resolve(root, "contracts/evm/artifacts/PortalAnchor.json"), "utf8"),
);

const provider = new JsonRpcProvider(RPC, { chainId: CHAIN_ID, name: "portaldot-v3-test" });
const wallet = mnemonic
  ? HDNodeWallet.fromPhrase(mnemonic).connect(provider)
  : new (await import("ethers")).Wallet(privateKey, provider);

const network = await provider.getNetwork();
if (Number(network.chainId) !== CHAIN_ID) {
  console.error(`Wrong network. Expected chain ${CHAIN_ID}, received ${network.chainId}.`);
  process.exit(1);
}

const gasAccount = fundingAddressForEvm(wallet.address);
const balance = await provider.getBalance(wallet.address);

console.log("");
console.log(`deployer        ${wallet.address}`);
console.log(`gas account     ${gasAccount}`);
console.log(`balance         ${formatEther(balance)} tPOT`);

if (balance === 0n) {
  console.error("");
  console.error("This address has no tPOT, so it cannot pay for the deployment.");
  console.error(`Send testnet tokens to ${gasAccount} and try again.`);
  console.error("The account explorer accepts an SS58 address, and that is the one above.");
  process.exit(1);
}

console.log("deploying PortalAnchor...");
const factory = new ContractFactory(artifact.abi, artifact.bytecode, wallet);
const contract = await factory.deploy();
const tx = contract.deploymentTransaction();
if (!tx) {
  console.error("The deployment transaction was not created.");
  process.exit(1);
}
console.log(`tx              ${tx.hash}`);
const receipt = await tx.wait();
if (!receipt) {
  console.error("The deployment transaction was not mined.");
  process.exit(1);
}

const address = await contract.getAddress();
console.log(`contract        ${address}`);
console.log(`block           ${receipt.blockNumber}`);
console.log(`gas used        ${receipt.gasUsed.toString()}`);

const existing = existsSync(deploymentPath)
  ? JSON.parse(readFileSync(deploymentPath, "utf8"))
  : { chainId: CHAIN_ID };
existing.chainId = CHAIN_ID;
existing.evm = {
  address,
  txHash: tx.hash,
  blockNumber: receipt.blockNumber,
  deployer: wallet.address,
  deployedAt: Math.floor(Date.now() / 1000),
};
writeFileSync(deploymentPath, `${JSON.stringify(existing, null, 2)}\n`);

console.log("");
console.log(`wrote ${deploymentPath}`);
console.log("The app and the indexer read that file, so no environment variable is required.");
