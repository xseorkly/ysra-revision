# -*- coding: utf-8 -*-
"""Contenu des 10 exercices du CC2 et des 20 entraînements.
Source unique : build.py vérifie les solutions, génère les traces et écrit exercices.js."""

SOL1 = """def scalar_mul(L, alpha):
    resultat = []
    for x in L:
        resultat.append(x * alpha)
    return resultat"""

SOL3 = """def somme(L, Lprime):
    resultat = []
    for i in range(len(L)):
        resultat.append(L[i] + Lprime[i])
    return resultat"""

SOL2 = """def renverse(L):
    resultat = []
    for i in range(len(L) - 1, -1, -1):
        resultat.append(L[i])
    return resultat"""

SOL6 = """def syracuse(L):
    resultat = []
    for x in L:
        if x % 2 == 0:
            resultat.append(x // 2)
        else:
            resultat.append(3 * x + 1)
    return resultat"""

def skel(signature, note=""):
    s = "def " + signature + ":\n    # à compléter ...\n    return None  # à modifier\n"
    if note:
        s = note + "\n\n" + s
    return s

def donne(code, ex):
    return "# Fonction déjà écrite à l'exercice " + str(ex) + " (tu peux t'en servir) :\n" + code

EXOS = [
# ---------------------------------------------------------------- 1
dict(
 n=1, titre="Multiplication par un scalaire", recette="Transformer", etoiles=1,
 fonction="scalar_mul(L, alpha)",
 enonce="Écrire une fonction <code>scalar_mul(L, alpha)</code> prenant en argument une liste de nombres <code>L</code> et un nombre <code>alpha</code>. Cette fonction renvoie une nouvelle liste formée des nombres de <code>L</code> multipliés par <code>alpha</code>. Ainsi l'instruction <code>scalar_mul([5,2,3], 10)</code> renvoie la liste <code>[50,20,30]</code>.",
 entrees="une liste <code>L</code> et un nombre <code>alpha</code>",
 sortie="une <strong>nouvelle liste</strong>, de même longueur que <code>L</code>",
 exemple="<code>[5, 2, 3]</code> et <code>10</code> → <code>[50, 20, 30]</code>",
 question=dict(q="Combien d'éléments aura la liste renvoyée par <code>scalar_mul([5, 2, 3, 8], 10)</code> ?",
   options=["1 seul : le produit de tout", "4 : un résultat par élément", "Ça dépend de alpha"], ok=1,
   why="Chaque nombre donne un nombre : 4 éléments en entrée, 4 en sortie. C'est la recette « Transformer »."),
 squelette=skel("scalar_mul(L, alpha)"),
 tests=[("scalar_mul([5, 2, 3], 10)", "[50, 20, 30]", "Exemple de l'énoncé"),
        ("scalar_mul([], 7)", "[]", "Liste vide"),
        ("scalar_mul([-2, 0, 4], -3)", "[6, 0, -12]", "Nombres négatifs"),
        ("_apres(scalar_mul, [5, 2, 3], 10)", "[5, 2, 3]", "La liste L de départ n'est pas modifiée")],
 indice1="On doit faire <strong>le même calcul sur chaque nombre</strong> de la liste : c'est la recette « Transformer » (chapitre 6). Il faut donc une liste vide au départ, une boucle qui passe sur chaque nombre, et un <code>append</code>.",
 indice2=["Crée une liste vide : <code>resultat = []</code>",
          "Pour chaque nombre <code>x</code> de <code>L</code> : <code>for x in L:</code>",
          "Dans la boucle, ajoute <code>x * alpha</code> à <code>resultat</code>",
          "Après la boucle (pas dedans !), renvoie <code>resultat</code>"],
 trous="""def scalar_mul(L, alpha):
    resultat = ____
    for x in ____:
        resultat.append(____)
    return ____""",
 solution=SOL1,
 explications=["On définit la fonction : elle reçoit une liste <code>L</code> et un nombre <code>alpha</code>.",
   "On crée une liste vide qui va recevoir les résultats. On ne touche pas à <code>L</code>.",
   "La boucle donne à <code>x</code> chaque nombre de <code>L</code>, l'un après l'autre.",
   "On calcule <code>x * alpha</code> et on le range à la fin de <code>resultat</code>.",
   "La boucle est finie : on renvoie la liste complète. Cette ligne est alignée avec <code>for</code>, pas dans la boucle."],
 appel="scalar_mul([5, 2, 3], 10)",
 pieges=["Mettre <code>return resultat</code> <strong>dans</strong> la boucle (décalé sous <code>append</code>) : la fonction s'arrête après le premier nombre et renvoie <code>[50]</code>.",
         "Écrire <code>return L</code> : on renvoie la liste de départ, pas les résultats.",
         "Écrire <code>L * alpha</code> : avec une liste, <code>*</code> ne multiplie pas les nombres, il <strong>répète</strong> la liste ! <code>[5, 2] * 3</code> donne <code>[5, 2, 5, 2, 5, 2]</code>."],
 entrainements=[
  dict(titre="Ajouter un nombre", etoiles=1,
   enonce="Écris <code>ajoute(L, n)</code> qui renvoie une nouvelle liste où l'on a ajouté <code>n</code> à chaque élément. Exemple : <code>ajoute([1, 5, 10], 3)</code> renvoie <code>[4, 8, 13]</code>.",
   squelette=skel("ajoute(L, n)"),
   tests=[("ajoute([1, 5, 10], 3)", "[4, 8, 13]", "Exemple"), ("ajoute([], 3)", "[]", "Liste vide"), ("ajoute([0, -4], -1)", "[-1, -5]", "Négatifs")],
   indice="Même recette que <code>scalar_mul</code> : seul le calcul dans <code>append</code> change.",
   solution="""def ajoute(L, n):
    resultat = []
    for x in L:
        resultat.append(x + n)
    return resultat""",
   explication="On a gardé exactement le squelette « Transformer » : seule la ligne du calcul a changé (<code>x + n</code> au lieu de <code>x * alpha</code>)."),
  dict(titre="Degrés Celsius en Fahrenheit", etoiles=2,
   enonce="Écris <code>en_fahrenheit(L)</code> qui convertit une liste de températures en °C en °F avec la formule <code>F = C × 9 / 5 + 32</code>. Exemple : <code>en_fahrenheit([0, 100, -40])</code> renvoie <code>[32.0, 212.0, -40.0]</code>.",
   squelette=skel("en_fahrenheit(L)"),
   tests=[("en_fahrenheit([0, 100, -40])", "[32.0, 212.0, -40.0]", "Exemple"), ("en_fahrenheit([])", "[]", "Liste vide"), ("en_fahrenheit([37])", "[98.6]", "Température du corps")],
   indice="Pour chaque température <code>c</code>, calcule <code>c * 9 / 5 + 32</code> et range-la dans la nouvelle liste. La division <code>/</code> donne un nombre à virgule : c'est normal d'obtenir <code>32.0</code>.",
   solution="""def en_fahrenheit(L):
    resultat = []
    for c in L:
        resultat.append(c * 9 / 5 + 32)
    return resultat""",
   explication="Toujours « Transformer » : un résultat par élément. Le nom de la variable de boucle est libre : <code>c</code> pour « Celsius » rend le code plus lisible."),
 ]),
# ---------------------------------------------------------------- 2
dict(
 n=2, titre="Renversement", recette="Transformer", etoiles=2,
 fonction="renverse(L)",
 enonce="Écrire une fonction <code>renverse(L)</code> qui prend en argument une liste <code>L</code> et qui renvoie une nouvelle liste dans laquelle les éléments sont rangés en sens inverse. Ainsi l'instruction <code>renverse([5,2,3])</code> renvoie la liste <code>[3,2,5]</code>.",
 entrees="une liste <code>L</code>",
 sortie="une <strong>nouvelle liste</strong> : les mêmes éléments, dans l'ordre inverse",
 exemple="<code>[5, 2, 3]</code> → <code>[3, 2, 5]</code>",
 question=dict(q="Pour <code>L = [5, 2, 3]</code>, dans quel ordre faut-il lire les <strong>indices</strong> ?",
   options=["0, 1, 2", "2, 1, 0", "3, 2, 1"], ok=1,
   why="La liste a 3 éléments, donc les indices vont de 0 à 2. À l'envers : 2, puis 1, puis 0. L'indice 3 n'existe pas."),
 squelette=skel("renverse(L)"),
 tests=[("renverse([5, 2, 3])", "[3, 2, 5]", "Exemple de l'énoncé"),
        ("renverse([])", "[]", "Liste vide"),
        ("renverse([9])", "[9]", "Un seul élément"),
        ("renverse([1, 2, 3, 4])", "[4, 3, 2, 1]", "Nombre pair d'éléments"),
        ("_apres(renverse, [5, 2, 3])", "[5, 2, 3]", "La liste L de départ n'est pas modifiée")],
 indice1="On ne peut pas utiliser <code>for x in L</code> tel quel : il lit la liste <strong>du début vers la fin</strong>. Il faut parcourir les <strong>indices</strong> en partant du dernier (<code>len(L) - 1</code>) jusqu'à <code>0</code>. Revois « Parcourir à l'envers » au chapitre 4.",
 indice2=["Crée une liste vide <code>resultat</code>",
          "Fais varier <code>i</code> de <code>len(L) - 1</code> jusqu'à <code>0</code> : <code>range(len(L) - 1, -1, -1)</code>",
          "À chaque tour, ajoute <code>L[i]</code> à <code>resultat</code>",
          "Après la boucle, renvoie <code>resultat</code>"],
 trous="""def renverse(L):
    resultat = []
    for i in range(____, -1, -1):
        resultat.append(____)
    return resultat""",
 solution=SOL2,
 explications=["On définit la fonction, qui reçoit une liste <code>L</code>.",
   "Liste vide qui recevra les éléments dans le nouvel ordre.",
   "<code>range(len(L) - 1, -1, -1)</code> se lit : « pars du dernier indice, descends de 1 à chaque fois, arrête-toi avant -1 ». Pour 3 éléments : 2, 1, 0.",
   "On range l'élément situé à l'indice <code>i</code> : d'abord le dernier, puis l'avant-dernier…",
   "On renvoie la nouvelle liste, après la boucle."],
 appel="renverse([5, 2, 3])",
 autre="""def renverse(L):
    resultat = []
    for x in L:
        resultat.insert(0, x)   # on place x tout devant
    return resultat""",
 autre_expl="Autre idée, sans indices : on lit la liste normalement, mais on place chaque élément <strong>devant</strong> les autres avec <code>insert(0, x)</code>. Comme une pile d'assiettes : la dernière posée se retrouve en haut.",
 pieges=["Écrire <code>range(len(L), 0, -1)</code> : on commence à l'indice 3, qui n'existe pas (<code>IndexError</code>), et on n'atteint jamais l'indice 0.",
         "Écrire <code>range(len(L) - 1, 0, -1)</code> : le 0 est exclu, donc le premier élément est oublié.",
         "Utiliser <code>L.reverse()</code> : ça retourne <code>L</code> elle-même au lieu de créer une nouvelle liste, et ça renvoie <code>None</code>."],
 entrainements=[
  dict(titre="À l'envers et doublé", etoiles=2,
   enonce="Écris <code>envers_double(L)</code> qui renvoie les éléments de <code>L</code> à l'envers <strong>et</strong> multipliés par 2. Exemple : <code>envers_double([1, 2, 3])</code> renvoie <code>[6, 4, 2]</code>.",
   squelette=skel("envers_double(L)"),
   tests=[("envers_double([1, 2, 3])", "[6, 4, 2]", "Exemple"), ("envers_double([])", "[]", "Liste vide"), ("envers_double([5])", "[10]", "Un élément")],
   indice="Reprends exactement <code>renverse</code> et change seulement ce que tu ajoutes : <code>2 * L[i]</code> au lieu de <code>L[i]</code>.",
   solution="""def envers_double(L):
    resultat = []
    for i in range(len(L) - 1, -1, -1):
        resultat.append(2 * L[i])
    return resultat""",
   explication="Le parcours à l'envers ne change pas ; seul le calcul dans <code>append</code> change."),
  dict(titre="Palindrome", etoiles=3,
   enonce="Une liste est un <em>palindrome</em> si elle se lit pareil dans les deux sens, comme <code>[1, 2, 1]</code>. Écris <code>est_palindrome(L)</code> qui renvoie <code>True</code> ou <code>False</code>. Tu peux utiliser <code>renverse</code>.",
   squelette=skel("est_palindrome(L)", donne(SOL2, 2)),
   tests=[("est_palindrome([1, 2, 1])", "True", "Palindrome"), ("est_palindrome([1, 2, 3])", "False", "Pas palindrome"), ("est_palindrome([])", "True", "Liste vide"), ("est_palindrome([4, 7, 7, 4])", "True", "Longueur paire")],
   indice="Une liste est un palindrome si elle est <strong>égale</strong> à sa version renversée. La comparaison <code>==</code> donne directement <code>True</code> ou <code>False</code>.",
   solution="""def est_palindrome(L):
    return L == renverse(L)""",
   explication="<code>L == renverse(L)</code> est une question (vrai/faux) : on peut renvoyer directement sa réponse. Pas besoin de <code>if</code>."),
 ]),
# ---------------------------------------------------------------- 3
dict(
 n=3, titre="Somme de deux listes", recette="Combiner deux listes", etoiles=1,
 fonction="somme(L, Lprime)",
 enonce="Écrire une fonction <code>somme(L, Lprime)</code> prenant en argument 2 listes de nombres de même taille. Cette fonction renvoie une nouvelle liste dans laquelle l'élément d'indice <code>i</code> est <code>L[i] + Lprime[i]</code>. Ainsi l'instruction <code>somme([5,2,3], [1,2,3])</code> renvoie la liste <code>[6,4,6]</code>.",
 entrees="deux listes <code>L</code> et <code>Lprime</code> <strong>de même taille</strong>",
 sortie="une <strong>nouvelle liste</strong> de même taille",
 exemple="<code>[5, 2, 3]</code> et <code>[1, 2, 3]</code> → <code>[5+1, 2+2, 3+3]</code> = <code>[6, 4, 6]</code>",
 question=dict(q="Pourquoi faut-il ici parcourir les <strong>indices</strong> (<code>for i in range(len(L))</code>) plutôt que les valeurs (<code>for x in L</code>) ?",
   options=["Parce que c'est plus rapide", "Parce qu'il faut lire la même case dans les deux listes en même temps", "Parce que la liste peut être vide"], ok=1,
   why="Avec <code>for x in L</code>, on aurait la valeur de <code>L</code> mais on ne saurait pas quelle case lire dans <code>Lprime</code>. L'indice <code>i</code> sert de « numéro de case » commun aux deux listes."),
 squelette=skel("somme(L, Lprime)"),
 tests=[("somme([5, 2, 3], [1, 2, 3])", "[6, 4, 6]", "Exemple de l'énoncé"),
        ("somme([], [])", "[]", "Listes vides"),
        ("somme([1, -1], [-1, 1])", "[0, 0]", "Nombres négatifs"),
        ("_apres(somme, [5, 2, 3], [1, 2, 3])", "[5, 2, 3]", "La liste L de départ n'est pas modifiée")],
 indice1="C'est la recette « Combiner deux listes » : on parcourt les indices <code>i</code> de 0 à <code>len(L) - 1</code>, et à chaque tour on additionne les deux cases de même numéro.",
 indice2=["Crée une liste vide <code>resultat</code>",
          "Pour chaque indice : <code>for i in range(len(L)):</code>",
          "Ajoute <code>L[i] + Lprime[i]</code> à <code>resultat</code>",
          "Après la boucle, renvoie <code>resultat</code>"],
 trous="""def somme(L, Lprime):
    resultat = []
    for i in range(____):
        resultat.append(____ + ____)
    return resultat""",
 solution=SOL3,
 explications=["La fonction reçoit deux listes.",
   "Liste vide pour les résultats.",
   "<code>i</code> prend les valeurs 0, 1, 2… jusqu'à <code>len(L) - 1</code> : tous les numéros de case.",
   "On additionne la case <code>i</code> de chaque liste et on range le résultat.",
   "On renvoie la liste, après la boucle."],
 appel="somme([5, 2, 3], [1, 2, 3])",
 pieges=["Écrire <code>L + Lprime</code> : avec des listes, <code>+</code> les <strong>colle bout à bout</strong> ! <code>[5, 2, 3] + [1, 2, 3]</code> donne <code>[5, 2, 3, 1, 2, 3]</code>.",
         "Écrire <code>for i in L</code> : <code>i</code> prend alors les <strong>valeurs</strong> 5, 2, 3, et <code>L[5]</code> provoque une <code>IndexError</code>."],
 entrainements=[
  dict(titre="Produit terme à terme", etoiles=1,
   enonce="Écris <code>produit(L, Lprime)</code> qui renvoie la liste des <code>L[i] * Lprime[i]</code>. Exemple : <code>produit([2, 3, 4], [5, 0, 2])</code> renvoie <code>[10, 0, 8]</code>.",
   squelette=skel("produit(L, Lprime)"),
   tests=[("produit([2, 3, 4], [5, 0, 2])", "[10, 0, 8]", "Exemple"), ("produit([], [])", "[]", "Listes vides"), ("produit([-1], [-6])", "[6]", "Négatifs")],
   indice="Même structure que <code>somme</code> : remplace <code>+</code> par <code>*</code>.",
   solution="""def produit(L, Lprime):
    resultat = []
    for i in range(len(L)):
        resultat.append(L[i] * Lprime[i])
    return resultat""",
   explication="On garde le parcours par indices pour lire les deux listes « en face » l'une de l'autre."),
  dict(titre="Le plus grand des deux", etoiles=2,
   enonce="Écris <code>plus_grand(L, Lprime)</code> qui renvoie, case par case, le plus grand des deux nombres. Exemple : <code>plus_grand([1, 8, 3], [4, 2, 3])</code> renvoie <code>[4, 8, 3]</code>. Sans utiliser <code>max</code>.",
   squelette=skel("plus_grand(L, Lprime)"),
   tests=[("plus_grand([1, 8, 3], [4, 2, 3])", "[4, 8, 3]", "Exemple"), ("plus_grand([], [])", "[]", "Listes vides"), ("plus_grand([-5, 0], [-2, -1])", "[-2, 0]", "Négatifs")],
   indice="Pour chaque indice <code>i</code>, compare <code>L[i]</code> et <code>Lprime[i]</code> avec un <code>if</code> / <code>else</code>, puis ajoute le plus grand.",
   solution="""def plus_grand(L, Lprime):
    resultat = []
    for i in range(len(L)):
        if L[i] > Lprime[i]:
            resultat.append(L[i])
        else:
            resultat.append(Lprime[i])
    return resultat""",
   explication="On combine deux recettes : le parcours de deux listes par indices, et une condition qui choisit quoi ajouter. En cas d'égalité, le <code>else</code> ajoute <code>Lprime[i]</code>, qui vaut la même chose."),
 ]),
# ---------------------------------------------------------------- 4
dict(
 n=4, titre="Soustraction par réutilisation", recette="Réutiliser des fonctions", etoiles=2,
 fonction="soustraction(L, Lprime)",
 enonce="<strong>En utilisant les fonctions précédentes</strong>, écrire une fonction <code>soustraction(L, Lprime)</code> prenant en argument 2 listes de nombres de même taille. Cette fonction renvoie une nouvelle liste dans laquelle l'élément d'indice <code>i</code> est <code>L[i] - Lprime[i]</code>. Ainsi l'instruction <code>soustraction([5,2,3], [1,2,3])</code> renvoie la liste <code>[4,0,0]</code>.",
 entrees="deux listes de même taille",
 sortie="une nouvelle liste : les différences case par case",
 exemple="<code>[5, 2, 3]</code> et <code>[1, 2, 3]</code> → <code>[4, 0, 0]</code>",
 question=dict(q="Quelle égalité permet d'écrire une soustraction avec les fonctions déjà écrites ?",
   options=["a − b = a + (−1) × b", "a − b = b − a", "a − b = a × b − 1"], ok=0,
   why="Soustraire b, c'est ajouter l'opposé de b. On fabrique les opposés avec <code>scalar_mul(Lprime, -1)</code>, puis on les ajoute avec <code>somme</code>."),
 squelette=donne(SOL1, 1) + "\n\n" + donne(SOL3, 3) + "\n\n" + skel("soustraction(L, Lprime)"),
 tests=[("soustraction([5, 2, 3], [1, 2, 3])", "[4, 0, 0]", "Exemple de l'énoncé"),
        ("soustraction([], [])", "[]", "Listes vides"),
        ("soustraction([0, 10], [3, -2])", "[-3, 12]", "Résultats négatifs et soustraction d'un négatif")],
 indice1="L'énoncé dit « en utilisant les fonctions précédentes » : on n'a pas besoin de boucle ! Pense à <code>a − b = a + (−1) × b</code>. Revois « Une fonction peut en appeler une autre » au chapitre 5.",
 indice2=["Calcule les opposés : <code>opposes = scalar_mul(Lprime, -1)</code>",
          "Additionne : <code>somme(L, opposes)</code>",
          "Renvoie ce résultat"],
 trous="""def soustraction(L, Lprime):
    opposes = scalar_mul(____, ____)
    return somme(____, ____)""",
 solution="""def soustraction(L, Lprime):
    opposes = scalar_mul(Lprime, -1)
    return somme(L, opposes)""",
 prelude=SOL1 + "\n\n" + SOL3,
 explications=["La fonction reçoit deux listes.",
   "On appelle <code>scalar_mul</code> (exercice 1) pour fabriquer la liste des opposés : <code>[1, 2, 3]</code> devient <code>[-1, -2, -3]</code>.",
   "On appelle <code>somme</code> (exercice 3) : <code>[5, 2, 3] + [-1, -2, -3]</code> case par case donne <code>[4, 0, 0]</code>, et on renvoie directement ce résultat."],
 appel="soustraction([5, 2, 3], [1, 2, 3])",
 autre="""def soustraction(L, Lprime):
    resultat = []
    for i in range(len(L)):
        resultat.append(L[i] - Lprime[i])
    return resultat""",
 autre_expl="Cette version avec une boucle donne le bon résultat, mais elle ne respecte pas la consigne « en utilisant les fonctions précédentes » : au contrôle, elle pourrait ne pas avoir tous les points.",
 pieges=["Recopier les fonctions <code>scalar_mul</code> et <code>somme</code> à l'intérieur de <code>soustraction</code> : inutile, on les <strong>appelle</strong> simplement par leur nom.",
         "Oublier le <code>return</code> devant <code>somme(...)</code> : le calcul est fait, mais la fonction renvoie <code>None</code>."],
 entrainements=[
  dict(titre="Double de la somme", etoiles=1,
   enonce="Avec <code>somme</code> et <code>scalar_mul</code> (déjà écrites), écris <code>double_somme(L, Lprime)</code> qui renvoie <code>2 × (L[i] + Lprime[i])</code> pour chaque <code>i</code>. Exemple : <code>double_somme([1, 2], [3, 4])</code> renvoie <code>[8, 12]</code>.",
   squelette=donne(SOL1, 1) + "\n\n" + donne(SOL3, 3) + "\n\n" + skel("double_somme(L, Lprime)"),
   tests=[("double_somme([1, 2], [3, 4])", "[8, 12]", "Exemple"), ("double_somme([], [])", "[]", "Listes vides")],
   indice="D'abord la somme, puis on multiplie le résultat par 2 : <code>scalar_mul(somme(L, Lprime), 2)</code>.",
   solution="""def double_somme(L, Lprime):
    s = somme(L, Lprime)
    return scalar_mul(s, 2)""",
   explication="On enchaîne deux fonctions : le résultat de la première sert d'argument à la seconde."),
  dict(titre="Moyenne de deux mesures", etoiles=2,
   enonce="Deux élèves ont mesuré les mêmes objets. Écris <code>moyenne(L, Lprime)</code> qui renvoie la moyenne des deux mesures, case par case, en réutilisant <code>somme</code> et <code>scalar_mul</code>. Exemple : <code>moyenne([10, 4], [12, 5])</code> renvoie <code>[11.0, 4.5]</code>.",
   squelette=donne(SOL1, 1) + "\n\n" + donne(SOL3, 3) + "\n\n" + skel("moyenne(L, Lprime)"),
   tests=[("moyenne([10, 4], [12, 5])", "[11.0, 4.5]", "Exemple"), ("moyenne([], [])", "[]", "Listes vides")],
   indice="La moyenne de a et b, c'est (a + b) × 0,5. En Python, la virgule s'écrit avec un point : <code>0.5</code>.",
   solution="""def moyenne(L, Lprime):
    return scalar_mul(somme(L, Lprime), 0.5)""",
   explication="On peut écrire l'enchaînement sur une seule ligne : Python calcule d'abord <code>somme(...)</code>, puis passe le résultat à <code>scalar_mul</code>."),
 ]),
# ---------------------------------------------------------------- 5
dict(
 n=5, titre="Compter les nombres pairs", recette="Compter", etoiles=1,
 fonction="compte_nombres_pairs(L)",
 enonce="Écrire une fonction <code>compte_nombres_pairs(L)</code> qui prend en argument une liste <code>L</code> de nombres entiers. Cette fonction renvoie le nombre de nombres pairs au sein de la liste. Ainsi l'instruction <code>compte_nombres_pairs([5,2,3])</code> renvoie <code>1</code>.",
 entrees="une liste <code>L</code> de nombres entiers",
 sortie="<strong>un seul nombre entier</strong> (pas une liste !)",
 exemple="<code>[5, 2, 3]</code> → <code>1</code> (seul 2 est pair)",
 question=dict(q="Que doit renvoyer <code>compte_nombres_pairs([4, 7, 10])</code> ?",
   options=["<code>[4, 10]</code>", "<code>2</code>", "<code>14</code>"], ok=1,
   why="On ne garde pas les nombres pairs (ce serait un filtre) et on ne les additionne pas : on <strong>compte</strong> combien il y en a. 4 et 10 sont pairs : la réponse est 2."),
 squelette=skel("compte_nombres_pairs(L)"),
 tests=[("compte_nombres_pairs([5, 2, 3])", "1", "Exemple de l'énoncé"),
        ("compte_nombres_pairs([])", "0", "Liste vide"),
        ("compte_nombres_pairs([0, -2, -3])", "2", "0 et -2 sont pairs"),
        ("compte_nombres_pairs([1, 3, 5])", "0", "Aucun nombre pair")],
 indice1="Recette « Compter » : un compteur qui part de 0, et qu'on augmente de 1 chaque fois qu'un nombre est pair. Un nombre <code>x</code> est pair quand <code>x % 2 == 0</code> (le reste de la division par 2 est nul).",
 indice2=["Crée un compteur : <code>compteur = 0</code>",
          "Pour chaque <code>x</code> de <code>L</code>…",
          "… si <code>x % 2 == 0</code>, augmente le compteur : <code>compteur = compteur + 1</code>",
          "Après la boucle, renvoie <code>compteur</code>"],
 trous="""def compte_nombres_pairs(L):
    compteur = ____
    for x in L:
        if ____ == 0:
            compteur = ____
    return compteur""",
 solution="""def compte_nombres_pairs(L):
    compteur = 0
    for x in L:
        if x % 2 == 0:
            compteur = compteur + 1
    return compteur""",
 explications=["La fonction reçoit une liste d'entiers.",
   "Le compteur démarre à 0 : on n'a encore rien compté. Il est créé <strong>avant</strong> la boucle.",
   "On examine chaque nombre <code>x</code>.",
   "<code>x % 2</code> est le reste de la division par 2 : 0 si <code>x</code> est pair, 1 s'il est impair.",
   "Nombre pair trouvé : le compteur augmente de 1.",
   "On renvoie le total, après la boucle."],
 appel="compte_nombres_pairs([5, 2, 3])",
 pieges=["Mettre <code>compteur = 0</code> <strong>dans</strong> la boucle : il est remis à zéro à chaque tour, et on renvoie au mieux 1.",
         "Écrire <code>compteur + 1</code> tout seul : le calcul est fait mais pas rangé. Il faut <code>compteur = compteur + 1</code> (ou <code>compteur += 1</code>).",
         "Renvoyer une liste : la consigne demande « le nombre de nombres pairs », donc un entier."],
 entrainements=[
  dict(titre="Compter les négatifs", etoiles=1,
   enonce="Écris <code>compte_negatifs(L)</code> qui renvoie combien de nombres sont strictement négatifs. Exemple : <code>compte_negatifs([-3, 0, 5, -1])</code> renvoie <code>2</code>.",
   squelette=skel("compte_negatifs(L)"),
   tests=[("compte_negatifs([-3, 0, 5, -1])", "2", "Exemple"), ("compte_negatifs([])", "0", "Liste vide"), ("compte_negatifs([0, 0])", "0", "0 n'est pas négatif")],
   indice="Même recette ; seule la condition change : <code>x < 0</code>.",
   solution="""def compte_negatifs(L):
    compteur = 0
    for x in L:
        if x < 0:
            compteur = compteur + 1
    return compteur""",
   explication="« Strictement négatif » se traduit par <code>&lt;</code> (et non <code>&lt;=</code>) : 0 n'est pas compté."),
  dict(titre="Au-dessus d'un seuil", etoiles=2,
   enonce="Écris <code>compte_au_dessus(L, seuil)</code> qui renvoie combien de notes sont <strong>supérieures ou égales</strong> à <code>seuil</code>. Exemple : <code>compte_au_dessus([8, 12, 10, 15], 10)</code> renvoie <code>3</code>.",
   squelette=skel("compte_au_dessus(L, seuil)"),
   tests=[("compte_au_dessus([8, 12, 10, 15], 10)", "3", "Exemple (10 compte)"), ("compte_au_dessus([], 10)", "0", "Liste vide"), ("compte_au_dessus([1, 2], 5)", "0", "Aucune")],
   indice="« Supérieur ou égal » s'écrit <code>&gt;=</code>.",
   solution="""def compte_au_dessus(L, seuil):
    compteur = 0
    for note in L:
        if note >= seuil:
            compteur += 1
    return compteur""",
   explication="<code>compteur += 1</code> est une écriture courte pour <code>compteur = compteur + 1</code>. Le test avec la note 10 vérifie qu'on a bien mis <code>&gt;=</code>."),
 ]),
# ---------------------------------------------------------------- 6
dict(
 n=6, titre="Syracuse", recette="Transformer (avec une condition)", etoiles=2,
 fonction="syracuse(L)",
 enonce="Écrire une fonction <code>syracuse(L)</code> qui prend en argument une liste <code>L</code> de nombres entiers. Cette fonction renvoie une nouvelle liste dans laquelle l'élément d'indice <code>i</code> a pour valeur : <code>L[i] // 2</code> si <code>L[i]</code> est pair, <code>3*L[i] + 1</code> si <code>L[i]</code> est impair.",
 entrees="une liste <code>L</code> d'entiers",
 sortie="une nouvelle liste de même longueur",
 exemple="<code>[8, 5, 2, 1]</code> → <code>[4, 16, 1, 4]</code> (8 pair → 4 ; 5 impair → 16 ; 2 pair → 1 ; 1 impair → 4)",
 question=dict(q="Que devient le nombre 7 ?",
   options=["3", "3.5", "22"], ok=2,
   why="7 est impair (7 % 2 vaut 1), donc on calcule 3 × 7 + 1 = 22."),
 squelette=skel("syracuse(L)"),
 tests=[("syracuse([8, 5, 2, 1])", "[4, 16, 1, 4]", "Pairs et impairs mélangés"),
        ("syracuse([])", "[]", "Liste vide"),
        ("syracuse([0, 7])", "[0, 22]", "0 est pair"),
        ("_apres(syracuse, [8, 5])", "[8, 5]", "La liste L de départ n'est pas modifiée")],
 indice1="C'est « Transformer » : un résultat par élément. Mais le calcul dépend du nombre : il faut un <code>if</code> / <code>else</code> <strong>dans</strong> la boucle. Attention, on utilise <code>//</code> (division entière) et pas <code>/</code>.",
 indice2=["Crée <code>resultat = []</code>",
          "Pour chaque <code>x</code> de <code>L</code> :",
          "si <code>x % 2 == 0</code>, ajoute <code>x // 2</code>",
          "sinon, ajoute <code>3 * x + 1</code>",
          "Après la boucle, renvoie <code>resultat</code>"],
 trous="""def syracuse(L):
    resultat = []
    for x in L:
        if ____:
            resultat.append(____)
        else:
            resultat.append(____)
    return resultat""",
 solution=SOL6,
 explications=["La fonction reçoit une liste d'entiers.",
   "Liste vide pour les résultats.",
   "On examine chaque nombre <code>x</code>.",
   "Test de parité : vrai si le reste de la division par 2 est nul.",
   "Cas pair : on ajoute la moitié. <code>//</code> donne un entier (<code>8 // 2</code> vaut <code>4</code>, pas <code>4.0</code>).",
   "Sinon (le nombre est impair)…",
   "… on ajoute <code>3 * x + 1</code>.",
   "On renvoie la liste après la boucle."],
 appel="syracuse([8, 5, 2, 1])",
 pieges=["Utiliser <code>/</code> : <code>8 / 2</code> donne <code>4.0</code> (un nombre à virgule) au lieu de <code>4</code>.",
         "Écrire deux <code>if</code> sans <code>else</code> en modifiant <code>x</code> au passage : on risque d'appliquer les deux calculs au même nombre.",
         "Croire qu'il faut calculer toute la « suite de Syracuse » : ici, on applique <strong>une seule étape</strong> à chaque élément."],
 entrainements=[
  dict(titre="Valeur absolue", etoiles=1,
   enonce="Écris <code>valeurs_absolues(L)</code> qui remplace chaque nombre négatif par son opposé (sans utiliser <code>abs</code>). Exemple : <code>valeurs_absolues([-3, 4, 0, -1])</code> renvoie <code>[3, 4, 0, 1]</code>.",
   squelette=skel("valeurs_absolues(L)"),
   tests=[("valeurs_absolues([-3, 4, 0, -1])", "[3, 4, 0, 1]", "Exemple"), ("valeurs_absolues([])", "[]", "Liste vide")],
   indice="Si <code>x &lt; 0</code>, on ajoute <code>-x</code> ; sinon on ajoute <code>x</code> tel quel.",
   solution="""def valeurs_absolues(L):
    resultat = []
    for x in L:
        if x < 0:
            resultat.append(-x)
        else:
            resultat.append(x)
    return resultat""",
   explication="Même schéma que Syracuse : un <code>if</code>/<code>else</code> choisit le calcul, et chaque élément donne exactement un résultat."),
  dict(titre="Plusieurs étapes de Syracuse", etoiles=3,
   enonce="Écris <code>syracuse_repete(L, n)</code> qui applique <code>syracuse</code> <code>n</code> fois de suite à la liste. Exemple : <code>syracuse_repete([6], 3)</code> : 6 → 3 → 10 → 5, donc renvoie <code>[5]</code>.",
   squelette=skel("syracuse_repete(L, n)", donne(SOL6, 6)),
   tests=[("syracuse_repete([6], 3)", "[5]", "Exemple"), ("syracuse_repete([8, 5], 0)", "[8, 5]", "0 étape : la liste ne change pas"), ("syracuse_repete([8, 5], 2)", "[2, 8]", "Deux étapes")],
   indice="Garde une variable <code>courante</code> qui vaut <code>L</code> au départ. Répète <code>n</code> fois (<code>for etape in range(n):</code>) : <code>courante = syracuse(courante)</code>.",
   solution="""def syracuse_repete(L, n):
    courante = L
    for etape in range(n):
        courante = syracuse(courante)
    return courante""",
   explication="La boucle ne parcourt pas une liste : elle sert juste à <strong>répéter</strong> n fois. À chaque tour, la nouvelle liste remplace l'ancienne dans <code>courante</code>. Comme <code>syracuse</code> crée une nouvelle liste, <code>L</code> n'est jamais modifiée."),
 ]),
# ---------------------------------------------------------------- 7
dict(
 n=7, titre="Saturation", recette="Transformer (avec une condition)", etoiles=1,
 fonction="saturation(L, plafond)",
 enonce="Écrire une fonction <code>saturation(L, plafond)</code> qui prend en argument une liste <code>L</code> de nombres entiers et un nombre <code>plafond</code>. Cette fonction renvoie une nouvelle liste dans laquelle les valeurs supérieures au plafond sont remplacées par le plafond.",
 entrees="une liste <code>L</code> et un nombre <code>plafond</code>",
 sortie="une nouvelle liste de même longueur",
 exemple="<code>[7, 10, 15, -2]</code> avec plafond <code>10</code> → <code>[7, 10, 10, -2]</code>",
 question=dict(q="Avec un plafond de 10, que devient la valeur 10 ?",
   options=["Elle reste 10", "Elle devient 9", "Elle disparaît"], ok=0,
   why="10 n'est pas <em>supérieur</em> au plafond, il est égal. Il est gardé tel quel. Et de toute façon, le remplacer par 10 ne changerait rien ! Rien ne disparaît : la liste garde la même longueur."),
 squelette=skel("saturation(L, plafond)"),
 tests=[("saturation([7, 10, 15, -2], 10)", "[7, 10, 10, -2]", "Exemple"),
        ("saturation([], 5)", "[]", "Liste vide"),
        ("saturation([100, 200], 50)", "[50, 50]", "Tout dépasse"),
        ("_apres(saturation, [7, 15], 10)", "[7, 15]", "La liste L de départ n'est pas modifiée")],
 indice1="Recette « Transformer » avec une condition : chaque valeur donne une valeur. Si elle dépasse le plafond, on ajoute le plafond ; sinon on ajoute la valeur.",
 indice2=["Crée <code>resultat = []</code>",
          "Pour chaque <code>x</code> de <code>L</code> :",
          "si <code>x &gt; plafond</code>, ajoute <code>plafond</code>",
          "sinon, ajoute <code>x</code>",
          "Renvoie <code>resultat</code> après la boucle"],
 trous="""def saturation(L, plafond):
    resultat = []
    for x in L:
        if x ____ plafond:
            resultat.append(____)
        else:
            resultat.append(____)
    return resultat""",
 solution="""def saturation(L, plafond):
    resultat = []
    for x in L:
        if x > plafond:
            resultat.append(plafond)
        else:
            resultat.append(x)
    return resultat""",
 explications=["La fonction reçoit une liste et un plafond.",
   "Liste vide pour les résultats.",
   "On examine chaque valeur.",
   "« Supérieure au plafond » se traduit par <code>&gt;</code>.",
   "Elle dépasse : on la remplace par le plafond.",
   "Sinon…",
   "… on la garde telle quelle.",
   "On renvoie la nouvelle liste."],
 appel="saturation([7, 10, 15, -2], 10)",
 pieges=["Oublier le <code>else</code> : les valeurs qui ne dépassent pas disparaissent, et la liste devient plus courte.",
         "Modifier <code>L</code> directement (<code>L[i] = plafond</code>) : la consigne demande une <strong>nouvelle</strong> liste."],
 entrainements=[
  dict(titre="Imposer un plancher", etoiles=1,
   enonce="Écris <code>plancher(L, minimum)</code> où les valeurs <strong>inférieures</strong> au minimum sont remplacées par le minimum. Exemple : <code>plancher([3, -5, 8], 0)</code> renvoie <code>[3, 0, 8]</code>.",
   squelette=skel("plancher(L, minimum)"),
   tests=[("plancher([3, -5, 8], 0)", "[3, 0, 8]", "Exemple"), ("plancher([], 0)", "[]", "Liste vide")],
   indice="C'est le miroir de <code>saturation</code> : la comparaison devient <code>x &lt; minimum</code>.",
   solution="""def plancher(L, minimum):
    resultat = []
    for x in L:
        if x < minimum:
            resultat.append(minimum)
        else:
            resultat.append(x)
    return resultat""",
   explication="Seuls le sens de la comparaison et les noms ont changé."),
  dict(titre="Encadrer entre deux bornes", etoiles=2,
   enonce="Écris <code>encadre(L, mini, maxi)</code> qui ramène chaque valeur dans l'intervalle [mini, maxi]. Exemple : <code>encadre([-4, 5, 30], 0, 20)</code> renvoie <code>[0, 5, 20]</code>.",
   squelette=skel("encadre(L, mini, maxi)"),
   tests=[("encadre([-4, 5, 30], 0, 20)", "[0, 5, 20]", "Exemple"), ("encadre([], 0, 1)", "[]", "Liste vide"), ("encadre([0, 20], 0, 20)", "[0, 20]", "Valeurs égales aux bornes")],
   indice="Trois cas : trop petit, trop grand, ou entre les deux. Utilise <code>if</code> / <code>elif</code> / <code>else</code>.",
   solution="""def encadre(L, mini, maxi):
    resultat = []
    for x in L:
        if x < mini:
            resultat.append(mini)
        elif x > maxi:
            resultat.append(maxi)
        else:
            resultat.append(x)
    return resultat""",
   explication="<code>elif</code> (« sinon si ») permet un troisième cas. Une seule des trois branches est exécutée pour chaque valeur."),
 ]),
# ---------------------------------------------------------------- 8
dict(
 n=8, titre="Mitage", recette="Transformer (selon la position)", etoiles=3,
 fonction="mitage(L, k)",
 enonce="Écrire une fonction <code>mitage(L, k)</code> qui prend en argument une liste <code>L</code> de nombres et un nombre entier <code>k</code>. Cette fonction renvoie une nouvelle liste, de même taille que <code>L</code>, dans laquelle les nombres dont <strong>l'indice</strong> est un multiple de <code>k</code> sont remplacés par des zéros.",
 entrees="une liste <code>L</code> et un entier <code>k</code> (on suppose <code>k ≥ 1</code>)",
 sortie="une nouvelle liste de même taille",
 exemple="<code>[9, 8, 7, 6, 5]</code> avec <code>k = 2</code> → indices 0, 2, 4 remplacés → <code>[0, 8, 0, 6, 0]</code>",
 question=dict(q="Avec <code>L = [9, 8, 7, 6, 5]</code> et <code>k = 2</code>, pourquoi le <strong>premier</strong> élément devient-il 0 ?",
   options=["Parce que 9 est impair", "Parce que son indice est 0, et 0 est un multiple de 2", "C'est une erreur de l'énoncé"], ok=1,
   why="On teste la <strong>position</strong>, pas la valeur. Le premier élément est à l'indice 0, et 0 est un multiple de tout nombre (0 = 2 × 0). Il est donc toujours remplacé."),
 squelette=skel("mitage(L, k)"),
 tests=[("mitage([9, 8, 7, 6, 5], 2)", "[0, 8, 0, 6, 0]", "Exemple"),
        ("mitage([4, 5, 6], 1)", "[0, 0, 0]", "k = 1 : tous les indices"),
        ("mitage([1, 2, 3, 4, 5, 6, 7], 3)", "[0, 2, 3, 0, 5, 6, 0]", "k = 3"),
        ("mitage([], 3)", "[]", "Liste vide"),
        ("_apres(mitage, [9, 8, 7], 2)", "[9, 8, 7]", "La liste L de départ n'est pas modifiée")],
 indice1="Le mot clé est <strong>indice</strong> : il faut connaître la position de chaque élément, donc parcourir avec <code>for i in range(len(L))</code>. Un nombre <code>i</code> est un multiple de <code>k</code> quand <code>i % k == 0</code>.",
 indice2=["Crée <code>resultat = []</code>",
          "Pour chaque indice <code>i</code> de 0 à <code>len(L) - 1</code> :",
          "si <code>i % k == 0</code>, ajoute <code>0</code>",
          "sinon, ajoute <code>L[i]</code>",
          "Renvoie <code>resultat</code>"],
 trous="""def mitage(L, k):
    resultat = []
    for i in range(____):
        if ____ % k == 0:
            resultat.append(____)
        else:
            resultat.append(____)
    return resultat""",
 solution="""def mitage(L, k):
    resultat = []
    for i in range(len(L)):
        if i % k == 0:
            resultat.append(0)
        else:
            resultat.append(L[i])
    return resultat""",
 explications=["La fonction reçoit une liste et l'entier <code>k</code>.",
   "Liste vide pour les résultats.",
   "On parcourt les <strong>positions</strong> 0, 1, 2… car c'est la position qui décide.",
   "<code>i % k == 0</code> : l'indice est-il un multiple de <code>k</code> ?",
   "Oui : on met un zéro à cette place.",
   "Non…",
   "… on recopie la valeur qui se trouve à cette position.",
   "On renvoie la nouvelle liste, de même taille que <code>L</code>."],
 appel="mitage([9, 8, 7, 6, 5], 2)",
 pieges=["Tester <code>L[i] % k</code> (la valeur) au lieu de <code>i % k</code> (la position).",
         "Utiliser <code>for x in L</code> : on n'a plus accès à l'indice.",
         "Avec <code>k = 0</code>, <code>i % 0</code> provoque une <code>ZeroDivisionError</code>. Le sujet ne parle pas de ce cas : on suppose <code>k ≥ 1</code>."],
 entrainements=[
  dict(titre="Un sur trois à zéro", etoiles=1,
   enonce="Écris <code>zero_un_sur_trois(L)</code> qui met 0 aux indices 0, 3, 6… Exemple : <code>zero_un_sur_trois([2, 4, 6, 8, 10])</code> renvoie <code>[0, 4, 6, 0, 10]</code>.",
   squelette=skel("zero_un_sur_trois(L)"),
   tests=[("zero_un_sur_trois([2, 4, 6, 8, 10])", "[0, 4, 6, 0, 10]", "Exemple"), ("zero_un_sur_trois([])", "[]", "Liste vide")],
   indice="C'est <code>mitage</code> avec <code>k</code> remplacé par 3.",
   solution="""def zero_un_sur_trois(L):
    resultat = []
    for i in range(len(L)):
        if i % 3 == 0:
            resultat.append(0)
        else:
            resultat.append(L[i])
    return resultat""",
   explication="On pourrait aussi écrire simplement <code>return mitage(L, 3)</code> si <code>mitage</code> est déjà écrite."),
  dict(titre="Garder les indices pairs", etoiles=2,
   enonce="Écris <code>indices_pairs(L)</code> qui renvoie une liste <strong>plus courte</strong>, formée seulement des éléments aux positions 0, 2, 4… Exemple : <code>indices_pairs([4, 9, 2, 8, 7])</code> renvoie <code>[4, 2, 7]</code>.",
   squelette=skel("indices_pairs(L)"),
   tests=[("indices_pairs([4, 9, 2, 8, 7])", "[4, 2, 7]", "Exemple"), ("indices_pairs([])", "[]", "Liste vide"), ("indices_pairs([5])", "[5]", "Un élément")],
   indice="Cette fois, c'est un <strong>filtre</strong> : on ajoute <code>L[i]</code> seulement si <code>i % 2 == 0</code>, et on n'ajoute rien sinon (pas de <code>else</code>).",
   solution="""def indices_pairs(L):
    resultat = []
    for i in range(len(L)):
        if i % 2 == 0:
            resultat.append(L[i])
    return resultat""",
   explication="Différence avec le mitage : on ne remplace pas, on <strong>retire</strong>. Sans <code>else</code>, la liste obtenue est plus courte."),
 ]),
# ---------------------------------------------------------------- 9
dict(
 n=9, titre="Extraction", recette="Filtrer", etoiles=2,
 fonction="extraction(L, valeur1, valeur2)",
 enonce="Écrire une fonction <code>extraction(L, valeur1, valeur2)</code> qui prend en argument une liste <code>L</code> de nombres et deux nombres <code>valeur1</code> et <code>valeur2</code>. Cette fonction renvoie une nouvelle liste formée des nombres <code>n</code> compris <strong>strictement</strong> entre <code>valeur1</code> et <code>valeur2</code>.",
 entrees="une liste <code>L</code> et deux bornes <code>valeur1</code> et <code>valeur2</code>",
 sortie="une nouvelle liste, souvent <strong>plus courte</strong>",
 exemple="<code>[2, 3, 7, 5, 9]</code> entre <code>2</code> et <code>7</code> → <code>[3, 5]</code> (2 et 7 sont exclus)",
 question=dict(q="Avec les bornes 2 et 7, garde-t-on le nombre 7 ?",
   options=["Oui, 7 est entre 2 et 7", "Non, « strictement » exclut les bornes"], ok=1,
   why="« Strictement entre » veut dire qu'on exclut les bornes : on garde x seulement si 2 &lt; x &lt; 7. Les nombres égaux à 2 ou à 7 ne sont pas gardés."),
 squelette=skel("extraction(L, valeur1, valeur2)"),
 tests=[("extraction([2, 3, 7, 5, 9], 2, 7)", "[3, 5]", "Exemple (bornes exclues)"),
        ("extraction([], 0, 10)", "[]", "Liste vide"),
        ("extraction([1, 2, 3], 5, 9)", "[]", "Aucun nombre gardé"),
        ("extraction([-3, 0, 3], -5, 5)", "[-3, 0, 3]", "Bornes négatives")],
 indice1="Recette « Filtrer » : on ajoute un nombre <strong>seulement</strong> s'il vérifie la condition, et on ne fait rien sinon (pas de <code>else</code>). En Python, on peut écrire directement <code>valeur1 &lt; x &lt; valeur2</code>.",
 indice2=["Crée <code>resultat = []</code>",
          "Pour chaque <code>x</code> de <code>L</code> :",
          "si <code>valeur1 &lt; x &lt; valeur2</code>, ajoute <code>x</code>",
          "Renvoie <code>resultat</code>"],
 trous="""def extraction(L, valeur1, valeur2):
    resultat = []
    for x in L:
        if ____ < x < ____:
            resultat.append(____)
    return resultat""",
 solution="""def extraction(L, valeur1, valeur2):
    resultat = []
    for x in L:
        if valeur1 < x < valeur2:
            resultat.append(x)
    return resultat""",
 explications=["La fonction reçoit une liste et deux bornes.",
   "Liste vide pour les nombres gardés.",
   "On examine chaque nombre.",
   "Double comparaison : vraie seulement si <code>x</code> est plus grand que <code>valeur1</code> <strong>et</strong> plus petit que <code>valeur2</code>. Elle équivaut à <code>valeur1 &lt; x and x &lt; valeur2</code>.",
   "Le nombre est dans l'intervalle : on le garde.",
   "On renvoie les nombres gardés. Ceux qui ne passaient pas le test ont simplement été ignorés."],
 appel="extraction([2, 3, 7, 5, 9], 2, 7)",
 pieges=["Utiliser <code>&lt;=</code> : les bornes seraient gardées alors que l'énoncé dit « strictement ».",
         "Ajouter un <code>else: resultat.append(0)</code> : un filtre ne remplace pas, il <strong>retire</strong>.",
         "Si <code>valeur1 &gt; valeur2</code> (par exemple 7 puis 2), aucun nombre ne passe le test. Le sujet ne précise pas ce cas."],
 entrainements=[
  dict(titre="Bornes comprises", etoiles=1,
   enonce="Écris <code>extraction_large(L, a, b)</code> qui garde les nombres entre <code>a</code> et <code>b</code>, <strong>bornes comprises</strong>. Exemple : <code>extraction_large([2, 3, 7, 5, 9], 2, 7)</code> renvoie <code>[2, 3, 7, 5]</code>.",
   squelette=skel("extraction_large(L, a, b)"),
   tests=[("extraction_large([2, 3, 7, 5, 9], 2, 7)", "[2, 3, 7, 5]", "Exemple"), ("extraction_large([], 1, 2)", "[]", "Liste vide")],
   indice="« Bornes comprises » : remplace <code>&lt;</code> par <code>&lt;=</code>.",
   solution="""def extraction_large(L, a, b):
    resultat = []
    for x in L:
        if a <= x <= b:
            resultat.append(x)
    return resultat""",
   explication="Un seul caractère change, mais le résultat aussi : c'est pourquoi il faut toujours tester les valeurs égales aux bornes."),
  dict(titre="Hors de l'intervalle", etoiles=2,
   enonce="Écris <code>hors_intervalle(L, a, b)</code> qui garde les nombres <strong>strictement plus petits</strong> que <code>a</code> <strong>ou strictement plus grands</strong> que <code>b</code>. Exemple : <code>hors_intervalle([1, 5, 12, 8], 3, 10)</code> renvoie <code>[1, 12]</code>.",
   squelette=skel("hors_intervalle(L, a, b)"),
   tests=[("hors_intervalle([1, 5, 12, 8], 3, 10)", "[1, 12]", "Exemple"), ("hors_intervalle([3, 10], 3, 10)", "[]", "Valeurs égales aux bornes")],
   indice="Deux conditions dont <strong>une seule</strong> suffit : on les relie par <code>or</code>. <code>x &lt; a or x &gt; b</code>.",
   solution="""def hors_intervalle(L, a, b):
    resultat = []
    for x in L:
        if x < a or x > b:
            resultat.append(x)
    return resultat""",
   explication="<code>or</code> (« ou ») est vrai dès qu'au moins une des deux conditions est vraie ; <code>and</code> (« et ») exige les deux."),
 ]),
# ---------------------------------------------------------------- 10
dict(
 n=10, titre="Somme cumulative", recette="Accumuler", etoiles=3,
 fonction="somme_cumulative(L)",
 enonce="Écrire une fonction <code>somme_cumulative(L)</code> qui prend en argument une liste <code>L</code> de nombres. Cette fonction renvoie une nouvelle liste de même taille au sein de laquelle l'élément d'indice <code>k</code> a pour valeur la somme des valeurs de <code>L</code> pour les indices 0 à <code>k</code>.",
 entrees="une liste <code>L</code> de nombres",
 sortie="une nouvelle liste de même taille",
 exemple="<code>[2, 3, 4]</code> → <code>[2, 2+3, 2+3+4]</code> = <code>[2, 5, 9]</code>",
 question=dict(q="Pour <code>L = [2, 3, 4, 1]</code>, que vaut le dernier élément du résultat ?",
   options=["1", "5", "10"], ok=2,
   why="Le dernier élément est la somme de <strong>tous</strong> les éléments : 2 + 3 + 4 + 1 = 10. C'est aussi le précédent (9) + 1 : on n'a pas besoin de tout recalculer."),
 squelette=skel("somme_cumulative(L)"),
 tests=[("somme_cumulative([2, 3, 4])", "[2, 5, 9]", "Exemple"),
        ("somme_cumulative([])", "[]", "Liste vide"),
        ("somme_cumulative([5])", "[5]", "Un élément"),
        ("somme_cumulative([1, -1, 1, -1])", "[1, 0, 1, 0]", "Avec des négatifs"),
        ("_apres(somme_cumulative, [2, 3, 4])", "[2, 3, 4]", "La liste L de départ n'est pas modifiée")],
 indice1="Recette « Accumuler » : une variable <code>total</code> garde la somme <strong>de tout ce qu'on a déjà vu</strong>. À chaque nombre, on l'ajoute au total, puis on range le total dans la nouvelle liste.",
 indice2=["Crée <code>resultat = []</code> et <code>total = 0</code>, <strong>avant</strong> la boucle",
          "Pour chaque <code>x</code> de <code>L</code> :",
          "ajoute <code>x</code> au total : <code>total = total + x</code>",
          "range le total : <code>resultat.append(total)</code>",
          "Renvoie <code>resultat</code>"],
 trous="""def somme_cumulative(L):
    resultat = []
    total = ____
    for x in L:
        total = ____
        resultat.append(____)
    return resultat""",
 solution="""def somme_cumulative(L):
    resultat = []
    total = 0
    for x in L:
        total = total + x
        resultat.append(total)
    return resultat""",
 explications=["La fonction reçoit une liste de nombres.",
   "Liste vide pour les résultats.",
   "Le total démarre à 0, <strong>avant</strong> la boucle, pour qu'il « se souvienne » d'un tour à l'autre.",
   "On examine chaque nombre.",
   "Le total augmente du nombre courant : il vaut maintenant la somme de tous les nombres vus jusqu'ici.",
   "On range une copie de ce total dans la nouvelle liste.",
   "On renvoie la liste."],
 appel="somme_cumulative([2, 3, 4])",
 pieges=["Mettre <code>total = 0</code> dans la boucle : le total est effacé à chaque tour, et on obtient une copie de <code>L</code>.",
         "Inverser les deux lignes de la boucle (<code>append</code> avant d'ajouter <code>x</code>) : on obtient <code>[0, 2, 5]</code>, décalé d'un cran.",
         "Recalculer toute la somme à chaque tour avec une deuxième boucle : ça marche, mais c'est beaucoup plus long sur une grande liste."],
 entrainements=[
  dict(titre="Produit cumulé", etoiles=2,
   enonce="Écris <code>produit_cumule(L)</code> : l'élément d'indice <code>k</code> vaut le produit des éléments d'indices 0 à <code>k</code>. Exemple : <code>produit_cumule([2, 3, 4])</code> renvoie <code>[2, 6, 24]</code>.",
   squelette=skel("produit_cumule(L)"),
   tests=[("produit_cumule([2, 3, 4])", "[2, 6, 24]", "Exemple"), ("produit_cumule([])", "[]", "Liste vide"), ("produit_cumule([5, 0, 2])", "[5, 0, 0]", "Avec un zéro")],
   indice="Attention au point de départ : pour une multiplication, le « total » doit commencer à <strong>1</strong>, pas à 0 (sinon tout reste à 0).",
   solution="""def produit_cumule(L):
    resultat = []
    produit = 1
    for x in L:
        produit = produit * x
        resultat.append(produit)
    return resultat""",
   explication="On démarre une somme à 0 et un produit à 1 : ce sont les valeurs « neutres » qui ne changent rien au premier calcul."),
  dict(titre="Le record jusqu'ici", etoiles=3,
   enonce="Écris <code>record(L)</code> : l'élément d'indice <code>k</code> vaut le plus grand nombre vu entre les indices 0 et <code>k</code>. Exemple : <code>record([3, 1, 4, 1, 5])</code> renvoie <code>[3, 3, 4, 4, 5]</code>. Sans utiliser <code>max</code>.",
   squelette=skel("record(L)"),
   tests=[("record([3, 1, 4, 1, 5])", "[3, 3, 4, 4, 5]", "Exemple"), ("record([])", "[]", "Liste vide"), ("record([-5, -8, -2])", "[-5, -5, -2]", "Que des négatifs")],
   indice="Garde une variable <code>meilleur</code>. Elle ne peut pas commencer à 0 (et si tous les nombres sont négatifs ?). Commence avec <code>L[0]</code>, mais seulement si la liste n'est pas vide.",
   solution="""def record(L):
    resultat = []
    if len(L) == 0:
        return resultat
    meilleur = L[0]
    for x in L:
        if x > meilleur:
            meilleur = x
        resultat.append(meilleur)
    return resultat""",
   explication="Le cas de la liste vide est traité à part, sinon <code>L[0]</code> provoquerait une <code>IndexError</code>. Ensuite, on applique « Accumuler » : la variable <code>meilleur</code> se souvient du plus grand nombre vu jusqu'ici."),
 ]),
]
