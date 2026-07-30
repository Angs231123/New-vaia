import { getSessionFromRequest } from "../../_utils/session.js";

export async function onRequestGet({ request, env }) {
  const session = await getSessionFromRequest(request, env);
  if (!session) {
    return Response.json({ loggedIn: false });
  }
  return Response.json({
    loggedIn: true,
    username: session.username || null,
    admin: !!session.admin,
  });
}
