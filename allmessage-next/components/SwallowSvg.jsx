// The AllMessage swallow. Wings swap between folded and flapping via the parent's data-state.
export default function SwallowSvg({ innerRef }) {
  return (
    <div className="swallow-inner" ref={innerRef}>
      <svg viewBox="0 -12 120 72" xmlns="http://www.w3.org/2000/svg">
        <path className="wing-flap far" fill="#1f5fb8" d="M68 27 C60 12 47 1 26 -6 C42 7 52 19 60 30 Z" />
        <g className="swallow-body">
          <path fill="#2a3650" d="M53 32 L3 43 L51 36 Z" />
          <path fill="#2a3650" d="M51 35 L7 52 L54 38 Z" />
          <path fill="#36445f" d="M46 34 C58 26 72 20 84 18 C92 17 97 20 98 24 C99 29 94 34 86 37 C74 41 58 40 46 34 Z" />
          <path fill="#56657f" d="M60 37 C70 39 80 38 89 34 C85 40 71 42 60 37 Z" />
          <circle fill="#27324a" cx="90" cy="22" r="8" />
          <path fill="#27324a" d="M97 20.5 L104 23 L97 25 Z" />
          <circle fill="#5fd4ff" cx="93" cy="20" r="1.7" />
          <path className="wing-fold" fill="#2f8be5" d="M48 33 C58 23 72 16 88 15 C92 15 94 17 92 19 C82 23 70 29 56 34 Z" />
          <path className="wing-fold" fill="#6fb6f5" opacity=".55" d="M62 26 C70 20 78 17 87 16 C80 20 72 24 64 27 Z" />
        </g>
        <path className="wing-flap" fill="#2f8be5" d="M72 26 C66 10 54 -2 32 -10 C48 5 58 18 64 30 Z" />
      </svg>
    </div>
  );
}

// Point of the bird that touches the perch, as a fraction of its box.
export const FOOT_X = 72 / 120;
export const FOOT_Y = (40 + 12) / 72;
