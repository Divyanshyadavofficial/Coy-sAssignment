"use client";

import { animate, motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { useImperativeHandle, useRef, type Ref } from "react";
import type { Direction, Profile } from "@/lib/service";

export type SwipeCardHandle = { swipe: (direction: Direction) => void };

type Props = {
  profile: Profile;
  interactive: boolean;
  onSwipe: (direction: Direction) => void;
  ref?: Ref<SwipeCardHandle>;
};

const DISTANCE = 110; // px of drag that counts as a decision
const VELOCITY = 650; // or a quick flick
const CHIP_COLORS = ["bg-butter", "bg-mint", "bg-lilac", "bg-sky", "bg-peach"];
const CHIP_TILT = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

export function SwipeCard({ profile, interactive, onSwipe, ref }: Props) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-320, 0, 320], [-16, 0, 16]);
  const likeOpacity = useTransform(x, [20, DISTANCE], [0, 1]);
  const likeScale = useTransform(x, [20, DISTANCE], [1.35, 1]);
  const nopeOpacity = useTransform(x, [-DISTANCE, -20], [1, 0]);
  const nopeScale = useTransform(x, [-DISTANCE, -20], [1, 1.35]);
  const decided = useRef(false);

  async function fling(direction: Direction) {
    if (decided.current) return;
    decided.current = true;
    const off = window.innerWidth / 2 + 420;
    await animate(x, direction === "like" ? off : -off, {
      duration: 0.38,
      ease: [0.33, 0.7, 0.25, 1],
    });
    onSwipe(direction);
  }

  useImperativeHandle(ref, () => ({ swipe: fling }));

  function onDragEnd(_: unknown, { offset, velocity }: PanInfo) {
    if (offset.x > DISTANCE || velocity.x > VELOCITY) fling("like");
    else if (offset.x < -DISTANCE || velocity.x < -VELOCITY) fling("pass");
    else animate(x, 0, { type: "spring", stiffness: 520, damping: 32 });
  }

  const place = [profile.college, profile.city].filter(Boolean).join(", ");

  return (
    <motion.article
      aria-label={`${profile.name}, ${profile.age}`}
      drag={interactive ? "x" : false}
      dragMomentum={false}
      dragElastic={0.85}
      onDragEnd={onDragEnd}
      style={{ x, rotate }}
      whileTap={interactive ? { scale: 1.015 } : undefined}
      className={`absolute inset-0 select-none ${interactive ? "cursor-grab touch-pan-y active:cursor-grabbing" : "pointer-events-none"}`}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[30px] border-[2.5px] border-ink bg-white shadow-hard-lg">
        <div className="relative min-h-0 flex-1 overflow-hidden border-b-[2.5px] border-ink">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote SVG avatars */}
          <img
            src={profile.photo}
            alt=""
            draggable={false}
            className="pointer-events-none absolute inset-0 size-full object-cover object-[50%_20%]"
          />

          {profile.city && (
            <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full border-2 border-ink bg-white px-2.5 py-1 text-xs font-bold shadow-hard-sm">
              <PinIcon />
              {profile.city}
            </span>
          )}

          <motion.span
            aria-hidden
            style={{ opacity: likeOpacity, scale: likeScale }}
            className="stamp absolute left-5 top-16 -rotate-[14deg] bg-white/80 text-4xl text-pink"
          >
            like
          </motion.span>
          <motion.span
            aria-hidden
            style={{ opacity: nopeOpacity, scale: nopeScale }}
            className="stamp absolute right-5 top-16 rotate-[12deg] bg-white/80 text-4xl text-ink"
          >
            nope
          </motion.span>
        </div>

        <div className="flex flex-col gap-2.5 px-5 pb-5 pt-4">
          <div className="flex items-baseline gap-2">
            <h2 className="text-[34px] font-extrabold leading-none tracking-[-0.03em]">{profile.name}</h2>
            <span className="font-serif text-[28px] italic leading-none text-ink-soft">{profile.age}</span>
          </div>
          {place && <p className="-mt-1 text-sm font-semibold text-ink-soft">{place}</p>}
          {profile.bio && (
            <p className="font-serif text-[21px] italic leading-[1.15] text-ink">&ldquo;{profile.bio}&rdquo;</p>
          )}
          {profile.interests.length > 0 && (
            <ul className="mt-1 flex flex-wrap gap-2" aria-label="Interests">
              {profile.interests.map((tag, i) => (
                <li
                  key={tag}
                  className={`${CHIP_COLORS[(i + profile.name.length) % CHIP_COLORS.length]} ${CHIP_TILT[i % CHIP_TILT.length]} rounded-full border-2 border-ink px-3 py-0.5 text-[13px] font-bold`}
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
      <path
        d="M8 14.5s4.5-4.2 4.5-7.8a4.5 4.5 0 0 0-9 0c0 3.6 4.5 7.8 4.5 7.8z"
        fill="var(--pink)"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="8" cy="6.6" r="1.6" fill="white" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
