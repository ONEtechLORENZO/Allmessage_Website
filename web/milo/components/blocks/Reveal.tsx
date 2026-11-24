"use client";

import { useEffect, useRef } from "react";

// Plays the "rise in" animation when the block scrolls into view.
// Content is visible in the HTML by default (good for SEO and no-JS visitors);
// it is only hidden first if it is still below the fold when the page loads.
export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.9) return; // already on screen: leave it as is
    el.classList.add("reveal-hidden");
    let done: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.replace("reveal-hidden", "reveal-shown");
        io.disconnect();
        // Once the entrance has finished, drop the class so hover effects respond instantly.
        done = setTimeout(() => el.classList.remove("reveal-shown"), 2600);
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(done);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
