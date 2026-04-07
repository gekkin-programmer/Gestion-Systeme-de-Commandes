# Gestion de Services Hôteliers — État du projet

## Accès VPS
- **IP** : 72.60.214.93
- **App** : http://72.60.214.93:3000
- **API** : http://72.60.214.93:4000
- **SSH** : `ssh root@72.60.214.93`
- **App path** : `/root/app`
- **PM2** : `pm2 status` / `pm2 logs api` / `pm2 logs web`

## Identifiants de test (Seed)
- **Super Admin** : `superadmin@hotel.cm` / `SuperAdmin2024!`
- **Admin Hôtel** : `admin@lebaobab.cm` / `Admin2024!`
- **Staff (Général)** : `staff@lebaobab.cm` / `Staff2024!`
- **Room Service** : `roomservice@lebaobab.cm` / `Staff2024!`
- **Ménage** : `housekeeping@lebaobab.cm` / `Staff2024!`
- **Concierge** : `concierge@lebaobab.cm` / `Staff2024!`
- **Spa** : `spa@lebaobab.cm` / `Staff2024!`
- **Hotel slug** : `hotel-le-baobab`

## Ce qui est implémenté et déployé (26/03/2026)

### Flux client (Migration terminée pour l'UI de base)
- Scan QR Chambre → Sélection services → Panier → Demande → Suivi temps réel
- Accès via `/{locale}/stay/{stayToken}` avec fallback/redirection depuis l'ancien `/menu/`
- Nouveau portail de connexion unifié sur `/{locale}/client/login`
- Paiement : Facture hôtel (Hotel Bill), MTN/Orange Money mockés.

### Staff & Départements
- Kanban des demandes temps réel (Socket.io)
- Filtrage par département (Room Service, Ménage, Conciergerie, Spa)
- Notifications sonores et navigateur pour les nouvelles demandes

### Admin Hôtel
- Gestion du catalogue de services par département (CRUD articles + prix)
- Gestion des chambres et génération des codes d'accès/QR
- Dashboard statistiques (revenus du jour, demandes par département)
- Gestion du personnel (assignation aux départements)
- Configuration hôtel (logo, thème, moyens de paiement)

### Application Mobile (Hybride : Client / Staff / Admin)
- **Framework** : Expo 51 + React Native WebView (Wrapper pointant vers l'App Web Next.js)
- **Cible** : App Store (iOS) & Play Store (Android)
- **Fonctionnalités** :
  - Splash Screen natif (expo-splash-screen) pour une transition invisible vers le Web
  - Entrée unifiée avec le Web sur le portail de connexion (`/client/login`)
  - Permet le déploiement de mises à jour de l'UI en temps réel (OTA) via pnpm sur le VPS

---

## Architecture & Technologies
- **Monorepo** : Turborepo + PNPM
- **Frontend Web** : Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand
- **Frontend Mobile** : Expo (React Native), Expo Router, Zustand, Axios
- **Backend** : Node.js (Express), TypeScript, Prisma (PostgreSQL)
- **Temps Réel** : Socket.io avec adaptateur Redis
- **Cache** : Redis (Rate limiting, Sockets, Metadata)
- **Internationalisation** : next-intl (FR/EN)

---

## À faire (Post-Migration Hotel)

### Priorité haute
- [x] Finaliser la vue client `[stayToken]` (Remplacement complet de l'ancien flow restaurant + Redirection)
- [ ] Tester le flow de paiement "Facture Hôtel" (Hotel Bill)
- [ ] Vérifier la synchronisation offline des changements de statut staff
- [ ] Valider la génération des QR codes pour les chambres

### Avant mise en production réelle
- [ ] Configurer un service email réel (Resend / SendGrid)
- [ ] Intégrer les APIs de paiement réelles
- [ ] Mise en place SSL et noms de domaine définitifs
- [ ] Suite de tests automatisés (Jest/Cypress)
- [ ] Documentation Swagger/OpenAPI

---

## Commandes utiles (Local & VPS)

```bash
# Développement (root)
pnpm dev

# Build (root)
pnpm build

# Base de données (apps/api)
pnpm db:migrate
pnpm db:seed
pnpm db:studio

# Déploiement VPS (Résumé)
git pull origin master
pnpm install
pnpm build
pm2 restart all
```
