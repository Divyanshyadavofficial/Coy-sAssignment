import { appDb, errorResponse } from "@/lib/api";
import { CURRENT_USER_ID } from "@/lib/db";
import { getMatches } from "@/lib/service";

export async function GET() {
  try {
    const matches = getMatches(await appDb(), CURRENT_USER_ID);
    return Response.json({ matches });
  } catch (err) {
    return errorResponse(err);
  }
}
