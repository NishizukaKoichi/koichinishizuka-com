import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TARGETS = new Set(["platform", "epoch", "sigil", "pact", "talisman", "spell", "all"]);

const PRODUCT_PAGE_PREFIX: Record<string, string> = {
  epoch: "/epoch",
  sigil: "/sigil",
  pact: "/pact",
  talisman: "/talisman",
  spell: "/spell",
};

const ALLOWED_API_PREFIXES: Record<string, string[]> = {
  epoch: ["/api/records", "/api/epoch", "/api/billing/session"],
  sigil: ["/api/v1/sigil"],
  pact: ["/api/v1/pact"],
  talisman: ["/api/v1/talisman", "/api/v1/auth/login"],
  spell: ["/api/v1/spell"],
};

function isStaticPath(pathname: string): boolean {
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") return true;
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

function inAllowedPrefixes(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function proxy(request: NextRequest) {
  const deployTarget = (process.env.DEPLOY_TARGET ?? "all").trim().toLowerCase();
  if (!TARGETS.has(deployTarget) || deployTarget === "all" || deployTarget === "platform") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (isStaticPath(pathname)) {
    return NextResponse.next();
  }

  const productPrefix = PRODUCT_PAGE_PREFIX[deployTarget];
  const allowedApiPrefixes = ALLOWED_API_PREFIXES[deployTarget] ?? [];

  if (pathname === "/") {
    return NextResponse.redirect(new URL(productPrefix, request.url));
  }

  if (pathname.startsWith("/api/")) {
    if (pathname === "/api/i18n/translate") {
      return NextResponse.next();
    }
    if (inAllowedPrefixes(pathname, allowedApiPrefixes)) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  if (pathname === productPrefix || pathname.startsWith(`${productPrefix}/`)) {
    return NextResponse.next();
  }

  return new NextResponse("Not Found", { status: 404 });
}

export const config = {
  matcher: "/:path*",
};
