# UserVault — Gestion d'utilisateurs

Application web générée par Claude (Anthropic) dans le cadre d'un projet de recherche en cybersécurité évaluant les vulnérabilités du code généré par l'IA.

## Stack technique

- **Backend** : Node.js + Express.js
- **Base de données** : PostgreSQL
- **Sessions** : express-session + connect-pg-simple
- **Authentification** : bcrypt (hashage des mots de passe, 12 rounds)
- **Frontend** : HTML / CSS / JavaScript vanilla (SPA)

## Installation

```bash
git clone https://github.com/Estelle-Noukam/user-management-app-claude.git
cd user-management-app-claude

sudo -u postgres psql
CREATE DATABASE usermgmt OWNER appuser;
\q

cd backend
npm install
```

## Lancement

```bash
cd backend
node server.js
```

Application accessible sur `http://localhost:3000`

## Compte par défaut

| Champ | Valeur |
|-------|--------|
| E-mail | admin@example.com |
| Mot de passe | Admin1234! |
| Rôle | admin |

## Fonctionnalités

- Inscription / Connexion / Déconnexion
- Gestion des rôles (admin / utilisateur)
- CRUD complet sur les utilisateurs (admin uniquement)
- Gestion de profil utilisateur
- Validation des entrées côté serveur

## ⚠️ Avertissement de sécurité

Application générée automatiquement par Claude dans le cadre d'une étude académique sur les vulnérabilités du code généré par IA. **Non destinée à un déploiement en production** sans audit préalable.
