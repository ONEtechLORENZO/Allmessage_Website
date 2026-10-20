'use client';

import { useEffect, useRef, useState } from 'react';
import { GmailIcon, InstagramIcon, MessengerIcon, WhatsAppIcon } from '../icons';
import DemoSwallow from './DemoSwallow';

const STEPS = [
  {
    title: 'La tua azienda',
    fields: [
      { name: 'azienda', label: 'Nome azienda', autoComplete: 'organization' },
      { name: 'referente', label: 'Nome referente', autoComplete: 'name' },
    ],
  },
  {
    title: 'I tuoi contatti',
    fields: [
      { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', error: 'Inserisci un indirizzo email valido.' },
      { name: 'telefono', label: 'Telefono / WhatsApp', type: 'tel', autoComplete: 'tel', error: 'Inserisci un numero di telefono valido.' },
    ],
  },
  {
    title: 'Il tuo lavoro',
    fields: [
      { name: 'settore', label: 'Settore di appartenenza' },
      { name: 'ruolo', label: 'Ruolo', autoComplete: 'organization-title' },
    ],
  },
  {
    title: 'La tua richiesta',
    fields: [
      { name: 'interesse', label: 'Interesse principale' },
      { name: 'messaggio', label: 'Messaggio / caso d’uso', multiline: true },
      { name: 'consenso', type: 'checkbox', label: 'Acconsento che questo sito web memorizzi le informazioni da me inviate in modo che possano rispondere alla mia richiesta', error: 'Devi accettare per inviare la richiesta.' },
    ],
  },
];
const EMPTY = Object.fromEntries(STEPS.flatMap(s => s.fields).map(f => [f.name, f.type === 'checkbox' ? false : '']));

const CHANNELS = [
  { name: 'WhatsApp', Icon: WhatsAppIcon, glow: 'rgba(37, 211, 102, .45)' },
  { name: 'Messenger', Icon: MessengerIcon, glow: 'rgba(160, 51, 255, .4)' },
  { name: 'Instagram', Icon: InstagramIcon, glow: 'rgba(214, 36, 159, .4)' },
  { name: 'Gmail', Icon: GmailIcon, glow: 'rgba(234, 67, 53, .4)' },
];

function isValid(field, value) {
  if (field.type === 'checkbox') return value === true;
  const v = String(value).trim();
  if (!v) return false;
  if (field.type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  if (field.type === 'tel') return v.replace(/\D/g, '').length >= 6;
  return true;
}

export default function DemoModal({ open, onClose }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('form'); // form | sending | error | success
  const modalRef = useRef(null);
  const dialogRef = useRef(null);
  const fillRef = useRef(null);
  const checkRef = useRef(null);
  const doneRef = useRef(null);
  const birdRef = useRef(null);
  const inputRefs = useRef({});
  const lastFocus = useRef(null);
  const focusStep = useRef(false);

  const done = status === 'success';
  const last = step === STEPS.length - 1;
  const pct = Math.round(((step + 1) / STEPS.length) * 100);

  // Open / close: lock the page scroll, move focus in, give it back on close.
  useEffect(() => {
    if (!open) return;
    if (status === 'success') { setValues(EMPTY); setErrors({}); setStep(0); setStatus('form'); }
    lastFocus.current = document.activeElement;
    document.body.classList.add('demo-lock');
    const t = setTimeout(() => focusFirst(0), 50);
    return () => {
      clearTimeout(t);
      document.body.classList.remove('demo-lock');
      lastFocus.current?.focus?.();
    };
  }, [open]);

  // After moving to another step, focus its first field.
  useEffect(() => {
    if (focusStep.current) { focusStep.current = false; focusFirst(step); }
  }, [step]);

  useEffect(() => { if (done) doneRef.current?.focus(); }, [done]);

  useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const items = [...modalRef.current.querySelectorAll('button, input, textarea, a[href]')].filter(el => !el.disabled && el.offsetParent !== null);
        const first = items[0], lastItem = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastItem.focus(); }
        else if (!e.shiftKey && document.activeElement === lastItem) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function focusFirst(i) {
    inputRefs.current[STEPS[i].fields[0].name]?.focus();
  }

  function update(field, value) {
    setValues(v => ({ ...v, [field.name]: value }));
    if (errors[field.name] && isValid(field, value)) setErrors(e => ({ ...e, [field.name]: false }));
  }

  function validateStep() {
    const bad = STEPS[step].fields.filter(f => !isValid(f, values[f.name]));
    setErrors(e => ({ ...e, ...Object.fromEntries(STEPS[step].fields.map(f => [f.name, bad.includes(f)])) }));
    if (bad.length) {
      inputRefs.current[bad[0].name]?.focus();
      birdRef.current?.nod();
    }
    return bad.length === 0;
  }

  function back() {
    if (step === 0) return;
    focusStep.current = true;
    setStep(step - 1);
    birdRef.current?.glide(-1);
  }

  async function submit(e) {
    e.preventDefault();
    if (!validateStep()) return;
    if (!last) {
      focusStep.current = true;
      setStep(step + 1);
      birdRef.current?.glide(1);
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('success');
      birdRef.current?.arrive();
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className={`demo-modal${open ? ' is-open' : ''}`} aria-hidden={!open} ref={modalRef} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="demo-dialog" role="dialog" aria-modal="true" aria-labelledby="demo-title" ref={dialogRef}>
        <button className="demo-close" type="button" aria-label="Chiudi" onClick={onClose}>&times;</button>
        <div className="demo-intro">
          <span className="demo-pill">Contatti</span>
          <h2 className="demo-title" id="demo-title">Richiedi<br /><span>Demo</span></h2>
          <p>Raccontaci della tua azienda: ti mostreremo come AllMessage riunisce tutte le tue conversazioni in un unico posto.</p>
          <div className="demo-channels">
            <p className="demo-channels-label">Tutti i tuoi canali, un’unica inbox</p>
            <ul>
              {CHANNELS.map(({ name, Icon, glow }, i) => (
                <li key={name} style={{ '--i': i, '--glow': glow }}>
                  <span className="demo-tile"><Icon gradientId={`demo-${name.toLowerCase()}-grad`} /></span>
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="demo-card">
          <form noValidate onSubmit={submit} hidden={done}>
            <div className="demo-progress">
              <div className="demo-progress-head">
                <span><strong>Passo {step + 1} di {STEPS.length}</strong> — {STEPS[step].title}</span>
                <span>{pct}%</span>
              </div>
              <div className="demo-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Avanzamento">
                <div className="demo-fill" ref={fillRef} style={{ width: `${pct}%` }}></div>
              </div>
            </div>

            {STEPS.map((s, i) => (
              <fieldset key={s.title} className={`demo-step${i === step ? ' is-active' : ''}`} style={{ border: 0, margin: 0, padding: 0 }}>
                {s.fields.map(f => {
                  const id = `demo-${f.name}`;
                  const common = {
                    id,
                    name: f.name,
                    ref: el => { inputRefs.current[f.name] = el; },
                    required: true,
                    'aria-invalid': errors[f.name] ? true : undefined,
                  };
                  return (
                    <div key={f.name} className={`demo-field${errors[f.name] ? ' has-error' : ''}`}>
                      {f.type === 'checkbox' ? (
                        <label className="demo-consent">
                          <input {...common} type="checkbox" checked={values[f.name]} onChange={e => update(f, e.target.checked)} />
                          <span>{f.label} <span className="demo-req">*</span></span>
                        </label>
                      ) : (
                        <>
                          <label htmlFor={id}>{f.label} <span className="demo-req">*</span></label>
                          {f.multiline
                            ? <textarea {...common} value={values[f.name]} onChange={e => update(f, e.target.value)} />
                            : <input {...common} type={f.type || 'text'} autoComplete={f.autoComplete} value={values[f.name]} onChange={e => update(f, e.target.value)} />}
                        </>
                      )}
                      <p className="demo-error">{f.error || 'Campo obbligatorio.'}</p>
                    </div>
                  );
                })}
              </fieldset>
            ))}

            <div className="demo-actions">
              <button className="demo-back" type="button" hidden={step === 0} onClick={back}>Indietro</button>
              <button className="demo-btn" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Invio…' : last ? 'Invia richiesta' : 'Avanti'}
              </button>
            </div>
            <p className="demo-send-error" hidden={status !== 'error'}>Invio non riuscito. Riprova tra qualche istante.</p>
          </form>

          <div className="demo-success" hidden={!done}>
            <div className="demo-check" aria-hidden="true" ref={checkRef}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </div>
            <h3>Grazie!</h3>
            <p>La tua richiesta è stata inviata.<br />Ti risponderemo al più presto.</p>
            <button className="demo-btn" type="button" ref={doneRef} onClick={onClose}>Torna al sito</button>
          </div>
        </div>

        <DemoSwallow ref={birdRef} open={open} done={done} dialogRef={dialogRef} fillRef={fillRef} checkRef={checkRef} />
      </div>
    </div>
  );
}
