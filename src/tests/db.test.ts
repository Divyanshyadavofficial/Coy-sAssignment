import { describe, it, expect } from "vitest";
import { createDb } from "../lib/db";

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
});