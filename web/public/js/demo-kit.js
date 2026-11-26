/* "Richiedi Demo" form + floating WhatsApp button.
 * Used by the AllMessage homepage and by product pages (Milo at /products/milo/).
 * On a page without the form, it loads /demo-kit/it.html or /demo-kit/en.html (the page also links /demo-kit/demo.css).
 * Every "Richiedi Demo" link (href containing "richiedi-demo") opens the form right where the visitor is:
 * no page change, no scrolling. */
(() => {
  if (window.__demoKit) return;
  window.__demoKit = true;

  // Google Apps Script Web App URL (see apps-script/Code.gs). It emails every request to sales@otech.one.
  const DEMO_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxORFMqRA64WzPvV9SvLgTiQV0RsG-J4L-mkDhf7j4K3-hjO2e88kNEtfrNJ0HTosokEw/exec';

  // WhatsApp number in international format, digits only (e.g. '393331234567').
  // Leave empty to open the "Richiedi Demo" form instead.
  const WHATSAPP_NUMBER = '';

  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'it');
  const T = (it, en) => (lang() === 'en' ? en : it);

  // Requests sent from a product page are marked with the product, e.g. "Milo":
  // the sales email subject then ends with "– Milo".
  // (?da=milo: Milo's button used as a plain link, e.g. if this script could not load there)
  const PRODUCT = location.pathname.startsWith('/products/milo') || new URLSearchParams(location.search).get('da') === 'milo' ? 'Milo' : '';

  let demo = null; // the form currently on the page: { open(link), close(), isOpen(), onKey(e) }

  // Any "Richiedi Demo" link, also ones a page adds later (Milo's header is rendered by React).
  document.addEventListener('click', e => {
    const a = e.target.closest?.('a[href*="richiedi-demo"]');
    if (!a || !demo || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    document.querySelector('.site-header')?.classList.remove('is-open');
    demo.open(a);
  });
  document.addEventListener('keydown', e => demo?.onKey(e));

  async function mount() {
    let modal = document.getElementById('demo-modal');
    if (!modal) {
      const res = await fetch(`/demo-kit/${lang()}.html`);
      if (!res.ok) return;
      const kit = document.createElement('div');
      kit.id = 'demo-kit';
      kit.dataset.lang = lang();
      kit.innerHTML = await res.text();
      document.body.append(kit);
      modal = document.getElementById('demo-modal');
    }
    demo = setupForm(modal);
    setupWhatsApp();
    setupSwallow(modal);
    if (location.hash === '#richiedi-demo') demo.open(null);
  }

  // Milo switches IT / EN without reloading the page: swap in the form of the new language.
  new MutationObserver(() => {
    const kit = document.getElementById('demo-kit');
    if (!kit || kit.dataset.lang === lang()) return;
    if (demo?.isOpen()) demo.close();
    kit.remove();
    demo = null;
    mount();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  /* ---------- floating WhatsApp button ---------- */
  function setupWhatsApp() {
    const btn = document.getElementById('wa-float');
    if (!btn || !WHATSAPP_NUMBER) return; // without a number its link opens the demo form
    const text = T(`Ciao, vorrei informazioni su ${PRODUCT || 'Allmessage'}`, `Hi, I would like some information about ${PRODUCT || 'Allmessage'}`);
    btn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    btn.target = '_blank';
    btn.rel = 'noopener';
  }

  /* ---------- the form ---------- */
  function setupForm(modal) {
    const form = document.getElementById('demo-form');
    const steps = [...form.querySelectorAll('.demo-step')];
    const backBtn = document.getElementById('demo-back');
    const nextBtn = document.getElementById('demo-next');
    const label = document.getElementById('demo-step-label');
    const pct = document.getElementById('demo-step-pct');
    const fill = document.getElementById('demo-fill');
    const track = fill.parentElement;
    const success = document.getElementById('demo-success');
    const sendError = document.getElementById('demo-send-error');
    const planBox = document.getElementById('demo-plan');
    let current = 0;
    let lastFocus = null;
    let autoInterest = ''; // "Main interest" text the form filled in by itself (plan or product)
    // Lets the swallow react to what happens in the form.
    const emit = (name, detail) => modal.dispatchEvent(new CustomEvent(name, { detail }));

    function showStep(i) {
      current = i;
      steps.forEach((s, n) => s.classList.toggle('is-active', n === i));
      const p = Math.round(((i + 1) / steps.length) * 100);
      label.innerHTML = `<strong>${T('Passo', 'Step')} ${i + 1} ${T('di', 'of')} ${steps.length}</strong> — ${steps[i].dataset.title}`;
      pct.textContent = p + '%';
      fill.style.width = p + '%';
      track.setAttribute('aria-valuenow', p);
      backBtn.hidden = i === 0;
      nextBtn.textContent = i === steps.length - 1 ? T('Invia richiesta', 'Send request') : T('Avanti', 'Next');
    }

    // Italian numbers only: mobile 3xx (9-10 digits) or landline 0x (6-11 digits), optional +39 / 0039.
    // Returns the number as "+39 <national>" or null when it is not valid.
    function italianPhone(value) {
      let n = String(value).trim();
      if (/[^\d\s+().\/-]/.test(n)) return null;
      n = n.replace(/[\s().\/-]/g, '');
      if (n.startsWith('+39')) n = n.slice(3);
      else if (n.startsWith('0039')) n = n.slice(4);
      else if (n.startsWith('+')) return null;
      if (/^3\d{8,9}$/.test(n) || /^0\d{5,10}$/.test(n)) return '+39 ' + n;
      return null;
    }

    function validField(input) {
      if (input.type === 'checkbox') return input.checked;
      const v = input.value.trim();
      if (!v) return false;
      if (input.type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      if (input.type === 'tel') return italianPhone(v) !== null;
      return true;
    }

    function validateStep(i) {
      let firstBad = null;
      steps[i].querySelectorAll('[required]').forEach(input => {
        const ok = validField(input);
        input.closest('.demo-field').classList.toggle('has-error', !ok);
        input.setAttribute('aria-invalid', String(!ok));
        if (!ok && !firstBad) firstBad = input;
      });
      if (firstBad) { firstBad.focus(); emit('demo:error'); }
      return !firstBad;
    }

    form.addEventListener('input', e => {
      const field = e.target.closest('.demo-field');
      if (field && field.classList.contains('has-error') && validField(e.target)) field.classList.remove('has-error');
    });

    backBtn.addEventListener('click', () => { if (current > 0) { showStep(current - 1); emit('demo:step', { dir: -1 }); } });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validateStep(current)) return;
      if (current < steps.length - 1) {
        showStep(current + 1);
        emit('demo:step', { dir: 1 });
        steps[current].querySelector('input, textarea').focus();
        return;
      }
      sendError.hidden = true;
      nextBtn.disabled = true;
      nextBtn.textContent = T('Invio…', 'Sending…');
      try {
        if (!DEMO_ENDPOINT) throw new Error('Endpoint non configurato');
        const data = Object.fromEntries(new FormData(form));
        // Bot trap: hidden field with a meaningless name (hp_zq7k) and autocomplete="new-password",
        // so browser autofill leaves it empty. The Apps Script still receives it as "website".
        data.website = data.hp_zq7k || '';
        delete data.hp_zq7k;
        data.telefono = italianPhone(data.telefono) || data.telefono;
        data.pagina = location.href;
        // text/plain keeps this a "simple" request: Apps Script cannot answer a CORS preflight.
        const res = await fetch(DEMO_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) });
        const out = await res.json().catch(() => ({ ok: res.ok }));
        if (!out.ok) throw new Error(out.error || res.status);
        form.hidden = true;
        success.hidden = false;
        emit('demo:success');
        success.querySelector('button').focus();
      } catch {
        sendError.hidden = false;
      } finally {
        nextBtn.disabled = false;
        nextBtn.textContent = T('Invia richiesta', 'Send request');
      }
    });

    function resetForm() {
      form.reset();
      form.querySelectorAll('.has-error').forEach(f => f.classList.remove('has-error'));
      form.hidden = false;
      success.hidden = true;
      sendError.hidden = true;
      showStep(0);
    }

    // Plan chosen in "Piani" (homepage): shown at the top of the form and sent with the request.
    function setPlan(card) {
      planBox.className = 'demo-plan';
      if (!card) { form.elements.piano.value = ''; planBox.hidden = true; return; }
      const raw = card.querySelector('.plan-tag span').textContent.trim();
      const name = raw.charAt(0) + raw.slice(1).toLowerCase();
      const price = '€' + card.querySelector('.plan-price .amt').textContent.trim() + card.querySelector('.plan-per').textContent.trim();
      const period = document.querySelector('.plans-toggle [aria-pressed="true"]')?.textContent.trim() || '';
      form.elements.piano.value = `${name} · ${price}${period ? ' (' + period + ')' : ''}`;
      planBox.classList.add('is-' + raw.toLowerCase());
      planBox.querySelector('.demo-plan-icon').innerHTML = card.querySelector('.tier-icon')?.outerHTML || '';
      planBox.querySelector('.demo-plan-name').textContent = name;
      planBox.querySelector('.demo-plan-price').textContent = `${price}${period ? T(' · fatturazione ', ' · billed ') + period.toLowerCase() : ''}`;
      planBox.hidden = false;
      prefillInterest(T(`Piano ${name}`, `${name} plan`));
    }
    function prefillInterest(text) {
      const field = form.elements.interesse;
      if (field.value && field.value !== autoInterest) return; // the visitor typed their own
      field.value = autoInterest = text;
    }
    planBox.querySelector('.demo-plan-remove').addEventListener('click', () => {
      const name = planBox.querySelector('.demo-plan-name').textContent;
      if (form.elements.interesse.value === T(`Piano ${name}`, `${name} plan`)) form.elements.interesse.value = '';
      setPlan(null);
    });

    const isOpen = () => modal.classList.contains('is-open');

    function open(link) {
      if (!success.hidden) resetForm();
      const card = link?.closest('.plan') || null;
      setPlan(card);
      if (!card) {
        form.elements.piano.value = PRODUCT;
        prefillInterest(PRODUCT);
      }
      if (isOpen()) return;
      lastFocus = document.activeElement;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('demo-lock');
      emit('demo:open');
      setTimeout(() => (steps[current].querySelector('input, textarea') || nextBtn).focus({ preventScroll: true }), 50);
    }

    function close() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('demo-lock');
      emit('demo:close');
      if (location.hash === '#richiedi-demo') history.replaceState(history.state, '', location.pathname + location.search);
      // back to the button that opened the form, without moving the page
      if (lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
    }

    function onKey(e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const items = [...modal.querySelectorAll('button, input, textarea, a[href]')].filter(el => !el.disabled && el.offsetParent !== null);
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    modal.querySelectorAll('[data-demo-close]').forEach(b => b.addEventListener('click', close));
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    return { open, close, isOpen, onKey };
  }

  /* ---------- the swallow joins the form ----------
   * It perches on the tip of the progress bar and pulls a trick every time the step changes. */
  function setupSwallow(modal) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const dialog = modal.querySelector('.demo-dialog');
    const form = document.getElementById('demo-form');
    const fill = document.getElementById('demo-fill');
    const check = modal.querySelector('.demo-check');

    const bird = document.createElement('div');
    bird.className = 'swallow demo-swallow';
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
    dialog.append(bird);
    const inner = bird.firstElementChild;

    const FOOT_X = 72 / 120, FOOT_Y = (40 + 12) / 72;
    // Each move returns a gentle offset and pitch for progress p (0 → 1).
    const TRICKS = {
      glide: { ms: 1150, fly: true, at: p => ({ dx: 0, dy: -Math.sin(Math.PI * p) * 22, rot: -Math.cos(Math.PI * p) * 5 * Math.sin(Math.PI * p) }) },
      nod: { ms: 650, fly: false, at: p => ({ dx: 0, dy: 0, rot: Math.sin(p * Math.PI * 2) * 5 * (1 - p) }) },
      arrive: { ms: 1500, fly: true, at: p => ({ dx: 0, dy: -Math.sin(Math.PI * p) * 36, rot: -Math.cos(Math.PI * p) * 6 * Math.sin(Math.PI * p) }) },
    };

    const pos = { x: 0, y: 0 }, vel = { x: 0, y: 0 };
    let face = -1, faceTarget = -1, tilt = 0, landed = false, running = false;
    let trick = null, last = 0;

    function target() {
      const d = dialog.getBoundingClientRect();
      if (form.hidden) {
        const r = check.getBoundingClientRect();
        return { x: r.left + r.width * .5 - d.left, y: r.top + 2 - d.top };
      }
      const r = fill.getBoundingClientRect();
      return { x: r.right - 10 - d.left, y: r.top - 2 - d.top };
    }

    function play(name) {
      trick = { ...TRICKS[name], start: performance.now() };
      if (trick.fly) landed = false;
    }

    function start() {
      const d = dialog.getBoundingClientRect();
      pos.x = d.width + 90; pos.y = 30; vel.x = vel.y = 0;
      face = faceTarget = -1; tilt = 0; landed = false; trick = null;
      bird.classList.add('is-visible');
      if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    }

    modal.addEventListener('demo:open', start);
    modal.addEventListener('demo:close', () => { running = false; bird.classList.remove('is-visible'); });
    modal.addEventListener('demo:step', e => { faceTarget = e.detail.dir; play('glide'); });
    modal.addEventListener('demo:error', () => { if (!trick || !trick.fly) play('nod'); });
    modal.addEventListener('demo:success', () => play('arrive'));

    function frame(now) {
      if (!running || !bird.isConnected) { running = false; return; }
      const dt = Math.min(now - last, 40) / 1000;
      last = now;
      const w = bird.offsetWidth, h = w * 72 / 120;
      const t = target();

      let off = { dx: 0, dy: 0, rot: 0 };
      if (trick) {
        const p = Math.min((now - trick.start) / trick.ms, 1);
        off = trick.at(p);
        if (p >= 1) trick = null;
      }
      const flying = trick && trick.fly;

      if (landed) {
        // Stay on the tip of the bar while it grows or shrinks.
        const e = 1 - Math.exp(-14 * dt);
        pos.x += (t.x - pos.x) * e; pos.y += (t.y - pos.y) * e; vel.x = vel.y = 0;
      } else {
        const k = 9, c = 2 * Math.sqrt(k);
        vel.x += ((t.x - pos.x) * k - vel.x * c) * dt;
        vel.y += ((t.y - pos.y) * k - vel.y * c) * dt;
        pos.x += vel.x * dt; pos.y += vel.y * dt;
        if (!flying && Math.hypot(t.x - pos.x, t.y - pos.y) < 16 && Math.hypot(vel.x, vel.y) < 160) { landed = true; faceTarget = 1; }
      }
      bird.dataset.state = landed && !flying ? 'perch' : 'fly';

      if (!landed && !flying && Math.abs(vel.x) > 90) faceTarget = vel.x > 0 ? 1 : -1;
      face += (faceTarget - face) * (1 - Math.exp(-10 * dt));
      const tiltTarget = landed ? 0 : Math.max(-10, Math.min(10, vel.y * .015)) * faceTarget;
      tilt += (tiltTarget - tilt) * (1 - Math.exp(-8 * dt));

      bird.style.transform = `translate3d(${pos.x + off.dx - w * FOOT_X}px, ${pos.y + off.dy - h * FOOT_Y}px, 0)`;
      inner.style.transform = `scaleX(${face.toFixed(3)}) rotate(${(tilt + off.rot).toFixed(2)}deg)`;
      requestAnimationFrame(frame);
    }

    if (modal.classList.contains('is-open')) start();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
