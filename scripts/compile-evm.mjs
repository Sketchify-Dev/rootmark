/**
 * Compile the Solidity anchor contract with the solc JavaScript compiler.
 *
 * Writes contracts/evm/artifacts/PortalAnchor.json, which holds the ABI, the deployment
 * bytecode and the compiler settings that produced them.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import solc from "solc";

const root = resolve(import.meta.dirname, "..");
const sourcePath = resolve(root, "contracts/evm/PortalAnchor.sol");
const outDir = resolve(root, "contracts/evm/artifacts");

const source = readFileSync(sourcePath, "utf8");

const input = {
  language: "Solidity",
  sources: { "PortalAnchor.sol": { content: source } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    // Paris keeps PUSH0 out of the bytecode, which is the safe choice on a new EVM runtime.
    evmVersion: "paris",
    outputSelection: {
      "*": { "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"] },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

const diagnostics = output.errors ?? [];
for (const entry of diagnostics) {
  const line = `${entry.severity}: ${entry.formattedMessage}`;
  if (entry.severity === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
}
if (diagnostics.some((entry) => entry.severity === "error")) {
  process.exit(1);
}

const contract = output.contracts["PortalAnchor.sol"].PortalAnchor;
mkdirSync(outDir, { recursive: true });
const artifactPath = resolve(outDir, "PortalAnchor.json");
writeFileSync(
  artifactPath,
  `${JSON.stringify(
    {
      contractName: "PortalAnchor",
      compiler: solc.version(),
      settings: input.settings,
      abi: contract.abi,
      bytecode: `0x${contract.evm.bytecode.object}`,
      deployedBytecode: `0x${contract.evm.deployedBytecode.object}`,
    },
    null,
    2,
  )}\n`,
);

console.log(`compiled with ${solc.version()}`);
console.log(`bytecode ${(contract.evm.bytecode.object.length / 2).toLocaleString()} bytes`);
console.log(`wrote ${artifactPath}`);
