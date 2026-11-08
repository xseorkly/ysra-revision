# -*- coding: utf-8 -*-
"""Examen blanc : sujet inédit, même structure que le CC2 (10 fonctions sur les listes)."""

BLANC = [
dict(n=1, titre="Les carrés", fn="carres", sig="carres(L)", proche=1,
 enonce="Écrire une fonction carres(L) qui prend en argument une liste L de nombres et renvoie une nouvelle liste formée des carrés des nombres de L. Ainsi carres([5,2,-3]) renvoie [25,4,9].",
 tests=[("carres([5, 2, -3])", "[25, 4, 9]", "Exemple"), ("carres([])", "[]", "Liste vide"), ("_apres(carres, [5, 2])", "[5, 2]", "L n'est pas modifiée")],
 solution="""def carres(L):
    resultat = []
    for x in L:
        resultat.append(x * x)
    return resultat""",
 expl="Recette « Transformer » : un résultat par élément. <code>x ** 2</code> convient aussi."),
dict(n=2, titre="Rotation", fn="rotation", sig="rotation(L)", proche=2,
 enonce="Écrire une fonction rotation(L) qui renvoie une nouvelle liste dans laquelle le dernier élément de L est placé en premier, les autres gardant leur ordre. Ainsi rotation([5,2,3]) renvoie [3,5,2]. Si L est vide, la fonction renvoie une liste vide.",
 tests=[("rotation([5, 2, 3])", "[3, 5, 2]", "Exemple"), ("rotation([])", "[]", "Liste vide"), ("rotation([7])", "[7]", "Un seul élément"), ("_apres(rotation, [5, 2, 3])", "[5, 2, 3]", "L n'est pas modifiée")],
 solution="""def rotation(L):
    if len(L) == 0:
        return []
    resultat = [L[len(L) - 1]]
    for i in range(len(L) - 1):
        resultat.append(L[i])
    return resultat""",
 expl="On commence la nouvelle liste avec le dernier élément (indice <code>len(L) - 1</code>), puis on ajoute les éléments d'indice 0 à <code>len(L) - 2</code> : c'est exactement <code>range(len(L) - 1)</code>. La liste vide est traitée à part, sinon <code>L[-1]</code> provoque une <code>IndexError</code>."),
dict(n=3, titre="Produit scalaire", fn="produit_scalaire", sig="produit_scalaire(L, Lprime)", proche=3,
 enonce="Écrire une fonction produit_scalaire(L, Lprime) prenant en argument 2 listes de nombres de même taille. Cette fonction renvoie le nombre égal à la somme des produits L[i] * Lprime[i]. Ainsi produit_scalaire([1,2,3], [4,5,6]) renvoie 32 (car 4 + 10 + 18 = 32).",
 tests=[("produit_scalaire([1, 2, 3], [4, 5, 6])", "32", "Exemple"), ("produit_scalaire([], [])", "0", "Listes vides"), ("produit_scalaire([2, -1], [3, 6])", "0", "Avec un négatif")],
 solution="""def produit_scalaire(L, Lprime):
    total = 0
    for i in range(len(L)):
        total = total + L[i] * Lprime[i]
    return total""",
 expl="Mélange de deux recettes : on parcourt les indices pour lire les deux listes « en face », et on accumule dans un total. Le résultat est <strong>un nombre</strong>, pas une liste."),
dict(n=4, titre="Norme au carré", fn="norme_carree", sig="norme_carree(L)", proche=4,
 enonce="En utilisant la fonction précédente, écrire une fonction norme_carree(L) qui renvoie la somme des carrés des éléments de L. Ainsi norme_carree([3,4]) renvoie 25.",
 tests=[("norme_carree([3, 4])", "25", "Exemple"), ("norme_carree([])", "0", "Liste vide"), ("norme_carree([-2, 1, 2])", "9", "Avec un négatif")],
 solution="""def norme_carree(L):
    return produit_scalaire(L, L)""",
 expl="La somme des carrés, c'est le produit scalaire de L avec elle-même : L[i] × L[i]. Comme à l'exercice 4 du CC2, « en utilisant la fonction précédente » veut dire : pas de boucle, on appelle la fonction déjà écrite."),
dict(n=5, titre="Compter les multiples", fn="compte_multiples", sig="compte_multiples(L, k)", proche=5,
 enonce="Écrire une fonction compte_multiples(L, k) qui prend en argument une liste L d'entiers et un entier k non nul. Cette fonction renvoie le nombre d'éléments de L qui sont des multiples de k. Ainsi compte_multiples([3,4,6,7,9], 3) renvoie 3.",
 tests=[("compte_multiples([3, 4, 6, 7, 9], 3)", "3", "Exemple"), ("compte_multiples([], 5)", "0", "Liste vide"), ("compte_multiples([0, 5, -10, 3], 5)", "3", "0 et -10 sont des multiples de 5")],
 solution="""def compte_multiples(L, k):
    compteur = 0
    for x in L:
        if x % k == 0:
            compteur = compteur + 1
    return compteur""",
 expl="Recette « Compter ». Un nombre est un multiple de k quand le reste de sa division par k est nul : <code>x % k == 0</code>."),
dict(n=6, titre="Arrondir au pair", fn="arrondi_pair", sig="arrondi_pair(L)", proche=6,
 enonce="Écrire une fonction arrondi_pair(L) qui prend en argument une liste L d'entiers et renvoie une nouvelle liste dans laquelle l'élément d'indice i vaut L[i] si L[i] est pair, et L[i] + 1 si L[i] est impair. Ainsi arrondi_pair([1,4,7]) renvoie [2,4,8].",
 tests=[("arrondi_pair([1, 4, 7])", "[2, 4, 8]", "Exemple"), ("arrondi_pair([])", "[]", "Liste vide"), ("arrondi_pair([0, -3])", "[0, -2]", "Zéro et négatif impair")],
 solution="""def arrondi_pair(L):
    resultat = []
    for x in L:
        if x % 2 == 0:
            resultat.append(x)
        else:
            resultat.append(x + 1)
    return resultat""",
 expl="Même schéma que Syracuse : « Transformer » avec un <code>if</code> / <code>else</code> qui choisit le calcul selon la parité."),
dict(n=7, titre="Seuillage", fn="seuillage", sig="seuillage(L, seuil)", proche=7,
 enonce="Écrire une fonction seuillage(L, seuil) qui renvoie une nouvelle liste dans laquelle les valeurs strictement inférieures à seuil sont remplacées par 0, les autres étant conservées. Ainsi seuillage([3,12,7,15,10], 10) renvoie [0,12,0,15,10].",
 tests=[("seuillage([3, 12, 7, 15, 10], 10)", "[0, 12, 0, 15, 10]", "Exemple (10 est gardé)"), ("seuillage([], 4)", "[]", "Liste vide"), ("_apres(seuillage, [3, 12], 10)", "[3, 12]", "L n'est pas modifiée")],
 solution="""def seuillage(L, seuil):
    resultat = []
    for x in L:
        if x < seuil:
            resultat.append(0)
        else:
            resultat.append(x)
    return resultat""",
 expl="Comme la saturation, mais dans l'autre sens. « Strictement inférieures » se traduit par <code>&lt;</code> : la valeur 10 n'est pas remplacée."),
dict(n=8, titre="Alterner les signes", fn="alterne_signe", sig="alterne_signe(L)", proche=8,
 enonce="Écrire une fonction alterne_signe(L) qui renvoie une nouvelle liste, de même taille que L, dans laquelle les nombres dont l'indice est impair sont remplacés par leur opposé. Ainsi alterne_signe([1,2,3,4]) renvoie [1,-2,3,-4].",
 tests=[("alterne_signe([1, 2, 3, 4])", "[1, -2, 3, -4]", "Exemple"), ("alterne_signe([])", "[]", "Liste vide"), ("alterne_signe([5, -6, 7])", "[5, 6, 7]", "Opposé d'un négatif")],
 solution="""def alterne_signe(L):
    resultat = []
    for i in range(len(L)):
        if i % 2 == 1:
            resultat.append(-L[i])
        else:
            resultat.append(L[i])
    return resultat""",
 expl="Comme le mitage : c'est la <strong>position</strong> qui décide, donc on parcourt les indices et on teste <code>i % 2</code>, pas <code>L[i] % 2</code>."),
dict(n=9, titre="Positions d'une valeur", fn="positions", sig="positions(L, valeur)", proche=9,
 enonce="Écrire une fonction positions(L, valeur) qui renvoie la liste des indices i tels que L[i] est égal à valeur. Ainsi positions([4,7,4,1], 4) renvoie [0,2].",
 tests=[("positions([4, 7, 4, 1], 4)", "[0, 2]", "Exemple"), ("positions([1, 2, 3], 9)", "[]", "Valeur absente"), ("positions([], 4)", "[]", "Liste vide")],
 solution="""def positions(L, valeur):
    resultat = []
    for i in range(len(L)):
        if L[i] == valeur:
            resultat.append(i)
    return resultat""",
 expl="Recette « Filtrer », mais on garde les <strong>indices</strong> et non les valeurs : on parcourt avec <code>range(len(L))</code> et on ajoute <code>i</code>."),
dict(n=10, titre="Écarts successifs", fn="ecarts", sig="ecarts(L)", proche=10,
 enonce="Écrire une fonction ecarts(L) qui renvoie une nouvelle liste de taille len(L) - 1 dans laquelle l'élément d'indice i vaut L[i+1] - L[i]. Ainsi ecarts([2,5,9,10]) renvoie [3,4,1]. Si L a moins de deux éléments, la fonction renvoie une liste vide.",
 tests=[("ecarts([2, 5, 9, 10])", "[3, 4, 1]", "Exemple"), ("ecarts([7])", "[]", "Un seul élément"), ("ecarts([])", "[]", "Liste vide"), ("ecarts([10, 4])", "[-6]", "Écart négatif")],
 solution="""def ecarts(L):
    resultat = []
    for i in range(len(L) - 1):
        resultat.append(L[i + 1] - L[i])
    return resultat""",
 expl="Il y a un écart de moins que d'éléments : i va de 0 à <code>len(L) - 2</code>, c'est-à-dire <code>range(len(L) - 1)</code>. Avec <code>range(len(L))</code>, le dernier tour lirait <code>L[len(L)]</code> : <code>IndexError</code>. Pour une liste vide ou d'un seul élément, <code>range</code> ne produit aucun tour : pas besoin de cas particulier."),
]

def copie_initiale():
    """Fichier de départ, présenté comme le sujet : énoncés en commentaires + squelettes."""
    import textwrap
    out = ['"""   EXAMEN BLANC - Python - CPES L1   """', "", "# Complète chaque fonction. Tu peux ajouter des print(...) pour tester.", ""]
    for e in BLANC:
        out.append("#__ Exercice %d : %s __" % (e["n"], e["titre"]))
        for l in textwrap.wrap(e["enonce"], 72):
            out.append("#   " + l)
        out.append("def %s:" % e["sig"])
        out.append("    # à compléter ...")
        out.append("    return None  # à modifier")
        out.append("")
    return "\n".join(out)
