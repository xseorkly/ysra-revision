# YSRA Révision — SEVES 2026–2027

Site interactif de révision pour l'UE Sciences et enjeux environnementaux (Université de Strasbourg).

Contenu du site : 18 fiches approfondies, 100 QCM thématiques, trois examens blancs, 36 questions d'annales comparées adaptées, corrigés et suivi local des résultats.

Le site est accessible via GitHub Pages : https://xseorkly.github.io/ysra-revision/

## Organisation

- `index.html` : page d'accueil unique avec les blocs **Sciences et enjeux environnementaux** (dossier `seves/`), **Géosciences 1 – Structure de la Terre** (site séparé : https://xseorkly.github.io/G-osciences1-Structure-de-la-Terre/), **Python pas à pas** (dossier `python/`), **Maths · Chapitre 5** (dossier `maths/`), **SQL pas à pas** (site séparé : https://xseorkly.github.io/sql1/), **Devoirs de chimie** (dossier `chimie/`) et **TP Chimie expérimentale 1** (dossier `tp-chimie-experimentale/`).
- `maths/` : **Applications et fonctions usuelles** (CPES L1, chapitre 5), le poly repris notion par notion.
  - `maths/index.html` : sommaire et lexique des symboles ; `applications.html` (partie A), `fonctions-reelles.html` (partie B), `fonctions-usuelles.html` (partie C) ; `essentiel.html` (fiche résumé imprimable) ; `qcm.html` (25 questions tirées dans une banque de 60).
  - `maths/app.js` : QCM, graphes et activités interactives ; formules affichées avec KaTeX (jsDelivr) ; `maths/suivi.js` : même suivi Apps Script que les autres pages (site « Maths chap 5 »).
  - Format des questions dans les pages : `<div data-a="2" data-part="A4">énoncé<ul><li>choix…</li></ul><p class="e">explication</p></div>` (`data-a` = numéro(s) des bonnes réponses, à partir de 1).
- `chimie/` : **Devoirs de chimie** (CPES L1), sujets et corrigés détaillés en PDF, téléchargeables depuis `chimie/index.html`.
  - `chimie/docs/` : chapitre 3 (corrigé du DM « Autour du limonène », devoir 2 h, devoir complet 3 h) chapitre 4 (devoir complet 3 h) et chapitre 5 (cours expliqué, contrôle commun et contrôle commun bis tiré de sujets de concours), chaque devoir en sujet seul et en corrigé ; `devoirs-chimie.zip` regroupe tous les PDF.
- `seves/index.html` : le site de révision SEVES. Les anciens liens avec un `#` sont redirigés automatiquement.
- `python/` : **Python pas à pas** (CPES L1), cours pour grands débutants et corrigé du CC2 du 19/12/2023. 8 chapitres, 10 exercices avec aides progressives, 20 entraînements, Python exécuté dans le navigateur (Pyodide, chargé depuis jsDelivr).
  - `python/index.html` : les chapitres ; `python/app.js` : navigation et activités ; `python/style.css` : mise en forme.
  - Page « Examen blanc » (`#/blanc`) : sujet inédit de 10 fonctions (`python/_source/blanc_data.py`), chrono, mode papier, note sur 20 et correction.
  - `python/data.js` est **généré** : ne pas le modifier à la main. Le contenu des exercices et le générateur sont dans `python/_source/` : `python3 python/_source/build.py python/_source python/data.js`.

Les questions d'annales comparées sont des exercices originaux inspirés de ressources universitaires extérieures, et non des sujets officiels de l'UE strasbourgeoise. Les PDF complémentaires font partie du pack ZIP remis séparément.
