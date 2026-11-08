# -*- coding: utf-8 -*-
"""Vérifie les solutions, génère les traces pas à pas et écrit data.js."""
import sys, io, json, types, copy
sys.path.insert(0, sys.argv[1] if len(sys.argv) > 1 else '.')
from exos_data import EXOS
from blanc_data import BLANC, copie_initiale

# ------------------------------------------------------------------ traceur
def tracer(code, filename, appel=None, prelude=None):
    """Exécute `code` et enregistre une étape par ligne exécutée (dans les cadres de `filename`)."""
    lines = code.split('\n')
    steps, pending = [], {}
    out = io.StringIO()

    def clean(d):
        r = {}
        for k, v in d.items():
            if k.startswith('_') or isinstance(v, (types.FunctionType, types.ModuleType, type)) or callable(v):
                continue
            r[k] = repr(v)
        return r

    def fname(frame):
        return frame.f_code.co_name

    def finalize(fid, next_line=None, ret=None, has_ret=False):
        p = pending.pop(fid, None)
        if not p:
            return
        st = p['st']
        st['v'] = clean(p['frame'].f_locals)
        st['o'] = out.getvalue()
        src = lines[st['l'] - 1].strip()
        if src.startswith('for ') and next_line is None:
            st['f'] = 'fin'
        elif src.startswith('for ') and next_line is not None:
            ind = len(lines[st['l'] - 1]) - len(lines[st['l'] - 1].lstrip())
            nl = lines[next_line - 1]
            nind = len(nl) - len(nl.lstrip())
            st['f'] = 'tour' if (next_line > st['l'] and nind > ind) else 'fin'
        if has_ret:
            st['r'] = repr(ret)
        steps.append(st)

    def tr(frame, event, arg):
        if frame.f_code.co_filename != filename:
            return tr
        fid = id(frame)
        if event == 'call':
            if frame.f_code.co_name != '<module>':
                steps.append({'l': frame.f_code.co_firstlineno, 'fr': fname(frame), 'v': clean(frame.f_locals),
                              'o': out.getvalue(), 'call': True,
                              'de': frame.f_back.f_lineno if frame.f_back and frame.f_back.f_code.co_filename == filename else None})
            return tr
        if event == 'line':
            finalize(fid, frame.f_lineno)
            st = {'l': frame.f_lineno, 'fr': fname(frame)}
            src = lines[frame.f_lineno - 1].strip()
            for kw in ('if ', 'elif '):
                if src.startswith(kw):
                    expr = src[len(kw):].rsplit(':', 1)[0]
                    st['c'] = bool(eval(expr, frame.f_globals, frame.f_locals))
            pending[fid] = {'st': st, 'frame': frame}
        elif event == 'return':
            finalize(fid, None, arg, frame.f_code.co_name != '<module>')
        return tr

    g = {'__name__': '__trace__'}
    old = sys.stdout
    sys.stdout = out
    try:
        if prelude:
            exec(compile(prelude, '<prelude>', 'exec'), g)
        if appel:
            exec(compile(code, filename, 'exec'), g)
            sys.settrace(tr)
            res = eval(compile(appel, '<appel>', 'eval'), g)
            sys.settrace(None)
        else:
            sys.settrace(tr)
            exec(compile(code, filename, 'exec'), g)
            sys.settrace(None)
            res = None
    finally:
        sys.settrace(None)
        sys.stdout = old
    return {'code': code, 'steps': steps, 'appel': appel, 'res': repr(res) if appel else None}

# ------------------------------------------------------------------ traces des chapitres
CH = {
 'var': dict(code="a = 5\nb = a + 2\na = a * 10\nprint(a, b)", notes={
   1: "On range 5 dans la variable <code>a</code>.",
   2: "Python calcule d'abord la partie droite avec la valeur actuelle de <code>a</code> (5), puis range le résultat 7 dans <code>b</code>.",
   3: "À droite : 5 × 10 = 50. Ce résultat remplace l'ancienne valeur de <code>a</code>.",
   4: "<code>b</code> vaut toujours 7 : il a été calculé avant, il ne « suit » pas <code>a</code>."}),
 'compteur': dict(code="compteur = 0\ncompteur = compteur + 1\ncompteur = compteur + 1\nprint(compteur)", notes={
   1: "Le compteur démarre à 0.",
   2: "À droite : 0 + 1 = 1. Puis on range 1 dans <code>compteur</code>, à la place de 0.",
   3: "À droite : 1 + 1 = 2. On range 2 dans <code>compteur</code>.",
   4: "On affiche la valeur actuelle : 2."}),
 'si': dict(code='x = 7\nif x % 2 == 0:\n    print(x, "est pair")\nelse:\n    print(x, "est impair")\nprint("fin")', notes={
   1: "On range 7 dans <code>x</code>.",
   2: "Python calcule <code>7 % 2</code>, qui vaut 1. Est-ce que 1 == 0 ?",
   3: "Ce bloc n'est exécuté que si le test est vrai.",
   5: "Le test était faux : Python saute directement dans le bloc du <code>else</code>.",
   6: "Cette ligne n'est pas décalée : elle ne fait partie ni du <code>if</code> ni du <code>else</code>. Elle est exécutée dans tous les cas."}),
 'liste': dict(code="R = []\nR.append(5)\nR.append(8)\nR[0] = 1\nprint(R, len(R))", notes={
   1: "On crée une liste vide : elle n'a aucune case.",
   2: "<code>append</code> ajoute une case à la fin : la liste contient maintenant 5.",
   3: "Une deuxième case est ajoutée à la fin.",
   4: "On remplace le contenu de la case d'indice 0 (la première).",
   5: "On affiche la liste et son nombre d'éléments."}),
 'for_val': dict(code='L = [5, 2, 3]\nfor x in L:\n    print(x * 10)\nprint("fini")', notes={
   1: "On crée une liste de trois nombres.",
   2: "La boucle donne à <code>x</code> l'élément suivant de la liste.",
   3: "Le corps de la boucle (ligne décalée) est exécuté avec la valeur actuelle de <code>x</code>.",
   4: "Cette ligne n'est pas décalée : elle s'exécute une seule fois, après la boucle."}),
 'for_ind': dict(code='L = [5, 2, 3]\nfor i in range(len(L)):\n    print("case", i, ":", L[i])', notes={
   1: "Une liste de 3 éléments : <code>len(L)</code> vaut 3, donc <code>range(3)</code> donne 0, 1, 2.",
   2: "Cette fois, la variable de boucle <code>i</code> reçoit un <strong>indice</strong> (un numéro de case).",
   3: "On utilise <code>i</code> pour lire la case : <code>L[i]</code>."}),
 'total': dict(code="L = [5, 2, 3]\ntotal = 0\nfor x in L:\n    total = total + x\nprint(total)", notes={
   1: "Une liste de nombres à additionner.",
   2: "Le total démarre à 0, <strong>avant</strong> la boucle.",
   3: "<code>x</code> reçoit l'élément suivant.",
   4: "On ajoute <code>x</code> au total : le total « se souvient » des tours précédents.",
   5: "Après la boucle, on affiche la somme."}),
 'envers': dict(code="L = [5, 2, 3]\nfor i in range(len(L) - 1, -1, -1):\n    print(i, L[i])", notes={
   1: "3 éléments, d'indices 0, 1 et 2.",
   2: "<code>range(2, -1, -1)</code> : on part de 2, on descend de 1, on s'arrête <strong>avant</strong> -1. Donc 2, 1, 0.",
   3: "On affiche l'indice et l'élément correspondant."}),
 'fonction': dict(code="def carre(x):\n    resultat = x * x\n    return resultat\n\nreponse = carre(5)\nprint(reponse)", notes={
   1: "Python <strong>mémorise</strong> la fonction <code>carre</code>, mais n'exécute pas encore son contenu.",
   2: "On est maintenant dans la fonction : <code>x</code> vaut 5. On calcule 5 × 5.",
   3: "<code>return</code> renvoie la valeur au programme qui a appelé la fonction, et termine la fonction.",
   5: "<code>carre(5)</code> appelle la fonction. Sa valeur de retour (25) est rangée dans <code>reponse</code>.",
   6: "On affiche le résultat."}),
 'retour_boucle': dict(code="def double(L):\n    R = []\n    for x in L:\n        R.append(2 * x)\n        return R\n\nprint(double([5, 2, 3]))", notes={
   1: "Python mémorise la fonction <code>double</code>.",
   2: "On crée la liste des résultats.",
   3: "Premier tour : <code>x</code> vaut 5.",
   4: "On ajoute 10.",
   5: "<strong>Problème :</strong> ce <code>return</code> est décalé dans la boucle. Il s'exécute au premier tour et arrête tout de suite la fonction !",
   7: "Résultat : <code>[10]</code> au lieu de <code>[10, 4, 6]</code>."}),
}

def verifier(sol, tests, prelude=None):
    g = {}
    if prelude:
        exec(prelude, g)
    exec(sol, g)
    def _apres(f, L, *a):
        f(L, *a)
        return L
    g['_apres'] = _apres
    for call, exp, label in tests:
        got = eval(call, g)
        assert got == eval(exp), (call, got, exp)

def echoue_squelette(sk, tests):
    g = {}
    exec(sk, g)
    g['_apres'] = lambda f, L, *a: (f(L, *a), L)[1]
    fails = 0
    for call, exp, label in tests:
        try:
            if eval(call, g) != eval(exp):
                fails += 1
        except Exception:
            fails += 1
    return fails

traces = {}
for k, d in CH.items():
    t = tracer(d['code'], '<script>')
    t['notes'] = {str(a): b for a, b in d['notes'].items()}
    traces[k] = t

exos = []
for e in EXOS:
    sol = e['solution']
    verifier(sol, e['tests'], e.get('prelude'))
    if 'autre' in e:
        verifier(e['autre'], e['tests'], e.get('prelude'))
    assert echoue_squelette(e['squelette'], e['tests']) > 0
    # le squelette donné doit au moins se lancer sans erreur
    sl = sol.split('\n')
    assert len(sl) == len(e['explications']), (e['n'], len(sl), len(e['explications']))
    t = tracer(sol, '<sol>', appel=e['appel'], prelude=e.get('prelude'))
    t['notes'] = {str(i + 1): x for i, x in enumerate(e['explications'])}
    traces['ex%d' % e['n']] = t
    # le résultat de la trace doit correspondre au premier test
    for j, tr in enumerate(e['entrainements']):
        verifier(tr['solution'], tr['tests'], tr['squelette'] if 'Fonction déjà écrite' in tr['squelette'] else None)
        assert echoue_squelette(tr['squelette'], tr['tests']) > 0, (e['n'], j)
    exos.append(e)

# examen blanc : toutes les solutions dans un même fichier, comme une copie
copie_sol = "\n\n".join(e['solution'] for e in BLANC)
tous = [t for e in BLANC for t in e['tests']]
verifier(copie_sol, tous)
assert echoue_squelette(copie_initiale(), tous) == len(tous) - sum(1 for t in tous if t[0].startswith('_apres'))
for e in BLANC:
    assert e['sig'].startswith(e['fn'] + '(')
    for t in e['tests']:
        assert e['fn'] in t[0]

js = "/* Fichier généré par build.py : ne pas modifier à la main. */\n"
js += "window.EXOS = " + json.dumps(exos, ensure_ascii=False) + ";\n"
js += "window.BLANC = " + json.dumps({'exos': BLANC, 'copie': copie_initiale()}, ensure_ascii=False) + ";\n"
js += "window.TRACES = " + json.dumps(traces, ensure_ascii=False) + ";\n"
open(sys.argv[2] if len(sys.argv) > 2 else 'data.js', 'w', encoding='utf-8').write(js)
print('OK', len(exos), 'exercices,', sum(len(e['entrainements']) for e in exos), 'entraînements,', len(traces), 'traces')
