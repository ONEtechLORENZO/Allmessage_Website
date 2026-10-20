'use client';

import { useEffect, useRef } from 'react';
import AboutDeco from './art/AboutDeco';
import AboutLinks from './art/AboutLinks';
import { CUBES, TILES } from './art/aboutData';
import { canAnimate, sketchClass, useReveal } from './motion';

const TITLE = 'Chi siamo';

export default function About() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const layerRefs = useRef([]);
  const logoRef = useRef(null);
  const parallaxRef = useRef({ target: { x: 0, y: 0 }, cur: { x: 0, y: 0 }, running: false, enabled: false });

  const phase = useReveal(sectionRef, { threshold: .35, duration: 4200 });
  const logoPhase = useReveal(logoRef, { threshold: .5, duration: 3500 });
  const animClass = phase === 'ready' ? ' about-anim' : phase === 'in' ? ' about-anim is-in' : '';

  useEffect(() => { parallaxRef.current.enabled = canAnimate(); }, []);

  // Mouse parallax: layers drift by their depth, eased every frame.
  function tick() {
    const p = parallaxRef.current;
    p.cur.x += (p.target.x - p.cur.x) * .08;
    p.cur.y += (p.target.y - p.cur.y) * .08;
    layerRefs.current.forEach(l => {
      if (!l) return;
      const d = parseFloat(l.dataset.depth);
      l.style.transform = `translate3d(${(p.cur.x * d).toFixed(3)}cqw, ${(p.cur.y * d).toFixed(3)}cqw, 0)`;
    });
    if (Math.abs(p.target.x - p.cur.x) + Math.abs(p.target.y - p.cur.y) > .001) requestAnimationFrame(tick);
    else p.running = false;
  }
  function kick() {
    const p = parallaxRef.current;
    if (!p.running) { p.running = true; requestAnimationFrame(tick); }
  }
  function onPointerMove(e) {
    const p = parallaxRef.current;
    if (!p.enabled || e.pointerType !== 'mouse') return;
    const r = stageRef.current.getBoundingClientRect();
    p.target.x = ((e.clientX - r.left) / r.width - .5) * -1.6;
    p.target.y = ((e.clientY - r.top) / r.height - .5) * -1.6;
    kick();
  }
  function onPointerLeave() {
    const p = parallaxRef.current;
    if (!p.enabled) return;
    p.target.x = p.target.y = 0;
    kick();
  }

  return (
    <section className={`about${animClass}`} id="chi-siamo" aria-labelledby="about-title" ref={sectionRef}>
      <p className="about-title-m" aria-hidden="true">{TITLE}</p>
      <div className="about-stage" ref={stageRef} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
        <AboutDeco />
        <div className="about-layer" data-depth=".9" ref={el => { layerRefs.current[0] = el; }}>
          <AboutLinks />
          {TILES.map(({ key, Icon, style }, n) => (
            <span key={key} data-n={n} className={`about-tile about-tile--${key}`} style={{ ...style, '--n': n }}>
              <Icon gradientId={`${key}-grad`} />
            </span>
          ))}
        </div>
        <div className="about-layer" data-depth="1.8" ref={el => { layerRefs.current[1] = el; }}>
          {CUBES.map((style, n) => <span key={n} data-n={n} className="about-cube" style={{ ...style, '--n': n }}></span>)}
        </div>
        {/* Letters rise in one by one; screen readers get the plain label. */}
        <h2 className="about-title" id="about-title" aria-label={TITLE}>
          {[...TITLE].map((ch, i) => (ch === ' ' ? ' ' : <span key={i} className="ch" aria-hidden="true" style={{ '--i': i }}>{ch}</span>))}
        </h2>
        <div className={`about-logo-wrap${sketchClass(logoPhase)}`} ref={logoRef}>
          <img className="about-logo" src="/brand/allmessage-logo.png" alt="AllMessage" width="4000" height="740" loading="lazy" data-perch="" data-perch-x=".075" data-perch-dy-h=".246" />
          <div className="logo-hatch" aria-hidden="true"></div>
          <img className="logo-outline" src="/brand/logo-outline-navy.png" alt="" aria-hidden="true" width="2024" height="394" />
        </div>
      </div>
      <div className="about-copy">
        <p>All Message è un prodotto di <a href="https://www.otech.one/" target="_blank" rel="noopener">One Tech</a>, azienda con sede a Milano. Sviluppiamo strumenti che semplificano il lavoro quotidiano delle aziende, riducendo le attività ripetitive.</p>
        <p>Per vedere la piattaforma o ricevere maggiori informazioni: <a href="mailto:sales@otech.one">sales@otech.one</a>.</p>
      </div>
    </section>
  );
}
