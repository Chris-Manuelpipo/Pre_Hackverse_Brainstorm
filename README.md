# Pre Hackverse Brainstorm

Plateforme d'entraide academique collaborative avec gamification. Les utilisateurs peuvent poser des questions, obtenir des reponses, voter et accumuler des points d'experience basés sur leur contribution et leur niveau de maitrise.

## 📱 Liens de production

| Service | URL |
|---------|-----|
| Frontend | [https://pre-hackversebrainstorm.vercel.app](https://pre-hackversebrainstorm.vercel.app) |
| Backend API | [https://pre-hackverse-brainstorm.onrender.com/api](https://pre-hackverse-brainstorm.onrender.com/api) |

## ✨ Fonctionnalités principales

- **Authentification**: Inscription/Connexion avec JWT
- **Questions & Réponses**: Poser des questions, répondre, éditer et supprimer
- **Système de vote**: Voter sur les réponses pour valoriser la qualité
- **Gamification**: Points d'expérience (XP), niveaux de confiance, badges
- **Recherche full-text**: Recherche avancée avec mots-clés et filtrage
- **Filtrage multi-critères**: Par matière, tags, auteur, score
- **Notifications en temps réel**: Socket.IO pour mises à jour instantanées
- **Uploads de fichiers**: Intégration Cloudinary pour images/documents
- **Profil utilisateur**: Visualiser stats, contribution, XP
- **Pagination**: Navigation efficace dans les grandes listes
- **Design responsive**: Mobile-first, optimisé tous appareils

## 🏗️ Architecture

### Flux utilisateur


```
Frontend (Vercel)
    ↓ (HTTPS)
    ├→ REST API (Express)
    │   ├→ PostgreSQL (Base de données)
    │   └→ Cloudinary (Stockage fichiers)
    └→ WebSocket (Notifications en temps réel)
```

### Structure du projet

```
Entraide académique/
├── frontend/                    # Application React + Vite
│   ├── src/
│   │   ├── api/                 # Clients API (questions, auth, votes...)
│   │   ├── components/          # Composants UI réutilisables
│   │   │   ├── editor/         # Éditeur markdown/rich text
│   │   │   ├── layout/         # Header, Sidebar, Footer
│   │   │   ├── question/       # Cards et formulaires questions
│   │   │   ├── reponse/        # Cards et voting buttons
│   │   │   └── ui/             # Composants élémentaires (Button, Input, etc)
│   │   ├── pages/              # Pages routes
│   │   │   ├── FeedPage        # Page principale
│   │   │   ├── QuestionDetailPage # Détail d'une question
│   │   │   ├── NewQuestionPage # Créer une question
│   │   │   ├── LoginPage       # Authentification
│   │   │   ├── RegisterPage    # Inscription
│   │   │   └── ProfilePage     # Profil utilisateur
│   │   ├── store/              # État global (Zustand)
│   │   │   ├── authStore       # État auth
│   │   │   ├── notificationsStore # État notifications
│   │   │   └── themeStore      # Thème clair/sombre
│   │   ├── hooks/              # Hooks React customisés
│   │   ├── utils/              # Utilitaires (erreurs, formatage)
│   │   ├── App.jsx             # Composant racine + routing
│   │   └── main.jsx            # Point d'entrée
│   ├── package.json
│   ├── vite.config.js          # Configuration Vite
│   ├── tailwind.config.js      # Configuration Tailwind
│   └── vercel.json             # Configuration déploiement Vercel
│
├── backend/                     # API Node.js + Express
│   ├── src/
│   │   ├── config/             # Configurations
│   │   │   ├── database.js     # Connexion PostgreSQL
│   │   │   └── cloudinary.js   # Configuration upload
│   │   ├── middleware/         # Middlewares Express
│   │   │   ├── auth.js         # Vérification JWT
│   │   │   ├── errorHandler.js # Gestion erreurs
│   │   │   └── validate.js     # Validation données
│   │   ├── modules/            # Modules métier
│   │   │   ├── auth/           # Authentification
│   │   │   ├── questions/      # CRUD questions
│   │   │   ├── reponses/       # CRUD réponses
│   │   │   ├── votes/          # Système de vote
│   │   │   ├── utilisateurs/   # Gestion utilisateurs
│   │   │   ├── notifications/  # Notifications
│   │   │   ├── commentaires/   # Commentaires
│   │   │   └── upload/         # Gestion uploads
│   │   ├── socket/             # Socket.IO setup
│   │   ├── utils/              # Utilitaires (pagination)
│   │   ├── app.js              # Configuration Express
│   │   └── server.js           # Point d'entrée serveur
│   ├── package.json
│   └── fix_trigger.sql         # Migrations SQL
│
├── schema_bdd_entraide.sql      # Schéma PostgreSQL complet
├── cleanup_db.sql              # Script de nettoyage DB
└── README.md                   # Ce fichier
```

## 🛠️ Stack technique

### Frontend

| Technologie | Usage |
|-------------|-------|
| **React 18** | Framework UI |
| **Vite** | Build tool ultra-rapide |
| **React Router** | Routing (HashRouter pour Vercel static) |
| **TanStack Query (React Query)** | Gestion cache et sync données API |
| **Zustand** | État global léger (auth, theme, notifications) |
| **Tailwind CSS** | Styling utility-first |
| **Axios** | Client HTTP |
| **Socket.IO Client** | WebSocket temps réel |

### Backend

| Technologie | Usage |
|-------------|-------|
| **Node.js & Express** | Serveur HTTP |
| **PostgreSQL 15+** | Base de données relationnelle |
| **JWT (jsonwebtoken)** | Authentification stateless |
| **Bcrypt** | Hash sécurisé mots de passe |
| **Socket.IO** | Communications temps réel |
| **Cloudinary SDK** | Stockage et transformation images |
| **Helmet** | Headers sécurité HTTP |
| **Morgan** | Logging requêtes HTTP |
| **CORS** | Cross-Origin Resource Sharing |
| **Joi/Validator** | Validation données entrée |

### Base de données

- **13 tables**: utilisateurs, questions, reponses, votes, commentaires, notifications, etc.
- **7 triggers** : Calculs XP, mise à jour timestamps, suppression cascade
- **3 vues** : Agrégations, jointures complexes (ex: v_feed_questions)
- **14 index** : Optimisation recherche et pagination
- **Full-text search** : Configuration Postgres french avec tsvector

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ ([télécharger](https://nodejs.org/))
- PostgreSQL 14+ ([télécharger](https://www.postgresql.org/download/))
- Git
- npm ou yarn

### Frontend

```bash
cd frontend

# Installation des dépendances
npm install

# Créer .env.local basé sur .env.example
cp .env.example .env.local
# Éditer et mettre à jour VITE_API_URL

# Lancer le serveur dev (http://localhost:5173)
npm run dev

# Build production
npm run build

# Lancer la preview du build
npm run preview
```

### Backend

```bash
cd backend

# Installation des dépendances
npm install

# Créer .env basé sur .env.example
cp .env.example .env
# Éditer avec les credentials réels

# Initialiser base de données
# 1. Créer base vide: createdb entraide
# 2. Exécuter le schéma: psql -d entraide -f ../schema_bdd_entraide.sql

# Lancer le serveur dev (http://localhost:5000)
npm run dev

# Build production
npm run build

# Démarrer production
node src/server.js
```

## 📋 Variables d'environnement

### Frontend (`.env.local`)

```env
# URL de l'API backend
VITE_API_URL=http://localhost:5000/api
# ou en production: https://pre-hackverse-brainstorm.onrender.com/api
```

### Backend (`.env`)

```env
# Base de données PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/entraide

# Authentification JWT
JWT_SECRET=votre_secret_tres_secure_ici
JWT_EXPIRES_IN=7d

# Cloudinary (uploads images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS - Autorisations frontend
CLIENT_URL=http://localhost:5173
FRONTEND_URL=https://pre-hackversebrainstorm.vercel.app

# Node environment
NODE_ENV=development
PORT=5000
```

## 📡 Endpoints API principaux

### Authentification
- `POST /api/auth/register` - Inscription nouvel utilisateur
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/refresh` - Renouveler token JWT

### Questions
- `GET /api/questions` - Liste questions (avec filtrage & pagination)
- `GET /api/questions/:id` - Détail question
- `POST /api/questions` - Créer question
- `PUT /api/questions/:id` - Modifier question
- `DELETE /api/questions/:id` - Supprimer question
- `GET /api/questions/search` - Recherche full-text

### Réponses
- `POST /api/reponses` - Ajouter réponse
- `PUT /api/reponses/:id` - Modifier réponse
- `DELETE /api/reponses/:id` - Supprimer réponse

### Votes
- `POST /api/votes` - Voter une réponse
- `DELETE /api/votes/:id` - Retirer vote

### Utilisateurs
- `GET /api/utilisateurs/:id` - Profil utilisateur
- `PUT /api/utilisateurs/:id` - Mettre à jour profil
- `GET /api/utilisateurs/:id/stats` - Statistiques utilisateur

### Autres
- `GET /api/matieres` - Liste des matières
- `GET /api/tags` - Liste des tags
- `POST /api/upload` - Upload fichier vers Cloudinary
- `GET /api/health` - Health check

## 🎮 Système de gamification

### Points d'expérience (XP)

| Action | Points | Plafond |
|--------|--------|---------|
| Créer question utile | +5 | - |
| Créer réponse | +3 | - |
| Réponse marquée meilleure | +15 | - |
| Vote reçu | +1 | 100/jour |
| Commentaire | +1 | - |

### Niveaux de confiance

| Niveau | Plage XP | Bénéfice |
|--------|----------|----------|
| Novice | 0-50 | Basique |
| Apprenant | 51-150 | Modération légère |
| Expert | 151-500 | Pouvoir full |
| Sage | 500+ | Badges spéciaux |

## 🗄️ Schéma base de données

### Tables principales

```sql
utilisateurs         - Profils utilisateurs + stats XP
questions           - Questions posées
reponses            - Réponses aux questions
votes               - Votes sur réponses (utile/non)
commentaires        - Commentaires sur questions/réponses
notifications       - Alertes temps réel
matieres            - Catégories questions
tags                - Tags flexibles
utilisateur_tags    - Spécialités utilisateur
```

### Vues principales

- `v_feed_questions` - Questions avec agrégation stats (voix, réponses)
- `v_utilisateur_stats` - Stats complètes utilisateur (XP, level, contributions)

## 💻 Développement

### Scripts disponibles

**Frontend:**
```bash
npm run dev      # Mode développement
npm run build    # Build production
npm run preview  # Prévisualiser le build
npm run lint     # Linter (ESLint)
```

**Backend:**
```bash
npm run dev      # Mode développement (nodemon)
npm run build    # Build TypeScript (s'il applicable)
```

### Workflow Git

```bash
# Créer branche feature
git checkout -b feature/ma-feature

# Faire changements, commit
git add .
git commit -m "Add: description courte"

# Push et ouvrir PR
git push origin feature/ma-feature
```

### Debugging

**Frontend:**
- DevTools React: [React Developer Tools extension](https://chrome.google.com/webstore/detail/react-developer-tools/)
- Redux DevTools: Pour Zustand state inspection
- Network tab: Inspecter requêtes API

**Backend:**
- Logs: `console.log()` ou logger dédié
- Postman/Insomnia: Tester endpoints API
- pgAdmin: Inspecter PostgreSQL

## 🔧 Configuration avancée

### CORS

Le backend accepte automatiquement:
- `http://localhost:5173` (frontend dev)
- `https://pre-hackversebrainstorm.vercel.app` (production)
- Tous URLs Vercel preview (`https://*.vercel.app`)

Voir `backend/src/app.js` pour ajouter domaines supplémentaires.

### Routing Vercel

L'app utilise **HashRouter** pour éviter besoin de rewrites Vercel.
- Dev: `http://localhost:5173/#/feed`
- Prod: `https://pre-hackversebrainstorm.vercel.app/#/feed`

### Sécurité

- JWT token stocké en `httpOnly` cookie
- Bcrypt hash pour mots de passe (salt=10)
- Helmet headers pour XSS/CSRF protection
- Validation input côté backend
- CORS strict par domaine

## 🐛 Troubleshooting

### Erreur: "CORS origin not allowed"

**Solution:** Vérifier `CLIENT_URL` et `FRONTEND_URL` dans `.env` backend.

### Erreur: "password authentication failed"

**Solution:** Vérifier `DATABASE_URL` et credentials PostgreSQL.

### Erreur 404 sur page refresh (production)

**Solution:** HashRouter est activé. Si URLs sans `#/` nécessaires, migrer vers BrowserRouter + vercel.json rewrites.

### Upload Cloudinary échoue

**Solution:** Vérifier `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### Notifications temps réel ne fonctionnent pas

**Solution:** Vérifier connexion Socket.IO. Vercel serverless ne supporte pas WebSocket persistent - besoin serveur dédié.

## 📚 Documentation additionnelle

- [API Documentation](./backend/docs/API.md) - Détails complets endpoints
- [Database Schema](./schema_bdd_entraide.sql) - DDL complète
- [Architecture Decisions](./ARCHITECTURE.md) - Choix tech justifiés

## 🤝 Contribution

1. Fork le repo
2. Créer branche: `git checkout -b feature/nouvelle-feature`
3. Commit: `git commit -am 'Add new feature'`
4. Push: `git push origin feature/nouvelle-feature`
5. Ouvrir Pull Request

Veuillez respecter:
- Conventions de nommage (camelCase pour JS)
- Commit messages descriptifs
- Tests pour nouvelles fonctionnalités

## 📄 License

MIT - Voir LICENSE file pour détails.

## 📧 Support & Contact

- **Issues:** Utiliser [GitHub Issues](https://github.com/yourusername/entraide-academique/issues)
- **Email:** support@example.com
- **Discord:** [Rejoindre serveur](https://discord.gg/example)

---

**Dernière mise à jour:** 22 avril 2026
**Version:** 1.0.1
