"use client";

import { basePath } from "@milo/lib/base-path";

import { useEffect, useRef } from "react";

// Robot "rules monitor" for the differentiators block (from the "Rules Robot Monitor" design).
// The 3D render is the base; an SVG light layer traced to its wires (1059×1485 grid) sits on top.
// The robot looks at each connected block in turn, light pulses run along the wires into the chip
// and up to the chat screen. The loop only runs while the block is on screen.

// Wire centrelines traced from the render.
const W: Record<string, string> = {
  screen: "M528.5 505.0 L528.5 452.0",
  lR: "M528.5 600.0 L528.5 662.0",
  lU: "M470.0 580.0 L237.0 580.0 Q228.0 580.0 228.0 589.0 L228.0 615.0",
  lF: "M590.0 580.0 L819.0 580.0 Q828.0 580.0 828.0 589.0 L828.0 615.0",
  uR: "M290.0 667.0 L342.0 667.0 Q351.0 667.0 351.0 676.0 L351.0 783.0 Q351.0 792.0 360.0 792.0 L412.0 792.0",
  iR: "M285.0 792.0 L412.0 792.0",
  mR: "M272.0 919.5 L342.0 919.5 Q351.0 919.5 351.0 910.5 L351.0 801.0 Q351.0 792.0 360.0 792.0 L412.0 792.0",
  fR: "M768.0 667.0 L718.0 667.0 Q709.0 667.0 709.0 676.0 L709.0 783.0 Q709.0 792.0 700.0 792.0 L648.0 792.0",
  liR: "M770.0 792.0 L648.0 792.0",
  cR: "M788.0 919.5 L718.0 919.5 Q709.0 919.5 709.0 910.5 L709.0 801.0 Q709.0 792.0 700.0 792.0 L648.0 792.0",
  rD: "M528.5 880.0 L528.5 955.0",
  mG: "M199.0 965.0 L199.0 1011.0 Q199.0 1020.0 208.0 1020.0 L280.0 1020.0",
  gD: "M393.0 1020.0 L460.0 1020.0",
  c2D: "M668.0 1020.0 L600.0 1020.0",
  cC2: "M857.0 965.0 L857.0 1011.0 Q857.0 1020.0 848.0 1020.0 L785.0 1020.0",
  dChip: "M528.5 1065.0 L528.5 1135.0",
};

// Each block: where the robot looks (c), sight-line scale (s), and the wires it lights
// (1 = run the wire in reverse so light flows toward the robot / chip).
const T: Record<string, { c: [number, number]; s: number; w: [string, number][] }> = {
  layers: { c: [530, 550], s: 0.85, w: [["lR", 0]] },
  users: { c: [225, 662], s: 1, w: [["uR", 0], ["lU", 1]] },
  image: { c: [215, 790], s: 1, w: [["iR", 0]] },
  mic: { c: [205, 914], s: 1, w: [["mR", 0], ["mG", 1]] },
  gear: { c: [336, 1014], s: 0.85, w: [["gD", 0], ["mG", 1]] },
  doc: { c: [530, 1010], s: 0.95, w: [["rD", 1], ["dChip", 0]] },
  check2: { c: [726, 1014], s: 0.85, w: [["c2D", 0], ["cC2", 1]] },
  check: { c: [855, 912], s: 1, w: [["cR", 0], ["cC2", 0]] },
  list: { c: [842, 790], s: 1, w: [["liR", 0]] },
  funnel: { c: [833, 662], s: 1, w: [["fR", 0], ["lF", 1]] },
};

const BOX: Record<string, [number, number, number, number]> = {
  layers: [472, 502, 590, 595], users: [158, 615, 290, 710], image: [145, 738, 285, 835],
  mic: [135, 863, 272, 965], gear: [280, 968, 395, 1065], doc: [460, 952, 600, 1065],
  check2: [670, 968, 785, 1065], check: [788, 863, 925, 965], list: [770, 738, 910, 835],
  funnel: [768, 615, 900, 710],
};

const SCAN = ["layers", "users", "image", "mic", "gear", "doc", "check2", "check", "list", "funnel"];
const EYE = [516, 728];

// Chat messages on the screen, in the screen panel's own coordinates (515×293).
// [side, x, width, y]: l = customer, r = Milo.
const MSG: ["l" | "r", number, number, number][] = [["l", 37, 275, 28], ["r", 168, 317, 96], ["l", 37, 247, 162], ["r", 172, 313, 225]];
const BH = 52;
function bubblePath(side: "l" | "r", u0: number, w: number, v0: number) {
  const u1 = u0 + w, r = 26, v1 = v0 + BH;
  const body = `M${u0 + r} ${v0} H${u1 - r} A${r} ${r} 0 0 1 ${u1} ${v0 + r} A${r} ${r} 0 0 1 ${u1 - r} ${v1} H${u0 + r} A${r} ${r} 0 0 1 ${u0} ${v0 + r} A${r} ${r} 0 0 1 ${u0 + r} ${v0}Z`;
  const tail = side === "l"
    ? `M${u0 + 6} ${v1 - 16} Q${u0 + 4} ${v1 - 2} ${u0 - 13} ${v1 + 3} Q${u0 + 10} ${v1 + 4} ${u0 + 30} ${v1 - 1}Z`
    : `M${u1 - 6} ${v1 - 16} Q${u1 - 4} ${v1 - 2} ${u1 + 13} ${v1 + 5} Q${u1 - 10} ${v1 + 4} ${u1 - 30} ${v1 - 1}Z`;
  return body + " " + tail;
}
const TYPING_PATH = bubblePath("l", 37, 84, 28);

export function RobotMonitor({ label }: { label: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; // static render only

    const q = <E extends Element>(s: string) => svg.querySelector(s) as E;
    const world = q<SVGGElement>(".rm-world");
    const sight = q<SVGPathElement>(".rm-sight");
    const eyes = q<SVGGElement>(".rm-eye");
    const lids = q<SVGGElement>(".rm-lids");
    const chip = q<SVGEllipseElement>(".rm-chip");
    const sheen = q<SVGRectElement>(".rm-sheen");
    const pr1 = q<SVGEllipseElement>(".rm-pr1");
    const pr2 = q<SVGEllipseElement>(".rm-pr2");

    const P: Record<string, { els: [SVGPathElement, number][]; len: number }> = {};
    for (const k of Object.keys(W)) {
      const [a, b, c] = Array.from(q(`[data-pk="${k}"]`).children) as SVGPathElement[];
      P[k] = { els: [[a, 70], [b, 48], [c, 30]], len: c.getTotalLength() };
    }
    const glows: Record<string, Element> = {};
    svg.querySelectorAll("[data-glow]").forEach((g) => (glows[g.getAttribute("data-glow")!] = g));

    svg.dataset.js = "1";
    let token = 0;
    let shown = false;
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const sleep = (ms: number, t: number) =>
      new Promise<void>((res, rej) => setTimeout(() => (t === token ? res() : rej(0)), ms));

    function pulse(key: string, t: number, dur = 900, rev = false) {
      const { els, len } = P[key];
      const t0 = performance.now(), max = 70;
      els.forEach(([e, tail]) => (e.style.strokeDasharray = `${tail} ${len + max * 3}`));
      return new Promise<void>((res) => {
        (function f(now: number) {
          const p = t === token ? Math.min(1, (now - t0) / dur) : 1;
          const head = ease(p) * (len + max);
          els.forEach(([e, tail], i) => {
            e.style.strokeDashoffset = String(rev ? -(len - head) : tail - head);
            e.style.opacity = p < 1 ? (i === 0 ? "0.75" : "1") : "0";
          });
          if (p < 1) requestAnimationFrame(f);
          else res();
        })(t0);
      });
    }
    function retrig(el: SVGElement) {
      el.classList.remove("go");
      void (el as SVGGraphicsElement).getBBox();
      el.classList.add("go");
    }
    function look(k: string) {
      const [tx, ty] = T[k].c, dx = tx - EYE[0], dy = ty - EYE[1], d = Math.hypot(dx, dy);
      const sx = EYE[0] + (dx / d) * 34, sy = EYE[1] + (dy / d) * 34;
      const ex = tx - (dx / d) * 72 * T[k].s, ey = ty - (dy / d) * 52 * T[k].s;
      sight.setAttribute("d", `M${sx.toFixed(1)} ${sy.toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)}`);
      sight.classList.add("on");
      const mx = Math.max(-1, Math.min(1, dx / 260)) * 5, my = Math.max(-1, Math.min(1, dy / 300)) * 3.2;
      eyes.style.transform = `translate(${mx}px,${my}px)`;
    }
    function blink() {
      lids.style.transform = "scaleY(.12)";
      setTimeout(() => (lids.style.transform = ""), 120);
    }
    function reset() {
      sight.classList.remove("on");
      Object.values(glows).forEach((g) => g.classList.remove("on"));
      chip.style.opacity = "0";
      eyes.style.transform = "";
      Object.values(P).forEach(({ els }) => els.forEach(([e]) => (e.style.opacity = "0")));
    }

    async function loop(t: number, intro: boolean) {
      if (intro) await sleep(1300, t);
      svg.dataset.ready = "1";
      await sleep(500, t);
      for (;;) {
        retrig(pr1);
        setTimeout(() => t === token && retrig(pr2), 650);
        for (let i = 0; i < SCAN.length; i++) {
          const k = SCAN[i];
          look(k);
          await sleep(520, t);
          glows[k].classList.add("on");
          T[k].w.forEach(([w, r]) => pulse(w, t, 950, !!r));
          if (i === 3 || i === 7) blink();
          await sleep(820, t);
          glows[k].classList.remove("on");
        }
        sight.classList.remove("on");
        eyes.style.transform = "translate(1px,3px)";
        retrig(pr1);
        await pulse("rD", t, 700);
        await pulse("dChip", t, 650);
        if (t !== token) return;
        chip.style.opacity = "0.35";
        await sleep(700, t);
        eyes.style.transform = "translate(3px,-3px)";
        await pulse("lR", t, 600, true);
        await pulse("screen", t, 650);
        if (t !== token) return;
        retrig(sheen);
        await sleep(1600, t);
        chip.style.opacity = "0";
        blink();
        await sleep(1300, t);
      }
    }

    // Chat: a continuous feed. The customer types, the message appears, Milo answers; once the
    // screen is full, older messages scroll up and fade out, so the screen is never empty.
    const track = q<SVGGElement>(".rm-track");
    const typingPos = q<SVGGElement>(".rm-typing-pos").cloneNode(true) as SVGGElement;
    const typing = typingPos.firstElementChild as SVGGElement;
    track.appendChild(typingPos);
    const SLOT = 66, Y0 = 28, VISIBLE = 4;
    const live: Element[] = [];
    let k = 0, top = 0;
    function addBubble(instant: boolean) {
      const i = k % MSG.length;
      const NS = "http://www.w3.org/2000/svg";
      // outer group holds the position (attribute); inner group animates (CSS transform)
      const pos = document.createElementNS(NS, "g");
      pos.setAttribute("class", "rm-slot");
      pos.setAttribute("transform", `translate(0 ${Y0 + SLOT * k - MSG[i][3]})`);
      const g = q(`.rm-chat .rm-bub:nth-of-type(${i + 1})`).cloneNode(true) as SVGGElement;
      g.classList.remove("on");
      pos.appendChild(g);
      track.insertBefore(pos, typingPos);
      if (instant) g.classList.add("on");
      else requestAnimationFrame(() => requestAnimationFrame(() => g.classList.add("on")));
      live.push(pos);
      k++;
    }
    function scrollIfFull() {
      if (k - top < VISIBLE) return;
      top++;
      track.style.transform = `translateY(${-top * SLOT}px)`;
      const old = live.shift();
      if (old) {
        old.classList.add("gone");
        setTimeout(() => old.remove(), 800);
      }
    }
    async function chatLoop(t: number) {
      if (k === 0) for (let i = 0; i < 3; i++) addBubble(true); // start with a conversation already on screen
      for (;;) {
        await sleep(700, t);
        scrollIfFull();
        const side = MSG[k % MSG.length][0];
        if (side === "l") {
          typingPos.setAttribute("transform", `translate(0 ${SLOT * k})`);
          typing.classList.add("on");
          await sleep(1100, t);
          typing.classList.remove("on");
          await sleep(120, t);
        }
        addBubble(false);
        await sleep(side === "l" ? 500 : 900, t);
      }
    }

    const io = new IntersectionObserver(
      ([e]) => {
        token++;
        reset();
        typing.classList.remove("on");
        if (!e.isIntersecting) {
          delete svg.dataset.run;
          return;
        }
        svg.dataset.run = "1";
        const intro = !shown;
        if (intro) {
          shown = true;
          svg.dataset.shown = "1";
          world.classList.add("rm-in");
        }
        loop(token, intro).catch(() => {});
        chatLoop(token).catch(() => {});
      },
      { threshold: 0.2 },
    );
    io.observe(svg);
    return () => {
      io.disconnect();
      token++;
    };
  }, []);

  return (
    <svg ref={svgRef} className="rm" viewBox="0 0 1059 1485" preserveAspectRatio="xMidYMid meet" role="img" aria-label={label}>
      <defs>
        <filter id="rm-b1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.2" /></filter>
        <filter id="rm-b5" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id="rm-b9" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9" /></filter>
        <filter id="rm-b14" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="14" /></filter>
        <radialGradient id="rm-hot"><stop offset="0" stopColor="#ffffff" /><stop offset=".3" stopColor="#7ff1ec" stopOpacity=".9" /><stop offset="1" stopColor="#0BD0C9" stopOpacity="0" /></radialGradient>
        <radialGradient id="rm-eyeG"><stop offset="0" stopColor="#f2fffe" /><stop offset=".55" stopColor="#8ef0ea" /><stop offset="1" stopColor="#0BD0C9" /></radialGradient>
        <radialGradient id="rm-visor"><stop offset="0" stopColor="#0e3d3e" /><stop offset=".7" stopColor="#0f4344" /><stop offset="1" stopColor="#0f4344" stopOpacity="0" /></radialGradient>
        <linearGradient id="rm-sheenG" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".9" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <linearGradient id="rm-bubL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fbfbfb" /><stop offset="1" stopColor="#e7e9ea" /></linearGradient>
        <linearGradient id="rm-bubR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#eef9f7" /><stop offset="1" stopColor="#d3ebe8" /></linearGradient>
        <filter id="rm-bshadow" x="-10%" y="-30%" width="120%" height="180%"><feGaussianBlur stdDeviation="3.5" /></filter>
        <clipPath id="rm-panel"><rect x="6" y="6" width="503" height="281" rx="16" /></clipPath>
        <clipPath id="rm-screen"><path d="M225 32 L870 200 Q905 210 905 245 L905 515 Q905 550 870 545 L235 395 Q205 388 205 355 L205 60 Q205 28 225 32 Z" /></clipPath>
      </defs>
      <g className="rm-world">
        <image href={`${basePath}/img/rules-robot-v3.webp`} x="0" y="0" width="1059" height="1485" />
        <g clipPath="url(#rm-screen)">
          <rect className="rm-sheen" x="220" y="40" width="190" height="620" fill="url(#rm-sheenG)" transform="skewX(-18)" />
        </g>
        <g transform="matrix(1 0.2777 0.00683 1 362 102)">
          <g clipPath="url(#rm-panel)">
            <g className="rm-chat">
              {MSG.map(([side, u0, w, v0], i) => {
                const d = bubblePath(side, u0, w, v0);
                const tone = side === "l" ? "rgba(120,132,136,.28)" : "rgba(11,160,155,.30)";
                return (
                  <g key={i} className={`rm-bub ${side}`}>
                    <path d={d} fill="rgba(40,70,75,.20)" filter="url(#rm-bshadow)" transform="translate(2 6)" />
                    <path d={d} fill={side === "l" ? "url(#rm-bubL)" : "url(#rm-bubR)"} />
                    <path d={d} fill="none" stroke="rgba(255,255,255,.85)" strokeWidth={1.4} />
                    <rect className="rm-bar" x={u0 + 24} y={v0 + 15} width={w * 0.62} height={7} rx={3.5} fill={tone} />
                    <rect className="rm-bar rm-bar2" x={u0 + 24} y={v0 + 29} width={w * 0.38} height={7} rx={3.5} fill={tone} />
                  </g>
                );
              })}
              <g className="rm-typing-pos">
                <g className="rm-typing">
                  <path d={TYPING_PATH} fill="url(#rm-bubL)" />
                  <path d={TYPING_PATH} fill="none" stroke="rgba(255,255,255,.85)" strokeWidth={1.4} />
                  <g>{[62, 79, 96].map((x) => <circle key={x} cx={x} cy={54} r={4.6} fill="#9aa4a7" />)}</g>
                </g>
              </g>
            </g>
            {/* live feed (built by the effect); the static chat above is the no-JS / reduced-motion fallback */}
            <g className="rm-track" />
          </g>
        </g>
        <circle className="rm-dot" cx="857" cy="243" r="9" fill="url(#rm-hot)" />
        <ellipse className="rm-chip" cx="530" cy="1250" rx="150" ry="80" fill="#0BD0C9" opacity="0" filter="url(#rm-b14)" />
        <g>
          {Object.entries(W).map(([k, d]) => <path key={k} className="rm-stream" d={d} />)}
        </g>
        <ellipse className="rm-pr rm-pr1" cx="530" cy="800" rx="86" ry="34" />
        <ellipse className="rm-pr rm-pr2" cx="530" cy="800" rx="86" ry="34" />
        <path className="rm-sight" />
        <g>
          {Object.entries(BOX).map(([k, [x0, y0, x1, y1]]) => {
            const a = { x: x0, y: y0, width: x1 - x0, height: y1 - y0, rx: 20 };
            return (
              <g key={k} className="rm-tg" data-glow={k}>
                <rect {...a} fill="none" stroke="#0BD0C9" strokeWidth={14} filter="url(#rm-b9)" className="rm-halo" />
                <rect {...a} fill="#0BD0C9" opacity={0.1} className="rm-tint" />
                <rect {...a} fill="none" stroke="#7ff1ec" strokeWidth={2.2} filter="url(#rm-b1)" opacity={0.85} />
              </g>
            );
          })}
        </g>
        <g>
          {Object.entries(W).map(([k, d]) => (
            <g key={k} data-pk={k}>
              <path className="rm-pk rm-pk1" d={d} />
              <path className="rm-pk rm-pk2" d={d} />
              <path className="rm-pk rm-pk3" d={d} />
            </g>
          ))}
        </g>
        <g>
          <ellipse cx="496.3" cy="724.1" rx="12" ry="11.5" fill="url(#rm-visor)" />
          <ellipse cx="535.6" cy="731.1" rx="12" ry="11.5" fill="url(#rm-visor)" />
          <g className="rm-eye">
            <g className="rm-lids">
              <ellipse cx="496.3" cy="724.1" rx="6.4" ry="6.2" fill="url(#rm-eyeG)" />
              <ellipse cx="535.6" cy="731.1" rx="6.4" ry="6.2" fill="url(#rm-eyeG)" />
              <ellipse cx="496.3" cy="724.1" rx="11.5" ry="10.5" fill="#0BD0C9" opacity=".3" filter="url(#rm-b1)" />
              <ellipse cx="535.6" cy="731.1" rx="11.5" ry="10.5" fill="#0BD0C9" opacity=".3" filter="url(#rm-b1)" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
