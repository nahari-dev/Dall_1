"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/chat", label: "AI Tutor" },
  { href: "/quiz", label: "Quiz" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/study-plan", label: "Study Plan" },
  { href: "/library", label: "Library" },
];

export default function Navbar() {
  const pathname = usePathname();

  // Don't render on the landing page
  if (pathname === "/") return null;

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between px-4 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--dall-teal)] to-[var(--dall-teal-dark)] flex items-center justify-center text-white font-bold text-xs">
            D
          </div>
          <span className="font-semibold text-dall-900 dark:text-dall-100">
            DentDall
          </span>
        </Link>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {NAV_LINKS.find((l) => pathname.startsWith(l.href))?.label ?? ""}
        </span>
      </div>
      <nav className="flex items-center gap-4 text-sm">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`transition-colors ${
              pathname.startsWith(link.href)
                ? "text-dall-600 dark:text-dall-400 font-medium"
                : "text-slate-600 dark:text-slate-400 hover:text-dall-600 dark:hover:text-dall-400"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
