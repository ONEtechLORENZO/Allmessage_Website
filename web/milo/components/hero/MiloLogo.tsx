"use client";

import { useEffect, useRef } from "react";
import "./milo-logo.css";

// Class names used by milo-logo.css
const s = {logo: "milo-logo", night: "milo-night", stroke: "milo-stroke", play: "milo-play", dial: "milo-dial", knobPop: "milo-knob-pop", knob: "milo-knob", long: "milo-long", instant: "milo-instant", msg: "milo-msg", seen: "milo-seen", active: "milo-active"} as const;

const ANGLES = [30, 60, 90, 120]; // knob stops, degrees clockwise from the top
const PAUSE = 2400; // ms between steps
const CX = 385, CY = 150;
const rad = (g: number) => (g * Math.PI) / 180;

type Props = {
  messages: string[];
  showMessages: boolean;
  dialLabel: string;
  night: boolean;
  /** false = letters stay hidden; true = the drawing animation starts */
  started: boolean;
};

export function MiloLogo({ messages, showMessages, dialLabel, night, started }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const knobRef = useRef<SVGGElement>(null);
  const lettersRef = useRef<SVGGElement>(null);
  const dialRef = useRef<SVGGElement>(null);
  const msgRefs = useRef<(SVGTextElement | null)[]>([]);

  useEffect(() => {
    if (!started) return;
    const svg = svgRef.current!, knob = knobRef.current!, dial = dialRef.current!, letters = lettersRef.current!;
    const texts = () => msgRefs.current.filter(Boolean) as SVGTextElement[];
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let current = -1, deg = 0;
    let loop: ReturnType<typeof setInterval> | undefined;
    let resume: ReturnType<typeof setTimeout> | undefined;
    let begin: ReturnType<typeof setTimeout> | undefined;
    let reveal: ReturnType<typeof setTimeout> | undefined;

    // The knob always turns clockwise, with a small snap at every stop.
    function go(i: number) {
      let target = Math.floor(deg / 360) * 360 + ANGLES[i];
      if (target <= deg) target += 360;
      const long = target - deg > 120;
      knob.classList.toggle(s.long, long);
      deg = target; current = i;
      knob.style.transform = `rotate(${deg}deg)`;
      clearTimeout(reveal);
      reveal = setTimeout(() => texts().forEach((t, k) => {
        t.classList.toggle(s.active, k === i);
        if (k === i) t.classList.add(s.seen);
      }), long ? 800 : 380);
    }
    const next = () => go((current + 1) % ANGLES.length);
    const run = () => { clearInterval(loop); loop = setInterval(next, PAUSE); };
    const holdForAWhile = () => { clearInterval(loop); clearTimeout(resume); resume = setTimeout(run, 6000); };
    const startLoop = () => { clearTimeout(begin); begin = setTimeout(() => { next(); run(); }, still ? 100 : 2200); };

    function restart() {
      clearInterval(loop); clearTimeout(resume);
      current = -1; deg = 0;
      knob.classList.add(s.instant); knob.style.transform = "rotate(0deg)";
      texts().forEach((t) => t.classList.remove(s.active, s.seen));
      svg.classList.remove(s.play); void svg.getBoundingClientRect();
      knob.classList.remove(s.instant); svg.classList.add(s.play);
      startLoop();
    }

    const onDial = () => { next(); holdForAWhile(); };
    const onKey = (e: KeyboardEvent) => {
      if (["Enter", " ", "ArrowRight"].includes(e.key)) { e.preventDefault(); next(); holdForAWhile(); }
    };
    const msgHandlers = texts().map((t, i) => {
      const h = () => { go(i); holdForAWhile(); };
      t.addEventListener("click", h);
      return () => t.removeEventListener("click", h);
    });
    dial.addEventListener("click", onDial);
    dial.addEventListener("keydown", onKey);
    letters.addEventListener("click", restart); // click the letters: animation starts over
    startLoop();

    return () => {
      clearInterval(loop); clearTimeout(resume); clearTimeout(begin); clearTimeout(reveal);
      dial.removeEventListener("click", onDial); dial.removeEventListener("keydown", onKey);
      letters.removeEventListener("click", restart);
      msgHandlers.forEach((off) => off());
    };
  }, [started]);

  return (
    <svg
      ref={svgRef}
      className={`${s.logo} ${started ? s.play : ""} ${night ? s.night : ""}`}
      viewBox="0 20 455 222"
      role="img"
      aria-label="milo"
    >
      <g ref={lettersRef} style={{ cursor: "pointer" }}>
        <path className={s.stroke} style={{ "--n": 0 } as React.CSSProperties} pathLength={1} d="M20 100V200" />
        <path className={s.stroke} style={{ "--n": 1 } as React.CSSProperties} pathLength={1} d="M20 135a35 35 0 0 1 70 0V200" />
        <path className={s.stroke} style={{ "--n": 2 } as React.CSSProperties} pathLength={1} d="M90 135a35 35 0 0 1 70 0V200" />
        <path className={s.stroke} style={{ "--n": 3 } as React.CSSProperties} pathLength={1} d="M215 100V200" />
        <path className={s.stroke} style={{ "--n": 4 } as React.CSSProperties} pathLength={1} d="M270 40V176a24 24 0 0 0 24 24" />
      </g>
      <g ref={dialRef} className={s.dial} tabIndex={0} role="button" aria-label={dialLabel}>
        <circle className={s.stroke} style={{ "--n": 5 } as React.CSSProperties} pathLength={1} cx={CX} cy={CY} r="50" transform={`rotate(-90 ${CX} ${CY})`} />
        <g className={s.knobPop}>
          <g ref={knobRef} className={s.knob}>
            <circle cx={CX} cy="100" r="7.5" />
          </g>
        </g>
      </g>
      <g style={{ display: showMessages ? undefined : "none" }} aria-hidden="true">
        {messages.map((m, i) => (
          <text
            key={m}
            ref={(el) => { msgRefs.current[i] = el; }}
            className={s.msg}
            x={(CX + 88 * Math.sin(rad(ANGLES[i]))).toFixed(1)}
            y={(CY - 88 * Math.cos(rad(ANGLES[i])) + 5).toFixed(1)}
          >
            {m}
          </text>
        ))}
      </g>
    </svg>
  );
}
