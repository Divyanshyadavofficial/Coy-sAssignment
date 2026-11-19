import { describe, it, expect, beforeEach } from "vitest";
import { createDb, CURRENT_USER_ID as ME, type DB } from "../lib/db";
import { seed, LIKED_ME, PASSED_ME } from "../lib/seed";
import { getFeed, recordSwipe, getMatches, ServiceError } from "../lib/service";

let db: DB;
beforeEach(() => {
  db = createDb(":memory:");
  seed(db);
});

const NEUTRAL = "p01"; // has not swiped on me
const ADMIRER = LIKED_ME[0];
const REJECTER = PASSED_ME[0];

describe("getFeed", () => {
  it("returns every other profile initially, never the user", () => {
    const feed = getFeed(db, ME);
    expect(feed).toHaveLength(30);
    expect(feed.some((p) => p.id === ME)).toBe(false);
    expect(Array.isArray(feed[0].interests)).toBe(true);
  });

  it("excludes swiped profiles, likes and passes alike", () => {
    recordSwipe(db, ME, "p01", "like");
    recordSwipe(db, ME, "p02", "pass");
    const ids = getFeed(db, ME).map((p) => p.id);
    expect(ids).not.toContain("p01");
    expect(ids).not.toContain("p02");
    expect(ids).toHaveLength(28);
  });

  it("leaks nothing about who liked the user: no extra fields, same order", () => {
    const before = getFeed(db, ME).map((p) => p.id);
    // Remove every incoming swipe; the feed must be identical.
    db.exec(`DELETE FROM swipes WHERE target_id = '${ME}'`);
    const after = getFeed(db, ME).map((p) => p.id);
    expect(after).toEqual(before);

    const keys = Object.keys(getFeed(db, ME)[0]).sort();
    expect(keys).toEqual(["age", "bio", "city", "college", "id", "interests", "name", "photo"]);
  });

  it("returns an empty list once everyone is swiped", () => {
    for (const p of getFeed(db, ME)) recordSwipe(db, ME, p.id, "pass");
    expect(getFeed(db, ME)).toEqual([]);
  });
});

describe("recordSwipe", () => {
  it("liking someone who liked you creates a match", () => {
    const res = recordSwipe(db, ME, ADMIRER, "like");
    expect(res.matched).toBe(true);
    if (res.matched) expect(res.match.profile.id).toBe(ADMIRER);
  });

  it("liking a neutral profile is not a match (and reveals nothing)", () => {
    expect(recordSwipe(db, ME, NEUTRAL, "like")).toEqual({ matched: false });
  });

  it("liking someone who passed on you is not a match", () => {
    expect(recordSwipe(db, ME, REJECTER, "like")).toEqual({ matched: false });
  });

  it("passing on an admirer is not a match", () => {
    expect(recordSwipe(db, ME, ADMIRER, "pass")).toEqual({ matched: false });
    expect(getMatches(db, ME)).toEqual([]);
  });

  it("the match forms when the second like lands, in either order", () => {
    expect(recordSwipe(db, ME, NEUTRAL, "like").matched).toBe(false);
    const res = recordSwipe(db, NEUTRAL, ME, "like");
    expect(res.matched).toBe(true);
    expect(getMatches(db, ME).map((m) => m.profile.id)).toEqual([NEUTRAL]);
  });

  it("rejects duplicate swipes without changing the first decision", () => {
    recordSwipe(db, ME, ADMIRER, "pass");
    expect(() => recordSwipe(db, ME, ADMIRER, "like")).toThrowError(ServiceError);
    expect(getMatches(db, ME)).toEqual([]);
  });

  it("rejects unknown targets and self-swipes", () => {
    expect(() => recordSwipe(db, ME, "ghost", "like")).toThrow(/not found/i);
    expect(() => recordSwipe(db, ME, ME, "like")).toThrow(/yourself/i);
  });
});

describe("getMatches", () => {
  it("is empty before any swipes despite pending admirers", () => {
    expect(getMatches(db, ME)).toEqual([]);
  });

  it("lists only mutual matches", () => {
    recordSwipe(db, ME, LIKED_ME[0], "like");
    recordSwipe(db, ME, LIKED_ME[1], "like");
    recordSwipe(db, ME, NEUTRAL, "like");
    recordSwipe(db, ME, REJECTER, "like");
    const ids = getMatches(db, ME).map((m) => m.profile.id).sort();
    expect(ids).toEqual([LIKED_ME[0], LIKED_ME[1]].sort());
  });

  it("persists across connections (simulated reload)", async () => {
    const fs = await import("node:fs");
    const os = await import("node:os");
    const path = await import("node:path");
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "coy-")), "t.db");

    const first = createDb(file);
    seed(first);
    recordSwipe(first, ME, ADMIRER, "like");
    first.close();

    const second = createDb(file);
    expect(getMatches(second, ME).map((m) => m.profile.id)).toEqual([ADMIRER]);
    expect(getFeed(second, ME).map((p) => p.id)).not.toContain(ADMIRER);
    second.close();
  });
});
