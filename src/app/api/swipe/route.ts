import { z } from "zod";
import { appDb, errorResponse } from "@/lib/api";
import { CURRENT_USER_ID } from "@/lib/db";
import { recordSwipe } from "@/lib/service";

const SwipeBody = z.object({
  targetId: z.string().min(1).max(64),
  direction: z.enum(["like", "pass"]),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be valid JSON" }, { status: 400 });
  }

  const parsed = SwipeBody.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", issues: parsed.error.issues.map((i) => i.message) },
      { status: 400 },
    );
  }

  const db = await appDb();
  try {
    const { targetId, direction } = parsed.data;
    const result = recordSwipe(db, CURRENT_USER_ID, targetId, direction);
    return Response.json(result, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
