"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { ME_AVATAR } from "@/lib/avatar";
import type { Match } from "@/lib/service";

// Fixed positions so hearts look scattered without re-randomising on render.
const HEARTS = [
  { left: "6%", size: 22, d: "7s", delay: "0s", r: "-12deg" },
  { left: "18%", size: 14, d: "5.5s", delay: "1.2s", r: "8deg" },
  { left: "31%", size: 30, d: "8s", delay: "0.4s", r: "-4deg" },
  { left: "47%", size: 16, d: "6.2s", delay: "2s", r: "14deg" },
  { left: "62%", size: 26, d: "7.4s", delay: "0.8s", r: "-18deg" },
  { left: "76%", size: 12, d: "5s", delay: "1.6s", r: "6deg" },
  { left: "88%", size: 20, d: "6.8s", delay: "0.2s", r: "-8deg" },
];

type Props = { match: Match; onClose: () => void };

export function MatchModal({ match, onClose }: Props) {
  const keepSwiping = useRef<HTMLButtonElement>(null);
  const { profile } = match;

  useEffect(() => {
    keepSwiping.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-title"
      initial={{ clipPath: "circle(0% at 50% 85%)" }}
      animate={{ clipPath: "circle(150% at 50% 85%)" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
      className="fixed inset-0 z-50 overflow-hidden bg-pink"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {HEARTS.map((h, i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className="floaty absolute -bottom-10"
            style={{
              left: h.left,
              width: h.size,
              ["--d" as string]: h.d,
              ["--delay" as string]: h.delay,
              ["--r" as string]: h.r,
            }}
          >
            <path
              d="M12 21s-8.5-5-8.5-11.2A4.8 4.8 0 0 1 12 7.1a4.8 4.8 0 0 1 8.5 2.7C20.5 16 12 21 12 21z"
              fill={i % 2 ? "white" : "var(--butter)"}
              stroke="var(--ink)"
              strokeWidth="2"
            />
          </svg>
        ))}
      </div>

      <div className="relative mx-auto flex h-full max-w-[440px] flex-col items-center justify-center px-6 text-center">
        <motion.p
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-sm font-bold uppercase tracking-[0.2em]"
        >
          psst. it&apos;s mutual
        </motion.p>

        <motion.h2
          id="match-title"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 14 }}
          className="mt-1 text-[44px] font-extrabold leading-[0.9] tracking-[-0.04em]"
        >
          it&apos;s a
          <span className="block font-serif text-[104px] font-normal italic leading-[0.85] tracking-[-0.02em] text-white [-webkit-text-stroke:2px_var(--ink)] [paint-order:stroke]">
            match
          </span>
        </motion.h2>

        <div className="relative mt-8 flex h-56 w-full items-center justify-center">
          <Polaroid src={ME_AVATAR} label="you" tilt={-9} fromX={-140} delay={0.55} className="-mr-6" />
          <Polaroid src={profile.photo} label={profile.name} tilt={8} fromX={140} delay={0.65} className="-ml-6" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.95, type: "spring", stiffness: 400, damping: 12 }}
            className="absolute left-1/2 top-[44%] z-10 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="wiggle grid size-16 place-items-center rounded-full border-[2.5px] border-ink bg-butter shadow-hard">
              <svg viewBox="0 0 24 24" className="size-8" aria-hidden>
                <path
                  d="M12 20.5s-8-4.7-8-10.5A4.5 4.5 0 0 1 12 7.4 4.5 4.5 0 0 1 20 10c0 5.8-8 10.5-8 10.5z"
                  fill="var(--pink)"
                  stroke="var(--ink)"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05 }}
          className="mt-6 max-w-[290px] text-[17px] font-medium leading-snug"
        >
          You and {profile.name} both said yes. That stays between the two of you.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.15 }}
          className="mt-8 flex w-full flex-col gap-3"
        >
          <Link
            href="/matches"
            className="press flex h-14 items-center justify-center rounded-full border-[2.5px] border-ink bg-ink text-lg font-bold text-white"
          >
            see your matches
          </Link>
          <button
            ref={keepSwiping}
            onClick={onClose}
            className="press h-14 rounded-full border-[2.5px] border-ink bg-white text-lg font-bold"
          >
            keep swiping
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

type PolaroidProps = {
  src: string;
  label: string;
  tilt: number;
  fromX: number;
  delay: number;
  className?: string;
};

function Polaroid({ src, label, tilt, fromX, delay, className = "" }: PolaroidProps) {
  return (
    <motion.figure
      initial={{ x: fromX, rotate: 0, opacity: 0 }}
      animate={{ x: 0, rotate: tilt, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 180, damping: 15 }}
      className={`w-40 shrink-0 rounded-md border-[2.5px] border-ink bg-white p-2 pb-1 shadow-hard-lg ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- remote SVG avatars */}
      <img src={src} alt="" className="aspect-square w-full rounded-sm border-2 border-ink object-cover" />
      <figcaption className="px-1 py-1 text-left font-serif text-2xl italic leading-none">{label}</figcaption>
    </motion.figure>
  );
}
