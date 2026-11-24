"use client";

import { Fragment, useEffect, useRef } from "react";
import type { Dictionary } from "@milo/lib/dictionaries";
import type { BoxCluster } from "./boxCluster";
import { SectionEyebrow } from "./SectionEyebrow";
import "./capabilities.css";

// Block: "Capabilities & evidence".
// Left: a floating cluster of 3D boxes (same boxes as the hero wall), always gently moving.
// Right: the four capabilities in a zig-zag. Text reveals word by word when the block comes into
// view; afterwards a small teal bar keeps cycling from one capability to the next.

type Props = { capabilities: Dictionary["capabilities"] };

const at = (s: number) => ({ "--d": `${s.toFixed(2)}s` }) as React.CSSProperties;

// Paper planes behind the capabilities: one teal leader, a flock of pale planes flowing behind it.
// Positions are in the flight's own frame (x = direction of flight, leader at 0,0).
const FLOCK: { x: number; y: number; o: number; d: number; r: number }[] = [];
{
  let k = 0;
  for (let x = -170; x >= -1640; x -= 88) {
    const spread = 40 + Math.abs(x) * 0.13;
    for (let y = -spread; y <= spread; y += 64) {
      k++;
      if ((k * 7) % 5 === 0) continue; // leave a few gaps, like a real flock
      const jx = ((k * 37) % 23) - 11, jy = ((k * 53) % 19) - 9;
      // o = opacity (fainter far behind), r = when it appears: right after the leader has passed
      FLOCK.push({ x: x + jx, y: y + jy, o: Math.max(0.35, 1 - Math.abs(x) / 2000), d: -((k * 0.61) % 4.2), r: 0.5 + 1.9 * (1 - Math.abs(x) / 1640) });
    }
  }
}

function Plane({ id, light, mid, dark }: { id: string; light: string; mid: string; dark: string }) {
  // pointing along +x, nose at (100, 0)
  return (
    <g id={id}>
      <path d="M100 0 L1 -39.5 L0.2 -10.8 Z" fill={light} />
      <path d="M100 0 L-0.3 35.2 L-0.2 10.8 Z" fill={light} />
      <path d="M100 0 L-0.2 10.8 L-15.8 0.6 Z" fill={dark} />
      <path d="M100 0 L-15.8 0.6 L0.2 -10.8 Z" fill={mid} />
    </g>
  );
}

function Words({ text, start, step, className }: { text: string; start: number; step: number; className: string }) {
  return (
    <>
      {text.split(/\s+/).filter(Boolean).map((w, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className={className} style={at(start + i * step)}>{w}</span>
        </Fragment>
      ))}
    </>
  );
}

export function Capabilities({ capabilities: c }: Props) {
  const ref = useRef<HTMLElement>(null);
  const artRef = useRef<HTMLDivElement>(null);

  // text reveal
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

  // planes run only while the block is on screen
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-run", e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 3D boxes (three.js is loaded only when this block is near the screen)
  useEffect(() => {
    const vp = artRef.current!;
    let cluster: BoxCluster | undefined, dead = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        import("./boxCluster").then(({ createBoxCluster }) => { if (!dead) cluster = createBoxCluster(vp); });
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(vp);
    return () => { dead = true; io.disconnect(); cluster?.dispose(); };
  }, []);

  return (
    <section ref={ref} id="capabilities" className="cap" aria-labelledby="cap-title">
      <div className="cap-wrap">
        <div className="cap-head">
          <SectionEyebrow num="03">{c.eyebrow}</SectionEyebrow>
          <h2 id="cap-title" className="cap-title"><Words text={c.title} start={0.3} step={0.08} className="cap-w" /></h2>
        </div>
        <div ref={artRef} className="cap-art" role="img" aria-label={c.label} />
        <div className="cap-planes" aria-hidden="true">
          <svg viewBox="0 0 1600 760" preserveAspectRatio="xMidYMid slice">
            <defs>
              <Plane id="cap-plane-s" light="#c9f2ef" mid="#9ee6e1" dark="#5fd2ca" />
              <filter id="cap-plane-sh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#0a5c59" floodOpacity=".18" /></filter>
            </defs>
            <g transform="translate(1480 175) rotate(-20)">
              <g>
                {FLOCK.map((p, i) => (
                  <g key={i} className="cap-fl" transform={`translate(${p.x} ${p.y}) scale(.46)`} style={{ "--o": p.o, "--r": `${p.r.toFixed(2)}s` } as React.CSSProperties}>
                    <g className="cap-fly" style={{ "--dl": `${p.d.toFixed(2)}s` } as React.CSSProperties}><use href="#cap-plane-s" /></g>
                  </g>
                ))}
              </g>
              <g className="cap-lead-in">
                <g className="cap-lead" filter="url(#cap-plane-sh)">
                  <g transform="translate(-130 0) scale(2)"><Plane id="cap-plane-l" light="#0bd0c9" mid="#09b5af" dark="#078a86" /></g>
                </g>
              </g>
            </g>
          </svg>
        </div>
        <ol className="cap-list">
          {c.items.map((item, i) => {
            const b = 0.55 + i * 0.16;
            return (
              <li key={item.title} className={`cap-item cap-item-${i + 1}`} style={{ "--i": i } as React.CSSProperties}>
                <span aria-hidden="true" className="cap-bar cap-a" style={at(b)} />
                <h3 className="cap-name"><Words text={item.title} start={b + 0.05} step={0.06} className="cap-w cap-w-sm" /></h3>
                <p className="cap-desc cap-a cap-soft" style={at(b + 0.2)}>{item.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
