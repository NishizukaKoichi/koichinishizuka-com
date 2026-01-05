#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const [productName, displayName] = process.argv.slice(2);

if (!productName) {
  console.error("Usage: node scripts/init.mjs <product-name> <display-name?>");
  process.exit(1);
}

const nameForReadme = displayName ?? productName;
const oneLiner = `For teams who can write specs but need billing, ${nameForReadme} turns a spec into a shippable paid app.`;

const readmePath = path.resolve(process.cwd(), "README.md");
const original = fs.readFileSync(readmePath, "utf8");
const updated = original
  .replace(/\{\{PRODUCT_NAME\}\}/g, nameForReadme)
  .replace(/\{\{ONE_LINER\}\}/g, oneLiner);

fs.writeFileSync(readmePath, updated, "utf8");

console.log("Updated README.md");
console.log(`- PRODUCT_NAME: ${nameForReadme}`);
console.log(`- ONE_LINER: ${oneLiner}`);
