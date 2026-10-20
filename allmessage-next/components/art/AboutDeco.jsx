// Static artwork for "Chi siamo": isometric bars and guide lines.
export default function AboutDeco() {
  return (
    <svg className="about-deco" viewBox="0 0 1672 941" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="bar-face" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#eeeef2" /></linearGradient>
        <linearGradient id="bar-side" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#d9dae0" /><stop offset="1" stopColor="#eceef2" /></linearGradient>
        <filter id="bar-shadow" x="-40%" y="-20%" width="200%" height="150%"><fedropshadow dx="10" dy="10" stdDeviation="9" floodColor="#28304a" floodOpacity=".16" /></filter>
      </defs>
      <g className="deco-lines" stroke="#c9cad1" strokeWidth="1.2" fill="none">
        <path pathLength="1" d="M0 590 H1672" stroke="#dedfe4" />
        <path pathLength="1" d="M716 0 L567 322" />
        <path pathLength="1" d="M449 592 L292 941" />
        <path pathLength="1" d="M1471 0 L1424 102" />
        <path pathLength="1" d="M1650 598 L1512 941" />
      </g>
      <g className="deco-bars" filter="url(#bar-shadow)">
        <path fill="url(#bar-side)" d="M616 322 L634 330 L516 598 L498 590 Z" />
        <path fill="url(#bar-face)" d="M568 322 L616 322 L498 590 L450 590 Z" />
        <path fill="url(#bar-side)" d="M700 322 L718 330 L600 598 L582 590 Z" />
        <path fill="url(#bar-face)" d="M652 322 L700 322 L582 590 L534 590 Z" />
        <path fill="url(#bar-side)" d="M1672 468 L1672 540 L1620 598 L1612 594 Z" />
        <path fill="url(#bar-face)" d="M1660 468 L1672 468 L1612 594 L1596 594 Z" />
      </g>
    </svg>
  );
}
