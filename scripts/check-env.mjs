#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf8");
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const key = trimmed.slice(0, i).trim();
    const value = trimmed.slice(i + 1).trim();
    if (key) env[key] = value;
  }
  return env;
}

const envLocal = loadEnvFile(path.join(repoRoot, ".env.local"));
const envProd = loadEnvFile(path.join(repoRoot, ".env.production.local"));
const env = { ...envLocal, ...envProd, ...process.env };

const target = (env.DEPLOY_TARGET ?? "all").trim().toLowerCase();

const requiredByTarget = {
  all: [
    "APP_BASE_URL",
    "PLATFORM_DATABASE_URL",
    "EPOCH_DATABASE_URL",
    "SIGIL_DATABASE_URL",
    "PACT_DATABASE_URL",
    "TALISMAN_DATABASE_URL",
    "SPELL_DATABASE_URL",
  ],
  platform: ["APP_BASE_URL", "PLATFORM_DATABASE_URL"],
  epoch: ["APP_BASE_URL", "EPOCH_DATABASE_URL"],
  sigil: ["APP_BASE_URL", "SIGIL_DATABASE_URL"],
  pact: ["APP_BASE_URL", "PACT_DATABASE_URL"],
  talisman: ["APP_BASE_URL", "TALISMAN_DATABASE_URL"],
  spell: ["APP_BASE_URL", "SPELL_DATABASE_URL"],
};

const required = requiredByTarget[target] ?? requiredByTarget.all;

const missing = required.filter((key) => !env[key] || env[key].trim().length === 0);
const errors = [];
const warnings = [];

if (missing.length > 0) {
  errors.push(`Missing required variables: ${missing.join(", ")}`);
}

if (!(target in requiredByTarget)) {
  warnings.push(`Unknown DEPLOY_TARGET=${target}; using full required set`);
}

if (env.APP_BASE_URL && !/^https?:\/\//.test(env.APP_BASE_URL)) {
  errors.push("APP_BASE_URL must start with http:// or https://");
}

const hasStripeSecret = Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_SECRET_KEY.trim());
const hasStripeWebhook = Boolean(env.STRIPE_WEBHOOK_SECRET && env.STRIPE_WEBHOOK_SECRET.trim());
if (hasStripeSecret !== hasStripeWebhook) {
  errors.push("STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET must be configured together");
}
if (!hasStripeSecret && !hasStripeWebhook) {
  warnings.push("Stripe env vars are unset; billing and webhooks will not work");
}

const hasAdminAllowlist = Boolean(
  (env.ADMIN_EMAIL_ALLOWLIST && env.ADMIN_EMAIL_ALLOWLIST.trim()) ||
    (env.ADMIN_DOMAIN_ALLOWLIST && env.ADMIN_DOMAIN_ALLOWLIST.trim())
);
if (!hasAdminAllowlist) {
  warnings.push("Admin allowlist is unset; /api/admin/pricing will reject access");
}

const hasExecAllowlist = Boolean(
  (env.EXEC_USER_ID_ALLOWLIST && env.EXEC_USER_ID_ALLOWLIST.trim()) ||
    (env.EXEC_EMAIL_ALLOWLIST && env.EXEC_EMAIL_ALLOWLIST.trim()) ||
    (env.EXEC_DOMAIN_ALLOWLIST && env.EXEC_DOMAIN_ALLOWLIST.trim())
);
if (!hasExecAllowlist) {
  warnings.push("Exec allowlist is unset; /intents and /runs will be denied");
}

const isProduction = (env.NODE_ENV ?? "").trim() === "production";
const allowDevHeaderAuth = (env.ALLOW_DEV_HEADER_AUTH ?? "").trim() === "1";
const hasInternalRequestSecret = Boolean((env.INTERNAL_REQUEST_SECRET ?? "").trim());

if (isProduction && allowDevHeaderAuth) {
  errors.push("ALLOW_DEV_HEADER_AUTH=1 is forbidden in production");
}

if (isProduction && !hasInternalRequestSecret) {
  warnings.push(
    "INTERNAL_REQUEST_SECRET is unset in production; forwarded x-user-id headers are disabled"
  );
}

if (errors.length > 0) {
  console.error("[env:check] FAILED");
  for (const line of errors) {
    console.error(`- ${line}`);
  }
  if (warnings.length > 0) {
    console.error("[env:check] warnings:");
    for (const line of warnings) {
      console.error(`- ${line}`);
    }
  }
  process.exit(1);
}

console.log("[env:check] OK");
if (warnings.length > 0) {
  for (const line of warnings) {
    console.warn(`[env:check] warning: ${line}`);
  }
}
