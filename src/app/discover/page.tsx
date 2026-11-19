"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Header, Sticker } from "@/components/Header";
import { MatchModal } from "@/components/MatchModal";
import { SwipeCard, type SwipeCardHandle } from "@/components/SwipeCard";
import type { Direction, Match, Profile, SwipeResult } from "@/lib/service";

const STACK = 3; // cards visible in the deck
const STACK_TILT = [0, -3, 2.5];

// Same copy whoever you like, so a toast can never hint at a one-sided like.
const FEEDBACK: Record<Direction, string> = {
  like: "liked. sealed until it's mutual.",
  pass: "passed. they'll never know.",
};

type Toast = { id: number; text: string; tone: Direction | "error" };

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const topCard = useRef<SwipeCardHandle>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const loadFeed = useCallback(async () => {
    try {
      const res = await fetch("/api/feed", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { profiles: Profile[] };
      setProfiles(data.profiles);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch
    loadFeed();
  }, [loadFeed]);

  const flash = useCallback((text: string, tone: Toast["tone"]) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text, tone });
    toastTimer.current = setTimeout(() => setToast(null), 1600);
  }, []);

  async function handleSwipe(profile: Profile, direction: Direction) {
    const remaining = (profiles?.length ?? 1) - 1;
    setProfiles((prev) => prev?.filter((p) => p.id !== profile.id) ?? prev);
    flash(FEEDBACK[direction], direction);

    try {
      const res = await fetch("/api/swipe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetId: profile.id, direction }),
      });
      if (res.status === 409) return; // already recorded (e.g. another tab)
      if (!res.ok) throw new Error(String(res.status));
      const result = (await res.json()) as SwipeResult;
      if (result.matched) setMatch(result.match);
      if (remaining === 0) loadFeed(); // the feed is paged, so check for more
    } catch {
      setProfiles((prev) => (prev ? [profile, ...prev] : [profile]));
      flash("couldn't save that. try again?", "error");
    }
  }

  // Arrow keys on desktop.
  useEffect(() => {
    if (match) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") topCard.current?.swipe("like");
      if (e.key === "ArrowLeft") topCard.current?.swipe("pass");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [match]);

  const closeMatch = useCallback(() => setMatch(null), []);
  const deck = profiles?.slice(0, STACK) ?? [];
  const hasCards = deck.length > 0;
  const finished = profiles?.length === 0;

  return (
    <>
      <Header>
        {profiles && profiles.length > 0 && (
          <Sticker className="rotate-2 bg-butter">
            <span className="tabular-nums">{profiles.length}</span> left to see
          </Sticker>
        )}
      </Header>

      <h1 className="mt-5 text-[13px] font-bold uppercase tracking-[0.18em] text-ink-soft">
        discover <span className="font-serif text-base normal-case italic tracking-normal">· nobody sees your likes</span>
      </h1>

      <section aria-label="Profiles" className="relative mt-3 min-h-[470px] flex-1">
        {profiles === null && !loadError && <DeckSkeleton />}
        {loadError && profiles === null && <LoadError onRetry={loadFeed} />}
        {profiles?.length === 0 && <EmptyDeck />}

        {deck
          .map((profile, i) => (
            <motion.div
              key={profile.id}
              className="absolute inset-0"
              style={{ zIndex: STACK - i }}
              initial={false}
              animate={{ scale: 1 - i * 0.045, y: i * 16, rotate: STACK_TILT[i] }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
            >
              <SwipeCard
                ref={i === 0 ? topCard : undefined}
                profile={profile}
                interactive={i === 0 && !match}
                onSwipe={(d) => handleSwipe(profile, d)}
              />
            </motion.div>
          ))
          .reverse()}
      </section>

      <div className="relative mt-8 flex items-center justify-center gap-7">
        <AnimatePresence>
          {toast && (
            <motion.p
              key={toast.id}
              role="status"
              initial={{ y: 8, opacity: 0, rotate: -2 }}
              animate={{ y: 0, opacity: 1, rotate: -2 }}
              exit={{ y: -6, opacity: 0 }}
              className={`absolute -top-7 z-20 whitespace-nowrap rounded-full border-2 border-ink px-3 py-1 text-[13px] font-bold shadow-hard-sm ${
                toast.tone === "like" ? "bg-pink" : toast.tone === "error" ? "bg-peach" : "bg-white"
              }`}
            >
              {toast.text}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          type="button"
          aria-label="Pass"
          hidden={finished}
          disabled={!hasCards || !!match}
          onClick={() => topCard.current?.swipe("pass")}
          className="press grid size-16 place-items-center rounded-full border-[2.5px] border-ink bg-white disabled:pointer-events-none disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="size-7" aria-hidden>
            <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Like"
          hidden={finished}
          disabled={!hasCards || !!match}
          onClick={() => topCard.current?.swipe("like")}
          className="press grid size-20 place-items-center rounded-full border-[2.5px] border-ink bg-pink disabled:pointer-events-none disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="size-9" aria-hidden>
            <path
              d="M12 20.5s-8-4.7-8-10.5A4.5 4.5 0 0 1 12 7.4 4.5 4.5 0 0 1 20 10c0 5.8-8 10.5-8 10.5z"
              fill="white"
              stroke="var(--ink)"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <p className={`mt-4 hidden text-center text-xs font-semibold text-ink-soft ${finished ? "" : "sm:block"}`}>
        drag the card, or use <Kbd>←</Kbd> <Kbd>→</Kbd>
      </p>

      <AnimatePresence>{match && <MatchModal match={match} onClose={closeMatch} />}</AnimatePresence>
    </>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mx-0.5 inline-grid min-w-6 place-items-center rounded-md border-2 border-ink bg-white px-1 font-sans text-[11px] shadow-[1.5px_1.5px_0_0_var(--ink)]">
      {children}
    </kbd>
  );
}

function DeckSkeleton() {
  return (
    <div className="absolute inset-0 flex animate-pulse flex-col overflow-hidden rounded-[30px] border-[2.5px] border-dashed border-ink/40 bg-white/60">
      <div className="flex-1 bg-pink-soft/60" />
      <div className="space-y-3 p-5">
        <div className="h-8 w-1/2 rounded-full bg-ink/10" />
        <div className="h-4 w-3/4 rounded-full bg-ink/10" />
      </div>
      <p className="sr-only">Loading profiles</p>
    </div>
  );
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-[30px] border-[2.5px] border-ink bg-white p-8 text-center shadow-hard-lg">
      <p className="text-2xl font-extrabold tracking-tight">the deck got stuck.</p>
      <p className="text-ink-soft">Couldn&apos;t load profiles. Check the server is running.</p>
      <button onClick={onRetry} className="press rounded-full border-[2.5px] border-ink bg-butter px-6 py-3 font-bold">
        try again
      </button>
    </div>
  );
}

function EmptyDeck() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
      <div aria-hidden className="relative mb-9 h-40 w-32">
        <div className="absolute inset-0 -rotate-[10deg] rounded-2xl border-[2.5px] border-dashed border-ink/50 bg-white" />
        <div className="absolute inset-0 rotate-[7deg] rounded-2xl border-[2.5px] border-dashed border-ink/50 bg-white" />
        <div className="absolute inset-0 grid place-items-center rounded-2xl border-[2.5px] border-ink bg-mint shadow-hard">
          <span className="font-serif text-5xl italic">fin.</span>
        </div>
      </div>
      <h2 className="text-[30px] font-extrabold leading-tight tracking-[-0.03em]">
        that&apos;s everyone,
        <br />
        <span className="font-serif font-normal italic">for now.</span>
      </h2>
      <p className="mt-3 max-w-[260px] text-ink-soft">
        You&apos;ve seen every profile. New people show up here as they join.
      </p>
      <Link
        href="/matches"
        className="press mt-7 rounded-full border-[2.5px] border-ink bg-pink px-7 py-3.5 text-lg font-bold"
      >
        check your matches
      </Link>
    </div>
  );
}
