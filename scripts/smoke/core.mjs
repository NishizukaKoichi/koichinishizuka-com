#!/usr/bin/env node
import process from "node:process";
import { randomUUID } from "node:crypto";

const baseUrl =
  process.env.SMOKE_BASE_URL ?? process.env.APP_BASE_URL ?? "http://localhost:3000";
const authCookieName = process.env.SMOKE_AUTH_COOKIE_NAME ?? "user_id";
const internalAuthSecret = process.env.SMOKE_INTERNAL_REQUEST_SECRET;
const smokeFlow = process.env.SMOKE_FLOW ?? "platform";
const smokeTarget = (process.env.SMOKE_TARGET ?? "").trim().toLowerCase();

const targetProbe = {
  epoch: {
    productPath: "/epoch",
    allowedApiProbe: "/api/records",
    deniedApiProbe: "/api/v1/spell/check",
    deniedPageProbe: "/spell",
  },
  sigil: {
    productPath: "/sigil",
    allowedApiProbe: "/api/v1/sigil/spaces",
    deniedApiProbe: "/api/records",
    deniedPageProbe: "/epoch",
  },
  pact: {
    productPath: "/pact",
    allowedApiProbe: "/api/v1/pact/employees",
    deniedApiProbe: "/api/records",
    deniedPageProbe: "/spell",
  },
  talisman: {
    productPath: "/talisman",
    allowedApiProbe: "/api/v1/talisman/persons",
    deniedApiProbe: "/api/records",
    deniedPageProbe: "/pact",
  },
  spell: {
    productPath: "/spell",
    allowedApiProbe: "/api/v1/spell/check",
    deniedApiProbe: "/api/records",
    deniedPageProbe: "/talisman",
  },
};

function fail(message, details) {
  console.error(`[smoke] FAIL: ${message}`);
  if (details !== undefined) {
    console.error(details);
  }
  process.exit(1);
}

async function requestJson(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, init);
  let json = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }
  return { response, json };
}

function authHeaders(userId, extra = {}) {
  const headers = {
    cookie: `${authCookieName}=${encodeURIComponent(userId)}`,
    ...extra,
  };

  if (internalAuthSecret) {
    headers["x-internal-auth"] = internalAuthSecret;
  }

  return headers;
}

async function requestPage(path) {
  const response = await fetch(`${baseUrl}${path}`);
  return response;
}

async function requestStatus(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, init);
  return response.status;
}

function assert(condition, message, details) {
  if (!condition) {
    fail(message, details);
  }
}

async function run() {
  if (smokeFlow === "target-guard") {
    const probe = targetProbe[smokeTarget];
    if (!probe) {
      fail("SMOKE_TARGET must be one of epoch|sigil|pact|talisman|spell when SMOKE_FLOW=target-guard");
    }

    console.log(`[smoke] baseUrl=${baseUrl}`);
    console.log(`[smoke] flow=target-guard`);
    console.log(`[smoke] target=${smokeTarget}`);

    const rootStatus = await requestStatus("/");
    assert(
      rootStatus !== 404,
      "root should be reachable on target deployment",
      { status: rootStatus }
    );

    const productStatus = await requestStatus(probe.productPath);
    assert(productStatus !== 404, "product root is not reachable", {
      path: probe.productPath,
      status: productStatus,
    });

    const deniedPageStatus = await requestStatus(probe.deniedPageProbe);
    assert(deniedPageStatus === 404, "foreign product page is not blocked", {
      path: probe.deniedPageProbe,
      status: deniedPageStatus,
    });

    const allowedApiStatus = await requestStatus(probe.allowedApiProbe);
    assert(
      allowedApiStatus !== 404,
      "target-owned API path should not be hidden",
      { path: probe.allowedApiProbe, status: allowedApiStatus }
    );

    const deniedApiStatus = await requestStatus(probe.deniedApiProbe);
    assert(deniedApiStatus === 404, "foreign API path is not blocked", {
      path: probe.deniedApiProbe,
      status: deniedApiStatus,
    });

    console.log("[smoke] OK");
    return;
  }

  const userId = randomUUID();
  const recordContent = `smoke-${Date.now()}`;
  const spellId = randomUUID();
  const productPaths = ["/", "/library", "/epoch", "/sigil", "/pact", "/talisman", "/spell"];

  console.log(`[smoke] baseUrl=${baseUrl}`);
  console.log(`[smoke] userId=${userId}`);

  for (const path of productPaths) {
    const response = await requestPage(path);
    assert(response.ok, `page check failed for ${path}`, { status: response.status });
  }

  const createRecord = await requestJson("/api/records", {
    method: "POST",
    headers: authHeaders(userId, { "content-type": "application/json" }),
    body: JSON.stringify({
      userId,
      recordType: "decision_made",
      payload: { content: recordContent },
      visibility: "private",
    }),
  });

  assert(createRecord.response.ok, "record creation failed", createRecord.json);
  const recordId = createRecord.json?.record?.recordId;
  assert(typeof recordId === "string" && recordId.length > 0, "record_id missing", createRecord.json);

  const listRecords = await requestJson(`/api/records/self?userId=${encodeURIComponent(userId)}`, {
    headers: authHeaders(userId),
  });
  assert(listRecords.response.ok, "record fetch failed", listRecords.json);
  const found = Array.isArray(listRecords.json?.records)
    ? listRecords.json.records.some((record) => record.recordId === recordId)
    : false;
  assert(found, "created record not found in self list", listRecords.json);

  if (smokeFlow === "platform") {
    console.log("[smoke] flow=platform");
    console.log("[smoke] OK");
    console.log(`[smoke] record_id=${recordId}`);
    return;
  }

  const createKey = await requestJson("/api/v1/developer-keys", {
    method: "POST",
    headers: authHeaders(userId, {
      "content-type": "application/json",
      }),
    body: JSON.stringify({ name: `smoke-${Date.now()}` }),
  });
  assert(createKey.response.ok, "developer key creation failed", createKey.json);

  const keyId = createKey.json?.key?.key_id;
  const keySecret = createKey.json?.key?.key_secret;
  assert(typeof keyId === "string" && keyId.length > 0, "key_id missing", createKey.json);
  assert(typeof keySecret === "string" && keySecret.length > 0, "key_secret missing", createKey.json);

  const grantScope = await requestJson(`/api/v1/developer-keys/${keyId}/scopes`, {
    method: "POST",
    headers: authHeaders(userId, {
      "content-type": "application/json",
      }),
    body: JSON.stringify({
      scope: "spell.check",
      action: "grant",
      conditionType: "free",
    }),
  });
  assert(grantScope.response.ok, "scope grant failed", grantScope.json);

  const issueTokens = await requestJson("/api/v1/tokens", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${keySecret}`,
    },
    body: JSON.stringify({ scopes: ["spell.check"] }),
  });
  assert(issueTokens.response.ok, "token issue failed", issueTokens.json);

  const accessToken = issueTokens.json?.access_token;
  const refreshToken = issueTokens.json?.refresh_token;
  assert(typeof accessToken === "string" && accessToken.length > 0, "access_token missing", issueTokens.json);
  assert(typeof refreshToken === "string" && refreshToken.length > 0, "refresh_token missing", issueTokens.json);

  const refresh = await requestJson("/api/v1/tokens/refresh", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  assert(refresh.response.ok, "token refresh failed", refresh.json);

  const spellCheck = await requestJson("/api/v1/spell/check", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      spell_id: spellId,
      runtime_id: "smoke-runtime",
      user_identifier: userId,
      requested_scope: "spell.runtime.exec",
    }),
  });
  assert(spellCheck.response.ok, "spell check failed", spellCheck.json);
  assert(typeof spellCheck.json?.allowed === "boolean", "spell check response malformed", spellCheck.json);

  const revokeKey = await requestJson(`/api/v1/developer-keys/${keyId}/revoke`, {
    method: "POST",
    headers: authHeaders(userId, { }),
  });
  assert(revokeKey.response.ok, "developer key revoke failed", revokeKey.json);

  console.log("[smoke] OK");
  console.log(`[smoke] flow=${smokeFlow}`);
  console.log(`[smoke] record_id=${recordId}`);
  console.log(`[smoke] key_id=${keyId}`);
}

run().catch((error) => {
  fail("unexpected exception", error instanceof Error ? error.stack ?? error.message : error);
});
