#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const checks = [
  { file: "docs/value.md", label: "Value" },
  { file: "docs/flow/user-flow.md", label: "User Flow" },
  { file: "docs/billing/payment-boundary.md", label: "Payment Boundary" },
  { file: "docs/analytics/metrics.md", label: "Metrics" },
];

const requiredPattern = /__REQUIRED:([a-z0-9_-]+)__/gi;
const errors = [];

for (const check of checks) {
  const filePath = path.resolve(process.cwd(), check.file);
  if (!fs.existsSync(filePath)) {
    errors.push(`${check.file}: missing file`);
    continue;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const matches = [...content.matchAll(requiredPattern)].map((match) => match[1]);
  if (matches.length > 0) {
    errors.push(`${check.file}: ${matches.join(", ")}`);
  }
}

if (errors.length > 0) {
  console.error("Missing required fields:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("OK");
process.exit(0);
