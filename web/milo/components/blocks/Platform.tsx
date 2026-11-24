"use client";

import { Fragment, useEffect, useRef } from "react";
import type { Dictionary } from "@milo/lib/dictionaries";
import type { BoxCluster } from "./boxCluster";
import { SectionEyebrow } from "./SectionEyebrow";
import "./platform.css";

// Block: platform features around a 3D box cluster.
// Left: three features, centre: boxes whose rows and columns slide like a Rubik's cube, right: two features.

type Props = { platform: Dictionary["platform"] };

const at = (s: number) => ({ "--d": `${s.toFixed(2)}s` }) as React.CSSProperties;

function Words({ text, start, step }: { text: string; start: number; step: number }) {
  return (
    <>
      {text.split(/\s+/).filter(Boolean).map((w, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="plt-w" style={at(start + i * step)}>{w}</span>
        </Fragment>
      ))}
    </>
  );
}

function Item({ item, delay }: { item: { title: string; text: string }; delay: number }) {
  return (
    <li className="plt-item">
      <h3 className="plt-name"><Words text={item.title} start={delay} step={0.07} /></h3>
      <p className="plt-desc plt-a" style={at(delay + 0.18)}>{item.text}</p>
    </li>
  );
}

export function Platform({ platform: c }: Props) {
  const ref = useRef<HTMLElement>(null);
  const artRef = useRef<HTMLDivElement>(null);

  // text reveal
  useEffect(() => {
    const el = ref.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.js = "1";
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.dataset.go = "1"; io.disconnect(); } }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 3D boxes, loaded only when the block is near the screen
  useEffect(() => {
    const vp = artRef.current!;
    let cluster: BoxCluster | undefined, dead = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      import("./boxCluster").then(({ createBoxCluster }) => { if (!dead) cluster = createBoxCluster(vp, "rubik"); });
    }, { rootMargin: "400px 0px" });
    io.observe(vp);
    return () => { dead = true; io.disconnect(); cluster?.dispose(); };
  }, []);

  const left = c.items.slice(0, 3), right = c.items.slice(3);
  return (
    <section ref={ref} id="platform" className="plt" aria-labelledby="plt-title">
      <div className="plt-wrap">
        <div className="plt-head">
          <SectionEyebrow num="04">{c.eyebrow}</SectionEyebrow>
          <h2 id="plt-title" className="plt-title"><Words text={c.title} start={0.3} step={0.08} /></h2>
        </div>
        <ul className="plt-list plt-left">
          {left.map((item, i) => <Item key={item.title} item={item} delay={0.3 + i * 0.22} />)}
        </ul>
        <div ref={artRef} className="plt-art" role="img" aria-label={c.label} />
        <ul className="plt-list plt-right">
          {right.map((item, i) => <Item key={item.title} item={item} delay={0.55 + i * 0.22} />)}
        </ul>
      </div>
    </section>
  );
}
