"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Header, Sticker } from "@/components/Header";
import type { Match } from "@/lib/service";

const TILTS = [-2.5, 2, -1.5, 3, -3, 1.5];

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(0); // set client-side when data lands

  useEffect(() => {
    fetch("/api/matches", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: { matches: Match[] }) => {
        setMatches(d.matches);
        setNow(Date.now());
      })
      .catch(() => setFailed(true));
  }, []);

  return (
    <>
      <Header>
        {matches && matches.length > 0 && (
          <Sticker className="-rotate-2 bg-pink">
            <span className="tabular-nums">{matches.length}</span> mutual
          </Sticker>
        )}
      </Header>

      <h1 className="mt-6 text-[40px] font-extrabold leading-[0.95] tracking-[-0.04em]">
        your <span className="font-serif font-normal italic">matches</span>
      </h1>
      <p className="mt-2 text-ink-soft">Only people who liked you back. Everyone else stays a secret.</p>

      {failed && (
        <p className="mt-8 rounded-2xl border-[2.5px] border-ink bg-peach p-4 font-semibold shadow-hard">
          Couldn&apos;t load your matches. Refresh to try again.
        </p>
      )}

      {matches === null && !failed && (
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6" aria-label="Loading matches">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="aspect-[4/5] animate-pulse rounded-lg border-[2.5px] border-dashed border-ink/30 bg-white/60" />
          ))}
        </ul>
      )}

      {matches?.length === 0 && <NoMatches />}

      {matches && matches.length > 0 && (
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7">
          {matches.map(({ profile, matchedAt }, i) => (
            <motion.li
              key={profile.id}
              initial={{ opacity: 0, y: 18, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: TILTS[i % TILTS.length] }}
              whileHover={{ rotate: 0, y: -4 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 260, damping: 20 }}
              className="rounded-md border-[2.5px] border-ink bg-white p-2 shadow-hard"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- remote SVG avatars */}
              <img
                src={profile.photo}
                alt={`${profile.name}'s avatar`}
                className="aspect-square w-full rounded-sm border-2 border-ink object-cover"
              />
              <div className="px-0.5 pb-1 pt-2">
                <p className="flex items-baseline gap-1.5">
                  <span className="text-lg font-extrabold leading-none tracking-tight">{profile.name}</span>
                  <span className="font-serif text-lg italic leading-none text-ink-soft">{profile.age}</span>
                </p>
                <p className="mt-1 truncate text-xs font-semibold text-ink-soft">
                  {profile.college ?? profile.city}
                </p>
                <p className="mt-2 font-serif text-[15px] italic leading-none text-pink-deep">
                  matched {timeAgo(matchedAt, now)}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </>
  );
}

function NoMatches() {
  return (
    <div className="mt-12 flex flex-col items-center text-center">
      <div aria-hidden className="relative mb-8 flex h-36 items-center">
        <div className="h-32 w-28 -rotate-[9deg] rounded-md border-[2.5px] border-dashed border-ink/50 bg-white" />
        <div className="-ml-8 h-32 w-28 rotate-[7deg] rounded-md border-[2.5px] border-dashed border-ink/50 bg-white" />
        <div className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[2.5px] border-ink bg-butter font-serif text-3xl italic shadow-hard">
          ?
        </div>
      </div>
      <h2 className="text-[26px] font-extrabold leading-tight tracking-[-0.03em]">no matches yet</h2>
      <p className="mt-2 max-w-[270px] text-ink-soft">
        Your likes are sealed. Nobody sees them unless they like you back.
      </p>
      <Link
        href="/discover"
        className="press mt-7 rounded-full border-[2.5px] border-ink bg-pink px-7 py-3.5 text-lg font-bold"
      >
        start discovering
      </Link>
    </div>
  );
}

function timeAgo(then: number, now: number) {
  const s = Math.max(0, Math.round((now - then) / 1000));
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d}d ago`;
}
