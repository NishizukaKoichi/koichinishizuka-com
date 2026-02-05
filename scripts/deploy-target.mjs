#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const TARGETS = ["platform", "epoch", "sigil", "pact", "talisman", "spell"];

const DEFAULT_PROJECTS = {
  platform: "koichinishizuka-com",
  epoch: "koichinishizuka-epoch",
  sigil: "koichinishizuka-sigil",
  pact: "koichinishizuka-pact",
  talisman: "koichinishizuka-talisman",
  spell: "koichinishizuka-spell",
};

function parseArgs(argv) {
  const result = {
    target: "",
    project: "",
    scope: process.env.VERCEL_SCOPE ?? "magicspell",
    mode: "production",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--target") {
      result.target = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (arg === "--project") {
      result.project = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (arg === "--scope") {
      result.scope = argv[i + 1] ?? result.scope;
      i += 1;
      continue;
    }
    if (arg === "--preview") {
      result.mode = "preview";
      continue;
    }
    if (arg === "--prod") {
      result.mode = "production";
    }
  }

  return result;
}

function resolveVercelRunner() {
  const cliJs = path.join(
    process.env.HOME ?? "",
    ".npm-global/lib/node_modules/vercel/dist/vc.js"
  );
  if (fs.existsSync(cliJs)) {
    return { cmd: "node", prefix: [cliJs] };
  }
  return { cmd: "vercel", prefix: [] };
}

function runOrExit(runner, args, cwd) {
  const result = spawnSync(runner.cmd, [...runner.prefix, ...args], {
    cwd,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const options = parseArgs(process.argv.slice(2));
if (!TARGETS.includes(options.target)) {
  console.error(
    `Usage: node scripts/deploy-target.mjs --target <${TARGETS.join("|")}> [--project <name>] [--scope <scope>] [--preview]`
  );
  process.exit(1);
}

const project = options.project || DEFAULT_PROJECTS[options.target];
const repoRoot = process.cwd();
const projectFile = path.join(repoRoot, ".vercel", "project.json");
const existingProjectJson = fs.existsSync(projectFile)
  ? fs.readFileSync(projectFile, "utf8")
  : null;

const runner = resolveVercelRunner();

console.log(`[deploy-target] target=${options.target}`);
console.log(`[deploy-target] project=${project}`);
console.log(`[deploy-target] scope=${options.scope}`);
console.log(`[deploy-target] mode=${options.mode}`);

try {
  runOrExit(
    runner,
    ["link", "--yes", "--scope", options.scope, "--project", project],
    repoRoot
  );

  const deployArgs = [
    "deploy",
    ".",
    "--yes",
    "--scope",
    options.scope,
    "--build-env",
    `DEPLOY_TARGET=${options.target}`,
    "--env",
    `DEPLOY_TARGET=${options.target}`,
    "--logs",
  ];

  if (options.mode === "production") {
    deployArgs.push("--prod");
  }

  runOrExit(runner, deployArgs, repoRoot);
} finally {
  if (existingProjectJson !== null) {
    fs.mkdirSync(path.dirname(projectFile), { recursive: true });
    fs.writeFileSync(projectFile, existingProjectJson);
  }
}

