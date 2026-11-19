import Link from "next/link";
import type { ReactNode } from "react";

export function Header({ children }: { children?: ReactNode }) {
  return (
    <header className="flex items-center justify-between">
      <Link href="/" aria-label="coy home" className="text-[34px] font-extrabold leading-none tracking-[-0.05em]">
        coy<span className="text-pink">.</span>
      </Link>
      {children}
    </header>
  );
}

export function Sticker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1 text-xs font-bold shadow-hard-sm ${className}`}
    >
      {children}
    </span>
  );
}
