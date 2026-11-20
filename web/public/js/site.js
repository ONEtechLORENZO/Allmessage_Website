/* AllMessage homepage interactions (ported from AllMessage_offline (1).html). */
// Page language ("it" on /, "en" on /en/): T('italiano', 'English') picks the right text.
const T = (it, en) => (document.documentElement.lang === 'en' ? en : it);
const stage = document.getElementById('animation-stage');
const intro = document.getElementById('logo-animation');
const messages = document.getElementById('message-animation');
const startButton = document.getElementById('start-animation');
let introComplete = false;
async function playCurrent() {
  const video = introComplete ? messages : intro;
  video.muted = true;
  try { await video.play(); startButton.hidden = true; }
  catch { startButton.hidden = false; }
}
function startMessages() {
  if (introComplete) return;
  introComplete = true;
  intro.pause();
  stage.dataset.state = 'finished';
  stage.closest('.hero').setAttribute('data-intro-complete', '');
  playCurrent();
}
intro.loop = false;
messages.loop = true;
intro.addEventListener('playing', () => {
  if (introComplete) intro.pause();
  else stage.dataset.state = 'playing';
});
intro.addEventListener('ended', startMessages, { once: true });
intro.addEventListener('error', startMessages, { once: true });
intro.addEventListener('canplay', () => { if (!introComplete) playCurrent(); }, { once: true });
messages.addEventListener('playing', () => { stage.dataset.state = 'looping'; startButton.hidden = true; });
messages.addEventListener('error', () => { stage.dataset.state = 'finished'; startButton.hidden = true; });
startButton.addEventListener('click', playCurrent);
document.querySelector('.final-frame').decode().catch(() => {});
playCurrent();
;
(() => {
  const slides = [...document.querySelectorAll('#how-slider .how-slide')];
  const dots = [...document.querySelectorAll('#how-dots button')];
  const DELAY = 5500;
  let current = 0, timer;
  function show(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, n) => {
      const active = n === current;
      if (active) { const img = s.querySelector('img'); img.style.animation = 'none'; void img.offsetWidth; img.style.animation = ''; }
      s.classList.toggle('is-active', active);
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    dots.forEach((d, n) => d.setAttribute('aria-current', n === current ? 'true' : 'false'));
  }
  function start() { clearInterval(timer); timer = setInterval(() => show(current + 1), DELAY); }
  dots.forEach((d, n) => d.addEventListener('click', () => { show(n); start(); }));
  document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(timer) : start());
  const sliderEl = document.getElementById('how-slider');
  sliderEl.addEventListener('slider:pause', () => clearInterval(timer));
  sliderEl.addEventListener('slider:resume', start);
  show(0);
  start();
})();
;
(() => {
  const section = document.getElementById('piani');
  const buttons = [...section.querySelectorAll('.plans-toggle button')];
  const fields = [...section.querySelectorAll('[data-monthly]')];
  let period = 'monthly';
  buttons.forEach(b => b.addEventListener('click', () => {
    if (b.dataset.period === period) return;
    period = b.dataset.period;
    buttons.forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    section.classList.add('is-switching');
    setTimeout(() => {
      fields.forEach(el => { el.textContent = el.dataset[period]; });
      section.classList.remove('is-switching');
    }, 200);
  }));
})();
;
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hero = document.getElementById('home');
  const bird = document.createElement('div');
  bird.className = 'swallow';
  bird.setAttribute('aria-hidden', 'true');
  bird.dataset.state = 'fly';
  bird.innerHTML = `<div class="swallow-inner"><svg viewBox="0 -12 120 72" xmlns="http://www.w3.org/2000/svg">
    <path class="wing-flap far" fill="#1f5fb8" d="M68 27 C60 12 47 1 26 -6 C42 7 52 19 60 30 Z"/>
    <g class="swallow-body">
      <path fill="#2a3650" d="M53 32 L3 43 L51 36 Z"/>
      <path fill="#2a3650" d="M51 35 L7 52 L54 38 Z"/>
      <path fill="#36445f" d="M46 34 C58 26 72 20 84 18 C92 17 97 20 98 24 C99 29 94 34 86 37 C74 41 58 40 46 34 Z"/>
      <path fill="#56657f" d="M60 37 C70 39 80 38 89 34 C85 40 71 42 60 37 Z"/>
      <circle fill="#27324a" cx="90" cy="22" r="8"/>
      <path fill="#27324a" d="M97 20.5 L104 23 L97 25 Z"/>
      <circle fill="#5fd4ff" cx="93" cy="20" r="1.7"/>
      <path class="wing-fold" fill="#2f8be5" d="M48 33 C58 23 72 16 88 15 C92 15 94 17 92 19 C82 23 70 29 56 34 Z"/>
      <path class="wing-fold" fill="#6fb6f5" opacity=".55" d="M62 26 C70 20 78 17 87 16 C80 20 72 24 64 27 Z"/>
    </g>
    <path class="wing-flap" fill="#2f8be5" d="M72 26 C66 10 54 -2 32 -10 C48 5 58 18 64 30 Z"/>
  </svg></div>`;
  // The bird flies inside a page-sized layer that clips it at the screen edges,
  // so waiting off-screen never widens the page on phones.
  const layer = document.createElement('div');
  layer.className = 'swallow-layer';
  layer.append(bird);
  document.body.appendChild(layer);
  const inner = bird.firstElementChild;

  // Point of the bird that touches the perch, as a fraction of its box.
  const FOOT_X = 72 / 120, FOOT_Y = (40 + 12) / 72;
  const pos = { x: innerWidth + 80, y: scrollY + innerHeight * .2 };
  const vel = { x: 0, y: 0 };
  let face = 1, faceTarget = 1, tilt = 0, perch = null, landed = false;
  let lastScroll = 0, visible = false, last = performance.now();

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
      if (el.closest('[hidden]')) return; // block hidden on the page
      const pt = perchPoint(el), vy = pt.y - scrollY;
      if (vy < vh * .1 || vy > vh * .9) return;
      const d = Math.abs(vy - vh * .4);
      if (d < bestD) { bestD = d; best = el; }
    });
    return best;
  }

  function inHero() { return hero.getBoundingClientRect().bottom > innerHeight * .55; }

  addEventListener('scroll', () => {
    lastScroll = performance.now();
    perch = null;
    landed = false;
  }, { passive: true });

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
      const phone = innerWidth < 700;
      tx = scrollX + innerWidth * (phone ? .9 : .84) + Math.sin(t * .9) * (phone ? 8 : 26);
      ty = scrollY + (phone ? 104 : innerHeight * .32) + Math.sin(t * 1.8) * (phone ? 4 : 9);
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
      if (perch && Math.hypot(tx - pos.x, ty - pos.y) < 10 && Math.hypot(vel.x, vel.y) < 140) {
        landed = true;
      }
    }
    bird.dataset.state = landed ? 'perch' : 'fly';

    // Turn only on clear horizontal movement, and keep the heading after landing.
    if (!landed && Math.abs(vel.x) > 90) faceTarget = vel.x > 0 ? 1 : -1;
    face += (faceTarget - face) * (1 - Math.exp(-10 * dt));
    const tiltTarget = landed ? 0 : Math.max(-20, Math.min(20, vel.y * .025)) * faceTarget;
    tilt += (tiltTarget - tilt) * (1 - Math.exp(-8 * dt));

    bird.style.transform = `translate3d(${pos.x - w * FOOT_X}px, ${pos.y - h * FOOT_Y}px, 0)`;
    inner.style.transform = `scaleX(${face.toFixed(3)}) rotate(${tilt.toFixed(2)}deg)`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
;
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const grid = document.querySelector('.plans-grid');
  const plans = [...grid.querySelectorAll('.plan')];
  const NS = 'http://www.w3.org/2000/svg';
  plans.forEach((plan, i) => {
    plan.style.setProperty('--i', i);
    const card = plan.querySelector('.plan-card');
    [...card.children].forEach((el, n) => el.style.setProperty('--c', n));
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'plan-sketch');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `<defs><filter id="pencil-${i}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="${i + 3}"/><feDisplacementMap in="SourceGraphic" scale="4"/></filter></defs>
      <rect class="s1" pathLength="1" filter="url(#pencil-${i})"/><rect class="s2" pathLength="1" filter="url(#pencil-${i})"/>`;
    card.prepend(svg);
    const size = () => {
      const w = card.offsetWidth, h = card.offsetHeight;
      const [a, b] = svg.querySelectorAll('rect');
      a.setAttribute('x', 1); a.setAttribute('y', 1); a.setAttribute('width', w - 2); a.setAttribute('height', h - 2); a.setAttribute('rx', 22);
      b.setAttribute('x', -3); b.setAttribute('y', 2); b.setAttribute('width', w + 4); b.setAttribute('height', h - 1); b.setAttribute('rx', 24);
    };
    size();
    new ResizeObserver(size).observe(card);
  });
  grid.classList.add('sketch-ready');
  const io = new IntersectionObserver(entries => {
    if (!entries.some(e => e.isIntersecting)) return;
    io.disconnect();
    grid.classList.add('is-drawn');
    // Hand back to the normal styles so hover effects have no leftover delays.
    setTimeout(() => grid.classList.remove('sketch-ready', 'is-drawn'), (plans.length - 1) * 300 + 3200);
  }, { threshold: .3 });
  io.observe(grid);
})();
;
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const slider = document.getElementById('how-slider');
  const wrap = document.createElement('div');
  wrap.className = 'how-sketch-wrap';
  slider.before(wrap);
  wrap.append(slider);
  const hatch = document.createElement('div');
  hatch.className = 'how-hatch';
  wrap.append(hatch);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'plan-sketch');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `<defs><filter id="pencil-how" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="2" seed="11"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter></defs>
    <rect class="s1" pathLength="1" filter="url(#pencil-how)"/><rect class="s2" pathLength="1" filter="url(#pencil-how)"/>`;
  wrap.append(svg);
  const size = () => {
    const w = slider.offsetWidth, h = slider.offsetHeight, r = parseFloat(getComputedStyle(slider).borderTopLeftRadius) || 30;
    const [a, b] = svg.querySelectorAll('rect');
    a.setAttribute('x', 1); a.setAttribute('y', 1); a.setAttribute('width', w - 2); a.setAttribute('height', h - 2); a.setAttribute('rx', r);
    b.setAttribute('x', -4); b.setAttribute('y', 3); b.setAttribute('width', w + 6); b.setAttribute('height', h - 2); b.setAttribute('rx', r + 2);
  };
  size();
  new ResizeObserver(size).observe(slider);
  wrap.classList.add('sketch-ready');
  const io = new IntersectionObserver(entries => {
    if (!entries.some(e => e.isIntersecting)) return;
    io.disconnect();
    wrap.classList.add('is-drawn');
    // Restart the active slide's zoom-out so it plays as the image is revealed.
    setTimeout(() => {
      const img = slider.querySelector('.how-slide.is-active img');
      if (img) { img.style.animation = 'none'; void img.offsetWidth; img.style.animation = ''; }
    }, 1400);
    setTimeout(() => wrap.classList.remove('sketch-ready', 'is-drawn'), 3600);
  }, { threshold: .3 });
  io.observe(wrap);
})();
;
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const NS = 'http://www.w3.org/2000/svg';
  function sketchText(el, id) {
    const range = document.createRange();
    range.selectNodeContents(el);
    if (range.getClientRects().length !== 1) return; // only single-line headings
    const text = el.textContent.trim();
    const cs = getComputedStyle(el);
    el.classList.add('text-sketch-host');
    // A zero-size inline marker sits exactly on the text baseline.
    const marker = document.createElement('span');
    marker.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    el.append(marker);
    const place = () => {
      const host = el.getBoundingClientRect(), r = range.getBoundingClientRect();
      return { x: r.left - host.left, y: marker.getBoundingClientRect().top - host.top };
    };
    const { x, y } = place();
    const font = `font-family:${cs.fontFamily};font-size:${cs.fontSize};font-weight:${cs.fontWeight};letter-spacing:${cs.letterSpacing}`;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'text-sketch');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `<defs>
        <pattern id="hatch-${id}" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="rgba(39,50,74,.62)" stroke-width="1.5"/></pattern>
        <filter id="pencil-${id}"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="2.2"/></filter>
      </defs>
      <text class="ts-hatch" x="${x}" y="${y}" fill="url(#hatch-${id})" style="${font}"></text>
      <text class="ts-line" x="${x}" y="${y}" filter="url(#pencil-${id})" style="${font}"></text>
      <text class="ts-line" x="${x + 1.5}" y="${y + 1}" filter="url(#pencil-${id})" style="${font};stroke-width:.7;opacity:.5"></text>`;
    svg.querySelectorAll('text').forEach(t => { t.textContent = text; });
    el.append(svg);
    el.classList.add('text-sketch-ready');
    const io = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return;
      io.disconnect();
      // Re-measure in case fonts or layout settled since setup.
      const p = place();
      svg.querySelectorAll('text').forEach((t, i) => { t.setAttribute('x', p.x + (i === 2 ? 1.5 : 0)); t.setAttribute('y', p.y + (i === 2 ? 1 : 0)); });
      el.classList.add('is-drawn');
      setTimeout(() => { el.classList.remove('text-sketch-ready', 'is-drawn'); svg.remove(); marker.remove(); }, 3300);
    }, { threshold: .6 });
    io.observe(el);
  }
  const start = () => {
    sketchText(document.getElementById('how-title'), 'how');
    sketchText(document.getElementById('integ-title'), 'integ');
  };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(start);
})();
;
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const wrap = document.querySelector('.about-logo-wrap');
  wrap.classList.add('sketch-ready');
  const io = new IntersectionObserver(entries => {
    if (!entries.some(e => e.isIntersecting)) return;
    io.disconnect();
    wrap.classList.add('is-drawn');
    setTimeout(() => wrap.classList.remove('sketch-ready', 'is-drawn'), 3500);
  }, { threshold: .5 });
  io.observe(wrap);
})();
;
(() => {
  const section = document.getElementById('chi-siamo');
  const stage = section.querySelector('.about-stage');
  const title = section.querySelector('.about-title');
  const layers = [...section.querySelectorAll('.about-layer')];
  section.querySelectorAll('[data-n]').forEach(el => el.style.setProperty('--n', el.dataset.n));
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  // Split the heading into letters for the rise-in (screen readers keep the plain label).
  const text = title.textContent;
  title.setAttribute('aria-label', text);
  title.innerHTML = [...text].map((c, i) => c === ' ' ? ' ' : `<span class="ch" aria-hidden="true" style="--i:${i}">${c}</span>`).join('');

  section.classList.add('about-anim');
  const io = new IntersectionObserver(entries => {
    if (!entries.some(e => e.isIntersecting)) return;
    io.disconnect();
    section.classList.add('is-in');
    setTimeout(() => section.classList.remove('about-anim', 'is-in'), 4200);
  }, { threshold: .35 });
  io.observe(section);

  // Mouse parallax: layers drift by their depth, eased every frame.
  const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  let running = false;
  function tick() {
    cur.x += (target.x - cur.x) * .08;
    cur.y += (target.y - cur.y) * .08;
    layers.forEach(l => {
      const d = parseFloat(l.dataset.depth);
      l.style.transform = `translate3d(${(cur.x * d).toFixed(3)}cqw, ${(cur.y * d).toFixed(3)}cqw, 0)`;
    });
    if (Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > .001) requestAnimationFrame(tick);
    else running = false;
  }
  function kick() { if (!running) { running = true; requestAnimationFrame(tick); } }
  stage.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = stage.getBoundingClientRect();
    target.x = ((e.clientX - r.left) / r.width - .5) * -1.6;
    target.y = ((e.clientY - r.top) / r.height - .5) * -1.6;
    kick();
  });
  stage.addEventListener('pointerleave', () => { target.x = target.y = 0; kick(); });
})();
;
(() => {
  const section = document.getElementById('integrazioni');
  const segs = [...section.querySelectorAll('.integ-seg')];
  const items = [...section.querySelectorAll('.integ-item')];
  const svg = section.querySelector('.integ-svg');
  const narrow = matchMedia('(max-width: 800px)');
  const fit = () => svg.setAttribute('viewBox', narrow.matches ? '-50 260 700 680' : '-160 0 1360 1120');
  fit();
  narrow.addEventListener('change', fit);
  const set = i => {
    section.classList.toggle('is-hl', i !== null);
    segs.forEach(s => s.classList.toggle('is-on', s.dataset.i === String(i)));
    items.forEach(it => it.classList.toggle('is-on', it.dataset.i === String(i)));
  };
  [...segs, ...items].forEach(el => {
    el.addEventListener('pointerenter', () => set(el.dataset.i));
    el.addEventListener('pointerleave', () => set(null));
  });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  // Replays each time the block comes back into view; resets once it is fully off screen.
  let playing = false, timer;
  section.classList.add('integ-anim');
  const io = new IntersectionObserver(entries => {
    const e = entries[entries.length - 1];
    if (e.intersectionRatio >= .3 && !playing) {
      playing = true;
      section.classList.add('integ-anim');
      requestAnimationFrame(() => section.classList.add('is-in'));
      // Hand back to the normal styles so hover effects have no leftover delays.
      timer = setTimeout(() => section.classList.remove('integ-anim', 'is-in'), 3200);
    } else if (!e.isIntersecting && playing) {
      playing = false;
      clearTimeout(timer);
      section.classList.remove('is-in');
      section.classList.add('integ-anim');
    }
  }, { threshold: [0, .3] });
  io.observe(section.querySelector('.integ-stage'));
})();
;
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const wrap = document.querySelector('.footer-logo-wrap');
  wrap.classList.add('sketch-ready');
  const io = new IntersectionObserver(entries => {
    if (!entries.some(e => e.isIntersecting)) return;
    io.disconnect();
    wrap.classList.add('is-drawn');
    setTimeout(() => wrap.classList.remove('sketch-ready', 'is-drawn'), 3500);
  }, { threshold: .5 });
  io.observe(wrap);
})();
;
(() => {
  const header = document.querySelector('.site-header');
  const toggle = header.querySelector('.menu-toggle');
  const setOpen = open => {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? T('Chiudi il menu', 'Close the menu') : T('Apri il menu', 'Open the menu'));
  };
  toggle.addEventListener('click', () => setOpen(!header.classList.contains('is-open')));
  // Underline the link of the section currently on screen.
  const links = [...header.querySelectorAll('.main-nav .nav-link[href^="#"]:not([hidden])')];
  const targets = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const spy = () => {
    const y = scrollY + innerHeight * .35;
    let current = targets[0];
    targets.forEach(t => { if (t.getBoundingClientRect().top + scrollY <= y) current = t; });
    links.forEach(l => {
      const on = l.getAttribute('href') === '#' + current.id;
      l.classList.toggle('is-active', on);
      if (on) l.setAttribute('aria-current', 'location'); else l.removeAttribute('aria-current');
    });
  };
  const onScroll = () => { header.classList.toggle('is-scrolled', scrollY > 8); spy(); };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  header.querySelectorAll('.main-nav a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  // Links to a block of this page (tabs, logo, footer) scroll there without adding a browser history
  // step, so "Back" leaves the page instead of replaying every block visited.
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href*="#"]');
    if (!a || a.target === '_blank' || a.href.includes('richiedi-demo')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
    const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!el) return;
    e.preventDefault();
    history.replaceState(history.state, '', url.pathname + url.search + url.hash);
    el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
})();
;
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* 1. scroll progress */
  const header = document.querySelector('.site-header');
  const bar = document.createElement('span');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  header.append(bar);
  let ticking = false;
  const progress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(progress); } }, { passive: true });
  progress();

  /* 2. fade-up on scroll */
  if (!reduce && 'IntersectionObserver' in window) {
    const groups = ['.how-head p', '.plans-head > p', '.plans-toggle', '.plans-note', '.footer-grid > div', '.footer-by'];
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    }), { threshold: .15, rootMargin: '0px 0px -40px 0px' });
    groups.forEach(sel => document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.setProperty('--rd', (i * .12) + 's');
      io.observe(el);
    }));
  }

  /* 3. magnetic buttons + ripple */
  const buttons = document.querySelectorAll('.primary-link, .demo-btn, .plan-cta, .demo-submit, .wa-float');
  buttons.forEach(btn => {
    if (!btn.classList.contains('wa-float')) btn.classList.add('has-ripple');
    btn.addEventListener('pointerdown', e => {
      if (reduce || btn.classList.contains('wa-float')) return;
      const r = btn.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2.2;
      const dot = document.createElement('span');
      dot.className = 'ripple';
      dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
      btn.append(dot);
      setTimeout(() => dot.remove(), 700);
    });
    if (reduce || !finePointer) return;
    btn.classList.add('magnetic');
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * .22, y = (e.clientY - r.top - r.height / 2) * .32;
      btn.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.translate = ''; });
  });

  /* 4. pricing: cursor spotlight + counting prices */
  document.querySelectorAll('.plan').forEach(plan => {
    const card = plan.querySelector('.plan-card');
    const glow = document.createElement('span');
    glow.className = 'plan-glow';
    glow.setAttribute('aria-hidden', 'true');
    card.prepend(glow);
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
  if (!reduce) {
    document.querySelectorAll('.plan-price .amt').forEach(el => {
      let prev = parseFloat(el.textContent) || 0, animating = false;
      new MutationObserver(() => {
        if (animating) return;
        const to = parseFloat(el.textContent);
        if (isNaN(to) || to === prev) return;
        const from = prev, start = performance.now(), dur = 700;
        prev = to;
        animating = true;
        const step = now => {
          const t = Math.min((now - start) / dur, 1), k = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(from + (to - from) * k);
          if (t < 1) requestAnimationFrame(step);
          else { el.textContent = to; requestAnimationFrame(() => { animating = false; }); }
        };
        requestAnimationFrame(step);
      }).observe(el, { childList: true, characterData: true, subtree: true });
    });
  }

  /* 5. slider: swipe, keyboard, pause on hover, mouse drift */
  const slider = document.getElementById('how-slider');
  const dots = [...document.querySelectorAll('#how-dots button')];
  if (slider && dots.length) {
    const current = () => Math.max(0, dots.findIndex(d => d.getAttribute('aria-current') === 'true'));
    const go = dir => dots[(current() + dir + dots.length) % dots.length].click();
    slider.tabIndex = 0;
    slider.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight');
    slider.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    let sx = null, sy = null;
    slider.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    slider.addEventListener('touchend', e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) go(dx < 0 ? 1 : -1);
      sx = null;
    });
    // Pause autoplay while hovered (the slider script listens for these events).
    slider.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') slider.dispatchEvent(new Event('slider:pause')); });
    slider.addEventListener('pointerleave', () => {
      slider.dispatchEvent(new Event('slider:resume'));
      slider.style.removeProperty('--px'); slider.style.removeProperty('--py');
    });
    if (!reduce && finePointer) {
      slider.addEventListener('pointermove', e => {
        const r = slider.getBoundingClientRect();
        slider.style.setProperty('--px', `${((e.clientX - r.left) / r.width - .5) * -18}px`);
        slider.style.setProperty('--py', `${((e.clientY - r.top) / r.height - .5) * -12}px`);
      });
    }
  }
})();
