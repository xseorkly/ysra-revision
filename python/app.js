/* Python pas à pas · CPES L1 — moteur du site (navigation, activités, Python dans le navigateur) */
"use strict";
(function () {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ------------------------------------------------------------ mémoire locale */
const mem = {};
const store = {
  get(k) { try { const v = localStorage.getItem("pycc2_" + k); return v === null ? (mem[k] ?? null) : v; } catch (e) { return mem[k] ?? null; } },
  set(k, v) { mem[k] = v; try { localStorage.setItem("pycc2_" + k, v); } catch (e) {} },
  del(k) { delete mem[k]; try { localStorage.removeItem("pycc2_" + k); } catch (e) {} }
};

/* ------------------------------------------------------------ coloration Python */
const KW = new Set("def return for in if elif else while and or not True False None import from as pass break continue is lambda".split(" "));
const BI = new Set("print len range append insert int float str list abs max min sum randint seed reversed type".split(" "));
function hl(code) {
  const re = /(#[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(_{3,})|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_À-ÿ][\wÀ-ÿ]*\b)/g;
  let out = "", last = 0, m;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index));
    const t = m[0];
    if (m[1]) out += '<span class="tk-c">' + esc(t) + "</span>";
    else if (m[2]) out += '<span class="tk-s">' + esc(t) + "</span>";
    else if (m[3]) out += '<span class="tk-blank">' + esc(t) + "</span>";
    else if (m[4]) out += '<span class="tk-n">' + t + "</span>";
    else if (KW.has(t)) out += '<span class="tk-k">' + t + "</span>";
    else if (BI.has(t)) out += '<span class="tk-b">' + t + "</span>";
    else out += esc(t);
    last = re.lastIndex;
  }
  return out + esc(code.slice(last));
}
const pre = code => '<pre class="code"><code>' + hl(code) + "</code></pre>";
function colorer(root) {
  $$("pre.code", root).forEach(p => {
    if (p.dataset.hl) return;
    p.dataset.hl = "1";
    const txt = p.textContent.replace(/^\n/, "").replace(/\s+$/, "");
    p.innerHTML = "<code>" + hl(txt) + "</code>";
  });
}

/* ------------------------------------------------------------ pages d'exercices */
const etoiles = n => "★".repeat(n) + "☆".repeat(3 - n);
const TESTS = {};
function qcmHTML(q, titre) {
  return '<div class="activite qcm" data-ok="' + q.ok + '"><div class="titre">' + (titre || "Vérifie") + '</div><p class="q">' + q.q +
    '</p><div class="opts">' + q.options.map(o => "<button type=\"button\">" + o + "</button>").join("") +
    '</div><div class="why" hidden>' + q.why + "</div></div>";
}
function editeurHTML(key, code, titre) {
  return '<div class="editeur" data-key="' + key + '" data-tests="' + key + '" data-titre="' + esc(titre) + '"><textarea>' + esc(code) + "</textarea></div>";
}
function exoHTML(e) {
  const id = "ex" + e.n;
  TESTS[id] = e.tests;
  let h = '<div class="eyebrow">Contrôle CC2 · Exercice ' + e.n + " sur 10</div><h1>" + e.titre + "</h1>";
  h += '<div class="badges"><span class="badge recette">Recette : ' + e.recette + '</span><span class="badge">Difficulté ' + etoiles(e.etoiles) + '</span><span class="badge fait" data-fait="' + id + '" hidden>✓ Réussi</span></div>';
  h += '<div class="enonce"><div class="src">Énoncé du sujet</div>' + e.enonce + "</div>";
  h += '<div class="etape-titre"><span class="n">1</span><h2>Comprendre</h2></div>';
  h += '<dl class="fiche"><dt>Entrées</dt><dd>' + e.entrees + "</dd><dt>Sortie</dt><dd>" + e.sortie + "</dd><dt>Exemple</dt><dd>" + e.exemple + "</dd></dl>";
  h += qcmHTML(e.question, "Avant de coder");
  h += '<div class="etape-titre"><span class="n">2</span><h2>À toi d\'écrire</h2></div>';
  h += "<p>Remplace la ligne <code>return None  # à modifier</code> par ton code, puis clique sur <strong>Tester mon code</strong>. Les tests te disent ce qui marche et ce qui ne marche pas.</p>";
  h += editeurHTML(id, e.squelette, "Ta fonction " + e.fonction);
  h += '<div class="etape-titre"><span class="n">3</span><h2>Besoin d\'aide ?</h2></div>';
  h += "<p>Ouvre les aides <strong>une par une</strong>. Après chaque aide, retourne essayer dans l'éditeur.</p>";
  h += '<div class="echelle">';
  h += rung("Aide 1", "L'idée", "<p>" + e.indice1 + "</p>");
  h += rung("Aide 2", "Le plan en français", '<ol class="etapes">' + e.indice2.map(x => "<li>" + x + "</li>").join("") + "</ol>");
  h += rung("Aide 3", "Le code à trous", "<p>Remplace chaque <code>____</code>, puis recopie dans l'éditeur.</p>" + pre(e.trous));
  let c = pre(e.solution) + "<h3>Ligne par ligne</h3><ol class=\"lignes\">";
  e.solution.split("\n").forEach((l, i) => { c += "<li><pre>" + hl(l) + "</pre>" + e.explications[i] + "</li>"; });
  c += "</ol><h3>Regarde Python l'exécuter</h3><p>Clique sur ▶ pour avancer d'une ligne. La ligne surlignée vient d'être exécutée ; à droite, l'état des variables.</p>";
  c += '<div class="trace" data-trace="' + id + '"></div>';
  if (e.autre) c += "<h3>Une autre façon de faire</h3><p>" + e.autre_expl + "</p>" + pre(e.autre);
  c += '<div class="attention"><b>Erreurs fréquentes</b><ul>' + e.pieges.map(p => "<li>" + p + "</li>").join("") + "</ul></div>";
  h += rung("Aide 4", "La correction expliquée", c);
  h += "</div>";
  h += '<div class="etape-titre"><span class="n">4</span><h2>Entraîne-toi</h2></div>';
  h += "<p>Deux exercices de la même famille, du plus simple au plus difficile.</p>";
  e.entrainements.forEach((t, j) => {
    const k = id + "-t" + j;
    TESTS[k] = t.tests;
    h += '<div class="entrainement"><h3>Entraînement ' + e.n + "." + (j + 1) + " · " + t.titre + ' <span class="badge">' + etoiles(t.etoiles) + '</span> <span class="badge fait" data-fait="' + k + '" hidden>✓ Réussi</span></h3><p>' + t.enonce + "</p>";
    h += editeurHTML(k, t.squelette, "Entraînement " + e.n + "." + (j + 1));
    h += '<div class="echelle">' + rung("Aide", "Un indice", "<p>" + t.indice + "</p>") + rung("Solution", "La correction", pre(t.solution) + "<p>" + t.explication + "</p>") + "</div></div>";
  });
  return h;
}
function rung(lvl, titre, contenu) {
  return '<div class="rung"><button type="button"><span class="lvl">' + lvl + "</span>" + titre + '</button><div class="contenu">' + contenu + "</div></div>";
}
function construireExos() {
  const ici = $("#exos-ici");
  (window.EXOS || []).forEach(e => {
    const s = document.createElement("section");
    s.className = "page";
    s.id = "ex" + e.n;
    s.dataset.titre = e.titre;
    s.dataset.num = String(e.n);
    s.dataset.groupe = "cc2";
    s.innerHTML = exoHTML(e);
    ici.before(s);
  });
  ici.remove();
}

/* ------------------------------------------------------------ QCM */
function initQcm(root) {
  $$(".qcm", root).forEach(b => {
    if (b.dataset.init) return; b.dataset.init = "1";
    const ok = +b.dataset.ok, btns = $$(".opts button", b), why = $(".why", b);
    let essais = 0;
    const fb = document.createElement("div"); fb.className = "feedback"; fb.hidden = true; b.appendChild(fb);
    btns.forEach((bt, i) => bt.addEventListener("click", () => {
      essais++;
      if (i === ok) {
        bt.classList.add("juste"); btns.forEach(x => x.disabled = true);
        fb.className = "feedback ok"; fb.hidden = false;
        fb.innerHTML = "<strong>" + (essais === 1 ? "Bravo !" : "Oui, c'est ça.") + "</strong> " + (why ? why.innerHTML : "");
        b.dispatchEvent(new CustomEvent("qcm", { bubbles: true, detail: { premier: essais === 1 } }));
      } else {
        bt.classList.add("faux"); bt.disabled = true;
        fb.className = "feedback ko"; fb.hidden = false;
        if (essais >= 2) {
          btns[ok].classList.add("juste"); btns.forEach(x => x.disabled = true);
          fb.innerHTML = "<strong>La bonne réponse est surlignée en vert.</strong> " + (why ? why.innerHTML : "");
          b.dispatchEvent(new CustomEvent("qcm", { bubbles: true, detail: { premier: false } }));
        } else fb.innerHTML = "<strong>Pas tout à fait.</strong> Relis bien et essaie une autre réponse.";
      }
    }));
  });
}

/* ------------------------------------------------------------ « Qu'affiche ce programme ? » */
const norm = s => s.replace(/\s+/g, "").replace(/'/g, '"').toLowerCase();
function initPredict(root) {
  $$(".predict", root).forEach(b => {
    if (b.dataset.init) return; b.dataset.init = "1";
    const bons = b.dataset.ok.split("|"), why = b.dataset.why || "";
    const row = document.createElement("div"); row.className = "row";
    row.innerHTML = '<input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Ta réponse…" aria-label="Ta réponse"><button type="button" class="btn primary">Vérifier</button>';
    b.appendChild(row);
    const fb = document.createElement("div"); fb.className = "feedback"; fb.hidden = true; b.appendChild(fb);
    const inp = $("input", row), bt = $("button", row);
    let essais = 0;
    const go = () => {
      if (!inp.value.trim()) return;
      essais++;
      fb.hidden = false;
      if (bons.some(x => norm(x) === norm(inp.value))) {
        fb.className = "feedback ok"; fb.innerHTML = "<strong>Exact !</strong> " + why; inp.disabled = bt.disabled = true;
      } else if (essais >= 2) {
        fb.className = "feedback ko"; fb.innerHTML = "<strong>Réponse attendue :</strong> <code>" + esc(bons[0]) + "</code>. " + why; inp.disabled = bt.disabled = true;
      } else {
        fb.className = "feedback ko"; fb.innerHTML = "<strong>Pas encore.</strong> Refais le calcul ligne par ligne, puis réessaie.";
      }
    };
    bt.addEventListener("click", go);
    inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
  });
}

/* ------------------------------------------------------------ remettre les lignes dans l'ordre */
function initParsons(root) {
  $$(".parsons", root).forEach(b => {
    if (b.dataset.init) return; b.dataset.init = "1";
    const lignes = JSON.parse(b.dataset.lines);
    let ordre = lignes.map((_, i) => i);
    // mélange déterministe, jamais dans le bon ordre
    let seed = lignes.join("").length;
    for (let i = ordre.length - 1; i > 0; i--) { seed = (seed * 9301 + 49297) % 233280; const j = Math.floor(seed / 233280 * (i + 1)); [ordre[i], ordre[j]] = [ordre[j], ordre[i]]; }
    if (ordre.every((v, i) => v === i)) ordre.reverse();
    let dispo = ordre.slice(), choisi = [];
    const wrap = document.createElement("div");
    b.appendChild(wrap);
    const fb = document.createElement("div"); fb.className = "feedback"; fb.hidden = true;
    const render = () => {
      wrap.innerHTML = '<div class="zlabel">Lignes disponibles (touche une ligne pour l\'ajouter)</div><div class="zone src"></div><div class="zlabel">Ton programme (touche une ligne pour la retirer)</div><div class="zone cible"></div><div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn primary">Vérifier</button><button type="button" class="btn">Recommencer</button></div>';
      const zs = $(".src", wrap), zc = $(".cible", wrap);
      if (!dispo.length) zs.innerHTML = '<div class="vide">Toutes les lignes sont placées.</div>';
      if (!choisi.length) zc.innerHTML = '<div class="vide">Vide pour l\'instant.</div>';
      dispo.forEach(i => { const x = document.createElement("button"); x.type = "button"; x.className = "ligne"; x.innerHTML = hl(lignes[i]); x.onclick = () => { dispo = dispo.filter(v => v !== i); choisi.push(i); fb.hidden = true; render(); }; zs.appendChild(x); });
      choisi.forEach(i => { const x = document.createElement("button"); x.type = "button"; x.className = "ligne"; x.innerHTML = hl(lignes[i]); x.onclick = () => { choisi = choisi.filter(v => v !== i); dispo.push(i); fb.hidden = true; render(); }; zc.appendChild(x); });
      const [bv, br] = $$(".row button", wrap);
      bv.onclick = () => {
        fb.hidden = false;
        if (choisi.length < lignes.length) { fb.className = "feedback ko"; fb.innerHTML = "Il reste des lignes à placer."; return; }
        const err = choisi.findIndex((v, k) => lignes[v] !== lignes[k]);
        if (err < 0) { fb.className = "feedback ok"; fb.innerHTML = "<strong>Parfait !</strong> " + (b.dataset.why || ""); }
        else { fb.className = "feedback ko"; fb.innerHTML = "<strong>Presque.</strong> Les " + err + " première(s) ligne(s) sont bien placées ; la ligne " + (err + 1) + " ne l'est pas. Pense à l'ordre : on prépare, on répète, on renvoie."; }
      };
      br.onclick = () => { dispo = ordre.slice(); choisi = []; fb.hidden = true; render(); };
      wrap.appendChild(fb);
    };
    render();
  });
}

/* ------------------------------------------------------------ échelle d'aides */
function initEchelles(root) {
  $$(".echelle", root).forEach(ech => {
    if (ech.dataset.init) return; ech.dataset.init = "1";
    const rungs = $$(":scope > .rung", ech);
    rungs.forEach((r, i) => {
      const bt = $(":scope > button", r);
      if (i > 0) { bt.disabled = true; bt.title = "Ouvre d'abord l'aide précédente"; }
      bt.addEventListener("click", () => {
        r.classList.toggle("open");
        if (r.classList.contains("open")) { colorer(r); initTraces(r); if (rungs[i + 1]) { const b2 = $(":scope > button", rungs[i + 1]); b2.disabled = false; b2.title = ""; } }
      });
    });
  });
}

/* ------------------------------------------------------------ exécution pas à pas */
function initTraces(root) {
  $$(".trace", root).forEach(box => {
    if (box.dataset.init) return; box.dataset.init = "1";
    const T = (window.TRACES || {})[box.dataset.trace];
    if (!T) return;
    const lignes = T.code.split("\n"), steps = T.steps, notes = T.notes || {};
    const avecSortie = steps.some(s => s.o);
    let k = 0; // 0 = avant de commencer
    box.innerHTML = '<div class="thead"><b>' + (T.appel ? "Appel : <code>" + esc(T.appel) + "</code>" : "Exécution pas à pas") +
      '</b><div class="tctrl"><button type="button" class="btn small" data-a="0" aria-label="Revenir au début">⏮</button><button type="button" class="btn small" data-a="-1" aria-label="Étape précédente">◀</button><span class="cpt"></span><button type="button" class="btn small primary" data-a="1" aria-label="Étape suivante">▶</button></div></div>' +
      '<div class="tbody"><div class="tcode">' + lignes.map((l, i) => '<div class="tl"><span class="ln">' + (i + 1) + '</span><span class="lc">' + (hl(l) || " ") + "</span></div>").join("") +
      '</div><div class="tvars"><h4></h4><div class="vlist"></div>' + (avecSortie ? '<h4 style="margin-top:12px">Affichage (print)</h4><div class="tout"></div>' : "") + '</div></div><div class="tnote"></div>';
    const tls = $$(".tl", box), cpt = $(".cpt", box), vh = $(".tvars h4", box), vl = $(".vlist", box), tout = $(".tout", box), tn = $(".tnote", box);
    const nomBoucle = l => { const m = /for\s+(\w+)\s+in/.exec(lignes[l - 1] || ""); return m ? m[1] : null; };
    function show() {
      cpt.textContent = "Étape " + k + " / " + steps.length;
      tls.forEach(x => x.classList.remove("cur"));
      if (k === 0) {
        vh.textContent = "Variables"; vl.innerHTML = '<span class="info" style="color:var(--muted);font-size:.9rem">Aucune pour l\'instant.</span>';
        if (tout) tout.textContent = "";
        tn.innerHTML = "Clique sur <strong>▶</strong> pour exécuter la première ligne.";
        return;
      }
      const s = steps[k - 1], prev = k > 1 ? steps[k - 2] : null;
      const ln = tls[s.l - 1]; ln.classList.add("cur");
      ln.scrollIntoView({ block: "nearest", inline: "nearest" });
      vh.textContent = s.fr && s.fr !== "<module>" ? "Variables dans la fonction " + s.fr : "Variables du programme";
      const keys = Object.keys(s.v);
      vl.innerHTML = keys.length ? keys.map(n => {
        const chg = !prev || prev.fr !== s.fr || prev.v[n] !== s.v[n];
        return '<div class="var' + (chg ? " chg" : "") + '"><span class="k">' + esc(n) + '</span><span class="val">' + esc(s.v[n]) + "</span></div>";
      }).join("") : '<span style="color:var(--muted);font-size:.9rem">Aucune pour l\'instant.</span>';
      if (tout) tout.textContent = s.o || "";
      let n = "";
      if (s.call) {
        n = '<span class="pill info">Appel</span>' + (s.de ? "La ligne " + s.de + " appelle " : "On appelle ") + "la fonction <code>" + esc(s.fr) + "</code>. Ses paramètres reçoivent les valeurs données : " +
          keys.map(x => "<code>" + esc(x) + " = " + esc(s.v[x]) + "</code>").join(", ") + ".";
      } else if (s.f === "fin") {
        n = '<span class="pill info">Fin de boucle</span>Il n\'y a plus d\'élément à prendre : on sort de la boucle et on passe à la suite.';
      } else {
        if (s.f === "tour") { const v = nomBoucle(s.l); n += '<span class="pill info">Nouveau tour</span>' + (v ? "<code>" + v + "</code> reçoit <code>" + esc(s.v[v]) + "</code>. " : ""); }
        else n += notes[s.l] || "";
        if (s.f === "tour" && notes[s.l] && k <= 4) n += " " + notes[s.l];
        if ("c" in s) n += ' <span class="pill ' + (s.c ? "vrai" : "fauxp") + '">' + (s.c ? "Vrai" : "Faux") + "</span>" + (s.c ? "Le test est vrai : on exécute le bloc décalé juste en dessous." : "Le test est faux : on saute le bloc décalé (on va au <code>else</code> s'il y en a un).");
        if ("r" in s) n += ' <span class="pill vrai">Renvoie</span><code>' + esc(s.r) + "</code>";
      }
      tn.innerHTML = n;
    }
    $$(".tctrl button", box).forEach(b => b.addEventListener("click", () => {
      const a = +b.dataset.a;
      k = a === 0 ? 0 : Math.max(0, Math.min(steps.length, k + a));
      show();
    }));
    show();
  });
}

/* ------------------------------------------------------------ Python dans le navigateur (Pyodide dans un worker) */
const PYO = "https://cdn.jsdelivr.net/npm/pyodide@0.27.7/";
const HARNESS = `
import json
def _apres(f, L, *a):
    f(L, *a)
    return L
def __lance():
    res = []
    for call, attendu, label in __tests__:
        try:
            obtenu = eval(call)
            res.append([label, call, attendu, repr(obtenu), bool(obtenu == eval(attendu)), None])
        except Exception as e:
            res.append([label, call, attendu, None, False, type(e).__name__ + ": " + str(e)])
    return json.dumps(res)
__lance()
`;
const WORKER_SRC = `
let py = null;
const ready = (async () => {
  try {
    importScripts(${JSON.stringify(PYO)} + "pyodide.js");
    py = await loadPyodide({ indexURL: ${JSON.stringify(PYO)} });
    postMessage({ t: "ready" });
  } catch (e) { postMessage({ t: "loadfail", msg: String(e) }); }
})();
const HARNESS = ${JSON.stringify(HARNESS)};
self.onmessage = async (e) => {
  await ready;
  if (!py) return;
  const { id, code, tests } = e.data;
  let out = "";
  py.setStdout({ batched: s => { out += s + "\\n"; } });
  py.setStderr({ batched: s => { out += s + "\\n"; } });
  const ns = py.globals.get("dict")();
  let error = null, results = null;
  try { py.runPython(code, { globals: ns }); }
  catch (err) { error = String(err.message || err); }
  if (!error && tests) {
    try { ns.set("__tests__", py.toPy(tests)); results = py.runPython(HARNESS, { globals: ns }); }
    catch (err) { error = String(err.message || err); }
  }
  try { ns.destroy(); } catch (x) {}
  postMessage({ t: "done", id, out, error, results });
};`;
let worker = null, wState = "off", waiting = [], runs = {}, runId = 0;
function getWorker() {
  if (worker) return;
  wState = "loading";
  worker = new Worker(URL.createObjectURL(new Blob([WORKER_SRC], { type: "text/javascript" })));
  worker.onmessage = e => {
    const m = e.data;
    if (m.t === "ready") { wState = "ready"; waiting.splice(0).forEach(f => f()); }
    else if (m.t === "loadfail") { wState = "fail"; waiting.splice(0).forEach(f => f()); }
    else if (m.t === "done" && runs[m.id]) { const r = runs[m.id]; delete runs[m.id]; clearTimeout(r.timer); r.resolve(m); }
  };
  worker.onerror = () => { wState = "fail"; waiting.splice(0).forEach(f => f()); };
}
function pyRun(code, tests, onStatus) {
  return new Promise(resolve => {
    getWorker();
    const go = () => {
      if (wState === "fail") { worker = null; resolve({ loadfail: true }); return; }
      onStatus && onStatus("run");
      const id = ++runId;
      runs[id] = { resolve, timer: setTimeout(() => {
        delete runs[id];
        try { worker.terminate(); } catch (x) {}
        worker = null; wState = "off";
        resolve({ timeout: true });
      }, 8000) };
      worker.postMessage({ id, code, tests });
    };
    if (wState === "ready") go();
    else { onStatus && onStatus("load"); waiting.push(go); }
  });
}

const ERREURS = {
  SyntaxError: "Python n'arrive pas à lire cette ligne. Souvent : un <code>:</code> oublié à la fin d'un <code>def</code>, <code>for</code> ou <code>if</code> ; une parenthèse ou un guillemet pas fermé ; ou <code>=</code> au lieu de <code>==</code> dans un test.",
  IndentationError: "Problème de décalage. Après une ligne qui finit par <code>:</code>, les lignes du bloc doivent être décalées de 4 espaces, toutes pareilles.",
  TabError: "Mélange de tabulations et d'espaces pour décaler les lignes. Utilise uniquement des espaces (4 par niveau).",
  NameError: "Python ne connaît pas ce nom. Vérifie l'orthographe (majuscules comprises), que la variable a bien été créée <em>avant</em> d'être utilisée, ou qu'un texte est bien entre guillemets.",
  IndexError: "Tu demandes une case qui n'existe pas. Pour une liste de longueur n, les indices vont de <code>0</code> à <code>n - 1</code>. Vérifie ton <code>range</code>.",
  TypeError: "Opération impossible entre ces types de valeurs (par exemple un nombre + une liste, ou <code>None</code> utilisé comme une liste), ou mauvais nombre d'arguments donnés à une fonction.",
  ZeroDivisionError: "Division (ou <code>%</code>) par zéro : c'est impossible.",
  AttributeError: "Cette valeur n'a pas cette méthode. Souvent : <code>append</code> utilisé sur autre chose qu'une liste, ou sur <code>None</code> (attention : <code>R = R.append(x)</code> met <code>None</code> dans R).",
  ValueError: "La valeur donnée n'a pas la bonne forme pour cette opération.",
  UnboundLocalError: "Une variable est utilisée dans la fonction avant d'avoir reçu une valeur. Crée-la (par exemple <code>total = 0</code>) avant la boucle."
};
function expliquerErreur(msg) {
  const lines = msg.trim().split("\n").filter(Boolean);
  const derniere = lines[lines.length - 1] || msg;
  const m = /^(\w+(?:Error|Exception)?)\s*:?/.exec(derniere);
  const type = m ? m[1] : "";
  let ligne = null; const re = /File "<exec>", line (\d+)/g; let x;
  while ((x = re.exec(msg))) ligne = x[1];
  return '<div class="erreur"><span class="brut">' + esc(derniere) + "</span>" + (ligne ? "<strong>Ligne " + ligne + ".</strong> " : "") + (ERREURS[type] || "Lis le dernier mot du message : il indique le type d'erreur.") + "</div>";
}

function initEditeurs(root) {
  $$(".editeur", root).forEach(box => {
    if (box.dataset.init) return; box.dataset.init = "1";
    const ta0 = $("textarea", box), initial = ta0.value.replace(/^\n/, "").replace(/\s+$/, "") + "\n";
    const key = box.dataset.key, tests = box.dataset.tests ? TESTS[box.dataset.tests] : null;
    const titre = box.dataset.titre || "À toi de jouer";
    box.innerHTML = '<div class="ehead"><b>' + esc(titre) + '</b><div class="ebtns"><button type="button" class="btn small" data-a="tab" title="Insérer 4 espaces (utile sur téléphone)">⇥ 4 espaces</button><button type="button" class="btn small" data-a="reset">↺ Recommencer</button><button type="button" class="btn small primary" data-a="run">' + (tests ? "▶ Tester mon code" : "▶ Exécuter") + '</button></div></div><div class="zone"><div class="gutter"></div><textarea spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" aria-label="Code Python"></textarea></div><div class="sortie"></div>';
    const ta = $("textarea", box), gut = $(".gutter", box), sortie = $(".sortie", box), btnRun = $('[data-a="run"]', box);
    ta.value = (key && store.get("code_" + key)) || initial;
    const maj = () => {
      const n = ta.value.split("\n").length;
      gut.textContent = Array.from({ length: n }, (_, i) => i + 1).join("\n");
      ta.rows = Math.max(5, n + 1);
      if (key) { if (ta.value === initial) store.del("code_" + key); else store.set("code_" + key, ta.value); }
    };
    const inserer = txt => { const s = ta.selectionStart, e = ta.selectionEnd; ta.setRangeText(txt, s, e, "end"); maj(); ta.focus(); };
    ta.addEventListener("input", maj);
    ta.addEventListener("keydown", e => {
      if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          const s = ta.selectionStart, debut = ta.value.lastIndexOf("\n", s - 1) + 1;
          const nb = (ta.value.slice(debut).match(/^ {1,4}/) || [""])[0].length;
          if (nb) { ta.setRangeText("", debut, debut + nb, "end"); maj(); }
        } else inserer("    ");
      } else if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
        const s = ta.selectionStart, debut = ta.value.lastIndexOf("\n", s - 1) + 1, ligne = ta.value.slice(debut, s);
        let ind = (ligne.match(/^ */) || [""])[0];
        if (/:\s*$/.test(ligne)) ind += "    ";
        e.preventDefault(); inserer("\n" + ind);
      } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); lancer(); }
    });
    $('[data-a="tab"]', box).addEventListener("click", () => inserer("    "));
    $('[data-a="reset"]', box).addEventListener("click", () => {
      if (ta.value !== initial && !confirm("Effacer ton code et revenir au départ ?")) return;
      ta.value = initial; maj(); sortie.classList.remove("on"); sortie.innerHTML = "";
    });
    btnRun.addEventListener("click", lancer);
    maj();
    async function lancer() {
      btnRun.disabled = true;
      sortie.classList.add("on");
      const r = await pyRun(ta.value, tests, st => {
        sortie.innerHTML = st === "load" ? '<p class="info">⏳ Chargement de Python… (environ 10 secondes la première fois, ensuite c\'est instantané)</p>' : '<p class="info">⏳ Exécution…</p>';
      });
      btnRun.disabled = false;
      let h = "";
      if (r.loadfail) {
        h = '<div class="erreur"><strong>Impossible de charger Python.</strong> Il faut une connexion internet la première fois. Tu peux aussi copier ton code dans <a href="https://console.basthon.fr/" target="_blank" rel="noopener">Basthon</a> ou dans Thonny.</div>';
      } else if (r.timeout) {
        h = '<div class="erreur"><strong>Ton programme ne s\'arrête pas</strong> (plus de 8 secondes). Il y a sans doute une boucle qui tourne sans fin. Python a été relancé.</div>';
      } else {
        if (r.out) h += '<div class="info">Ce que ton programme affiche :</div><div class="console">' + esc(r.out.replace(/\n$/, "")) + "</div>";
        if (r.error) h += expliquerErreur(r.error);
        if (r.results) {
          const res = JSON.parse(r.results), nOk = res.filter(t => t[4]).length;
          h += '<ul class="tests">' + res.map(([label, call, att, obt, ok, err]) => {
            const apres = call.startsWith("_apres(");
            let d;
            if (err) d = "Erreur : " + esc(err);
            else if (apres) d = "L vaut " + esc(obt) + " après l'appel" + (ok ? "" : " (attendu : " + esc(att) + ")");
            else d = esc(call) + " → " + esc(obt) + (ok ? "" : " &nbsp;(attendu : " + esc(att) + ")");
            return '<li class="' + (ok ? "ok" : "ko") + '"><span class="ic">' + (ok ? "✓" : "✗") + "</span><div><strong>" + esc(label) + '</strong><div class="detail">' + d + "</div></div></li>";
          }).join("") + "</ul>";
          const errT = res.find(t => t[5]);
          if (errT) { const ty = errT[5].split(":")[0]; if (ERREURS[ty]) h += '<div class="erreur"><span class="brut">' + esc(errT[5]) + "</span>" + ERREURS[ty] + "</div>"; }
          if (nOk === res.length) {
            h += '<div class="bilan ok">🎉 Tous les tests passent (' + nOk + "/" + res.length + "). Bravo ! Compare quand même avec la correction : il y a parfois plusieurs bonnes façons de faire.</div>";
            if (key) { store.set("ok_" + key, "1"); majProgres(); }
          } else {
            h += '<div class="bilan ko">' + nOk + " test(s) réussi(s) sur " + res.length + ". Corrige et relance !</div>";
            if (res.some(t => t[3] === "None" && !t[1].startsWith("_apres("))) h += '<p class="info">💡 Ta fonction renvoie <code>None</code> : as-tu bien remplacé <code>return None</code> ? Ton <code>return</code> est-il placé après la boucle et bien aligné avec <code>for</code> ?</p>';
          }
        } else if (!r.error && !r.out) h += '<p class="info">Le programme s\'est exécuté sans rien afficher. Utilise <code>print(...)</code> pour voir un résultat.</p>';
      }
      sortie.innerHTML = h;
    }
  });
}

/* ------------------------------------------------------------ navigation */
let PAGES = [];
function majProgres() {
  const lecons = PAGES.filter(p => p.dataset.groupe === "base" || p.dataset.groupe === "methode");
  const exos = PAGES.filter(p => p.dataset.groupe === "cc2");
  const vu = p => store.get("vu_" + p.id) === "1";
  const ok = p => store.get("ok_" + p.id) === "1";
  $$(".navlink").forEach(a => {
    const p = document.getElementById(a.dataset.id);
    if (!p) return;
    const fait = p.dataset.groupe === "cc2" ? ok(p) : (p.dataset.groupe === "base" || p.dataset.groupe === "methode") && vu(p);
    a.classList.toggle("done", !!fait);
  });
  $$("[data-fait]").forEach(b => b.hidden = store.get("ok_" + b.dataset.fait) !== "1");
  const nL = lecons.filter(vu).length, nE = exos.filter(ok).length;
  const tot = lecons.length + exos.length, pct = tot ? Math.round(100 * (nL + nE) / tot) : 0;
  $("#progTxt").innerHTML = "<b>" + nL + "/" + lecons.length + "</b> chapitres lus · <b>" + nE + "/" + exos.length + "</b> exercices réussis";
  $("#progBar").style.width = pct + "%";
  const groupes = { base: [], methode: [], cc2: [] };
  PAGES.forEach(p => groupes[p.dataset.groupe] && groupes[p.dataset.groupe].push(p));
  $$("[data-prog]").forEach(el => {
    const g = groupes[el.dataset.prog] || [];
    const n = g.filter(p => el.dataset.prog === "cc2" ? ok(p) : vu(p)).length;
    $(".bar div", el).style.width = (g.length ? 100 * n / g.length : 0) + "%";
    $(".cnt", el).textContent = n + " / " + g.length;
  });
}
function construireNav() {
  const groupes = [["accueil", "Commencer"], ["base", "Les bases"], ["methode", "La méthode"], ["cc2", "Le contrôle CC2 corrigé"], ["bilan", "Pour réviser"]];
  let h = "";
  groupes.forEach(([g, t]) => {
    const ps = PAGES.filter(p => (p.dataset.groupe || "bilan") === g);
    if (!ps.length) return;
    h += '<div class="navTitle">' + t + "</div>";
    ps.forEach(p => {
      h += '<a class="navlink" href="#/' + p.id + '" data-id="' + p.id + '">' + (p.dataset.num ? '<span class="num">' + p.dataset.num + "</span>" : "") + "<span>" + (p.dataset.nav || p.dataset.titre) + '</span><span class="ok">✓</span></a>';
    });
  });
  $("#nav").innerHTML = h;
}
function afficher() {
  let id = location.hash.replace(/^#\/?/, "") || "accueil";
  let page = document.getElementById(id);
  if (!page || !page.classList.contains("page")) { id = "accueil"; page = document.getElementById("accueil"); }
  PAGES.forEach(p => p.classList.toggle("active", p === page));
  $$(".navlink").forEach(a => a.classList.toggle("current", a.dataset.id === id));
  $("#crumb").textContent = page.dataset.titre || "";
  document.title = (page.dataset.titre ? page.dataset.titre + " · " : "") + "Python pas à pas · CPES L1";
  colorer(page); initQcm(page); initPredict(page); initParsons(page); initEchelles(page); initTraces(page); initEditeurs(page);
  if (!page.dataset.pnav) {
    page.dataset.pnav = "1";
    const i = PAGES.indexOf(page), prev = PAGES[i - 1], next = PAGES[i + 1];
    const nav = document.createElement("nav"); nav.className = "pnav";
    nav.innerHTML = (prev ? '<a class="prev" href="#/' + prev.id + '"><small>← Précédent</small>' + prev.dataset.titre + "</a>" : "") +
      (next ? '<a class="next" href="#/' + next.id + '"><small>Suivant →</small>' + next.dataset.titre + "</a>" : "");
    page.appendChild(nav);
  }
  if (page.dataset.groupe === "base" || page.dataset.groupe === "methode") store.set("vu_" + id, "1");
  majProgres();
  window.scrollTo(0, 0);
  fermerMenu();
}
function fermerMenu() { $("#sidebar").classList.remove("open"); $("#backdrop").classList.remove("open"); }

/* quiz final : score du premier coup */
function initQuizFinal() {
  const q = $("#quiz");
  if (!q) return;
  let rep = 0, bons = 0;
  const total = $$(".qcm", q).length;
  q.addEventListener("qcm", e => {
    rep++; if (e.detail.premier) bons++;
    $("#score").textContent = "Score : " + bons + " / " + total + " du premier coup" + (rep < total ? " (" + (total - rep) + " question(s) restante(s))" : rep && bons >= total - 2 ? " — excellent !" : " — revois les chapitres des questions ratées.");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  construireExos();
  PAGES = $$("section.page");
  construireNav();
  initQuizFinal();
  $("#menuBtn").addEventListener("click", () => { $("#sidebar").classList.toggle("open"); $("#backdrop").classList.toggle("open"); });
  $("#backdrop").addEventListener("click", fermerMenu);
  $("#resetProg").addEventListener("click", () => {
    if (!confirm("Effacer ta progression et tout le code que tu as écrit ?")) return;
    try { Object.keys(localStorage).filter(k => k.startsWith("pycc2_")).forEach(k => localStorage.removeItem(k)); } catch (e) {}
    Object.keys(mem).forEach(k => delete mem[k]);
    location.reload();
  });
  window.addEventListener("hashchange", afficher);
  afficher();
});
})();
