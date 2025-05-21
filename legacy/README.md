# Dossier `legacy/` – Scripts historiques & données initiales d’Intyma

Ce dossier contient l’ensemble des **scripts et données utilisés dans les premières versions** de l’application Intyma, fonctionnant principalement en mode terminal et stockage JSON.

---

## Contenu principal

- **Scripts Python**  
  - `intyma.py`, `intyma_app.py`, `intyma_gui.py`, `generer_actrices.py`, etc.  
  → Scripts permettant la gestion, l’analyse ou l’enrichissement de la vidéothèque et des fiches associées.

- **Fichiers de données JSON**  
  - `scenes_metadata.json` : métadonnées des scènes (titre, actrices, tags, notes…)
  - `favorites.json` : liste des favoris
  - `history.json` : historique de visionnage
  - `actrices.json` : fiches détaillées des actrices (photo, tags, statistiques…)
  - etc.

---

## Usage

- **Consultation et maintenance** de l’ancienne base de données ou des scripts pour référence.
- **Transition et migration** : Ce dossier sert de source pour la future migration des données vers la nouvelle architecture (`intyma-app/` – backend Flask & base SQLite).
- **Sécurité** :  
  **Aucune donnée personnelle ou sensible ne doit être partagée à l’extérieur de ce dossier.**

---

## Historique

- Ce code représente la première génération de l’application Intyma, utilisée en ligne de commande et reposant sur des fichiers JSON pour le stockage.
- La nouvelle version (voir dossier `../intyma-app/`) offrira une interface web moderne, une base de données robuste, et des fonctionnalités avancées de gestion.

---

## À propos

**Ce dossier est strictement privé et réservé à un usage personnel.  
Ne jamais le publier ni le transférer sur un cloud public.**

---

