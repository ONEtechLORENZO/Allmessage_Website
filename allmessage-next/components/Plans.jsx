'use client';

import { useRef, useState } from 'react';
import { DemoLink } from './demo/DemoProvider';
import { TierBusinessIcon, TierEnterpriseIcon, TierProIcon } from './icons';
import { sketchClass, useReveal, useSketchRects } from './motion';

const SERVER = 'Server Dedicato AWS 320 GB Disco Storage 2 GB RAM';
const STORAGE = 'Storage Documenti Over 30gg';

const PLANS = [
  { key: 'pro', tag: 'PRO', Icon: TierProIcon, price: { monthly: '599', annual: '6110' }, desc: 'Per freelance e micro-imprese', features: [['5000 Chat Attive', true], [SERVER, false], [STORAGE, false]] },
  { key: 'featured', tag: 'BUSINESS', Icon: TierBusinessIcon, badge: 'Più scelto', price: { monthly: '899', annual: '9170' }, desc: 'Per PMI e team strutturati', features: [['10000 Chat Attive', true], [SERVER, false], [STORAGE, false]] },
  { key: 'enterprise', tag: 'ENTERPRISE', Icon: TierEnterpriseIcon, shine: true, price: { monthly: '1399', annual: '14270' }, desc: 'Per grandi aziende con esigenze avanzate', features: [['25000 Chat Attive', true], [SERVER, true], [STORAGE, true]] },
];
const PER = { monthly: '/mese', annual: '/anno' };

function Plan({ plan, index, period }) {
  const cardRef = useRef(null);
  const sketchRef = useRef(null);
  useSketchRects(sketchRef, cardRef);
  // --c staggers how the card's content fades in after the outline is drawn.
  const c = n => ({ '--c': n + (plan.shine ? 1 : 0) });

  return (
    <article className={`plan plan--${plan.key}`} data-shine={plan.shine ? '' : undefined} style={{ '--i': index }}>
      {plan.badge && <span className="plan-badge">{plan.badge}</span>}
      <div className="plan-tag" data-perch="" data-perch-x=".78" data-perch-skew="4"><plan.Icon /><span>{plan.tag}</span></div>
      <div className="plan-card" ref={cardRef}>
        <svg className="plan-sketch" ref={sketchRef} aria-hidden="true">
          <defs>
            <filter id={`pencil-${index}`} x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed={index + 3} />
              <feDisplacementMap in="SourceGraphic" scale="4" />
            </filter>
          </defs>
          <rect className="s1" pathLength="1" filter={`url(#pencil-${index})`} />
          <rect className="s2" pathLength="1" filter={`url(#pencil-${index})`} />
        </svg>
        {plan.shine && <span className="plan-shine" aria-hidden="true" style={{ '--c': 0 }}></span>}
        <div className="plan-price" style={c(0)}><span className="cur">€</span><span className="amt">{plan.price[period]}</span></div>
        <span className="plan-per" style={c(1)}>{PER[period]}</span>
        <p className="plan-desc" style={c(2)}>{plan.desc}</p>
        <DemoLink className="plan-cta" style={c(3)}>Contattaci</DemoLink>
        <ul className="plan-features" style={c(4)}>
          {plan.features.map(([label, included]) => (
            <li key={label} className={included ? undefined : 'no'}>
              <span>{label}</span>
              {!included && <span className="sr-only"> (non incluso)</span>}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function Plans() {
  const [period, setPeriod] = useState('monthly');
  const [shown, setShown] = useState('monthly');
  const [switching, setSwitching] = useState(false);
  const gridRef = useRef(null);
  const phase = useReveal(gridRef, { threshold: .3, duration: (PLANS.length - 1) * 300 + 3200 });

  // Prices fade out, change, then fade back in.
  const choose = p => {
    if (p === period) return;
    setPeriod(p);
    setSwitching(true);
    setTimeout(() => { setShown(p); setSwitching(false); }, 200);
  };

  return (
    <section className={`plans${switching ? ' is-switching' : ''}`} id="piani" aria-labelledby="plans-title">
      <div className="plans-band" aria-hidden="true"></div>
      <div className="plans-inner">
        <div className="plans-head">
          <h2 id="plans-title" data-perch="text" data-perch-x=".14" data-perch-dy=".2">Piani</h2>
          <p>Tre piani su misura per ogni tipo di azienda.</p>
          <div className="plans-toggle" role="group" aria-label="Periodo di fatturazione">
            <button type="button" aria-pressed={period === 'monthly'} onClick={() => choose('monthly')}>Mensile</button>
            <button type="button" aria-pressed={period === 'annual'} onClick={() => choose('annual')}>Annuale</button>
          </div>
        </div>
        <div className={`plans-grid${sketchClass(phase)}`} ref={gridRef}>
          {PLANS.map((plan, i) => <Plan key={plan.key} plan={plan} index={i} period={shown} />)}
        </div>
        <p className="plans-note">** Onboarding fee: €1.000 solo per API. Gratuita per Web App.</p>
      </div>
    </section>
  );
}
