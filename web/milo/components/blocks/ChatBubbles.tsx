"use client";

import { useEffect, useRef } from "react";
import "./bubbles.css";

// Glass chat bubbles that pop up one after another, then fade and replay every 7 seconds.
// The loop only runs while the animation is on screen.

const CYCLE = 7000; // ms, one full replay
const FADE_AT = 6300; // ms, start fading out so the next round starts clean

type Bubble = { x: number; y: number; w: number; h: number; z: number; d: number; fy: number; fx?: number; fd: number; kind: "aqua" | "glass"; tail?: "tr" | "tl"; r?: number; tx?: number; ox: string };

// Positions on the 371×441 design grid; d = appearance delay (s).
const BUBBLES: Bubble[] = [
  { x: 105, y: 127, w: 102, h: 63, z: 1, d: 0.1, fy: -2, fd: 7.5, kind: "aqua", ox: "30%" },
  { x: 180, y: 107, w: 63, h: 43, z: 3, d: 0.32, fy: -1.6, fx: 0.6, fd: 6.2, kind: "glass", tail: "tr", r: 6, tx: 46, ox: "80%" },
  { x: 35, y: 170, w: 158, h: 102, z: 4, d: 0.54, fy: -2.4, fd: 8, kind: "glass", tail: "tr", r: 9, tx: 116, ox: "78%" },
  { x: 167, y: 237, w: 123, h: 81, z: 2, d: 0.76, fy: -2, fx: -0.5, fd: 7, kind: "aqua", tail: "tr", r: 8, tx: 96, ox: "80%" },
  { x: 218, y: 177, w: 122, h: 78, z: 5, d: 0.96, fy: -2.2, fd: 6.8, kind: "glass", tail: "tl", r: 9, tx: 15, ox: "15%" },
  { x: 92, y: 320, w: 56, h: 42, z: 3, d: 1.16, fy: -1.4, fd: 6, kind: "aqua", tail: "tl", r: 6, tx: 4, ox: "12%" },
  { x: 133, y: 305, w: 112, h: 72, z: 6, d: 1.34, fy: -2, fx: 0.4, fd: 7.6, kind: "glass", tail: "tr", r: 8, tx: 86, ox: "80%" },
];

// Turns { x: 105, d: 0.1 } into CSS variables { "--x": "105", "--d": "0.1s" } (d and fd are seconds).
const vars = (o: Record<string, string | number | undefined>) =>
  Object.fromEntries(
    Object.entries(o)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [`--${k}`, k === "d" || k === "fd" ? `${v}s` : String(v)]),
  ) as React.CSSProperties;

export function ChatBubbles({ label }: { label: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current!, scene = sceneRef.current!;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timers: ReturnType<typeof setTimeout>[] = [];
    const clear = () => { timers.forEach(clearTimeout); timers = []; };

    function run() {
      clear();
      scene.classList.remove("cb-out");
      stage.classList.remove("cb-play");
      void stage.offsetWidth; // restart the CSS animations
      stage.classList.add("cb-play");
      if (still) return;
      timers.push(setTimeout(() => scene.classList.add("cb-out"), FADE_AT));
      timers.push(setTimeout(run, CYCLE));
    }

    // Only loop while visible; start fresh each time it scrolls back into view.
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? run() : clear()), { threshold: 0.2 });
    io.observe(stage);
    return () => { io.disconnect(); clear(); };
  }, []);

  return (
    <div className="cb-frame">
      <div ref={stageRef} className="cb-stage" role="img" aria-label={label}>
        <div ref={sceneRef} className="cb-scene">
          {BUBBLES.map((b, i) => (
            <div key={i} className="cb-b" style={vars({ x: b.x, y: b.y, w: b.w, h: b.h, z: b.z, d: b.d, fy: b.fy, fx: b.fx, fd: b.fd })}>
              <div
                className={`cb-m ${b.kind === "aqua" ? "cb-aqua" : "cb-glass"} ${b.tail ? `cb-${b.tail}` : ""}`}
                style={vars({ r: b.r, tx: b.tx, ox: b.ox })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
