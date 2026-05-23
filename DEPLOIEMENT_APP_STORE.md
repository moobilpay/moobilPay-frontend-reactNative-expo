# Déploiement App Store — checklist complète

## 1. Côté Apple Developer (compte payant requis : 99 USD/an ✅ déjà fait)

- ✅ App ID `com.moobilpay.com` avec capabilities Sign in with Apple + Push Notifications (déjà fait)
- ✅ Clé APNs `.p8` uploadée dans Firebase (déjà fait)
- ⚠️ **Vérifier le statut du compte** : https://developer.apple.com/account → ton compte doit être **Active** (pas Expired). Renouvellement annuel sinon tout est suspendu.

## 2. Créer l'app sur App Store Connect

Va sur https://appstoreconnect.apple.com → **Mes apps** → bouton **+** → **Nouvelle app**.

Remplis :

- **Plateformes** : iOS
- **Nom** : `MoobilPay` (visible dans l'App Store, max 30 caractères, doit être unique mondialement — vérifie qu'il n'est pas pris)
- **Langue principale** : Français
- **Bundle ID** : sélectionne `com.moobilpay.com` dans la liste
- **SKU** : un identifiant interne unique (ex: `MOOBILPAY-IOS-001`)
- **Accès utilisateur** : "Complet"

## 3. Préparer les ressources visuelles

Obligatoires (à uploader dans App Store Connect → ta fiche app) :

| Ressource | Format | Taille |
|---|---|---|
| **Icône app** | PNG, sans transparence, sans coins arrondis | 1024×1024 px |
| **Screenshots iPhone 6.7"** | PNG ou JPG | 1290×2796 ou 1320×2868 px (min 3, max 10) |
| **Screenshots iPhone 6.5"** | PNG ou JPG | 1242×2688 px (optionnel mais recommandé) |
| **Screenshots iPad 13"** | si `supportsTablet: true` | 2064×2752 px |

## 4. Métadonnées obligatoires

Dans App Store Connect → ta fiche :

- **Catégorie principale** : `Finance` (probablement) + secondaire `Utilitaires`
- **Description** (4000 caractères max) : pitch produit
- **Mots-clés** (100 caractères, séparés par virgules) : `netflix, paiement, mobile money, mtn, orange, afrique`
- **URL d'assistance** (obligatoire) : page web où l'utilisateur peut te contacter
- **URL de marketing** (optionnel)
- **URL de politique de confidentialité** (**obligatoire** depuis 2018) : page hébergée, accessible publiquement
- **Coordonnées de contact** pour Apple Review (téléphone + email valides)
- **Compte de test** : email + mot de passe d'un compte démo pour qu'Apple puisse tester (obligatoire si l'app demande login — c'est ton cas)

## 5. Déclarations légales Apple

Dans **App Privacy** (section dédiée), tu dois déclarer **toutes** les données collectées :

- Email (auth) → "Contact info"
- UID Firebase → "User ID"
- Token FCM → "Device ID"
- Numéro de téléphone (si tu en collectes) → "Contact info"
- Données de transaction → "Purchase history"

Et pour **chaque** donnée : usage (Analytics, App Functionality, etc.), liée à l'identité ou pas.

Si tu as un backend qui logue : déclare aussi.

## 6. Build production EAS

Différent du dev build, tu fais :

```bash
eas build -p ios --profile production
```

Vérifie ton `eas.json` — le profil `production` doit avoir `distribution: "store"`.

## 7. Soumettre à Apple

Quand le build production est ✅ :

```bash
eas submit -p ios --latest
```

EAS uploade ton `.ipa` vers App Store Connect automatiquement. Tu retournes sur App Store Connect :

- Ta fiche app → **TestFlight** (le build apparaît après 10-30 min de traitement Apple)
- **Beta testers** : tu peux d'abord tester via TestFlight (interne ou externe)
- Une fois validé, **App Store** → **Sélectionne le build** → **Ajouter à examen** → **Soumettre à l'examen**

## 8. Examen Apple (App Review)

- **Délai** : 24-72h en moyenne (parfois 1 semaine si charge)
- **Taux de refus 1ère soumission** : ~40 % (normal). Apple te donne la raison, tu corriges, tu re-soumets.
- **Pièges classiques pour MoobilPay** :
  - ☑ Sign in with Apple **obligatoire** si tu proposes Google/Facebook login (Apple Guideline 4.8) → ✅ tu l'as fait
  - ☑ Compte de test valide (si Apple ne peut pas tester ton app, refus immédiat)
  - ⚠ Paiement de services tiers (Netflix) : Apple peut demander des clarifications. Bien expliquer que MoobilPay est un intermédiaire de paiement, pas un revendeur Netflix.
  - ⚠ Si tu utilises l'IAP Apple (achats in-app) ou pas : si tu factures du contenu numérique consommé dans l'app, Apple exige son IAP avec 15-30 % de commission. Pour MoobilPay (mobile money → service externe) tu es probablement exempté, mais c'est à argumenter.
  - ⚠ Politique de confidentialité : URL doit **vraiment** marcher et le contenu correspondre à ce que tu déclares dans App Privacy.

## 9. Après approbation

- L'app passe en état **Ready for sale** → disponible sur l'App Store en ~2h.
- Tu choisis les **pays/régions** où elle est dispo (App Store Connect → Pricing & Availability).
- Les mises à jour passent toutes par App Review (généralement plus rapide que la 1ère, ~24h).

---

## TL;DR — Ordre des étapes pratiques

1. Termine ton build dev actuel et **teste à fond** Apple Sign In + notifs sur ton iPhone.
2. Crée la fiche app sur App Store Connect (15 min).
3. Prépare icône 1024×1024 + 3-5 screenshots iPhone (Photoshop/Figma — ~1h).
4. Rédige description + politique de confidentialité (URL hébergée — important, ~1-2h).
5. Build production : `eas build -p ios --profile production` (~20 min).
6. Submit : `eas submit -p ios --latest` (~5 min).
7. Configure App Privacy + métadonnées + sélectionne le build → Submit for review.
8. Attendre 1-3 jours.
