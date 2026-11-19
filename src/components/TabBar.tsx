"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/discover", label: "Discover", icon: CardsIcon },
  { href: "/matches", label: "Matches", icon: HeartsIcon },
] as const;

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[440px] px-5 pb-[max(env(safe-area-inset-bottom),1rem)]"
    >
      <ul className="flex items-center justify-between gap-1 rounded-full border-[2.5px] border-ink bg-white p-1.5 shadow-hard">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-12 items-center justify-center gap-2 rounded-full text-sm font-bold transition-colors ${
                  active
                    ? "bg-pink text-ink outline-2 outline-ink"
                    : "text-ink-soft hover:bg-pink-soft hover:text-ink"
                }`}
              >
                <Icon filled={active} />
                <span className={active ? "" : "sr-only sm:not-sr-only"}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

type IconProps = { filled: boolean };
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function HomeIcon({ filled }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className="size-[22px]" aria-hidden>
      <path {...stroke} fill={filled ? "white" : "none"} d="M3.5 10.8 12 4l8.5 6.8V19a1.5 1.5 0 0 1-1.5 1.5h-4v-6h-6v6H5A1.5 1.5 0 0 1 3.5 19z" />
    </svg>
  );
}

function CardsIcon({ filled }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className="size-[22px]" aria-hidden>
      <rect {...stroke} x="3.2" y="5.5" width="11" height="15" rx="2.5" transform="rotate(-10 8.7 13)" />
      <rect {...stroke} fill={filled ? "white" : "none"} x="9.5" y="3.5" width="11" height="15" rx="2.5" transform="rotate(8 15 11)" />
    </svg>
  );
}

function HeartsIcon({ filled }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className="size-[22px]" aria-hidden>
      <path {...stroke} fill={filled ? "white" : "none"} d="M12 20s-7.5-4.4-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z" />
      <path {...stroke} d="M17.5 3.2c.9-.9 2.6-.6 2.9.8.3 1.6-1.6 2.9-2.9 3.6-1.3-.7-3.2-2-2.9-3.6.3-1.4 2-1.7 2.9-.8z" />
    </svg>
  );
}
