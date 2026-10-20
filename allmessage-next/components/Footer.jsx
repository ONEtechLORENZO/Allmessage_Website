'use client';

import { useRef } from 'react';
import { sketchClass, useReveal } from './motion';

const LINKEDIN_URL = 'https://www.linkedin.com/company/otech-one/posts/?feedView=all';
const INSTAGRAM_URL = 'https://www.instagram.com/onetech.one';

export default function Footer() {
  const logoRef = useRef(null);
  const phase = useReveal(logoRef, { threshold: .5, duration: 3500 });

  return (
    <footer className="footer" id="contatti">
      <div className="footer-grid">
        <div>
          <h3>Prodotti</h3>
          <ul>
            <li>Kore</li>
            <li><a href="#home">Allmessage</a></li>
            <li>Acta</li>
            <li>Argo</li>
          </ul>
        </div>
        <div>
          <h3>Seguici</h3>
          <ul>
            <li><a href={LINKEDIN_URL} target="_blank" rel="noopener">LinkedIn</a></li>
            <li><a href={INSTAGRAM_URL} target="_blank" rel="noopener">Instagram</a></li>
          </ul>
        </div>
        <div>
          <h3>Richieste di partnership</h3>
          <ul><li><a href="mailto:partnerships@otech.one">partnerships@otech.one</a></li></ul>
          <h3 className="footer-gap">Richieste stampa</h3>
          <ul><li><a href="mailto:press@otech.one">press@otech.one</a></li></ul>
        </div>
        <div>
          <h3>Sedi</h3>
          <ul>
            <li><a href="https://www.google.com/maps/search/?api=1&query=Via+Gustavo+Fara+32+20124+Milano" target="_blank" rel="noopener">Via Gustavo Fara 32, 20124 Milano MI</a></li>
            <li><a className="footer-muted" href="mailto:sales@otech.one">sales@otech.one</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className={`footer-logo-wrap${sketchClass(phase)}`} ref={logoRef}>
          <img className="footer-logo" src="/brand/allmessage-logo.png" alt="AllMessage" width="4000" height="740" loading="lazy" data-perch="" data-perch-x=".075" data-perch-dy-h=".246" />
          <div className="footer-hatch" aria-hidden="true"></div>
          <img className="footer-outline" src="/brand/logo-outline-white.png" alt="" aria-hidden="true" width="2024" height="394" />
        </div>
        <p className="footer-by">prodotto di <a href="https://www.otech.one/" target="_blank" rel="noopener">One Tech</a></p>
      </div>
    </footer>
  );
}
