"use client";

import { Fragment, useEffect, useRef } from "react";
import type { Dictionary } from "@milo/lib/dictionaries";
import { RobotMonitor } from "./RobotMonitor";
import "./rules.css";

// Block: "Language from the model. Decisions from your rules."
// Left: headline and the three differentiators (staggered). Right: the robot rules monitor.
// Text reveals word by word (rise + fade + un-blur) when the block scrolls into view.

type Props = { different: Dictionary["different"] };

const at = (s: number) => ({ "--d": `${s.toFixed(2)}s` }) as React.CSSProperties;

function Words({ text, start, step, className = "dfr-w" }: { text: string; start: number; step: number; className?: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className={className} style={at(start + i * step)}>{w}</span>
        </Fragment>
      ))}
    </>
  );
}

export function RulesFlow({ different }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; // text simply stays visible
    el.dataset.js = "1"; // data attributes, because React manages className
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.dataset.go = "1";
        io.disconnect();
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [s1, s2 = ""] = (different.title.match(/[^.!?]+[.!?]+/g) ?? [different.title]).map((s) => s.trim());
  const s1Words = s1.split(/\s+/).length;
  const s2Start = 0.4 + s1Words * 0.07 + 0.08;

  return (
    <section ref={ref} id="differentiators" className="dfr" aria-labelledby="dfr-title">
      <div className="dfr-wrap">
        <div className="dfr-copy">
          <p className="dfr-eyebrow">
            <span className="dfr-chip dfr-a dfr-pop" style={at(0.05)}>02</span>
            <span aria-hidden="true" className="dfr-dash dfr-a" style={at(0.15)} />
            <span className="dfr-a dfr-track" style={at(0.22)}>{different.eyebrow}</span>
          </p>

          <h2 id="dfr-title" className="dfr-title">
            <span className="dfr-s1"><Words text={s1} start={0.4} step={0.07} /></span>{" "}
            <span className="dfr-s2"><Words text={s2} start={s2Start} step={0.07} /></span>
          </h2>

          <ol className="dfr-list">
            {different.items.map((item, i) => {
              const b = 1.05 + i * 0.26;
              return (
                <li key={item.title} className={`dfr-item dfr-item-${i + 1}`}>
                  <div className="dfr-top">
                    <span aria-hidden="true" className="dfr-num">
                      {String(i + 1).padStart(2, "0").split("").map((c, k) => (
                        <span key={k} className="dfr-mask">
                          <span className="dfr-a dfr-digit" style={at(b + k * 0.07)}>{c}</span>
                        </span>
                      ))}
                    </span>
                    <span className="dfr-tag dfr-a dfr-wipe" style={at(b + 0.2)}>{item.tag}</span>
                  </div>
                  <h3 className="dfr-name">
                    <Words text={item.title} start={b + 0.12} step={0.05} className="dfr-w dfr-w-sm" />
                  </h3>
                  <p className="dfr-desc dfr-a dfr-soft" style={at(b + 0.32)}>{item.text}</p>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="dfr-art">
          <RobotMonitor label={different.flowLabel} />
        </div>
      </div>
    </section>
  );
}
