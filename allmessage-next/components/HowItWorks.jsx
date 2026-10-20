'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { restartAnimation, sketchClass, useReveal, useSketchRects, useTextSketch } from './motion';

const SLIDES = [
  { img: 'come-funziona', alt: 'Postazione di lavoro collegata a WhatsApp, Instagram, Facebook ed Email', title: 'Colleghi i tuoi canali', text: 'WhatsApp, Instagram e Messenger si agganciano in pochi minuti.' },
  { img: 'come-funziona-2', alt: 'Tutti i canali convergono in un’unica schermata', title: 'Rispondi da un’unica schermata', text: 'Tutte le chat arrivano nella stessa inbox, il team lavora da lì.' },
  { img: 'come-funziona-3', alt: 'Postazione con canali collegati e automazioni attive', title: 'Automatizzi il resto', text: 'Risposte automatiche per le domande ripetitive, pagamenti direttamente in chat.' },
];
const DELAY = 5500;

export default function HowItWorks() {
  const [current, setCurrent] = useState(0);
  const titleRef = useRef(null);
  const wrapRef = useRef(null);
  const sliderRef = useRef(null);
  const sketchRef = useRef(null);
  const imgRefs = useRef([]);
  const timerRef = useRef(null);

  useTextSketch(titleRef, 'how');
  useSketchRects(sketchRef, sliderRef, {
    inset: [1, 1, -2, -2],
    outer: [-4, 3, 6, -2],
    radius: el => parseFloat(getComputedStyle(el).borderTopLeftRadius) || 30,
  });
  // Restart the active slide's zoom-out so it plays as the image is revealed.
  const phase = useReveal(wrapRef, {
    threshold: .3,
    duration: 3600,
    onIn: () => setTimeout(() => restartAnimation(imgRefs.current[current]), 1400),
  });

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), DELAY);
  }, []);

  useEffect(() => {
    startTimer();
    const onVisibility = () => (document.hidden ? clearInterval(timerRef.current) : startTimer());
    document.addEventListener('visibilitychange', onVisibility);
    return () => { clearInterval(timerRef.current); document.removeEventListener('visibilitychange', onVisibility); };
  }, [startTimer]);

  useEffect(() => { restartAnimation(imgRefs.current[current]); }, [current]);

  return (
    <section className="how" id="come-funziona" aria-labelledby="how-title">
      <div className="how-head">
        <h2 id="how-title" ref={titleRef} data-perch="text" data-perch-x=".06" data-perch-dy=".2">Come funziona</h2>
        <div>
          <p>All Message è una <strong>piattaforma web</strong> che riunisce WhatsApp, Instagram, Facebook ed Email in un’unica casella di posta. Permette inoltre di creare template e gestire campagne.</p>
          <p>Grazie alle <strong>API</strong>, può collegarsi al tuo e-commerce, CRM o agli strumenti di automazione per inviare messaggi e sincronizzare automaticamente i contatti.</p>
        </div>
      </div>
      <div className={`how-sketch-wrap${sketchClass(phase)}`} ref={wrapRef}>
        <div className="how-slider" id="how-slider" ref={sliderRef} data-perch="" data-perch-x=".84" role="region" aria-roledescription="carosello" aria-label="Come funziona AllMessage">
          {SLIDES.map((s, i) => (
            <figure key={s.img} className={`how-slide${i === current ? ' is-active' : ''}`} aria-roledescription="slide" aria-label={`${i + 1} di ${SLIDES.length}`} aria-hidden={i !== current}>
              <img
                ref={el => { imgRefs.current[i] = el; }}
                src={`/media/${s.img}-1672.jpg`}
                srcSet={`/media/${s.img}-960.jpg 960w, /media/${s.img}-1672.jpg 1672w`}
                sizes="(max-width: 1000px) 100vw, 90vw"
                alt={s.alt}
                width="1672"
                height="941"
                loading={i === 0 ? undefined : 'lazy'}
              />
              <figcaption><h3>{s.title}</h3><p>{s.text}</p></figcaption>
            </figure>
          ))}
        </div>
        <div className="how-hatch" />
        <svg className="plan-sketch" ref={sketchRef} aria-hidden="true">
          <defs>
            <filter id="pencil-how" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="2" seed="11" />
              <feDisplacementMap in="SourceGraphic" scale="5" />
            </filter>
          </defs>
          <rect className="s1" pathLength="1" filter="url(#pencil-how)" />
          <rect className="s2" pathLength="1" filter="url(#pencil-how)" />
        </svg>
      </div>
      <div className="how-dots" id="how-dots" aria-label="Scegli la slide">
        {SLIDES.map((s, i) => (
          <button key={s.img} type="button" aria-label={`Slide ${i + 1}`} aria-current={i === current} onClick={() => { setCurrent(i); startTimer(); }} />
        ))}
      </div>
    </section>
  );
}
