/**
 * Print the addresses a mnemonic controls on Portaldot V3.
 *
 * Run it before deploying so you know exactly which address needs testnet tokens.
 */
import { HDNodeWallet } from "ethers";
import { Keyring } from "@polkadot/api";
import { fundingAddressForEvm } from "../src/lib/address.ts";

const mnemonic = process.env.PORTALDOT_MNEMONIC?.trim();
if (!mnemonic) {
  console.error("PORTALDOT_MNEMONIC is not set.");
  console.error('Usage: PORTALDOT_MNEMONIC="word word ..." npm run wallet');
  process.exit(1);
}

const evmWallet = HDNodeWallet.fromPhrase(mnemonic);
const keyring = new Keyring({ type: "sr25519", ss58Format: 42 });
const native = keyring.addFromMnemonic(mnemonic);

console.log("");
console.log("Portaldot V3 testnet addresses");
console.log("------------------------------");
console.log(`EVM address        ${evmWallet.address}`);
console.log(`  gas account      ${fundingAddressForEvm(evmWallet.address)}   (SS58, receives tPOT for EVM gas)`);
console.log(`Native sr25519     ${native.address}   (ink! contract deployer)`);
console.log("");
console.log("Send testnet tPOT to the gas account above. The native account needs tokens too");
console.log("if you intend to deploy the ink! contract.");
console.log("");
