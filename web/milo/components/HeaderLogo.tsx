import "./header-logo.css";

// The animated "milo" wordmark from the hero, small, for the header (CSS only, no JavaScript):
// the letters draw in once, then the white knob on the "o" keeps stepping around the ring.
const CX = 385, CY = 150;
const n = (i: number) => ({ "--n": i }) as React.CSSProperties;

export function HeaderLogo() {
  return (
    <svg className="hl" viewBox="0 20 455 222" aria-hidden="true" focusable="false">
      <path className="hl-s" style={n(0)} pathLength={1} d="M20 100V200" />
      <path className="hl-s" style={n(1)} pathLength={1} d="M20 135a35 35 0 0 1 70 0V200" />
      <path className="hl-s" style={n(2)} pathLength={1} d="M90 135a35 35 0 0 1 70 0V200" />
      <path className="hl-s" style={n(3)} pathLength={1} d="M215 100V200" />
      <path className="hl-s" style={n(4)} pathLength={1} d="M270 40V176a24 24 0 0 0 24 24" />
      <circle className="hl-s" style={n(5)} pathLength={1} cx={CX} cy={CY} r="50" transform={`rotate(-90 ${CX} ${CY})`} />
      <g className="hl-knob-pop">
        <circle className="hl-knob" cx={CX} cy={CY - 50} r="8" />
      </g>
    </svg>
  );
}
