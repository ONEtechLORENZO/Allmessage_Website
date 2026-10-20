'use client';

import { useEffect, useRef, useState } from 'react';
import IntegrationsArt from './art/IntegrationsArt';
import { canAnimate, useTextSketch } from './motion';

const ITEMS = [
  { name: 'WHATSAPP', top: '11.429%', text: 'Le soluzioni WebApp o API consentono di integrare la messaggistica di WhatsApp nelle tue applicazioni, offrendo comunicazioni sicure e immediate con i clienti, automatizzando risposte e supporto.' },
  { name: 'FACEBOOK MESSENGER', top: '35.536%', text: 'All Message si integra con Messenger facilitando la comunicazione diretta con i clienti, automatizzando risposte e supporto, migliorando l’engagement e l’efficienza del servizio clienti.' },
  { name: 'INSTAGRAM', top: '59.643%', text: 'Le soluzioni WebApp o API consentono di integrare le funzionalità di Instagram nelle tue applicazioni, automatizzando pubblicazioni, gestione dei contenuti e analisi delle performance per migliorare la presenza online.' },
  { name: 'GMAIL', top: '83.750%', text: 'Le soluzioni WebApp o API consentono di integrare Gmail nella stessa casella di chat e social, centralizzando le email dei clienti, automatizzando risposte e smistamento e velocizzando l’assistenza.' },
];
const WIDE = '-160 0 1360 1120', NARROW = '-50 260 700 680';

export default function Integrations() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const titleRef = useRef(null);
  const [hl, setHl] = useState(null);
  const [viewBox, setViewBox] = useState(WIDE);
  // 'armed' = hidden and ready, 'in' = animating, 'idle' = normal styles.
  const [anim, setAnim] = useState('armed');

  useTextSketch(titleRef, 'integ');

  useEffect(() => {
    const narrow = matchMedia('(max-width: 800px)');
    const fit = () => setViewBox(narrow.matches ? NARROW : WIDE);
    fit();
    narrow.addEventListener('change', fit);
    return () => narrow.removeEventListener('change', fit);
  }, []);

  // Hovering a ring segment or a text block highlights the matching pair.
  useEffect(() => {
    const segs = [...sectionRef.current.querySelectorAll('.integ-seg')];
    const handlers = segs.map(s => {
      const enter = () => setHl(s.dataset.i);
      const leave = () => setHl(null);
      s.addEventListener('pointerenter', enter);
      s.addEventListener('pointerleave', leave);
      return () => { s.removeEventListener('pointerenter', enter); s.removeEventListener('pointerleave', leave); };
    });
    return () => handlers.forEach(off => off());
  }, []);

  useEffect(() => {
    sectionRef.current.querySelectorAll('.integ-seg').forEach(s => s.classList.toggle('is-on', s.dataset.i === hl));
  }, [hl]);

  // Replays each time the block comes back into view; resets once it is fully off screen.
  useEffect(() => {
    if (!canAnimate()) { setAnim('idle'); return; }
    let playing = false, timer, raf;
    const io = new IntersectionObserver(entries => {
      const e = entries[entries.length - 1];
      if (e.intersectionRatio >= .3 && !playing) {
        playing = true;
        setAnim('armed');
        raf = requestAnimationFrame(() => { raf = requestAnimationFrame(() => setAnim('in')); });
        timer = setTimeout(() => setAnim('idle'), 3200);
      } else if (!e.isIntersecting && playing) {
        playing = false;
        clearTimeout(timer);
        setAnim('armed');
      }
    }, { threshold: [0, .3] });
    io.observe(stageRef.current);
    return () => { io.disconnect(); clearTimeout(timer); cancelAnimationFrame(raf); };
  }, []);

  const cls = ['integ', hl !== null && 'is-hl', anim !== 'idle' && 'integ-anim', anim === 'in' && 'is-in'].filter(Boolean).join(' ');

  return (
    <section className={cls} id="integrazioni" aria-labelledby="integ-title" ref={sectionRef}>
      <div className="integ-inner">
        <div className="integ-stage" ref={stageRef}>
          <h2 className="integ-title" id="integ-title" ref={titleRef} data-perch="text" data-perch-x=".08" data-perch-dy=".2">Integrazioni</h2>
          <IntegrationsArt viewBox={viewBox} />
          {ITEMS.map((it, i) => (
            <article
              key={it.name}
              className={`integ-item${hl === String(i) ? ' is-on' : ''}`}
              data-i={i}
              style={{ '--i': i, top: it.top }}
              onPointerEnter={() => setHl(String(i))}
              onPointerLeave={() => setHl(null)}
            >
              <h3><span>{it.name}</span> <b>{String(i + 1).padStart(2, '0')}</b></h3>
              <p>{it.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
