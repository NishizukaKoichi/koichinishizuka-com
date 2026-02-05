#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");

const candidates = [
  path.resolve(repoRoot, "..", "product-contracts"),
  path.resolve(repoRoot, "..", "..", "product-contracts"),
  path.join(os.homedir(), "Desktop", "product-contracts"),
  path.join(os.homedir(), "product-contracts"),
];

function resolveContractsRepo() {
  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, "scripts", "stack", "apply.mjs"))) {
      return candidate;
    }
  }
  console.error("product-contracts が見つからない");
  process.exit(1);
}

const contractsRepo = resolveContractsRepo();
const delegatedScript = path.join(contractsRepo, "scripts", "stack", "apply.mjs");
const args = process.argv.slice(2);

const result = spawnSync(process.execPath, [delegatedScript, ...args], {
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
