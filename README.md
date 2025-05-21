# Intyma – Application de gestion personnelle de vidéothèque

Projet privé, développé pour un usage local exclusif.

---

## Structure du projet

Intyma/
│
├── legacy/ # Scripts et données historiques (mode terminal, JSON)
├── intyma-app/ # Nouvelle génération web (Flask backend + React frontend)
│ ├── backend/
│ └── frontend/
├── media/ # Stockage local d’images/photos/miniatures (hors Git)
├── .gitignore
└── README.md


---

## Description rapide

- **legacy/** : scripts Python et fichiers JSON d’origine, utilisés pour le développement initial et la migration des données.
- **intyma-app/** : version moderne, architecture web, à développer (API Flask, UI React).
- **media/** : toutes les images/miniatures locales, jamais versionnées.

---

## Fonctionnalités attendues

- Interface web moderne et privée pour gérer une vidéothèque locale.
- Gestion avancée : fiches scènes, actrices, tags, favoris, historiques, notes, statistiques…
- Filtrage et recherche multi-critères, animations et design inspirés des sites professionnels.
- Stockage sécurisé et strictement local.

---

## Confidentialité

Ce projet est strictement privé, non destiné à être partagé publiquement.

---

## Statut

- ✅ Dossier `legacy` organisé
- ✅ Git et `.gitignore` configurés
- 🚧 Développement `intyma-app` à venir (backend Flask, frontend React)