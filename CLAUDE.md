# Consignes projet - moobilPay (app mobile Qezaly, React Native / Expo)

Fichier versionné : ses règles valent sur tout PC et dans toute session Claude Code.

## R1 - Projet

- Qezaly : payer des abonnements (Netflix, Spotify...) par Mobile Money, via un agent IA.
- Ce dépôt = **app mobile** (Android en priorité, iOS ensuite).
- Dépôts liés : `Netflix-Automation` (back-end), `ai_browser` (agent IA),
  `mobilwallet-backend` (paiement Mobile Money).

## R2 - Style de réponse (OBLIGATOIRE)

- **Court et droit au but.** Listes à puces, pas de paragraphes.
- Répondre à ce qui est demandé, rien de plus. Pas de post-scriptum.
- Jamais de `.md` récapitulatif sans demande.

## R3 - Périmètre (OBLIGATOIRE)

- Ne jamais modifier un autre dépôt (back-end, agent IA) sans permission.

## R4 - Repères (lire en début de session)

- `app/` : écrans Expo Router (`(tabs)/` : accueil, activations, transactions, notifications, réglages).
- `modules/` : écrans autonomes (connexion, onboarding).
- `src/features/<domaine>/` : `auth`, `notifications`, `payment` (composants, hooks, services).
- `src/api/config.ts` : URL de l'API et config Firebase.
- `src/context/` : contextes globaux (Socket, mode revue) ; `src/services/` : Firebase, Socket.io.
- Build Android : workflow `.github/workflows/android-release.yml` ; iOS : `BUILD_SUBMIT_IOS.md`.
- Pas d'agent Explore pour « découvrir » le projet : lire ce fichier et l'arbre.

## R5 - Architecture (OBLIGATOIRE)

- Un fichier = une responsabilité. Viser ~400 lignes, **500 = plafond**.
- Nouveau code dans le dossier de son domaine (`src/features/<domaine>/`).
- Noms explicites, pas de `utils`/`helpers` fourre-tout.

## R6 - Branches Git (OBLIGATOIRE)

- Jamais de travail direct sur `main`.
- `feature/<sujet>` : fonctionnalité ; `debug/<sujet>` : un bug.
- Fusion seulement après validation de l'utilisateur.

## R7 - Ne rien changer sans accord (OBLIGATOIRE)

- Corriger dans le fonctionnement existant, sans le remplacer par une autre solution.
- Plusieurs options possibles : **demander d'abord**.
- Builds, envoi Play Store / App Store, tests sur appareil : toujours demander avant.

## R8 - Argent (OBLIGATOIRE)

- Aucun montant ni frais de mémoire : relire le code et les données du back-end.
- Un chiffre non vérifié est annoncé comme tel.

## R9 - Secrets

- Aucun secret en dur. Les clés des builds sont dans les secrets GitHub Actions.

## R10 - Emojis

- Aucun emoji décoratif : ni dans le code, ni dans l'interface, ni dans les commits.

## R11 - Hooks

- `.claude/hooks/` (déclarés dans `.claude/settings.json`), repris du modèle yaammoo :
  - `session-start-read.sh` : injecte ce fichier au premier message de la session.
  - `no-secret-commit.sh` : refuse un commit qui contient `.env*` ou une clé.
  - `enforce-file-size.sh` : fichier de code > 500 lignes = proposer un découpage (avec accord).
- Un hook qui bloque applique la règle : ne pas le contourner.
