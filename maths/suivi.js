// Suivi des révisions (même Apps Script que la page SEVES) :
// - une ligne « ouverture » par visite du site Maths chap 5 (une seule par onglet, pas une par page) ;
// - une ligne « note » quand un QCM est terminé ou abandonné en cours de route (voir build() dans les pages).
(() => {
  const ENDPOINT = 'https://script.google.com/macros/s/AKfycbzFxgvSm59K1zOjh4MxUhZjhcE3X_VYW030iU1o6WIB7XBtDqTjbseNtYJjpNkPBslmfw/exec';
  const SITE = 'Maths chap 5';
  const rnd = () => Math.random().toString(36).slice(2, 10);
  const keep = (store, key, make) => {
    try { let v = store.getItem(key); if (!v) { v = make(); store.setItem(key, v); } return v; }
    catch (e) { return make(); }
  };
  const dev = keep(localStorage, 'ysra.device', rnd);
  const sid = keep(sessionStorage, 'ysra.maths5.session', rnd);
  const open = keep(sessionStorage, 'ysra.maths5.ouverture', () => new Date().toISOString());
  let leaving = false;
  function send(type, extra) {
    if (!ENDPOINT) return;
    const body = JSON.stringify(Object.assign({
      type, site: SITE, session: sid, appareil: dev, ouverture: open,
      quand: new Date().toISOString(), ua: navigator.userAgent
    }, extra || {}));
    // Quand la page se ferme, sendBeacon est le seul envoi que le navigateur garantit.
    try { if (leaving && navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, body)) return; } catch (e) {}
    try { fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain' }, body }).catch(() => {}); }
    catch (e) {}
  }
  window.ysraTrack = send;
  let first = true;
  try { first = !sessionStorage.getItem('ysra.maths5.vu'); sessionStorage.setItem('ysra.maths5.vu', '1'); } catch (e) {}
  if (first) send('ouverture');
  // QCM laissé en cours : on envoie l'état au moment où la page est quittée ou masquée.
  const flush = () => { leaving = true; document.querySelectorAll('.quiz').forEach(b => b._flush && b._flush()); leaving = false; };
  addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
})();
