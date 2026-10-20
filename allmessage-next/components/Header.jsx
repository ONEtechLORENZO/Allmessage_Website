'use client';

import { useEffect, useState } from 'react';
import { DemoLink } from './demo/DemoProvider';

const LINKS = [
  { href: '#home', label: 'Home', active: true },
  { href: '#come-funziona', label: 'Come funziona' },
  { href: '#piani', label: 'Piani' },
  { href: '#chi-siamo', label: 'Chi siamo' },
  { href: '#integrazioni', label: 'Integrazioni' },
];
const LOGIN_URL = 'https://aessefin.allmessage.chat/';

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className={`site-header${open ? ' is-open' : ''}`}>
      <a className="brand" href="#home" aria-label="AllMessage, homepage">
        <img src="/media/logo-header.png" alt="AllMessage" width="4000" height="740" />
      </a>
      <nav className="main-nav" id="main-nav" aria-label="Navigazione principale">
        {LINKS.map(l => (
          <a key={l.href} className={`nav-link${l.active ? ' is-active' : ''}`} href={l.href} aria-current={l.active ? 'page' : undefined} onClick={close}>
            {l.label}
          </a>
        ))}
        <a className="nav-link nav-login" href={LOGIN_URL} onClick={close}>Accedi <span aria-hidden="true">↗</span></a>
      </nav>
      <div className="header-actions">
        <a href={LOGIN_URL} className="login">Accedi<span aria-hidden="true">↗</span></a>
        <DemoLink className="demo-btn" onClick={close}>Richiedi Demo</DemoLink>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label={open ? 'Chiudi il menu' : 'Apri il menu'}
          onClick={() => setOpen(o => !o)}
        >
          <span></span><span></span>
        </button>
      </div>
    </header>
  );
}
