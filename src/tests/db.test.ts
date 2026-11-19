import { describe, it, expect } from "vitest";
import { createDb } from "../lib/db";
import { seed, LIKED_ME, PASSED_ME } from "../lib/seed";

describe("db", () => {
  it("creates tables and enforces constraints", () => {
    const db = createDb(":memory:");
    const add = db.prepare("INSERT INTO profiles (id,name,age,photo) VALUES (?,?,?,?)");
    add.run("me", "Me", 22, "x");
    add.run("p1", "Asha", 21, "x");

    const swipe = db.prepare(
      "INSERT INTO swipes (swiper_id,target_id,direction,created_at) VALUES (?,?,?,?)"
    );
    swipe.run("me", "p1", "like", Date.now());

    expect(() => swipe.run("me", "p1", "pass", Date.now())).toThrow(); // duplicate swipe
    expect(() => swipe.run("me", "me", "like", Date.now())).toThrow(); // self swipe
    expect(() => swipe.run("me", "ghost", "like", Date.now())).toThrow(); // FK
    expect(() => swipe.run("p1", "me", "love", Date.now())).toThrow(); // bad direction
  });

  it("seeds 30+ profiles and pre-likes, and is re-runnable", () => {
    const db = createDb(":memory:");
    seed(db);
    seed(db); // running twice must not fail or duplicate data

    const profiles = db
      .prepare("SELECT COUNT(*) AS n FROM profiles WHERE id <> 'me'")
      .get() as { n: number };
    expect(profiles.n).toBeGreaterThanOrEqual(30);

    const likes = db
      .prepare("SELECT COUNT(*) AS n FROM swipes WHERE target_id = 'me' AND direction = 'like'")
      .get() as { n: number };
    expect(likes.n).toBe(LIKED_ME.length);

    const passes = db
      .prepare("SELECT COUNT(*) AS n FROM swipes WHERE target_id = 'me' AND direction = 'pass'")
      .get() as { n: number };
    expect(passes.n).toBe(PASSED_ME.length);

    const matches = db.prepare("SELECT COUNT(*) AS n FROM matches").get() as { n: number };
    expect(matches.n).toBe(0); // no matches until "me" likes someone back
  });
});