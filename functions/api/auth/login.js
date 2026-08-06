// Plain username/password admin login. Credentials are set as Cloudflare
// Pages environment variables (ADMIN_USERNAME, ADMIN_PASSWORD) — never
// hardcode them here.

import { createSession, sessionCookieHeader, timingSafeEqual } from "../../_utils/session.js";

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return Response.json(
      { error: "Admin login isn't configured yet — set ADMIN_USERNAME, ADMIN_PASSWORD and SESSION_SECRET in the Cloudflare Pages project's environment variables." },
      { status: 501 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { username, password } = body || {};
  const usernameOk = timingSafeEqual(username, env.ADMIN_USERNAME);
  const passwordOk = timingSafeEqual(password, env.ADMIN_PASSWORD);
  if (!usernameOk || !passwordOk) {
    return Response.json({ error: "Incorrect username or password" }, { status: 401 });
  }

  const session = await createSession(
    { admin: true, username, exp: Date.now() + 1000 * 60 * 60 * 12 },
    env.SESSION_SECRET
  );

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": sessionCookieHeader(session),
    },
  });
}
