/* Maths · Chapitre 5 — moteur des QCM, des graphes et des activités */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const DELIMS = [{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false}];
function render(el){ if (window.renderMathInElement) { try { renderMathInElement(el, {delimiters: DELIMS, throwOnError: false}); } catch (e) {} } }
function tex(s){ if (window.katex) { try { return katex.renderToString(s, {throwOnError:false}); } catch (e) {} } return s; }
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmt = (v, d = 2) => { if (!isFinite(v)) return v > 0 ? '+\\infty' : (v < 0 ? '-\\infty' : '\\text{non défini}'); const r = Math.round(v * 10 ** d) / 10 ** d; return String(r).replace('.', '{,}'); };
const fmtTxt = (v, d = 2) => { if (!isFinite(v)) return 'non défini'; const r = Math.round(v * 10 ** d) / 10 ** d; return String(r).replace('.', ','); };

/* ================= QCM ================= */
// Source dans la page : <div class="quiz" data-label="..."><div class="qsrc"><div data-a="2">énoncé<ul><li>…</li></ul><p class="e">explication</p></div>…</div></div>
// data-a : numéro(s) des bonnes réponses, à partir de 1 (« 1,3 » si plusieurs). data-draw="20" : tirage aléatoire.
function parseBank(src){
  return $$(':scope > div', src).map(d => {
    const c = d.cloneNode(true);
    const ul = $('ul', c), e = $('.e', c);
    const choices = ul ? $$(':scope > li', ul).map(li => li.innerHTML) : [];
    const expl = e ? e.innerHTML : '';
    if (ul) ul.remove(); if (e) e.remove();
    return { q: c.innerHTML.trim(), c: choices, a: (d.dataset.a || '1').split(',').map(x => +x - 1), e: expl, part: d.dataset.part || '' };
  });
}
function drawFrom(bank, n){
  if (!n || n >= bank.length) return shuffle(bank);
  // tirage équilibré par partie (data-part) quand il y en a
  const parts = {}; bank.forEach(q => (parts[q.part] = parts[q.part] || []).push(q));
  const keys = Object.keys(parts); const out = [];
  const pools = keys.map(k => shuffle(parts[k]));
  let i = 0; while (out.length < n) { const p = pools[i % pools.length]; if (p.length) out.push(p.shift()); i++; if (pools.every(x => !x.length)) break; }
  return shuffle(out);
}
function buildQuiz(box){
  const src = $('.qsrc', box); if (!src) return;
  const bank = parseBank(src); src.remove();
  const label = box.dataset.label || 'QCM';
  const n = +box.dataset.draw || 0;
  const head = document.createElement('div');
  head.className = 'bar';
  head.innerHTML = `<progress value="0"></progress><span class="score"></span><button type="button" class="btn ghost" data-act="reset">↻ ${n ? 'Nouveau tirage' : 'Recommencer'}</button>`;
  const wrap = document.createElement('div'); const res = document.createElement('div'); res.className = 'result';
  box.append(head, wrap, res);
  const prog = $('progress', head), score = $('.score', head);
  let qs, done, good, miss, t0, sentAt;
  function report(){
    if (!window.ysraTrack || !done || sentAt === done) return; sentAt = done;
    const full = done === qs.length;
    window.ysraTrack('note', { serie: label + (full ? ' — terminé' : ` — interrompu (${done} questions faites sur ${qs.length})`), score: good, total: full ? qs.length : done,
      pourcentage: Math.round(good / done * 100), a_revoir: miss.join(' | '), duree_min: Math.round((Date.now() - t0) / 60000) });
  }
  box._flush = report;
  function upd(){
    prog.max = qs.length; prog.value = done;
    score.textContent = `${good} / ${done} juste${good > 1 ? 's' : ''} · ${qs.length - done} restante${qs.length - done > 1 ? 's' : ''}`;
    if (done === qs.length) {
      const sur20 = Math.round(good / qs.length * 200) / 10;
      const msg = sur20 >= 16 ? 'Excellent : ce chapitre est acquis.' : sur20 >= 12 ? 'Bien : relis les explications des questions ratées.' : sur20 >= 8 ? 'C’est un début : reprends les fiches des notions ratées puis recommence.' : 'Pas de panique : relis les fiches « L’idée » et « Exemple résolu » puis refais le QCM.';
      res.innerHTML = `<div class="big">${good} / ${qs.length} · ${String(sur20).replace('.', ',')} / 20</div><p>${msg}</p>${miss.length ? '<p><b>À revoir :</b> ' + miss.join(' · ') + '</p>' : ''}`;
      res.classList.add('show'); report();
    }
  }
  function build(){
    if (qs && done && done < qs.length) report();
    qs = drawFrom(bank, n); done = 0; good = 0; miss = []; t0 = Date.now(); sentAt = 0;
    res.classList.remove('show'); wrap.innerHTML = '';
    qs.forEach((Q, k) => {
      const multi = Q.a.length > 1; const order = shuffle(Q.c.map((_, i) => i));
      const d = document.createElement('div'); d.className = 'q';
      d.innerHTML = `<div class="qt"><span class="n">${k + 1}.</span>${Q.q}${multi ? '<span class="multi">plusieurs réponses</span>' : ''}</div>` +
        order.map(i => `<label><input type="${multi ? 'checkbox' : 'radio'}" name="${box.id || 'q'}-${k}" value="${i}"><span>${Q.c[i]}</span></label>`).join('') +
        `<button type="button" class="btn" style="margin-top:6px">Valider</button><div class="fb"></div>`;
      const btn = $('button', d), fb = $('.fb', d);
      btn.onclick = () => {
        const chosen = $$('input', d).filter(x => x.checked).map(x => +x.value);
        if (!chosen.length) { fb.innerHTML = 'Choisis au moins une réponse.'; fb.classList.add('show'); return; }
        const ok = chosen.length === Q.a.length && chosen.every(x => Q.a.includes(x));
        $$('label', d).forEach(l => { const v = +$('input', l).value; if (Q.a.includes(v)) l.classList.add('good'); else if (chosen.includes(v)) l.classList.add('bad'); $('input', l).disabled = true; });
        btn.disabled = true; done++; if (ok) good++; else miss.push(Q.part ? Q.part : 'question ' + (k + 1));
        fb.innerHTML = `<b class="${ok ? 'ok' : 'no'}">${ok ? '✔ Juste.' : '✘ Pas tout à fait.'}</b> ${Q.e}`; fb.classList.add('show'); render(fb); upd();
      };
      wrap.append(d);
    });
    render(wrap); upd();
  }
  $('[data-act=reset]', head).onclick = build;
  build();
}

/* ================= Graphes ================= */
class Plot {
  constructor(cv, o){ this.cv = cv; this.o = Object.assign({xmin:-5,xmax:5,ymin:-4,ymax:4}, o); const r = window.devicePixelRatio || 1;
    this.W = +cv.getAttribute('width') || 640; this.H = +cv.getAttribute('height') || 400; cv.width = this.W * r; cv.height = this.H * r; this.c = cv.getContext('2d'); this.c.setTransform(r, 0, 0, r, 0, 0); }
  X(x){ const o = this.o; return (x - o.xmin) / (o.xmax - o.xmin) * this.W; }
  Y(y){ const o = this.o; return this.H - (y - o.ymin) / (o.ymax - o.ymin) * this.H; }
  set(o){ Object.assign(this.o, o); }
  clear(){ const c = this.c, o = this.o; c.clearRect(0, 0, this.W, this.H); c.fillStyle = '#fff'; c.fillRect(0, 0, this.W, this.H);
    const step = (a, b) => { const r = b - a; return r > 40 ? 10 : r > 16 ? 2 : r > 3 ? 1 : 0.5; };
    const sx = o.sx || step(o.xmin, o.xmax), sy = o.sy || step(o.ymin, o.ymax);
    c.lineWidth = 1; c.strokeStyle = '#edf1f3';
    for (let x = Math.ceil(o.xmin / sx) * sx; x <= o.xmax; x += sx) { c.beginPath(); c.moveTo(this.X(x), 0); c.lineTo(this.X(x), this.H); c.stroke(); }
    for (let y = Math.ceil(o.ymin / sy) * sy; y <= o.ymax; y += sy) { c.beginPath(); c.moveTo(0, this.Y(y)); c.lineTo(this.W, this.Y(y)); c.stroke(); }
    c.strokeStyle = '#7d8c99'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(0, this.Y(0)); c.lineTo(this.W, this.Y(0)); c.moveTo(this.X(0), 0); c.lineTo(this.X(0), this.H); c.stroke();
    c.fillStyle = '#647587'; c.font = '11px Inter,system-ui,sans-serif';
    for (let x = Math.ceil(o.xmin / sx) * sx; x <= o.xmax; x += sx) if (Math.abs(x) > 1e-9) c.fillText(fmtTxt(x, 1), this.X(x) + 2, Math.min(this.H - 3, Math.max(11, this.Y(0) + 12)));
    for (let y = Math.ceil(o.ymin / sy) * sy; y <= o.ymax; y += sy) if (Math.abs(y) > 1e-9) c.fillText(fmtTxt(y, 1), Math.min(this.W - 24, Math.max(2, this.X(0) + 4)), this.Y(y) - 2);
  }
  curve(f, col = '#117b83', opt = {}){
    const c = this.c, o = this.o, a = opt.from ?? o.xmin, b = opt.to ?? o.xmax, N = opt.N || 800, jump = opt.jump ?? (o.ymax - o.ymin) * 0.6;
    c.strokeStyle = col; c.lineWidth = opt.w || 2.4; c.setLineDash(opt.dash || []); c.beginPath(); let pen = false, py = 0;
    for (let i = 0; i <= N; i++) { const x = a + (b - a) * i / N; const y = f(x);
      if (!isFinite(y) || y > o.ymax + (o.ymax - o.ymin) * 3 || y < o.ymin - (o.ymax - o.ymin) * 3) { pen = false; continue; }
      if (pen && Math.abs(y - py) > jump) pen = false;
      if (!pen) { c.moveTo(this.X(x), this.Y(y)); pen = true; } else c.lineTo(this.X(x), this.Y(y)); py = y; }
    c.stroke(); c.setLineDash([]);
  }
  point(x, y, col = '#14314c', lab = '', open = false){ const c = this.c; c.beginPath(); c.arc(this.X(x), this.Y(y), 5, 0, 7); if (open) { c.fillStyle = '#fff'; c.fill(); c.strokeStyle = col; c.lineWidth = 2; c.stroke(); } else { c.fillStyle = col; c.fill(); }
    if (lab) { c.font = 'bold 13px Inter,system-ui,sans-serif'; c.fillStyle = col; c.fillText(lab, this.X(x) + 7, this.Y(y) - 7); } }
  seg(x1, y1, x2, y2, col = '#647587', dash = [5, 4], w = 1.4){ const c = this.c; c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash); c.beginPath(); c.moveTo(this.X(x1), this.Y(y1)); c.lineTo(this.X(x2), this.Y(y2)); c.stroke(); c.setLineDash([]); }
  hline(y, col, dash = [6, 4], w = 2){ this.seg(this.o.xmin, y, this.o.xmax, y, col, dash, w); }
  vline(x, col, dash = [6, 4], w = 2){ this.seg(x, this.o.ymin, x, this.o.ymax, col, dash, w); }
  xband(a, b, col){ const c = this.c; c.fillStyle = col; c.globalAlpha = .9; c.fillRect(this.X(a), this.Y(0) - 4, this.X(b) - this.X(a), 8); c.globalAlpha = 1; }
  yband(a, b, col){ const c = this.c; c.fillStyle = col; c.globalAlpha = .9; c.fillRect(this.X(0) - 4, this.Y(b), 8, this.Y(a) - this.Y(b)); c.globalAlpha = 1; }
  text(x, y, s, col = '#14314c'){ const c = this.c; c.font = 'bold 13px Inter,system-ui,sans-serif'; c.fillStyle = col; c.fillText(s, this.X(x), this.Y(y)); }
}
const TEAL = '#117b83', GOLD = '#d99a2b', BLUE = '#3d5fb0', RED = '#b2442f', VIO = '#8a4fb5';
const Ent = Math.floor;

/* ---------- A1 : application ou pas ? (diagrammes en flèches) ---------- */
const DIAGS = [
  {L:['Ali','Bea','Chen'], R:['Paris','Lyon','Nice'], A:[[0,0],[1,1],[2,1]], ok:true, why:'Chaque élève (à gauche) a exactement une flèche. Peu importe que Nice n’ait aucun antécédent, et que Lyon en ait deux.'},
  {L:['1','2','3'], R:['a','b'], A:[[0,0],[1,1]], ok:false, why:'L’élément 3 n’a pas d’image : il n’a aucune flèche. Dans une application, TOUS les éléments de départ ont une image.'},
  {L:['1','2','3'], R:['a','b','c'], A:[[0,0],[1,1],[1,2],[2,2]], ok:false, why:'L’élément 2 a deux images (b et c). Dans une application, chaque élément a UNE SEULE image.'},
  {L:['x','y','z'], R:['5'], A:[[0,0],[1,0],[2,0]], ok:true, why:'Chaque élément a une seule flèche. Ils vont tous vers 5 : c’est autorisé (application « constante »).'},
  {L:['Lun','Mar'], R:['Maths','SVT','Chimie','Info'], A:[[0,2],[1,0]], ok:true, why:'Chaque jour a exactement une image. SVT et Info n’ont pas d’antécédent : c’est autorisé, l’ensemble d’arrivée peut être « gros ».'},
  {L:['−2','0','2'], R:['0','4'], A:[[0,1],[1,0],[2,1]], ok:true, why:'C’est x ↦ x² : −2 et 2 ont la même image 4. Deux flèches peuvent arriver au même endroit ; c’est le DÉPART qui doit avoir une seule flèche.'},
  {L:['4','9'], R:['−3','−2','2','3'], A:[[0,1],[0,2],[1,0],[1,3]], ok:false, why:'4 a deux images (−2 et 2) : la règle « nombre dont le carré vaut x » n’est pas une application. C’est pour ça qu’on choisit √x ≥ 0, une seule valeur.'},
];
function diagSVG(D){
  const h = Math.max(D.L.length, D.R.length) * 44 + 20, yL = i => 30 + i * (h - 40) / Math.max(1, D.L.length - 1) * (D.L.length > 1 ? 1 : 0) + (D.L.length > 1 ? 0 : (h - 40) / 2), yR = i => 30 + i * (h - 40) / Math.max(1, D.R.length - 1) * (D.R.length > 1 ? 1 : 0) + (D.R.length > 1 ? 0 : (h - 40) / 2);
  let s = `<svg viewBox="0 0 400 ${h + 20}"><defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#117b83"/></marker></defs>`;
  s += `<ellipse cx="80" cy="${(h + 20) / 2}" rx="62" ry="${h / 2}" fill="#eef3f4" stroke="#9fb3bd"/><ellipse cx="320" cy="${(h + 20) / 2}" rx="62" ry="${h / 2}" fill="#fdf8ee" stroke="#d6bf8f"/>`;
  s += `<text x="80" y="14" text-anchor="middle" font-weight="700">E (départ)</text><text x="320" y="14" text-anchor="middle" font-weight="700">F (arrivée)</text>`;
  D.A.forEach(([i, j]) => { s += `<line x1="104" y1="${yL(i) + 10}" x2="292" y2="${yR(j) + 10}" stroke="#117b83" stroke-width="2" marker-end="url(#ar)"/>`; });
  D.L.forEach((t, i) => { s += `<circle cx="96" cy="${yL(i) + 10}" r="4" fill="#14314c"/><text x="88" y="${yL(i) + 15}" text-anchor="end">${t}</text>`; });
  D.R.forEach((t, j) => { s += `<circle cx="300" cy="${yR(j) + 10}" r="4" fill="#9a6a12"/><text x="310" y="${yR(j) + 15}">${t}</text>`; });
  return s + '</svg>';
}
function actDiag(el){
  let k = 0, sc = 0, seen = 0; const order = shuffle(DIAGS);
  el.insertAdjacentHTML('beforeend', `<div class="diag"></div><div class="choices"><button class="btn" data-v="1">C’est une application</button><button class="btn ghost" data-v="0">Ce n’est PAS une application</button></div><div class="verdict"></div><div class="choices"><button class="btn ghost" data-next>Diagramme suivant →</button></div>`);
  const box = $('.diag', el), v = $('.verdict', el), next = $('[data-next]', el); const bts = $$('[data-v]', el);
  function show(){ const D = order[k % order.length]; box.innerHTML = diagSVG(D); v.textContent = `Diagramme ${k % order.length + 1} / ${order.length}`; v.className = 'verdict'; bts.forEach(b => b.disabled = false); next.style.display = 'none'; }
  bts.forEach(b => b.onclick = () => { const D = order[k % order.length]; const ok = (b.dataset.v === '1') === D.ok; seen++; if (ok) sc++;
    v.className = 'verdict ' + (ok ? 'ok' : 'no'); v.innerHTML = (ok ? '✔ Bravo. ' : '✘ Non. ') + D.why + ` <span style="color:var(--mut);font-weight:500">(score : ${sc}/${seen})</span>`; bts.forEach(x => x.disabled = true); next.style.display = ''; });
  next.onclick = () => { k++; show(); }; show();
}

/* ---------- A4 : image directe / image réciproque de f(x)=√(x+1) ---------- */
function actImage(el){
  el.insertAdjacentHTML('beforeend', `<div class="ctrl"><label>Mode <select data-mode><option value="d">Image directe f(A)</option><option value="r">Image réciproque f⁻¹(B)</option></select></label></div>
  <div class="ctrl" data-a><label>a <input type="range" min="0" max="24" step="0.5" value="0" data-a1><span></span></label><label>b <input type="range" min="0" max="24" step="0.5" value="3" data-a2><span></span></label></div>
  <div class="ctrl" data-b hidden><label>c <input type="range" min="0" max="5.4" step="0.1" value="2" data-b1><span></span></label><label>d <input type="range" min="0" max="5.4" step="0.1" value="5" data-b2><span></span></label></div>
  <canvas class="plot" width="640" height="380"></canvas><div class="readout"></div>`);
  const P = new Plot($('canvas', el), {xmin:-2, xmax:26, ymin:-0.6, ymax:6, sx:2, sy:1}); const f = x => x >= 0 ? Math.sqrt(x + 1) : NaN;
  const out = $('.readout', el), m = $('[data-mode]', el);
  function draw(){
    const mode = m.value; $('[data-a]', el).hidden = mode !== 'd'; $('[data-b]', el).hidden = mode !== 'r';
    P.clear(); P.curve(f, '#9fb3bd');
    if (mode === 'd') {
      let a = +$('[data-a1]', el).value, b = +$('[data-a2]', el).value; if (a > b) [a, b] = [b, a];
      $('[data-a1]', el).nextElementSibling.textContent = fmtTxt(+$('[data-a1]', el).value); $('[data-a2]', el).nextElementSibling.textContent = fmtTxt(+$('[data-a2]', el).value);
      P.xband(a, b, TEAL); P.curve(f, TEAL, {from:a, to:b, w:4}); P.yband(f(a), f(b), GOLD);
      P.seg(a, 0, a, f(a)); P.seg(a, f(a), 0, f(a)); P.seg(b, 0, b, f(b)); P.seg(b, f(b), 0, f(b));
      P.text(a + 0.2, -0.45, 'A', TEAL); P.text(0.5, (f(a) + f(b)) / 2, 'f(A)', '#9a6a12');
      out.innerHTML = `${tex(`A=[${fmt(a)}\\,;\\,${fmt(b)}]`)} (en vert sur l’axe des abscisses). On envoie chaque point de A sur la courbe : les hauteurs obtenues forment ${tex(`f(A)=[\\sqrt{${fmt(a)}+1}\\,;\\,\\sqrt{${fmt(b)}+1}]=[${fmt(f(a))}\\,;\\,${fmt(f(b))}]`)} (en jaune sur l’axe des ordonnées).`;
    } else {
      let c = +$('[data-b1]', el).value, d = +$('[data-b2]', el).value; if (c > d) [c, d] = [d, c];
      $('[data-b1]', el).nextElementSibling.textContent = fmtTxt(+$('[data-b1]', el).value); $('[data-b2]', el).nextElementSibling.textContent = fmtTxt(+$('[data-b2]', el).value);
      P.yband(c, d, GOLD); P.text(0.5, (c + d) / 2, 'B', '#9a6a12');
      if (d < 1) { out.innerHTML = `${tex(`B=[${fmt(c)}\\,;\\,${fmt(d)}]`)}. Or ${tex('\\sqrt{x+1}\\geqslant 1')} pour tout ${tex('x\\geqslant 0')} : aucune hauteur de la courbe n’est dans B. Donc ${tex('f^{-1}(B)=\\varnothing')} (ensemble vide). Ce n’est pas une erreur : une image réciproque peut être vide.`; return; }
      const lo = Math.max(0, c * c - 1), hi = d * d - 1;
      P.hline(c, GOLD, [5, 4], 1.3); P.hline(d, GOLD, [5, 4], 1.3); P.xband(lo, hi, TEAL); P.curve(f, TEAL, {from:lo, to:hi, w:4});
      P.seg(lo, 0, lo, f(lo)); P.seg(hi, 0, hi, f(hi)); P.text(lo + 0.2, -0.45, 'f⁻¹(B)', TEAL);
      out.innerHTML = `${tex(`B=[${fmt(c)}\\,;\\,${fmt(d)}]`)}. On cherche tous les ${tex('x\\geqslant0')} tels que ${tex(`${fmt(c)}\\leqslant\\sqrt{x+1}\\leqslant ${fmt(d)}`)}. On élève au carré (tout est positif) : ${tex(`${fmt(c * c)}\\leqslant x+1\\leqslant ${fmt(d * d)}`)}, donc ${tex(`${fmt(c * c - 1)}\\leqslant x\\leqslant ${fmt(hi)}`)}${c * c - 1 < 0 ? `, et comme x doit être ≥ 0 : ` : ''}. Résultat : ${tex(`f^{-1}(B)=[${fmt(lo)}\\,;\\,${fmt(hi)}]`)} (en vert).`;
    }
  }
  $$('input,select', el).forEach(i => i.oninput = draw); draw();
}

/* ---------- A5 : machine à composer ---------- */
function actCompo(el){
  el.insertAdjacentHTML('beforeend', `<div class="ctrl"><label>Choisis x <input type="number" step="0.5" value="4" data-x></label><label><input type="range" min="-3" max="8" step="0.5" value="4" data-xr></label></div>
  <div class="grid2"><div class="mini"><h4>${tex('g\\circ f')} : d’abord f, puis g</h4><div data-gf></div></div><div class="mini"><h4>${tex('f\\circ g')} : d’abord g, puis f</h4><div data-fg></div></div></div>`);
  const f = x => 2 * x - 3, g = x => x > 0 ? Math.log(x) : NaN; const ix = $('[data-x]', el), ir = $('[data-xr]', el);
  function draw(src){ if (src === 'r') ix.value = ir.value; else ir.value = ix.value; const x = +ix.value;
    const fx = f(x), gfx = g(fx);
    $('[data-gf]', el).innerHTML = `<p>${tex(`x=${fmt(x)}`)} → machine f → ${tex(`f(${fmt(x)})=2\\times${fmt(x)}-3=${fmt(fx)}`)}</p><p>→ machine g → ${isFinite(gfx) ? tex(`g(${fmt(fx)})=\\ln(${fmt(fx)})\\approx${fmt(gfx)}`) : `<b class="k-no">bloqué !</b> ${tex(`\\ln(${fmt(fx)})`)} n’existe pas car ${tex(`${fmt(fx)}\\leqslant 0`)}. C’est pour ça que ${tex('g\\circ f')} n’est définie que pour ${tex('x>\\tfrac32')}.`}</p>`;
    const gx = g(x);
    $('[data-fg]', el).innerHTML = isFinite(gx) ? `<p>${tex(`x=${fmt(x)}`)} → machine g → ${tex(`\\ln(${fmt(x)})\\approx${fmt(gx)}`)}</p><p>→ machine f → ${tex(`2\\times${fmt(gx)}-3\\approx${fmt(f(gx))}`)}</p>` : `<p>${tex(`x=${fmt(x)}`)} → machine g → <b class="k-no">bloqué dès le départ</b> : ${tex('\\ln')} n’accepte que les nombres strictement positifs. ${tex('f\\circ g')} est définie sur ${tex('\\mathbb R^{+*}')}.</p>`; }
  ix.oninput = () => draw('n'); ir.oninput = () => draw('r'); draw('n');
}

/* ---------- A6 : réciproque et symétrie par rapport à y = x ---------- */
const PAIRS = {
  exp: {f: Math.exp, g: x => x > 0 ? Math.log(x) : NaN, nf: 'f(x)=e^x', ng: 'f^{-1}(x)=\\ln x', t: [-3, 1.7]},
  sq: {f: x => x >= 0 ? x * x : NaN, g: x => x >= 0 ? Math.sqrt(x) : NaN, nf: 'f(x)=x^2\\ (x\\geqslant0)', ng: 'f^{-1}(x)=\\sqrt x', t: [0, 2.4]},
  aff: {f: x => 2 * x + 1, g: x => (x - 1) / 2, nf: 'f(x)=2x+1', ng: 'f^{-1}(x)=\\dfrac{x-1}{2}', t: [-2, 2.5]},
};
function actRecip(el){
  el.insertAdjacentHTML('beforeend', `<div class="ctrl"><label>Couple <select data-p><option value="exp">exp et ln</option><option value="sq">carré (sur ℝ⁺) et racine</option><option value="aff">2x+1 et (x−1)/2</option></select></label><label>Déplace le point <input type="range" min="0" max="1" step="0.01" value="0.6" data-t></label></div>
  <canvas class="plot" width="480" height="480" style="max-width:480px"></canvas><div class="readout"></div>`);
  const P = new Plot($('canvas', el), {xmin:-3, xmax:6, ymin:-3, ymax:6, sx:1, sy:1}); const out = $('.readout', el);
  function draw(){ const p = PAIRS[$('[data-p]', el).value]; const t = p.t[0] + (p.t[1] - p.t[0]) * $('[data-t]', el).value; const y = p.f(t);
    P.clear(); P.curve(x => x, '#c9d3d8', {dash:[6, 5], w:1.5}); P.curve(p.f, TEAL); P.curve(p.g, GOLD);
    P.seg(t, y, y, t, VIO, [3, 3], 1.6); P.point(t, y, TEAL, 'M'); P.point(y, t, '#9a6a12', 'M′');
    P.text(4.6, 5.6, 'y = x', '#8a99a6');
    out.innerHTML = `En vert ${tex(p.nf)}, en jaune ${tex(p.ng)}. Le point ${tex(`M(${fmt(t)}\\,;\\,${fmt(y)})`)} est sur la courbe de f. On échange ses coordonnées : ${tex(`M'(${fmt(y)}\\,;\\,${fmt(t)})`)} est sur la courbe de ${tex('f^{-1}')}. M et M′ sont symétriques par rapport à la droite ${tex('y=x')} (le pointillé violet la croise à angle droit).`; }
  $$('input,select', el).forEach(i => i.oninput = draw); draw();
}

/* ---------- B1 : parité ---------- */
const PAR = [
  {n:'x^2', t:'x²', f: x => x * x, r:'paire'}, {n:'x^3', t:'x³', f: x => x ** 3, r:'impaire'}, {n:'|x|', t:'|x|', f: Math.abs, r:'paire'}, {n:'\\dfrac1x', t:'1/x', f: x => x ? 1 / x : NaN, r:'impaire'},
  {n:'x^3-x', t:'x³ − x', f: x => x ** 3 - x, r:'impaire'}, {n:'x^2+x', t:'x² + x', f: x => x * x + x, r:'ni'}, {n:'e^x', t:'eˣ', f: Math.exp, r:'ni'}, {n:'\\sqrt x', t:'√x', f: x => x >= 0 ? Math.sqrt(x) : NaN, r:'dom'},
  {n:'\\dfrac{1}{1+x^2}', t:'1/(1 + x²)', f: x => 1 / (1 + x * x), r:'paire'}, {n:'x^2+1', t:'x² + 1', f: x => x * x + 1, r:'paire'}, {n:'2x+1', t:'2x + 1', f: x => 2 * x + 1, r:'ni'},
];
function actParite(el){
  el.insertAdjacentHTML('beforeend', `<div class="ctrl"><label>Fonction <select data-f>${PAR.map((p, i) => `<option value="${i}">f(x) = ${p.t}</option>`).join('')}</select></label><label>x <input type="range" min="0.2" max="2.6" step="0.05" value="1.2" data-x></label></div>
  <canvas class="plot" width="640" height="380"></canvas><div class="readout"></div>
  <p style="margin:8px 0 2px;font-weight:600">À toi : cette fonction est…</p><div class="choices"><button class="btn ghost" data-r="paire">paire</button><button class="btn ghost" data-r="impaire">impaire</button><button class="btn ghost" data-r="ni">ni paire ni impaire</button><button class="btn ghost" data-r="dom">ni l’un ni l’autre : domaine pas symétrique</button></div><div class="verdict"></div>`);
  const P = new Plot($('canvas', el), {xmin:-3.2, xmax:3.2, ymin:-4, ymax:5, sx:1, sy:1}); const out = $('.readout', el), v = $('.verdict', el);
  function draw(){ const p = PAR[$('[data-f]', el).value], x = +$('[data-x]', el).value; const a = p.f(x), b = p.f(-x);
    P.clear(); P.curve(p.f, TEAL); if (isFinite(a)) { P.point(x, a, TEAL, 'A'); P.seg(x, 0, x, a); } if (isFinite(b)) { P.point(-x, b, BLUE, 'B'); P.seg(-x, 0, -x, b); }
    out.innerHTML = `${tex(`f(${fmt(x)})=${fmt(a)}`)} &nbsp; et &nbsp; ${isFinite(b) ? tex(`f(-${fmt(x)})=${fmt(b)}`) : tex(`f(-${fmt(x)})`) + ' <b class="k-no">n’existe pas</b>'} &nbsp;·&nbsp; ${tex(`-f(${fmt(x)})=${fmt(-a)}`)}<br>` +
      (!isFinite(b) ? 'Le domaine n’est pas symétrique (−x n’est pas dans D) : la condition (i) échoue.' : Math.abs(a - b) < 1e-9 ? `${tex('f(-x)=f(x)')} ici : A et B sont à la même hauteur (symétrie par rapport à l’axe des ordonnées).` : Math.abs(a + b) < 1e-9 ? `${tex('f(-x)=-f(x)')} ici : B est le symétrique de A par rapport à l’origine.` : `Ni ${tex('f(-x)=f(x)')} ni ${tex('f(-x)=-f(x)')} pour ce x : un seul contre-exemple suffit pour dire « pas paire » et « pas impaire ».`);
    v.textContent = ''; v.className = 'verdict'; }
  $$('[data-r]', el).forEach(b => b.onclick = () => { const p = PAR[$('[data-f]', el).value]; const ok = b.dataset.r === p.r; v.className = 'verdict ' + (ok ? 'ok' : 'no');
    const lab = {paire:'paire', impaire:'impaire', ni:'ni paire ni impaire', dom:'ni paire ni impaire, car son domaine [0 ; +∞[ n’est pas symétrique'}[p.r];
    v.textContent = (ok ? '✔ Exact : ' : '✘ Non : ') + 'f est ' + lab + '. Change de fonction pour continuer.'; });
  $$('input,select', el).forEach(i => i.oninput = draw); draw();
}

/* ---------- B2 : périodicité ---------- */
const PER = [
  {n:'x − Ent(x) (partie décimale)', f: x => x - Ent(x), T:1, jump:.5, ymin:-1, ymax:2},
  {n:'cos x', f: Math.cos, T:2 * Math.PI, ymin:-2, ymax:2},
  {n:'|sin x|', f: x => Math.abs(Math.sin(x)), T:Math.PI, ymin:-1, ymax:2},
  {n:'x² (piège)', f: x => x * x, T:null, ymin:-1, ymax:6},
];
function actPeriode(el){
  el.insertAdjacentHTML('beforeend', `<div class="ctrl"><label>Fonction <select data-f>${PER.map((p, i) => `<option value="${i}">${p.n}</option>`).join('')}</select></label><label>Décalage T <input type="range" min="0.1" max="7" step="0.01" value="0.6" data-t><span></span></label></div>
  <canvas class="plot" width="640" height="320"></canvas><div class="readout"></div>`);
  const P = new Plot($('canvas', el), {xmin:-7, xmax:7, sx:1, sy:1}); const out = $('.readout', el);
  function draw(){ const p = PER[$('[data-f]', el).value], T = +$('[data-t]', el).value; $('[data-t]', el).nextElementSibling.textContent = fmtTxt(T);
    P.set({ymin:p.ymin, ymax:p.ymax}); P.clear(); P.curve(p.f, TEAL, {jump:p.jump}); P.curve(x => p.f(x + T), GOLD, {dash:[7, 5], w:2, jump:p.jump});
    let err = 0; for (let x = -6; x <= 6; x += 0.037) err = Math.max(err, Math.abs(p.f(x + T) - p.f(x)));
    const ok = err < 0.03;
    out.innerHTML = `En vert la courbe de ${tex('f')}, en pointillé jaune celle de ${tex('x\\mapsto f(x+T)')} avec ${tex(`T\\approx${fmt(T)}`)}. ` + (ok ? `<b class="k-ok">Les deux courbes se superposent : ${tex(`f(x+T)=f(x)`)} pour tout x, donc T est une période.</b>` + (p.T ? ` (La plus petite période est ${p.T === 1 ? tex('T=1') : p.T > 4 ? tex('T=2\\pi\\approx6{,}28') : tex('T=\\pi\\approx3{,}14')}.)` : '') : `Les courbes ne se superposent pas : cherche un autre décalage.` + (p.T ? '' : ` <i>Indice : pour x², aucun décalage ne marche, la fonction n’est pas périodique.</i>`)); }
  $$('input,select', el).forEach(i => i.oninput = draw); draw();
}

/* ---------- B3 : monotonie ---------- */
const MONO = [
  {n:'x²', f: x => x * x, d:[-3, 3], y:[-1, 9]}, {n:'−2x + 1', f: x => -2 * x + 1, d:[-3, 3], y:[-6, 7]}, {n:'eˣ', f: Math.exp, d:[-3, 2.2], y:[-1, 9]},
  {n:'ln x', f: Math.log, d:[0.05, 8], y:[-3, 3]}, {n:'1/x sur ]0 ; +∞[', f: x => 1 / x, d:[0.15, 6], y:[-1, 7]}, {n:'x³', f: x => x ** 3, d:[-2, 2], y:[-8, 8]}, {n:'Ent(x)', f: Ent, d:[-3, 3], y:[-4, 4], jump:.5},
];
function actMono(el){
  el.insertAdjacentHTML('beforeend', `<div class="ctrl"><label>Fonction <select data-f>${MONO.map((p, i) => `<option value="${i}">f(x) = ${p.n}</option>`).join('')}</select></label></div>
  <div class="ctrl"><label>a <input type="range" min="0" max="1" step="0.005" value="0.3" data-a></label><label>b <input type="range" min="0" max="1" step="0.005" value="0.7" data-b></label></div>
  <canvas class="plot" width="640" height="360"></canvas><div class="readout"></div>`);
  const P = new Plot($('canvas', el), {}); const out = $('.readout', el);
  function draw(){ const p = MONO[$('[data-f]', el).value]; const L = t => p.d[0] + (p.d[1] - p.d[0]) * t; let a = L(+$('[data-a]', el).value), b = L(+$('[data-b]', el).value);
    P.set({xmin:Math.min(p.d[0], 0) - 0.5, xmax:p.d[1] + 0.5, ymin:p.y[0], ymax:p.y[1], sx:1, sy:p.y[1] - p.y[0] > 10 ? 2 : 1}); P.clear(); P.curve(p.f, TEAL, {from:p.d[0], to:p.d[1], jump:p.jump});
    const fa = p.f(a), fb = p.f(b); P.point(a, fa, BLUE, 'f(a)'); P.point(b, fb, RED, 'f(b)'); P.seg(a, 0, a, fa); P.seg(b, 0, b, fb); P.text(a, p.y[0] + 0.2 * (p.y[1] - p.y[0]) / 8, 'a', BLUE); P.text(b, p.y[0] + 0.2 * (p.y[1] - p.y[0]) / 8, 'b', RED);
    const s1 = a < b ? '<' : a > b ? '>' : '=', s2 = Math.abs(fa - fb) < 1e-9 ? '=' : fa < fb ? '<' : '>';
    out.innerHTML = `${tex(`a\\approx${fmt(a)}\\ ${s1}\\ b\\approx${fmt(b)}`)} &nbsp;⟶&nbsp; ${tex(`f(a)\\approx${fmt(fa)}\\ ${s2}\\ f(b)\\approx${fmt(fb)}`)}<br>` +
      (s1 === '=' ? 'Écarte a et b.' : s1 === s2 ? 'L’ordre est <b>conservé</b> (comme une fonction croissante sur ce morceau).' : s2 === '=' ? 'Les images sont égales : croissante au sens large mais pas strictement (comme sur une marche de Ent).' : 'L’ordre est <b>inversé</b> (comme une fonction décroissante sur ce morceau).') +
      ' <i>Une fonction est croissante sur I si l’ordre est conservé pour TOUS les couples a, b de I : essaie plusieurs positions.</i>'; }
  $$('input,select', el).forEach(i => i.oninput = draw); draw();
}

/* ---------- B4-B6 : majorant, minorant, max, min, sup, inf ---------- */
const BOR = [
  {n:'f(x) = 1/x sur ]0 ; +∞[', f: x => 1 / x, d:[0.0001, 8], v:[-0.5, 8.5, -1.2, 5], inf:0, infA:false, sup:Infinity, supA:false, txt:'Minorée par 0 (et par tout nombre négatif). inf f = 0, mais 0 n’est jamais atteint (1/x ≠ 0) : <b>pas de minimum</b>. Pas majorée (1/x devient aussi grand qu’on veut près de 0) : <b>pas de sup réel</b>.'},
  {n:'f(x) = 1/(1 + x²) sur ℝ', f: x => 1 / (1 + x * x), d:[-8, 8], v:[-8, 8, -0.6, 1.8], inf:0, infA:false, sup:1, supA:true, txt:'Bornée : 0 < f(x) ≤ 1. <b>Maximum = 1</b>, atteint en x = 0 (donc sup f = max f = 1). inf f = 0 mais <b>pas de minimum</b> : la courbe s’approche de 0 sans jamais le toucher.'},
  {n:'f(x) = x² sur [−2 ; 1]', f: x => x * x, d:[-2, 1], v:[-3, 2.5, -1, 5], inf:0, infA:true, sup:4, supA:true, txt:'Bornée. <b>Minimum = 0</b> (atteint en 0) et <b>maximum = 4</b> (atteint en −2). Ici inf = min et sup = max.'},
  {n:'f(x) = eˣ sur ℝ', f: Math.exp, d:[-8, 2.2], v:[-8, 3, -1, 8], inf:0, infA:false, sup:Infinity, supA:false, txt:'Minorée par 0 : inf = 0 non atteint (eˣ > 0), pas de minimum. Pas majorée.'},
];
function actBorne(el){
  el.insertAdjacentHTML('beforeend', `<div class="ctrl"><label>Fonction <select data-f>${BOR.map((p, i) => `<option value="${i}">${p.n}</option>`).join('')}</select></label></div>
  <div class="ctrl"><label><span style="color:${BLUE};font-weight:700">m</span> <input type="range" min="-1" max="4.5" step="0.05" value="-0.5" data-mn><span></span></label><label><span style="color:${RED};font-weight:700">M</span> <input type="range" min="-1" max="7" step="0.05" value="2" data-mx><span></span></label></div>
  <canvas class="plot" width="640" height="360"></canvas><div class="readout"></div><div class="choices"><button class="btn ghost" data-rev>Révéler sup, inf, max, min</button></div><div class="verdict"></div>`);
  const P = new Plot($('canvas', el), {}); const out = $('.readout', el), v = $('.verdict', el);
  function draw(){ const p = BOR[$('[data-f]', el).value], m = +$('[data-mn]', el).value, M = +$('[data-mx]', el).value;
    $('[data-mn]', el).nextElementSibling.textContent = fmtTxt(m); $('[data-mx]', el).nextElementSibling.textContent = fmtTxt(M);
    P.set({xmin:p.v[0], xmax:p.v[1], ymin:p.v[2], ymax:p.v[3], sx:1, sy:1}); P.clear(); P.curve(p.f, TEAL, {from:p.d[0], to:p.d[1]});
    if (p.d[0] === -2) { P.point(-2, 4, TEAL); P.point(1, 1, TEAL); }
    P.hline(m, BLUE); P.hline(M, RED);
    const isMin = m <= p.inf + 1e-9, isMaj = M >= p.sup - 1e-9;
    out.innerHTML = `${tex(`m=${fmt(m)}`)} : ${isMin ? '<b class="k-ok">c’est un minorant</b> (toute la courbe est au-dessus de la droite bleue)' : '<b class="k-no">pas un minorant</b> (une partie de la courbe passe sous la droite bleue)'}` +
      (isMin && Math.abs(m - p.inf) < 0.03 ? ` — et c’est le <b>plus grand</b> minorant possible : c’est la borne inférieure.` : '') +
      `<br>${tex(`M=${fmt(M)}`)} : ${isMaj ? '<b class="k-ok">c’est un majorant</b> (toute la courbe est sous la droite rouge)' : '<b class="k-no">pas un majorant</b> (la courbe dépasse la droite rouge)'}` +
      (isMaj && Math.abs(M - p.sup) < 0.03 ? ` — et c’est le <b>plus petit</b> majorant possible : c’est la borne supérieure.` : '');
    v.innerHTML = ''; }
  $('[data-rev]', el).onclick = () => { v.className = 'verdict'; v.innerHTML = BOR[$('[data-f]', el).value].txt; };
  $$('input,select', el).forEach(i => i.oninput = draw); draw();
}

/* ---------- C2 : partie entière ---------- */
function actEnt(el){
  el.insertAdjacentHTML('beforeend', `<div class="ctrl"><label>x <input type="range" min="-4" max="4" step="0.01" value="2.56" data-x></label><label>ou tape x <input type="number" step="0.01" value="2.56" data-n></label></div>
  <canvas class="plot" width="640" height="380"></canvas><div class="readout"></div>`);
  const P = new Plot($('canvas', el), {xmin:-4.5, xmax:4.5, ymin:-5, ymax:4.5, sx:1, sy:1}); const out = $('.readout', el), r = $('[data-x]', el), n = $('[data-n]', el);
  function draw(src){ if (src === 'n') r.value = n.value; else n.value = r.value; const x = +n.value, e = Ent(x);
    P.clear(); for (let k = -5; k <= 4; k++) { P.seg(k, k, k + 1, k, TEAL, [], 3); P.point(k, k, TEAL); P.point(k + 1, k, TEAL, '', true); }
    P.vline(x, GOLD, [5, 4], 1.5); P.point(x, e, RED, `Ent(x) = ${e}`);
    out.innerHTML = `${tex(`x=${fmt(x)}`)} : le plus grand entier ≤ x est ${tex(`\\text{Ent}(${fmt(x)})=${e}`)}. Vérification : ${tex(`${e}\\leqslant ${fmt(x)} \\lt ${e + 1}`)}.` + (x < 0 && x !== e ? ` <b>Attention</b>, x est négatif : on descend vers ${e}, on ne « coupe » pas après la virgule (ce qui donnerait ${Math.trunc(x) === 0 ? '0' : Math.trunc(x)}, faux).` : '') +
      `<br><span style="color:var(--mut)">Point plein = valeur atteinte ; rond vide = valeur non atteinte (le saut). </span>`; }
  r.oninput = () => draw('r'); n.oninput = () => draw('n'); draw('n');
}

/* ---------- C : explorateur des fonctions usuelles ---------- */
const USU = {
  abs: {n:'|x|', f: Math.abs, v:[-4, 4, -1, 4.5], card:['Définie sur ℝ, paire, positive','Décroissante sur ℝ⁻, croissante sur ℝ⁺','Limites : +∞ en −∞ et en +∞','Dérivée : −1 si x<0, 1 si x>0 ; <b>pas dérivable en 0</b> (pointe)']},
  ent: {n:'Ent(x)', f: Ent, v:[-4, 4, -4.5, 4], jump:.5, card:['Définie sur ℝ, croissante (au sens large)','Discontinue en chaque entier (saut de 1)','Dérivée nulle sur chaque ]k ; k+1[','Limites : −∞ en −∞, +∞ en +∞']},
  sqrt: {n:'√x', f: x => x >= 0 ? Math.sqrt(x) : NaN, v:[-1, 9, -1, 3.5], card:['Définie et continue sur [0 ; +∞[','Croissante sur ℝ⁺, √0 = 0, limite +∞ en +∞','Dérivée 1/(2√x) sur ]0 ; +∞[ ; <b>pas dérivable en 0</b> (tangente verticale)','√x / x → 0 en +∞ (√x grandit moins vite que x)']},
  inv: {n:'1/x', f: x => 1 / x, v:[-5, 5, -5, 5], card:['Définie sur ℝ* (pas en 0), impaire','Décroissante sur ]−∞ ; 0[ ET sur ]0 ; +∞[ (mais pas sur ℝ*)','Dérivée −1/x²','Courbe : une hyperbole ; limites 0 en ±∞, ±∞ en 0']},
  ln: {n:'ln x', f: x => x > 0 ? Math.log(x) : NaN, v:[-1, 9, -4, 3], card:['Définie sur ]0 ; +∞[, ln 1 = 0, ln e = 1','Strictement croissante ; dérivée 1/x','−∞ en 0⁺, +∞ en +∞ (très lentement)','ln(ab) = ln a + ln b']},
  exp: {n:'eˣ', f: Math.exp, v:[-4, 3, -1, 8], card:['Définie sur ℝ, toujours > 0, e⁰ = 1','Strictement croissante ; dérivée eˣ (elle-même)','0 en −∞, +∞ en +∞ (très vite)','e^(a+b) = eᵃ × eᵇ']},
  pw: {n:'x^α', f: null, v:[-0.5, 4, -0.5, 4], card:['Définie pour x > 0 : x^α = e^(α ln x)','Dérivée α x^(α−1)','α > 0 : croissante ; α < 0 : décroissante','α = 1/2 : c’est √x ; α = −1 : c’est 1/x']},
};
function actExplore(el){
  el.insertAdjacentHTML('beforeend', `<div class="ctrl"><label>Fonction <select data-f>${Object.entries(USU).map(([k, p]) => `<option value="${k}">${p.n}</option>`).join('')}</select></label><label data-al hidden>α <input type="range" min="-2" max="3" step="0.25" value="0.5" data-a><span></span></label></div>
  <canvas class="plot" width="640" height="360"></canvas><div class="readout"></div>`);
  const P = new Plot($('canvas', el), {}); const out = $('.readout', el);
  function draw(){ const k = $('[data-f]', el).value, p = USU[k]; $('[data-al]', el).hidden = k !== 'pw'; const al = +$('[data-a]', el).value; $('[data-a]', el).nextElementSibling.textContent = fmtTxt(al);
    const f = k === 'pw' ? (x => x > 0 ? Math.pow(x, al) : NaN) : p.f;
    P.set({xmin:p.v[0], xmax:p.v[1], ymin:p.v[2], ymax:p.v[3], sx:1, sy:1}); P.clear(); if (k === 'pw') P.curve(x => x, '#d5dde1', {dash:[5, 5], w:1.2});
    P.curve(f, TEAL, {jump:p.jump}); if (k === 'ent') for (let j = -5; j <= 4; j++) { P.point(j, j, TEAL); P.point(j + 1, j, TEAL, '', true); }
    out.innerHTML = '<ul style="margin:0;padding-left:18px">' + p.card.map(c => `<li>${c}</li>`).join('') + (k === 'pw' ? `<li>Ici α = ${fmtTxt(al)} : ${al > 0 ? 'croissante' : al < 0 ? 'décroissante' : 'constante égale à 1'}${al > 1 ? ', plus rapide que y = x (pointillé) quand x > 1' : al > 0 && al < 1 ? ', plus lente que y = x quand x > 1' : ''}.</li>` : '') + '</ul>'; }
  $$('input,select', el).forEach(i => i.oninput = draw); draw();
}

/* ---------- C5-C6 : la course des fonctions (croissances comparées) ---------- */
function actCourse(el){
  el.insertAdjacentHTML('beforeend', `<div class="ctrl"><label>x <input type="range" min="0" max="1" step="0.001" value="0.15" data-x><b data-v></b></label></div><div class="scroll"><table><thead><tr><th>fonction</th><th>valeur en x</th></tr></thead><tbody data-t></tbody></table></div><div class="readout" data-c></div>`);
  const X = t => Math.round(Math.pow(10, -2 + 4.7 * t) * 100) / 100;
  function draw(){ const x = Math.max(0.01, X(+$('[data-x]', el).value)); $('[data-v]', el).textContent = ' x = ' + fmtTxt(x);
    const rows = [['\\ln x', Math.log(x)], ['\\sqrt x', Math.sqrt(x)], ['x', x], ['x^2', x * x], ['e^x', Math.exp(x)]];
    const big = v => Math.abs(v) >= 1e6 ? v.toExponential(2).replace('.', ',').replace('e+', ' × 10^') : fmtTxt(v, 3);
    $('[data-t]', el).innerHTML = rows.map(r => `<tr><td>${tex(r[0])}</td><td>${big(r[1])}</td></tr>`).join('');
    $('[data-c]', el).innerHTML = `${tex(`\\dfrac{\\ln x}{x}\\approx ${fmt(Math.log(x) / x, 4)}`)} &nbsp; ${tex(`\\dfrac{e^x}{x}\\approx`)} ${big(Math.exp(x) / x)} &nbsp; ${tex(`x\\ln x\\approx ${fmt(x * Math.log(x), 4)}`)}<br>` +
      (x > 30 ? 'Pousse x : ln x / x file vers 0 et eˣ / x explose vers +∞. <b>L’exponentielle gagne toujours, le logarithme perd toujours</b> face aux puissances de x.' : x < 0.1 ? 'x est proche de 0 : x ln x tend vers 0 (le « x » écrase le « ln x » qui part vers −∞).' : 'Déplace le curseur à fond à droite, puis à fond à gauche.'); }
  $('[data-x]', el).oninput = draw; draw();
}

const ACTS = {diag: actDiag, image: actImage, compo: actCompo, recip: actRecip, parite: actParite, periode: actPeriode, mono: actMono, borne: actBorne, ent: actEnt, explore: actExplore, course: actCourse};
function init(){
  $$('.quiz').forEach(buildQuiz);
  render(document.body);
  $$('[data-widget]').forEach(el => { const f = ACTS[el.dataset.widget]; if (f) try { f(el); } catch (e) { console.error(e); } });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
// KaTeX peut arriver après : on relance le rendu une fois chargé
window.addEventListener('load', () => render(document.body));
})();
