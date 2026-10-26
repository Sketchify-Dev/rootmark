/**
 * Compile the Solidity contracts with the solc JavaScript compiler.
 *
 * Every .sol file in contracts/evm is compiled, and one artifact is written per contract into
 * contracts/evm/artifacts. Each artifact holds the ABI, the deployment bytecode and the
 * compiler settings that produced it.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import solc from "solc";

const root = resolve(import.meta.dirname, "..");
const sourceDir = resolve(root, "contracts/evm");
const outDir = resolve(sourceDir, "artifacts");

const files = readdirSync(sourceDir).filter((name) => name.endsWith(".sol"));
if (files.length === 0) {
  console.error("no .sol files found in contracts/evm");
  process.exit(1);
}

const sources = {};
for (const file of files) {
  sources[file] = { content: readFileSync(resolve(sourceDir, file), "utf8") };
}

const input = {
  language: "Solidity",
  sources,
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

mkdirSync(outDir, { recursive: true });
let written = 0;
for (const file of files) {
  const compiled = output.contracts[file] ?? {};
  for (const [name, contract] of Object.entries(compiled)) {
    const artifactPath = resolve(outDir, `${name}.json`);
    writeFileSync(
      artifactPath,
      `${JSON.stringify(
        {
          contractName: name,
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
    console.log(
      `${name}: bytecode ${(contract.evm.bytecode.object.length / 2).toLocaleString()} bytes -> ${artifactPath}`,
    );
    written += 1;
  }
}

console.log(`compiled with ${solc.version()}, ${written} artifact(s) written`);
