"use client";

import { useEffect, useRef } from "react";
import type { Dictionary } from "@milo/lib/dictionaries";
import { site } from "@milo/lib/site";
import { SectionEyebrow } from "./SectionEyebrow";
import "./about.css";

// Block 05: who makes Milo. Left: label and headline, right: short text and the sales contact.

type Props = { about: Dictionary["about"] };

const at = (s: number) => ({ "--d": `${s.toFixed(2)}s` }) as React.CSSProperties;

export function About({ about: a }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; // text simply stays visible
    el.dataset.js = "1";
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.dataset.go = "1"; io.disconnect(); } }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [before, after = ""] = a.title.split("{oneTech}");
  const email = site.company.email;

  return (
    <section ref={ref} id="about" className="abt" aria-labelledby="abt-title">
      <div className="abt-wrap">
        <div className="abt-head">
          <SectionEyebrow num="05">{a.eyebrow}</SectionEyebrow>
          <h2 id="abt-title" className="abt-title abt-a" style={at(0.3)}>
            {before}
            <a href="https://www.otech.one/" target="_blank" rel="noopener">One Tech</a>
            {after}
          </h2>
        </div>
        <div className="abt-body">
          {/* One Tech "O" mark, faded, behind the text */}
          <svg className="abt-mark" viewBox="0 0 411 400" aria-hidden="true">
            <path fill="#6F4DFF" fillRule="evenodd" clipRule="evenodd" d="M205.707 0c119.999 0 204.896 82.45 204.896 200-.001 116.733-84.897 200-204.896 200C84.893 400 0 316.733 0 200 0 82.45 84.893 0 205.707 0m0 94.699c-57.958 0-97.958 43.261-97.958 105.301 0 19.016 3.765 36.265 10.646 51.048-6.255 19.097-17.992 37.315-40.05 51.828 25.826 3.473 55.667 2.447 83.855-7.014 12.82 6.106 27.47 9.439 43.507 9.439 57.142 0 97.146-43.261 97.147-105.301 0-62.04-40.004-105.301-97.147-105.301" />
          </svg>
          <p className="abt-text abt-a" style={at(0.5)}>{a.text}</p>
          <p className="abt-contact abt-a" style={at(0.65)}>
            <span>{a.contact}</span>
            <a href={`mailto:${email}`} className="abt-mail">
              {email}
              <span aria-hidden="true">↗</span>
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
