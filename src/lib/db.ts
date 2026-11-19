import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export const CURRENT_USER_ID = "me";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS profiles (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  age       INTEGER NOT NULL CHECK (age >= 18),
  photo     TEXT NOT NULL,
  bio       TEXT NOT NULL DEFAULT '',
  city      TEXT,
  college   TEXT,
  interests TEXT NOT NULL DEFAULT '[]'          -- JSON array as text
);

CREATE TABLE IF NOT EXISTS swipes (
  swiper_id  TEXT NOT NULL REFERENCES profiles(id),
  target_id  TEXT NOT NULL REFERENCES profiles(id),
  direction  TEXT NOT NULL CHECK (direction IN ('like','pass')),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (swiper_id, target_id),
  CHECK (swiper_id <> target_id)
);

CREATE TABLE IF NOT EXISTS matches (
  user_a     TEXT NOT NULL REFERENCES profiles(id),
  user_b     TEXT NOT NULL REFERENCES profiles(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_a, user_b),
  CHECK (user_a < user_b)
);

CREATE INDEX IF NOT EXISTS idx_matches_user_b ON matches(user_b);
`;
export type DB = Database.Database;
export function createDb(file: string): DB {
  if (file !== ":memory:") {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  return db;
}

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), "data", "coy.db");

const globalForDb = globalThis as unknown as { __coyDb?: DB };

export function getDb(): DB {
  if (!globalForDb.__coyDb) globalForDb.__coyDb = createDb(DB_PATH);
  return globalForDb.__coyDb;
}
