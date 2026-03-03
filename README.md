# Gestion de Commandes Restaurant — MVP Cameroun

Plateforme de commandes digitales par QR code pour restaurants camerounais.

## Stack

| Couche | Tech |
|--------|------|
| Frontend | Next.js 14 (App Router) + Tailwind + TypeScript |
| Backend | Express.js + Socket.io + TypeScript |
| Base de données | PostgreSQL + Prisma ORM |
| Monorepo | pnpm workspaces + Turborepo |
| Auth | JWT (access 15min + refresh 7j httpOnly cookie) |
| i18n | next-intl (FR/EN) |
| État client | Zustand + persist |

## Démarrage rapide

### 1. Prérequis
- Node.js ≥ 20
- pnpm ≥ 9
- Docker (pour PostgreSQL)

### 2. Installation

```bash
# Cloner et installer
pnpm install

# Copier les variables d'environnement
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

# Éditer apps/api/.env avec vos secrets
```

### 3. Base de données

```bash
# Démarrer PostgreSQL
docker-compose up db -d

# Créer les tables
pnpm db:migrate

# Insérer les données de test
pnpm db:seed
```

### 4. Lancer le projet

```bash
pnpm dev
# API → http://localhost:4000
# Web → http://localhost:3000
```

## Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Admin | superadmin@restaurant.cm | SuperAdmin2024! |
| Admin | admin@lebaobab.cm | Admin2024! |
| Staff | staff@lebaobab.cm | Staff2024! |

## Flux QR Code → Commande

1. Scanner le QR code d'une table → `/fr/menu/restaurant-le-baobab/{tableToken}`
2. Session créée automatiquement (expire en 4h)
3. Parcourir le menu, ajouter au panier (persisté localStorage)
4. Commander → notification temps réel au staff (Socket.io)
5. Staff gère les commandes via le kanban (`/fr/staff/orders`)
6. Payer (mock MTN/Orange Money ou espèces)
7. Télécharger le reçu PDF

## Structure

```
gestions-commande-restaurant/
├── apps/
│   ├── api/          # Express.js + Prisma
│   └── web/          # Next.js 14
└── packages/
    └── shared/       # Types + constantes + validators Zod partagés
```

## API

Base URL : `http://localhost:4000/api/v1`

| Route | Description |
|-------|-------------|
| `POST /auth/login` | Connexion |
| `GET /menu/slug/:slug` | Menu public par slug |
| `POST /sessions/start` | Démarrer session table |
| `POST /orders` | Créer commande |
| `GET /orders/:id/status` | Statut commande |
| `POST /payments/initiate` | Initier paiement |
| `GET /receipts/:orderId` | Reçu PDF |

## Variables d'environnement clés

**API** (`apps/api/.env`) :
```
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
```

**Web** (`apps/web/.env.local`) :
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```
