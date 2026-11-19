import { connection } from "next/server";
import { getDb, type DB } from "./db";
import { seed } from "./seed";
import { ServiceError } from "./service";

/**
 * DB handle for route handlers. `connection()` opts out of prerendering:
 * with cacheComponents on, a sync better-sqlite3 read would otherwise be
 * baked into the build output. Seeds automatically on a fresh clone.
 */
export async function appDb(): Promise<DB> {
  await connection();
  const db = getDb();
  const { n } = db.prepare("SELECT COUNT(*) AS n FROM profiles").get() as { n: number };
  if (n === 0) seed(db);
  return db;
}

const STATUS: Record<ServiceError["code"], number> = {
  NOT_FOUND: 404,
  SELF_SWIPE: 400,
  ALREADY_SWIPED: 409,
};

export function errorResponse(err: unknown): Response {
  if (err instanceof ServiceError) {
    return Response.json({ error: err.message, code: err.code }, { status: STATUS[err.code] });
  }
  console.error(err);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
