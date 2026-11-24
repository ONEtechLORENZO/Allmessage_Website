// IT/EN switch: remember which block you were reading and land on the same block
// on the other language page (instead of jumping back to the top).
// Runs inline, right after the markup, so the page opens already in place.
export const keepPlaceScript = `(function () {
  var KEY = 'am-lang-place', LINE = 90;
  function blocks() { return document.querySelectorAll('section[id], footer[id]'); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.lang-switch a[href]');
    if (!a) return;
    if (a.getAttribute('aria-current') === 'true') { e.preventDefault(); return; }
    // Replace instead of adding a history step: "Back" should not flip between the two languages.
    if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) { e.preventDefault(); setTimeout(function () { location.replace(a.href); }, 0); }
    var list = blocks(), pick = null;
    for (var i = 0; i < list.length; i++) {
      var r = list[i].getBoundingClientRect();
      if (r.top <= LINE && r.bottom > LINE) { pick = { id: list[i].id, f: (LINE - r.top) / r.height }; break; }
    }
    if (!pick) return;
    pick.to = new URL(a.href, location.href).pathname; pick.t = Date.now();
    try { sessionStorage.setItem(KEY, JSON.stringify(pick)); } catch (err) {}
  }, true);
  var p = null;
  try { p = JSON.parse(sessionStorage.getItem(KEY)); sessionStorage.removeItem(KEY); } catch (err) {}
  if (!p || p.to !== location.pathname || Date.now() - p.t > 15000 || location.hash) return;
  var moved = false;
  function place() {
    var el = document.getElementById(p.id);
    if (!el || moved) return;
    var r = el.getBoundingClientRect();
    window.scrollTo({ top: Math.max(0, r.top + window.scrollY + p.f * r.height - LINE), behavior: 'instant' });
  }
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  place();
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) {
    window.addEventListener(ev, function () { moved = true; }, { once: true, passive: true });
  });
  document.addEventListener('DOMContentLoaded', place);
  window.addEventListener('load', function () { place(); setTimeout(place, 300); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
})();`;
