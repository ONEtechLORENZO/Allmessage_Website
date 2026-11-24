"use client";

import { useEffect, useRef, useState } from "react";

// Header tabs that jump to a block on the page. The tab of the block in view is highlighted.
type Tab = { id: string; label: string };

export function SectionTabs({ tabs, label, home }: { tabs: Tab[]; label: string; home: string }) {
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // phones: the tab strip scrolls sideways so the highlighted tab is always in sight
  useEffect(() => {
    const ul = listRef.current;
    if (!ul || ul.scrollWidth <= ul.clientWidth) return;
    const a = ul.querySelector<HTMLElement>("[aria-current]");
    const left = a ? a.offsetLeft - (ul.clientWidth - a.offsetWidth) / 2 : 0;
    ul.scrollTo({ left, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [active]);

  useEffect(() => {
    // only the visible copy of each block (the previous language's page may still be in the document, hidden)
    const els = tabs.map((t) => [...document.querySelectorAll<HTMLElement>(`section[id="${t.id}"]`)].find((e) => e.getClientRects().length)).filter(Boolean) as HTMLElement[];
    if (!els.length) return; // e.g. on the privacy page
    // a block counts as "in view" when it crosses the middle of the screen
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-45% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    const top = () => { if (scrollY < innerHeight * 0.4) setActive(null); }; // back on the hero: nothing highlighted
    addEventListener("scroll", top, { passive: true });
    return () => { io.disconnect(); removeEventListener("scroll", top); };
  }, [tabs]);

  // Links to a block of this page (header tabs, footer, logo) scroll there without adding a browser
  // history step, so "Back" leaves Milo (e.g. back to AllMessage) instead of replaying every block.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.href.includes("richiedi-demo")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      const id = decodeURIComponent(url.hash.slice(1));
      const el = [...document.querySelectorAll<HTMLElement>(`[id="${CSS.escape(id)}"]`)].find((x) => x.getClientRects().length);
      if (!el) return;
      e.preventDefault();
      e.stopPropagation(); // keep Next's <Link> from pushing a history entry
      history.replaceState(history.state, "", url.pathname + url.search + url.hash);
      el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    };
    addEventListener("click", onClick, true); // capture: runs before React's own click handlers
    return () => removeEventListener("click", onClick, true);
  }, []);

  return (
    <nav aria-label={label} className="min-w-0">
      <ul ref={listRef} className="relative flex items-center gap-1 overflow-x-auto text-sm font-medium whitespace-nowrap [scrollbar-width:none] md:gap-[clamp(4px,1.4vw,22px)] md:text-[15px]">
        {tabs.map((t) => (
          <li key={t.id}>
            <a
              href={`${home}#${t.id}`}
              aria-current={active === t.id ? "true" : undefined}
              className={`block rounded-full px-3.5 py-1.5 transition-colors ${
                active === t.id ? "bg-[#e6f9f8] text-[#04282b]" : "text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
