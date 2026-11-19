import { appDb, errorResponse } from "@/lib/api";
import { CURRENT_USER_ID } from "@/lib/db";
import { getFeed } from "@/lib/service";

export async function GET() {
  // Outside try: during build, connection() rejects on purpose to mark the route dynamic.
  const db = await appDb();
  try {
    const profiles = getFeed(db, CURRENT_USER_ID);
    return Response.json({ profiles });
  } catch (err) {
    return errorResponse(err);
  }
}
