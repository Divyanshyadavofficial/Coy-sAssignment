# coy · discover

A swipe-based **Discover** tab for [Coy](https://getcoy.com), built for the Coy SDE Intern assignment.

Coy's whole promise is that nobody finds out you like them unless they like you back. This tab keeps that promise: you swipe through profiles, and the only time you learn anything about how someone feels is when it's mutual.

> Part A (two feature suggestions for Coy) is in [`PART_A.md`](./PART_A.md).

---

## Run it

Needs Node 20 or newer.

```bash
npm install
npm run dev
```

Open <http://localhost:3000/discover>.

The database seeds itself on first run, so there's nothing else to set up. To reset everything (profiles, swipes and matches) back to the start:

```bash
npm run seed
```

Tests:

```bash
npm test
```

### Getting a match during a demo

Eight seeded profiles have already liked you. Like any of them and you'll get the match screen:

**Ishita, Saanvi, Ananya, Myra, Riya, Aarav, Rudra, Zoya**

Two profiles (**Meera** and **Kiara**) have already *passed* on you. Liking them looks exactly like liking anyone else. No match, no hint. That's the point.

On desktop you can drag the card, use the buttons, or press `←` / `→`.

---

## What's in here

| Requirement | Where |
| --- | --- |
| 30 seeded profiles, some pre-liking you | `src/lib/seed.ts` |
| One card at a time, drag on mobile, buttons + keys on desktop | `src/components/SwipeCard.tsx`, `src/app/discover/page.tsx` |
| Swiped profiles never come back | `getFeed` in `src/lib/service.ts` + primary key on `swipes` |
| Empty state | `EmptyDeck` in `src/app/discover/page.tsx` |
| "It's a match!" screen | `src/components/MatchModal.tsx` |
| Matches view | `src/app/matches/page.tsx` |
| `GET /feed`, `POST /swipe`, `GET /matches` | `src/app/api/*/route.ts` |
| Persists across reloads | SQLite file at `data/coy.db` |

Stack: Next.js 16 (App Router + route handlers), React 19, TypeScript, SQLite via `better-sqlite3`, Tailwind 4, Framer Motion, Zod, Vitest.

```
src/
  app/
    api/feed | swipe | matches   route handlers (thin: validate, call service, map errors)
    discover/  matches/  page.tsx   the three tabs (Home is intentionally blank)
  components/                    SwipeCard, MatchModal, TabBar, Header
  lib/
    db.ts        schema + connection
    service.ts   all the business logic: feed, swipe, matches
    seed.ts      mock profiles
    api.ts       shared route plumbing
  tests/         db + service tests
```

---

## API

All endpoints act as the single logged-in user (`me`).

**`GET /api/feed`** returns profiles you haven't swiped on yet.

```json
{ "profiles": [{ "id": "p01", "name": "Aanya", "age": 21, "photo": "…", "bio": "…",
                 "city": "Delhi", "college": "Miranda House", "interests": ["poetry", "chai"] }] }
```

**`POST /api/swipe`** with `{ "targetId": "p03", "direction": "like" | "pass" }`

```json
{ "matched": false }
{ "matched": true, "match": { "profile": { … }, "matchedAt": 1763571234000 } }
```

| Status | When |
| --- | --- |
| 201 | swipe saved |
| 400 | bad body, or swiping yourself |
| 404 | no such profile |
| 409 | already swiped on this profile |

**`GET /api/matches`** returns your mutual matches, newest first.

```json
{ "matches": [{ "profile": { … }, "matchedAt": 1763571234000 }] }
```

---

## How the privacy promise is kept

This was the part I cared most about getting right, because a single leak breaks the whole idea.

- **The feed doesn't know who liked you.** The feed query only looks at *your* swipes, never swipes aimed at you. So someone who liked you can't show up earlier, later, or more often than anyone else. There's a test that deletes every incoming swipe and checks the feed comes back identical.
- **No extra fields.** Profiles in the feed have no `likedYou` flag or anything like it. A test pins the exact set of keys.
- **A like tells you nothing until it's mutual.** `POST /swipe` returns `{ "matched": false }` whether the other person liked you, passed on you, or hasn't seen you yet. The UI copy after a like is the same for everyone too.
- **No double-dipping.** You can't swipe the same person twice (primary key on `(swiper_id, target_id)` + a 409). Same idea as Coy's "adding is final": you can't pass and then like to test someone.
- **No missed matches under load.** The swipe runs in an `IMMEDIATE` SQLite transaction, so two people liking each other at the same moment can't both read "no like yet" and miss the match.

## Data model

```
profiles (id, name, age ≥ 18, photo, bio, city, college, interests)
swipes   (swiper_id, target_id, direction like|pass, created_at)
         PK (swiper_id, target_id), CHECK swiper ≠ target
matches  (user_a, user_b, created_at)
         PK (user_a, user_b), CHECK user_a < user_b   -- each pair stored once
```

`matches` could be derived from two likes, but storing it gives a clean "matched at" time and keeps `GET /matches` a simple join.

## Design

The tab should feel like it belongs inside Coy, so it borrows Coy's own look: the hot pink, ink outlines with hard offset shadows, pill buttons and Bricolage Grotesque, with an italic serif for the softer moments. Interest tags are sticker-style chips, cards get "like" / "nope" rubber stamps while you drag, and the match screen is two polaroids sliding together.

Avatars are illustrated ([DiceBear](https://www.dicebear.com/) "notionists") instead of stock photos. They stay sharp at any size and suit Coy, which doesn't use photos at all.

Animations respect `prefers-reduced-motion`.

## Tests

`npm test` runs 16 tests against an in-memory SQLite database:

- schema constraints (no duplicate swipes, no self-swipes, valid directions, foreign keys)
- seed is re-runnable and creates the pre-likes
- feed excludes swiped profiles and is unaffected by who liked you
- every like/pass combination, and matches forming in either order
- error cases
- swipes and matches surviving a closed and reopened database (a "page reload")

## If I had more time

- Real auth and multiple users. The service already takes a `userId` everywhere, so it's mostly plumbing.
- Cursor pagination on the feed, and prefetching the next page before you run out.
- Undo for an accidental pass, with a short window and only before the swipe is "sealed".
- Rate limiting on `/swipe` so nobody can script through the deck.
- E2E tests for the swipe gestures (Playwright).
