# Pre Hackverse Brainstorm

Plateforme d'entraide academique avec une architecture frontend + backend.

## Liens de production

- Frontend: [https://pre-hackversebrainstorm.vercel.app/feed](https://pre-hackversebrainstorm.vercel.app/feed)
- Backend API: [https://pre-hackverse-brainstorm.onrender.com/api/](https://pre-hackverse-brainstorm.onrender.com/api/)

## Presentation

Cette application permet de:

- publier des questions
- repondre aux questions
- voter sur les reponses
- suivre les notifications
- gerer un compte utilisateur

## Stack technique

### Frontend

- React
- Vite
- React Router
- TanStack Query
- Zustand
- Tailwind CSS

### Backend

- Node.js
- Express
- PostgreSQL
- JWT
- Socket.IO

## Structure du projet

- frontend/: application web client (Vercel)
- backend/: API REST et logique metier (Render)
- schema_bdd_entraide.sql: schema PostgreSQL

## Lancer en local

### Prerequis

- Node.js 18+
- PostgreSQL

### Frontend

1. Aller dans frontend/
2. Installer les dependances: npm install
3. Configurer les variables d'environnement dans .env
4. Lancer: npm run dev

### Backend

1. Aller dans backend/
2. Installer les dependances: npm install
3. Configurer les variables d'environnement dans .env
4. Lancer: npm run dev

## Variables d'environnement

### Frontend

- VITE_API_URL: URL de l'API backend

### Backend

- DATABASE_URL
- JWT_SECRET
- JWT_EXPIRES_IN
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- CLIENT_URL

## Notes de deploiement

- Frontend deploye sur Vercel
- Backend deploye sur Render
- Verifier les regles CORS cote backend pour autoriser le domaine frontend
- Pour les routes SPA, utiliser une configuration de rewrite Vercel (ou HashRouter)
