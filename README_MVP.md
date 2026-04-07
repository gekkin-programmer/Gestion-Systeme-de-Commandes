# 🏨 Résumé du Cahier des Charges (MVP)

## 📖 Vue d'ensemble
Plateforme de digitalisation dédiée aux services hôteliers permettant aux clients de commander depuis leur chambre via une application mobile dédiée (téléchargeable via scan d'un QR code). Le projet vise prioritairement les hôtels partenaires à Douala (Cameroun).

## 🎯 Objectifs Stratégiques
1. **Expérience Client** : Commander facilement des repas ou des services d'entretien avec un suivi en temps réel.
2. **Opérations Hôtelières** : Offrir un outil de gestion centralisé aux équipes de l'hôtel.
3. **Monétisation & Achats** : Supporter les paiements mobile locaux (MTN MoMo, Orange Money) et l'intégration des frais sur la facture globale de la chambre.

## 🚀 Périmètre Fonctionnel (MVP)
- **App Client (iOS/Android)** :
  - Authentification par numéro de téléphone.
  - Saisie du **Code Chambre**.
  - Accès structuré à 4 pôles : *Room Service*, *Housekeeping*, *Conciergerie*, *Spa*.
  - Panier de commandes, paiement intégré ou ajout à la facture, suivi du statut, factures PDF.
  - Base Multilingue (FR / EN / AR).
- **Interface Staff** : Traitement des commandes avec notifications sonores/visuelles (Reçu → En cours → Livré) et confirmation des paiements.
- **Interface Admin Hôtel** : Création/gestion des chambres (codes), édition des menus et services, statistiques basiques, gestion des comptes employés.
- **Super Admin** : Gestion des hôtels partenaires et configuration technique globale.

## ❌ Hors Scope (Prévu V2)
- Réservations de chambres, intégrations PMS directes, analytics poussées, programme de fidélité, et auto-inscription des hôtels.

## 🔒 Sécurité & Contrôle d'Accès (Liaison Client-Chambre)
Afin de garantir que seuls les clients résidents de l'hôtel puissent passer commande, l'architecture métier est structurée autour d'un "Code Chambre" à durée de vie paramétrable :
1. **Génération au Check-in** : Le système génère un Code Chambre unique assigné au client pour son séjour avec une date/heure de fin calculée.
2. **Authentification Mobile** : Le client renseigne ce code dans l'application pour physiquement lier son appareil ("Phone Number") à cette chambre temporairement.
3. **Expiration au Check-out** : En fin de séjour, le code expire. Les accès (Room service, etc.) sont instantanément révoqués, prévenant toute utilisation ultérieure de l'application hors de l'établissement hôtelier.

---

## 📍 Prochaines Étapes Techniques (Plan d'action)

Actuellement, nous avons solidifié **l'interface et l'authentification native du client** (Phases 1 à 3 partielles). Nous avons construit l'architecture de navigation, l'internationalisation, les sélecteurs de pays et l'UI d'onboarding. 

**Voici les prochaines étapes logiques :**

### 1. Écran de saisie du "Code Chambre"
Puisque le MVP exige que le client connecte son application à sa chambre physique, la prochaine étape après OTP est l'interface de matching où l'utilisateur saisit le code secret de sa chambre pour débloquer le catalogue de l'hôtel.

### 2. Dashboard et Catalogue de Services (Guest)
Nous devons concevoir l'écran d'accueil principal (Hub) qui va présenter les 4 modules card-based : *Room Service*, *Housekeeping*, *Conciergerie*, *Spa*, ainsi que la page de listing du menu (photos, prix, ajout au panier).

### 3. Connexion Back-End / Base de données
Il faudra rapidement modéliser la base de données (PostgreSQL/MongoDB) pour définir le schéma relationnel : `Hotels`, `Rooms` (et leurs codes uniques), `Users`, `Services`, `Orders`. Il faudra par ailleurs remplacer les mocks de l'API (`authApi.requestGuestOtp`) par de vrais endpoints dynamiques.

### 4. Panier et flux de paiement local
Préparer le tunnel de checkout où le client pourra basculer entre une sur-facturation de sa chambre (Hotel Bill) ou un prompt d'API MTN / Orange Money.
