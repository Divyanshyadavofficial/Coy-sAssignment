import { appDb, errorResponse } from "@/lib/api";
import { CURRENT_USER_ID } from "@/lib/db";
import { getFeed } from "@/lib/service";

export async function GET() {
  try {
    const profiles = getFeed(await appDb(), CURRENT_USER_ID);
    return Response.json({ profiles });
  } catch (err) {
    return errorResponse(err);
  }
}
