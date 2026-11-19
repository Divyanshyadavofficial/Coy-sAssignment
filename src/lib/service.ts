import type { DB } from "./db";

export type Direction = "like" | "pass";

/** Public shape of a profile. Deliberately has no "likedYou"-style field. */
export type Profile = {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  city: string | null;
  college: string | null;
  interests: string[];
};

export type Match = { profile: Profile; matchedAt: number };

export type SwipeResult = { matched: false } | { matched: true; match: Match };

export class ServiceError extends Error {
  constructor(
    public code: "NOT_FOUND" | "SELF_SWIPE" | "ALREADY_SWIPED",
    message: string,
  ) {
    super(message);
  }
}

type ProfileRow = Omit<Profile, "interests"> & { interests: string };

const PROFILE_COLS = "p.id, p.name, p.age, p.photo, p.bio, p.city, p.college, p.interests";

function toProfile(row: ProfileRow): Profile {
  return { ...row, interests: JSON.parse(row.interests) as string[] };
}

/** Matches are stored once, with the smaller id in user_a. */
function orderPair(x: string, y: string): [string, string] {
  return x < y ? [x, y] : [y, x];
}

/**
 * Profiles the user has not swiped on yet.
 *
 * Privacy: the query never reads swipes *targeting* the user, so whether a
 * profile liked or passed on them cannot change membership or ordering.
 */
export function getFeed(db: DB, userId: string, limit = 50): Profile[] {
  const rows = db
    .prepare(
      `SELECT ${PROFILE_COLS}
         FROM profiles p
        WHERE p.id <> @userId
          AND NOT EXISTS (
                SELECT 1 FROM swipes s
                 WHERE s.swiper_id = @userId AND s.target_id = p.id)
        ORDER BY p.id
        LIMIT @limit`,
    )
    .all({ userId, limit }) as ProfileRow[];
  return rows.map(toProfile);
}

/**
 * Records a like/pass. Returns `matched: true` only when this swipe completes a
 * mutual like, so a one-sided like from the other person is never revealed.
 */
export function recordSwipe(
  db: DB,
  userId: string,
  targetId: string,
  direction: Direction,
): SwipeResult {
  if (userId === targetId) throw new ServiceError("SELF_SWIPE", "Cannot swipe on yourself");

  const run = db.transaction((): SwipeResult => {
    const target = db
      .prepare(`SELECT ${PROFILE_COLS} FROM profiles p WHERE p.id = ?`)
      .get(targetId) as ProfileRow | undefined;
    if (!target) throw new ServiceError("NOT_FOUND", "Profile not found");

    const now = Date.now();
    const inserted = db
      .prepare(
        `INSERT INTO swipes (swiper_id, target_id, direction, created_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT (swiper_id, target_id) DO NOTHING`,
      )
      .run(userId, targetId, direction, now);
    if (inserted.changes === 0) {
      throw new ServiceError("ALREADY_SWIPED", "Already swiped on this profile");
    }

    if (direction === "pass") return { matched: false };

    const likedBack = db
      .prepare(
        `SELECT 1 FROM swipes
          WHERE swiper_id = ? AND target_id = ? AND direction = 'like'`,
      )
      .get(targetId, userId);
    if (!likedBack) return { matched: false };

    const [a, b] = orderPair(userId, targetId);
    db.prepare(
      `INSERT INTO matches (user_a, user_b, created_at) VALUES (?, ?, ?)
       ON CONFLICT (user_a, user_b) DO NOTHING`,
    ).run(a, b, now);

    return { matched: true, match: { profile: toProfile(target), matchedAt: now } };
  });

  // IMMEDIATE takes the write lock up front, so two concurrent swipes
  // can't both read "no reverse like" and miss a match.
  return run.immediate();
}

/** All mutual matches for the user, newest first. */
export function getMatches(db: DB, userId: string): Match[] {
  const rows = db
    .prepare(
      `SELECT ${PROFILE_COLS}, m.created_at AS matchedAt
         FROM matches m
         JOIN profiles p
           ON p.id = CASE WHEN m.user_a = @userId THEN m.user_b ELSE m.user_a END
        WHERE m.user_a = @userId OR m.user_b = @userId
        ORDER BY m.created_at DESC, p.id`,
    )
    .all({ userId }) as (ProfileRow & { matchedAt: number })[];
  return rows.map(({ matchedAt, ...row }) => ({ profile: toProfile(row), matchedAt }));
}
