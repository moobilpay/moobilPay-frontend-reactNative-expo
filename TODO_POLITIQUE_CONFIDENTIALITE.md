# TODO — Politique de confidentialité MoobilPay

**URL cible** : https://moobilpay.com/politique-confidentialite.html
**Objectif** : passer la review Apple (Guideline 5.1.1) + cohérence avec les
5 données déclarées dans App Privacy (Name, Email, Phone Number, User ID,
Device ID). « Other Financial Info » a été RETIRÉ d'App Privacy (l'app n'est
pas un service financier, c'est un tracker de budget personnel).

---

## 🔴 PRÉREQUIS BLOQUANTS (à faire AVANT soumission Apple)

### 1. Créer la page d'assistance
**URL à créer** : `https://moobilpay.com/support`
Apple va cliquer dessus pendant la review. Si 404 → refus immédiat.
Contenu minimum :
- E-mail de contact : contact@moobilpay.com
- FAQ basique (« Comment ajouter un suivi », « Comment supprimer mon
  compte », « Comment activer les notifications »)
- Formulaire ou simple mailto

---

---

## Périmètre réel de MoobilPay (à respecter dans la politique)

L'app est un **outil de suivi personnel et de gestion de budget**. L'utilisateur
ajoute manuellement des éléments à suivre (en saisissant un nom au clavier) et
visualise une vue d'ensemble : nom, jours restants, rappels d'échéance. L'app
**ne traite aucun paiement**, ne vend rien, et **ne se connecte à aucun service
tiers**. Aucune marque de service tiers n'est citée dans l'application.

**Stack technique réellement utilisée par l'app mobile** :
- Authentification : Firebase Auth (email/password, Google Sign-In, Sign in
  with Apple)
- Base de données : Firebase Firestore (Google, USA)
- Notifications push : Expo Notifications + Firebase Cloud Messaging (FCM)
- Stockage sécurisé local : expo-secure-store (Keychain iOS)
- Hébergement backend : Fly.io
- Communication temps réel : Socket.io

**Non utilisé / désactivé** (à NE PAS mentionner) :
- Selenium / scraping Netflix
- Stockage de vrais identifiants Netflix
- WhatsApp / SMS / Twilio
- Google Drive
- Email IMAP / Zoho

---

## Contenu COMPLET à publier sur la page

Copie-colle ce qui suit dans la page HTML (entre `<body>` ou dans la zone
contenu) :

```html
<h1>Politique de confidentialité — MoobilPay</h1>
<p><em>Dernière mise à jour : 11 juin 2026</em></p>

<h2>1. Introduction</h2>
<p>
  MoobilPay est une application mobile de <strong>suivi personnel et de gestion
  de budget</strong>. La présente politique explique quelles données nous
  collectons, comment nous les utilisons, avec qui nous les partageons et quels
  sont vos droits.
</p>
<p>
  En utilisant MoobilPay, vous acceptez les pratiques décrites dans cette
  politique.
</p>

<h2>2. Éditeur</h2>
<ul>
  <li>Éditeur : MoobilPay</li>
  <li>Adresse : Ngousso, Centre 1200, Yaoundé, Cameroun</li>
  <li>Contact : contact@moobilpay.com</li>
</ul>

<h2>3. Données que nous collectons</h2>

<h3>3.1 Données fournies par vous</h3>
<ul>
  <li><strong>Nom et prénom</strong> — saisis à l'inscription ou récupérés
      depuis votre compte Apple / Google.</li>
  <li><strong>Adresse e-mail</strong> — pour la création du compte et la
      communication.</li>
  <li><strong>Numéro de téléphone</strong> — utilisé pour identifier votre
      compte.</li>
  <li><strong>Mot de passe</strong> — uniquement si vous choisissez l'auth
      par e-mail/mot de passe ; il est chiffré côté Firebase et jamais
      visible par nous.</li>
  <li><strong>Éléments suivis</strong> que vous enregistrez : nom de
      l'élément que vous saisissez et date d'échéance associée.</li>
</ul>

<h3>3.2 Données générées par l'utilisation</h3>
<ul>
  <li><strong>Identifiant utilisateur unique (UID Firebase)</strong> — généré
      automatiquement pour rattacher vos données à votre compte.</li>
  <li><strong>Jeton de notification push (FCM / APNs)</strong> — pour vous
      envoyer des rappels d'échéance.</li>
  <li><strong>Historique de vos suivis</strong> : noms saisis, statut,
      horodatage. Ces enregistrements servent à votre suivi personnel.</li>
  <li><strong>Identifiants techniques</strong> : modèle d'appareil, version
      iOS / Android, version de l'application, adresse IP.</li>
</ul>

<h3>3.3 Données que nous ne collectons PAS</h3>
<ul>
  <li>Aucune donnée de localisation.</li>
  <li>Aucun accès aux contacts, photos, caméra, micro.</li>
  <li>Aucune connexion à un service tiers : l'app ne demande, ne transmet et ne
      stocke aucun identifiant de service externe.</li>
  <li>Aucune donnée de santé.</li>
  <li>Aucun identifiant publicitaire (IDFA).</li>
</ul>

<h2>4. Finalités d'utilisation</h2>
<table>
  <tr><th>Donnée</th><th>Finalité</th><th>Base légale</th></tr>
  <tr><td>Email, mot de passe, UID</td><td>Création et sécurisation du
      compte</td><td>Exécution du contrat</td></tr>
  <tr><td>Nom, prénom</td><td>Personnalisation de
      l'expérience</td><td>Exécution du contrat</td></tr>
  <tr><td>Numéro de téléphone</td><td>Identification du
      compte</td><td>Exécution du contrat</td></tr>
  <tr><td>Jeton FCM</td><td>Envoi de rappels et
      notifications</td><td>Consentement (révocable)</td></tr>
  <tr><td>Historique de suivis</td><td>Suivi personnel</td><td>Exécution du
      contrat</td></tr>
  <tr><td>Données techniques (IP, modèle, OS)</td><td>Sécurité,
      diagnostic</td><td>Intérêt légitime</td></tr>
</table>

<h2>5. Authentification</h2>
<p>MoobilPay propose plusieurs méthodes de connexion :</p>
<ul>
  <li><strong>Sign in with Apple</strong> — conforme aux exigences Apple
      (Guideline 4.8). Si vous utilisez « Masquer mon e-mail », seul
      l'identifiant relais Apple est conservé. Vous pouvez révoquer l'accès
      à tout moment depuis <em>Réglages iOS → Apple ID → Connexion avec
      Apple</em>.</li>
  <li><strong>Google Sign-In</strong> — via le SDK officiel Google.</li>
  <li><strong>Email / mot de passe</strong> — via Firebase
      Authentication.</li>
</ul>

<h2>6. Services tiers et sous-traitants</h2>
<p>
  Nous utilisons des prestataires techniques pour faire fonctionner l'app.
  Aucun ne reçoit vos données à des fins publicitaires.
</p>
<ul>
  <li><strong>Apple Inc.</strong> (États-Unis) — Sign in with Apple,
      notifications APNs.</li>
  <li><strong>Google LLC / Firebase</strong> (États-Unis) — Authentication,
      Firestore (base de données), Cloud Messaging (FCM).</li>
  <li><strong>Expo (650 Industries, Inc.)</strong> (États-Unis) — service
      de notifications push.</li>
  <li><strong>Fly.io</strong> (États-Unis) — hébergement du serveur
      backend.</li>
</ul>
<p>
  <strong>MoobilPay ne se connecte à aucun service tiers, n'agit comme
  intermédiaire pour aucun service, ne traite aucun paiement et ne stocke
  aucun identifiant de connexion à un service externe.</strong> L'application
  est un outil de suivi personnel autonome.
</p>

<h2>7. Transferts internationaux</h2>
<p>
  Les serveurs de Google (Firebase) et Apple sont situés aux États-Unis.
  Vos données peuvent donc être traitées hors de l'Union européenne et hors
  de votre pays de résidence. Ces transferts sont encadrés par les clauses
  contractuelles types adoptées par la Commission européenne et par les
  engagements de conformité de Google et d'Apple.
</p>

<h2>8. Durée de conservation</h2>
<ul>
  <li><strong>Compte utilisateur</strong> : conservé tant que le compte est
      actif. Supprimé dans un délai maximum de <strong>30 jours</strong>
      après votre demande.</li>
  <li><strong>Historique de vos suivis</strong> : conservé tant que
      le compte est actif ; supprimé avec le compte.</li>
  <li><strong>Logs techniques</strong> : <strong>90 jours</strong>
      maximum.</li>
  <li><strong>Jeton FCM</strong> : supprimé à la désinstallation ou à la
      révocation des notifications.</li>
</ul>

<h2>9. Vos droits</h2>
<p>Vous disposez des droits suivants :</p>
<ul>
  <li><strong>Accès</strong> — obtenir une copie de vos données.</li>
  <li><strong>Rectification</strong> — corriger des données inexactes,
      directement dans l'app ou par e-mail.</li>
  <li><strong>Suppression</strong> — supprimer votre compte depuis l'app
      (<em>Paramètres → Supprimer mon compte</em>) ou par e-mail.</li>
  <li><strong>Opposition</strong> — désactiver les notifications dans
      <em>Réglages iOS → Notifications → MoobilPay</em>.</li>
  <li><strong>Portabilité</strong> — recevoir vos données dans un format
      lisible, sur demande.</li>
  <li><strong>Réclamation</strong> — auprès de l'autorité de contrôle
      compétente (CNIL en France, ANTIC au Cameroun, etc.).</li>
</ul>
<p>
  Pour exercer un droit, écrivez à <strong>contact@moobilpay.com</strong>.
  Nous répondons sous 30 jours maximum.
</p>

<h2>10. Suppression de votre compte</h2>
<p>
  Conformément à la Guideline 5.1.1(v) d'Apple, vous pouvez supprimer votre
  compte directement depuis l'application :
</p>
<ol>
  <li>Ouvrez l'application MoobilPay.</li>
  <li>Allez dans <em>Paramètres</em> (ou <em>Profil</em>).</li>
  <li>Sélectionnez <em>Supprimer mon compte</em>.</li>
  <li>Confirmez la suppression.</li>
</ol>
<p>
  Vous pouvez également demander la suppression par e-mail à
  <strong>contact@moobilpay.com</strong>. La suppression est effective dans
  un délai maximum de 30 jours.
</p>

<h2>11. Sécurité</h2>
<p>
  Vos données sont transmises en HTTPS (TLS 1.2+) et stockées de manière
  sécurisée chez nos sous-traitants (Firebase, Fly.io). Les mots de passe
  sont chiffrés par Firebase Authentication. Les jetons sensibles sont
  stockés localement dans le Keychain iOS via expo-secure-store.
</p>
<p>
  Aucune méthode de transmission ou de stockage n'est totalement sécurisée.
  En cas d'incident affectant vos données, nous vous en informerons dans les
  meilleurs délais.
</p>

<h2>12. Mineurs</h2>
<p>
  MoobilPay n'est pas destiné aux enfants de moins de <strong>13 ans</strong>
  (16 ans dans l'Union européenne). Nous ne collectons pas sciemment de
  données d'enfants. Si vous pensez qu'un mineur a créé un compte, écrivez à
  contact@moobilpay.com pour suppression.
</p>

<h2>13. Modifications</h2>
<p>
  Cette politique peut évoluer. La date de dernière mise à jour est indiquée
  en haut. En cas de changement substantiel, nous vous en informerons via
  l'application ou par e-mail.
</p>

<h2>14. Nous contacter</h2>
<ul>
  <li>E-mail : <strong>contact@moobilpay.com</strong></li>
  <li>Éditeur : MoobilPay</li>
  <li>Adresse : Ngousso, Centre 1200, Yaoundé, Cameroun</li>
</ul>
```

---

## Checklist de cohérence App Privacy ↔ Politique

Vérifie que chaque case cochée dans App Privacy a son équivalent textuel
dans la politique ci-dessus :

- [x] **Name** → section 3.1 « Nom et prénom »
- [x] **Email Address** → section 3.1 « Adresse e-mail »
- [x] **Phone Number** → section 3.1 « Numéro de téléphone »
- [x] **User ID (Firebase UID)** → section 3.2 « Identifiant utilisateur
      unique (UID Firebase) »
- [x] **Device ID (FCM token)** → section 3.2 « Jeton de notification push
      (FCM / APNs) »

⚠️ **Other Financial Info** : RETIRÉ d'App Privacy. L'app ne collecte aucune
info financière (pas de carte/compte bancaire, pas de montant). Les éléments
suivis sont de simples noms saisis par l'utilisateur pour son suivi personnel.

✅ Tout est couvert.

---

## Checklist Apple Review (Guideline 5.1.1)

- [x] Liste explicite des données collectées
- [x] Finalités d'utilisation
- [x] Liste des services tiers / sous-traitants
- [x] Durées de conservation
- [x] Droits utilisateur (accès, suppression, etc.)
- [x] **Procédure de suppression de compte** dans l'app (5.1.1(v))
- [x] Contact (email)
- [x] Date de dernière mise à jour
- [x] Mention des mineurs
- [x] Clarification du positionnement (tracker personnel, aucun service tiers)

---

## Actions à faire AVANT de soumettre l'app

1. [ ] Publier la page HTML ci-dessus sur
       `https://moobilpay.com/politique-confidentialite.html`
2. [ ] Tester que l'URL répond bien (200 OK, pas de redirection cassée)
3. [ ] Vérifier que la page **Suppression de compte** existe vraiment dans
       l'app mobile (Paramètres → Supprimer mon compte)
4. [ ] Créer aussi la page `https://moobilpay.com/support` (exigée par Apple
       comme URL d'assistance)
