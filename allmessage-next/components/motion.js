'use client';

import { useEffect, useRef, useState } from 'react';

// Scroll-triggered animations only run when the browser supports them and the
// visitor has not asked for reduced motion.
export function canAnimate() {
  return typeof window !== 'undefined'
    && 'IntersectionObserver' in window
    && !matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// One-shot reveal: 'ready' (hidden, waiting) → 'in' (animating) → 'done' (plain styles,
// so hover effects have no leftover delays). The server renders 'ready' so nothing flashes.
export function useReveal(ref, { threshold = .5, duration = 3500, onIn } = {}) {
  const [phase, setPhase] = useState('ready');
  const onInRef = useRef(onIn);
  onInRef.current = onIn;

  useEffect(() => {
    const el = ref.current;
    if (!el || !canAnimate()) { setPhase('done'); return; }
    let timer;
    const io = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return;
      io.disconnect();
      setPhase('in');
      onInRef.current?.();
      timer = setTimeout(() => setPhase('done'), duration);
    }, { threshold });
    io.observe(el);
    return () => { io.disconnect(); clearTimeout(timer); };
  }, [ref, threshold, duration]);

  return phase;
}

// Class names for the pencil-sketch reveal used by logos, plans and the slider.
export function sketchClass(phase) {
  return phase === 'ready' ? ' sketch-ready' : phase === 'in' ? ' sketch-ready is-drawn' : '';
}

// Keeps the two pencil strokes of a .plan-sketch svg sized to `target`.
// Each stroke is [x, y, width delta, height delta].
export function useSketchRects(svgRef, targetRef, options = {}) {
  const opts = useRef(options);
  opts.current = options;
  useEffect(() => {
    const svg = svgRef.current, target = targetRef.current;
    if (!svg || !target) return;
    const size = () => {
      const { inset = [1, 1, -2, -2], outer = [-3, 2, 4, -1], radius = 22, extraRadius = 2 } = opts.current;
      const w = target.offsetWidth, h = target.offsetHeight;
      const r = typeof radius === 'function' ? radius(target) : radius;
      const [a, b] = svg.querySelectorAll('rect');
      const set = (el, [x, y, dw, dh], rx) => {
        el.setAttribute('x', x); el.setAttribute('y', y);
        el.setAttribute('width', Math.max(0, w + dw)); el.setAttribute('height', Math.max(0, h + dh));
        el.setAttribute('rx', rx);
      };
      set(a, inset, r);
      set(b, outer, r + extraRadius);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(target);
    return () => ro.disconnect();
  }, [svgRef, targetRef]);
}

// Restarts the CSS animation on an element (e.g. the slow zoom on a slide image).
export function restartAnimation(el) {
  if (!el) return;
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';
}

// Hand-drawn outline of a single-line heading that fades into the real text.
export function useTextSketch(ref, id) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !canAnimate()) return;
    let cancelled = false, io, timer, svg, marker;
    const NS = 'http://www.w3.org/2000/svg';

    const setup = () => {
      if (cancelled) return;
      const range = document.createRange();
      range.selectNodeContents(el);
      if (range.getClientRects().length !== 1) return; // only single-line headings
      const text = el.textContent.trim();
      const cs = getComputedStyle(el);
      el.classList.add('text-sketch-host');
      // A zero-size inline marker sits exactly on the text baseline.
      marker = document.createElement('span');
      marker.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
      el.append(marker);
      const place = () => {
        const host = el.getBoundingClientRect(), r = range.getBoundingClientRect();
        return { x: r.left - host.left, y: marker.getBoundingClientRect().top - host.top };
      };
      const { x, y } = place();
      const font = `font-family:${cs.fontFamily};font-size:${cs.fontSize};font-weight:${cs.fontWeight};letter-spacing:${cs.letterSpacing}`;
      svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'text-sketch');
      svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML = `<defs>
          <pattern id="hatch-${id}" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="rgba(39,50,74,.62)" stroke-width="1.5"/></pattern>
          <filter id="pencil-${id}"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="2.2"/></filter>
        </defs>
        <text class="ts-hatch" x="${x}" y="${y}" fill="url(#hatch-${id})" style="${font}"></text>
        <text class="ts-line" x="${x}" y="${y}" filter="url(#pencil-${id})" style="${font}"></text>
        <text class="ts-line" x="${x + 1.5}" y="${y + 1}" filter="url(#pencil-${id})" style="${font};stroke-width:.7;opacity:.5"></text>`;
      svg.querySelectorAll('text').forEach(t => { t.textContent = text; });
      el.append(svg);
      el.classList.add('text-sketch-ready');
      io = new IntersectionObserver(entries => {
        if (!entries.some(e => e.isIntersecting)) return;
        io.disconnect();
        // Re-measure in case fonts or layout settled since setup.
        const p = place();
        svg.querySelectorAll('text').forEach((t, i) => { t.setAttribute('x', p.x + (i === 2 ? 1.5 : 0)); t.setAttribute('y', p.y + (i === 2 ? 1 : 0)); });
        el.classList.add('is-drawn');
        timer = setTimeout(cleanup, 3300);
      }, { threshold: .6 });
      io.observe(el);
    };

    function cleanup() {
      io?.disconnect();
      clearTimeout(timer);
      el.classList.remove('text-sketch-ready', 'is-drawn');
      svg?.remove();
      marker?.remove();
    }

    (document.fonts ? document.fonts.ready : Promise.resolve()).then(setup);
    return () => { cancelled = true; cleanup(); };
  }, [ref, id]);
}
