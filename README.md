# YSRA Révision — SEVES 2026–2027

Site interactif de révision pour l'UE Sciences et enjeux environnementaux (Université de Strasbourg).

Contenu du site : 18 fiches approfondies, 100 QCM thématiques, trois examens blancs, 36 questions d'annales comparées adaptées, corrigés et suivi local des résultats.

Le site est accessible via GitHub Pages : https://xseorkly.github.io/ysra-revision/

## Organisation

- `index.html` : page d'accueil unique avec trois blocs : **Sciences et enjeux environnementaux** (dossier `seves/`) et **Géosciences 1 – Structure de la Terre** (site séparé : https://xseorkly.github.io/G-osciences1-Structure-de-la-Terre/) et **Python pas à pas** (dossier `python/`).
- `seves/index.html` : le site de révision SEVES. Les anciens liens avec un `#` sont redirigés automatiquement.
- `python/` : **Python pas à pas** (CPES L1), cours pour grands débutants et corrigé du CC2 du 19/12/2023. 8 chapitres, 10 exercices avec aides progressives, 20 entraînements, Python exécuté dans le navigateur (Pyodide, chargé depuis jsDelivr).
  - `python/index.html` : les chapitres ; `python/app.js` : navigation et activités ; `python/style.css` : mise en forme.
  - `python/data.js` est **généré** : ne pas le modifier à la main. Le contenu des exercices et le générateur sont dans `python/_source/` : `python3 python/_source/build.py python/_source python/data.js`.

Les questions d'annales comparées sont des exercices originaux inspirés de ressources universitaires extérieures, et non des sujets officiels de l'UE strasbourgeoise. Les PDF complémentaires font partie du pack ZIP remis séparément.
