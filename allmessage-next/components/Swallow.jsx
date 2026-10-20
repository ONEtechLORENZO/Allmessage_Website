'use client';

import { useEffect, useRef } from 'react';
import SwallowSvg, { FOOT_X, FOOT_Y } from './SwallowSvg';

// Once the visitor scrolls past the hero, the swallow flies along and perches on
// headings and cards marked with data-perch (see perchPoint for the options).
export default function Swallow() {
  const birdRef = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bird = birdRef.current, inner = innerRef.current;
    const hero = document.getElementById('home');
    if (!bird || !inner || !hero) return;
    bird.dataset.state = 'fly';

    const pos = { x: innerWidth + 80, y: scrollY + innerHeight * .2 };
    const vel = { x: 0, y: 0 };
    let face = 1, faceTarget = 1, tilt = 0, perch = null, landed = false;
    let lastScroll = 0, visible = false, last = performance.now(), raf;

    function perchPoint(el) {
      let r = el.getBoundingClientRect();
      if (el.dataset.perch === 'text') {
        const range = document.createRange();
        range.selectNodeContents(el);
        r = range.getBoundingClientRect();
      }
      const fx = parseFloat(el.dataset.perchX || '.5');
      const fs = parseFloat(getComputedStyle(el).fontSize);
      let y = r.top + parseFloat(el.dataset.perchDy || '0') * fs;
      if (el.dataset.perchDyH) y += r.height * parseFloat(el.dataset.perchDyH);
      const skew = parseFloat(el.dataset.perchSkew || '0');
      if (skew) y += (1 - fx) * r.width * Math.tan(skew * Math.PI / 180);
      return { x: r.left + r.width * fx + scrollX, y: y + scrollY };
    }

    function choosePerch() {
      const vh = innerHeight;
      let best = null, bestD = Infinity;
      document.querySelectorAll('[data-perch]').forEach(el => {
        const pt = perchPoint(el), vy = pt.y - scrollY;
        if (vy < vh * .1 || vy > vh * .9) return;
        const d = Math.abs(vy - vh * .4);
        if (d < bestD) { bestD = d; best = el; }
      });
      return best;
    }

    const inHero = () => hero.getBoundingClientRect().bottom > innerHeight * .55;

    const onScroll = () => {
      lastScroll = performance.now();
      perch = null;
      landed = false;
    };
    addEventListener('scroll', onScroll, { passive: true });

    function frame(now) {
      const dt = Math.min(now - last, 40) / 1000;
      last = now;
      const w = bird.offsetWidth, h = w * 72 / 120;

      const showBird = !inHero();
      if (showBird !== visible) {
        visible = showBird;
        bird.classList.toggle('is-visible', visible);
        if (visible) { pos.x = scrollX + innerWidth + 80; pos.y = scrollY + innerHeight * .15; vel.x = vel.y = 0; perch = null; landed = false; }
      }

      if (!perch && visible && now - lastScroll > 260) perch = choosePerch();

      let tx, ty;
      if (!visible) { tx = scrollX + innerWidth + 120; ty = scrollY + innerHeight * .1; }
      else if (perch) ({ x: tx, y: ty } = perchPoint(perch));
      else {
        const t = now / 1000;
        tx = scrollX + innerWidth * .84 + Math.sin(t * .9) * 26;
        ty = scrollY + innerHeight * .32 + Math.sin(t * 1.8) * 9;
      }

      if (landed) {
        // Ride along with the perch (e.g. a pricing card lifting on hover).
        const e = 1 - Math.exp(-14 * dt);
        pos.x += (tx - pos.x) * e; pos.y += (ty - pos.y) * e; vel.x = vel.y = 0;
      } else {
        // Critically damped spring: glides in and settles without overshoot.
        const k = perch ? 24 : 9, c = 2 * Math.sqrt(k);
        vel.x += ((tx - pos.x) * k - vel.x * c) * dt;
        vel.y += ((ty - pos.y) * k - vel.y * c) * dt;
        const sp = Math.hypot(vel.x, vel.y), max = 1500;
        if (sp > max) { vel.x *= max / sp; vel.y *= max / sp; }
        pos.x += vel.x * dt; pos.y += vel.y * dt;
        if (perch && Math.hypot(tx - pos.x, ty - pos.y) < 10 && Math.hypot(vel.x, vel.y) < 140) landed = true;
      }
      bird.dataset.state = landed ? 'perch' : 'fly';

      // Turn only on clear horizontal movement, and keep the heading after landing.
      if (!landed && Math.abs(vel.x) > 90) faceTarget = vel.x > 0 ? 1 : -1;
      face += (faceTarget - face) * (1 - Math.exp(-10 * dt));
      const tiltTarget = landed ? 0 : Math.max(-20, Math.min(20, vel.y * .025)) * faceTarget;
      tilt += (tiltTarget - tilt) * (1 - Math.exp(-8 * dt));

      bird.style.transform = `translate3d(${pos.x - w * FOOT_X}px, ${pos.y - h * FOOT_Y}px, 0)`;
      inner.style.transform = `scaleX(${face.toFixed(3)}) rotate(${tilt.toFixed(2)}deg)`;
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', onScroll);
      bird.classList.remove('is-visible');
    };
  }, []);

  // The layer clips the bird at the screen edges, so waiting off-screen never widens the page on phones.
  return (
    <div className="swallow-layer">
      <div className="swallow" ref={birdRef} aria-hidden="true">
        <SwallowSvg innerRef={innerRef} />
      </div>
    </div>
  );
}
