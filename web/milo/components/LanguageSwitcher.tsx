"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { basePath, localePath, locales, type Locale } from "@milo/lib/site";

const names: Record<Locale, string> = { it: "Italiano", en: "English" };
const KEY = "milo-lang-spot"; // where the visitor was, so the other language opens at the same spot

// Next.js keeps the previous language's page in the document (hidden) for a quick way back, so every
// block exists twice. Only the visible copy counts.
const shown = (el: Element) => el.getClientRects().length > 0;
const visibleSection = (id: string) => [...document.querySelectorAll<HTMLElement>(`section[id="${id}"]`)].find(shown);

/** The block in view (the last one whose top has passed 40% of the screen) and how far into it we are. */
function currentSpot() {
  let spot: { id: string; offset: number } | null = null;
  for (const el of document.querySelectorAll<HTMLElement>("section[id]")) {
    if (!shown(el)) continue;
    const top = el.getBoundingClientRect().top;
    if (top <= innerHeight * 0.4) spot = { id: el.id, offset: -top };
  }
  return spot;
}

export function LanguageSwitcher({ lang, label }: { lang: Locale; label: string }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  // Keep the visitor on the same page when switching language ("/products/milo/en/privacy/" → "/products/milo/privacy/").
  const inner = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname;
  const parts = inner.split("/").filter(Boolean);
  // (the Italian pages are built at ".../it/", so the server sees "it" here even though visitors never do)
  if (parts[0] && (locales as readonly string[]).includes(parts[0])) parts.shift();
  const rest = parts.length ? `/${parts.join("/")}` : "";

  // after switching: jump straight back to the same block, at the same distance into it
  useEffect(() => {
    let saved: { id: string; offset: number } | null = null;
    try { saved = JSON.parse(sessionStorage.getItem(KEY) ?? "null"); sessionStorage.removeItem(KEY); } catch {}
    if (!saved) return;
    // the new page may take a few frames to appear: keep trying for up to ~1 s
    let tries = 0, raf = 0;
    const go = () => {
      const el = visibleSection(saved!.id);
      if (el) scrollTo({ top: el.getBoundingClientRect().top + scrollY + saved!.offset, behavior: "instant" });
      if ((!el || tries < 3) && tries++ < 60) raf = requestAnimationFrame(go);
    };
    go();
    return () => cancelAnimationFrame(raf);
  }, [lang]);

  function onSwitch(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // new tab etc.: normal link
    e.preventDefault();
    const spot = currentSpot();
    try { if (spot) sessionStorage.setItem(KEY, JSON.stringify(spot)); } catch {}
    router.replace(href, { scroll: false }); // replace: switching language is not a step for "Back"
  }

  return (
    <nav aria-label={label}>
      <ul className="flex rounded-lg border border-border p-0.5 text-xs font-semibold">
        {locales.map((l) => (
          <li key={l}>
            <Link
              href={localePath(l, rest)}
              onClick={(e) => l !== lang && onSwitch(e, localePath(l, rest))}
              hrefLang={l}
              lang={l}
              aria-current={l === lang ? "true" : undefined}
              title={names[l]}
              className={`block rounded-md px-2.5 py-1.5 uppercase md:px-2 md:py-1 ${
                l === lang ? "bg-brand text-brand-contrast" : "text-muted hover:text-foreground"
              }`}
            >
              <span aria-hidden="true">{l}</span>
              <span className="sr-only">{names[l]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
