import { getSessionFromRequest } from "../../_utils/session.js";

export async function onRequestGet({ request, env }) {
  const session = await getSessionFromRequest(request, env);
  if (!session) {
    return Response.json({ loggedIn: false });
  }
  return Response.json({
    loggedIn: true,
    cid: session.cid,
    name: session.name || null,
    admin: !!session.admin,
  });
}
