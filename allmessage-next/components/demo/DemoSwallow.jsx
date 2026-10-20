'use client';

import { useEffect, useImperativeHandle, useRef } from 'react';
import SwallowSvg, { FOOT_X, FOOT_Y } from '../SwallowSvg';

// Each move returns a gentle offset and pitch for progress p (0 → 1).
const MOVES = {
  glide: { ms: 1150, fly: true, at: p => ({ dy: -Math.sin(Math.PI * p) * 22, rot: -Math.cos(Math.PI * p) * 5 * Math.sin(Math.PI * p) }) },
  nod: { ms: 650, fly: false, at: p => ({ dy: 0, rot: Math.sin(p * Math.PI * 2) * 5 * (1 - p) }) },
  arrive: { ms: 1500, fly: true, at: p => ({ dy: -Math.sin(Math.PI * p) * 36, rot: -Math.cos(Math.PI * p) * 6 * Math.sin(Math.PI * p) }) },
};

// The swallow perches on the tip of the form's progress bar and glides along as it grows;
// after sending, it settles on the check mark.
export default function DemoSwallow({ ref, open, done, dialogRef, fillRef, checkRef }) {
  const birdRef = useRef(null);
  const innerRef = useRef(null);
  const state = useRef(null);
  const doneRef = useRef(done);
  doneRef.current = done;

  useImperativeHandle(ref, () => ({
    glide(dir) { const s = state.current; if (s) { s.faceTarget = dir; play('glide'); } },
    nod() { const s = state.current; if (s && !(s.move && s.move.fly)) play('nod'); },
    arrive() { play('arrive'); },
  }), []);

  function play(name) {
    const s = state.current;
    if (!s) return;
    s.move = { ...MOVES[name], start: performance.now() };
    if (s.move.fly) s.landed = false;
  }

  useEffect(() => {
    if (!open || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bird = birdRef.current, inner = innerRef.current, dialog = dialogRef.current;
    const d0 = dialog.getBoundingClientRect();
    // Fly in from just outside the dialog's right edge.
    const s = state.current = { pos: { x: d0.width + 90, y: 30 }, vel: { x: 0, y: 0 }, face: -1, faceTarget: -1, tilt: 0, landed: false, move: null };
    let last = performance.now(), raf;
    bird.dataset.state = 'fly';
    bird.classList.add('is-visible');

    function target() {
      const d = dialog.getBoundingClientRect();
      if (doneRef.current) {
        const r = checkRef.current.getBoundingClientRect();
        return { x: r.left + r.width * .5 - d.left, y: r.top + 2 - d.top };
      }
      const r = fillRef.current.getBoundingClientRect();
      return { x: r.right - 10 - d.left, y: r.top - 2 - d.top };
    }

    function frame(now) {
      const dt = Math.min(now - last, 40) / 1000;
      last = now;
      const w = bird.offsetWidth, h = w * 72 / 120;
      const t = target(), { pos, vel } = s;

      let off = { dy: 0, rot: 0 };
      if (s.move) {
        const p = Math.min((now - s.move.start) / s.move.ms, 1);
        off = s.move.at(p);
        if (p >= 1) s.move = null;
      }
      const flying = s.move && s.move.fly;

      if (s.landed) {
        // Stay on the tip of the bar while it grows or shrinks.
        const e = 1 - Math.exp(-14 * dt);
        pos.x += (t.x - pos.x) * e; pos.y += (t.y - pos.y) * e; vel.x = vel.y = 0;
      } else {
        const k = 9, c = 2 * Math.sqrt(k);
        vel.x += ((t.x - pos.x) * k - vel.x * c) * dt;
        vel.y += ((t.y - pos.y) * k - vel.y * c) * dt;
        pos.x += vel.x * dt; pos.y += vel.y * dt;
        if (!flying && Math.hypot(t.x - pos.x, t.y - pos.y) < 16 && Math.hypot(vel.x, vel.y) < 160) { s.landed = true; s.faceTarget = 1; }
      }
      bird.dataset.state = s.landed && !flying ? 'perch' : 'fly';

      if (!s.landed && !flying && Math.abs(vel.x) > 90) s.faceTarget = vel.x > 0 ? 1 : -1;
      s.face += (s.faceTarget - s.face) * (1 - Math.exp(-10 * dt));
      const tiltTarget = s.landed ? 0 : Math.max(-10, Math.min(10, vel.y * .015)) * s.faceTarget;
      s.tilt += (tiltTarget - s.tilt) * (1 - Math.exp(-8 * dt));

      bird.style.transform = `translate3d(${pos.x - w * FOOT_X}px, ${pos.y + off.dy - h * FOOT_Y}px, 0)`;
      inner.style.transform = `scaleX(${s.face.toFixed(3)}) rotate(${(s.tilt + off.rot).toFixed(2)}deg)`;
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      bird.classList.remove('is-visible');
      state.current = null;
    };
  }, [open, dialogRef, fillRef, checkRef]);

  return (
    <div className="swallow demo-swallow" ref={birdRef} aria-hidden="true">
      <SwallowSvg innerRef={innerRef} />
    </div>
  );
}
