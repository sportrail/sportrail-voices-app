import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Compare two strings in time proportional to the longer input, regardless of
// where they first differ. Avoids leaking which byte mismatched via timing.
function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  const len = Math.max(ab.length, bb.length);
  let diff = ab.length ^ bb.length;
  for (let i = 0; i < len; i++) {
    diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return diff === 0;
}

/**
 * Basic-auth gate for the entire app.
 *
 * Activated only when APP_PASSWORD is set in the environment. When unset
 * (e.g. local dev without the env var) the middleware is a no-op so the
 * dev experience does not break.
 *
 * Set in Vercel:
 *   - APP_PASSWORD=<your-shared-password>
 *   - APP_USERNAME=<optional, defaults to "sportrail">
 *
 * The browser will prompt once per session via WWW-Authenticate.
 *
 * Rationale: this app generates PNGs that consume Vercel function minutes
 * and chromium-min cold-start bandwidth. Leaving it open invites abuse.
 * Basic auth is the lightest gate that still works; rotate APP_PASSWORD
 * if it leaks.
 */
export function middleware(req: NextRequest) {
  const expectedPassword = process.env.APP_PASSWORD;
  if (!expectedPassword) {
    // Auth disabled (no env var configured)
    return NextResponse.next();
  }

  const expectedUsername = process.env.APP_USERNAME ?? "sportrail";

  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Basic ")) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Sportrail Voices", charset="UTF-8"',
        "Cache-Control": "no-store",
      },
    });
  }

  let username = "";
  let password = "";
  try {
    // atob yields a binary string (1 char = 1 byte). Re-decode as UTF-8 so
    // non-ASCII passwords match the original env value (we advertise
    // charset="UTF-8" on the WWW-Authenticate header).
    const binary = atob(header.slice(6));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const decoded = new TextDecoder("utf-8").decode(bytes);
    const sep = decoded.indexOf(":");
    if (sep === -1) throw new Error("malformed");
    username = decoded.slice(0, sep);
    password = decoded.slice(sep + 1);
  } catch {
    return new NextResponse("Malformed credentials", { status: 400 });
  }

  const userOk = timingSafeEqual(username, expectedUsername);
  const passOk = timingSafeEqual(password, expectedPassword);
  if (!(userOk && passOk)) {
    return new NextResponse("Invalid credentials", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Sportrail Voices", charset="UTF-8"',
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  // Match everything except Next.js internals and static assets that the
  // browser fetches BEFORE the auth dialog is dismissed (favicon etc).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
