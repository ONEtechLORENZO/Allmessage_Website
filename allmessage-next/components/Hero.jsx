'use client';

import { useEffect, useRef, useState } from 'react';
import { DemoLink } from './demo/DemoProvider';

// Intro video (messages gather into the logo) followed by a looping message animation.
export default function Hero() {
  const introRef = useRef(null);
  const loopRef = useRef(null);
  const finalRef = useRef(null);
  const playRef = useRef(() => {});
  const [stage, setStage] = useState('loading');
  const [introComplete, setIntroComplete] = useState(false);
  const [showStart, setShowStart] = useState(false);

  useEffect(() => {
    const intro = introRef.current, messages = loopRef.current;
    let complete = false;

    async function playCurrent() {
      const video = complete ? messages : intro;
      video.muted = true;
      try { await video.play(); setShowStart(false); }
      catch { setShowStart(true); }
    }
    playRef.current = playCurrent;

    function startMessages() {
      if (complete) return;
      complete = true;
      intro.pause();
      setStage('finished');
      setIntroComplete(true);
      playCurrent();
    }

    const onIntroPlaying = () => { if (complete) intro.pause(); else setStage('playing'); };
    const onCanPlay = () => { if (!complete) playCurrent(); };
    const onLoopPlaying = () => { setStage('looping'); setShowStart(false); };
    const onLoopError = () => { setStage('finished'); setShowStart(false); };

    intro.loop = false;
    messages.loop = true;
    intro.addEventListener('playing', onIntroPlaying);
    intro.addEventListener('ended', startMessages);
    intro.addEventListener('error', startMessages);
    intro.addEventListener('canplay', onCanPlay, { once: true });
    messages.addEventListener('playing', onLoopPlaying);
    messages.addEventListener('error', onLoopError);
    finalRef.current?.decode().catch(() => {});

    // The video may have started (or finished) before React hydrated.
    if (intro.ended) startMessages();
    else {
      if (!intro.paused) setStage('playing');
      playCurrent();
    }

    return () => {
      intro.removeEventListener('playing', onIntroPlaying);
      intro.removeEventListener('ended', startMessages);
      intro.removeEventListener('error', startMessages);
      intro.removeEventListener('canplay', onCanPlay);
      messages.removeEventListener('playing', onLoopPlaying);
      messages.removeEventListener('error', onLoopError);
    };
  }, []);

  return (
    <section className="hero" id="home" aria-labelledby="hero-title" data-intro-complete={introComplete ? '' : undefined}>
      <div className="animation-stage" id="animation-stage" data-state={stage} role="img" aria-label="AllMessage: i messaggi si riuniscono nel logo, con una rondine che atterra sulla a.">
        <img className="opening-frame" src="/media/hero-opening.jpg" alt="" aria-hidden="true" width="1920" height="1080" fetchPriority="high" />
        <video ref={introRef} id="logo-animation" autoPlay muted playsInline preload="auto" aria-hidden="true" disablePictureInPicture disableRemotePlayback tabIndex={-1}>
          <source src="/media/hero-intro.mp4" type="video/mp4" />
        </video>
        <video ref={loopRef} id="message-animation" muted playsInline loop preload="auto" aria-hidden="true" disablePictureInPicture disableRemotePlayback tabIndex={-1}>
          <source src="/media/hero-loop.mp4" type="video/mp4" />
        </video>
        <img ref={finalRef} className="final-frame" src="/media/hero-final.png" alt="" aria-hidden="true" width="1920" height="1080" />
        <button className="start-animation" id="start-animation" type="button" hidden={!showStart} onClick={() => playRef.current()}>
          Avvia l’animazione
        </button>
      </div>
      <div className="hero-copy">
        <h1 id="hero-title">Tutte le conversazioni.<br /><span>Un unico posto.</span></h1>
        <p>Gestisci i messaggi della tua azienda, le automazioni e le integrazioni da un’unica piattaforma.</p>
        <DemoLink className="primary-link">Richiedi una demo<span aria-hidden="true">↗</span></DemoLink>
      </div>
    </section>
  );
}
