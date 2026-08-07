import { sessionCookieHeader } from "../../_utils/session.js";

export async function onRequestGet() {
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie": sessionCookieHeader(null, { clear: true }),
    },
  });
}
