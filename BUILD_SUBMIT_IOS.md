# Build & Submit iOS — MoobilPay (guide rapide)

Procédure pour builder et soumettre l'app iOS avec EAS depuis la machine Kali.
Deux blocages connus + leurs solutions.

## ⚠️ Préfixe obligatoire pour toutes les commandes EAS

Sur cette machine, l'auth Apple timeoute (IPv6 cassé + `io_uring` du kernel Kali).
Toujours préfixer les commandes `eas` par :

```bash
UV_USE_IO_URING=0 NODE_OPTIONS="--dns-result-order=ipv4first" eas ...
```

Si ça timeoute encore, désactiver l'IPv6 temporairement :

```bash
sudo sysctl -w net.ipv6.conf.all.disable_ipv6=1
sudo sysctl -w net.ipv6.conf.default.disable_ipv6=1
# réactiver après : ... disable_ipv6=0   (ou reboot)
```

Si la session 2FA est corrompue ("Session expired") :

```bash
rm -rf ~/.app-store   # force un nouveau code 2FA
```

## 1. Build de production

```bash
cd /home/valdoblair/Documents/PROJET/michel/MoobilPay/moobilPay
UV_USE_IO_URING=0 NODE_OPTIONS="--dns-result-order=ipv4first" eas build --platform ios --profile production
```

- Login Apple : `yes` → Apple ID `tchindavaldoblair@icloud.com` → **vrai** mot de passe → code 2FA (iPhone).
- Réutiliser le certificat de distribution : `Y`.
- Générer un nouveau provisioning profile : `Y`.
- Récupérer le lien `.ipa` à la fin.

## 2. Submit vers App Store Connect

Utiliser une **App Store Connect API Key** (.p8) → pas de 2FA, ne plante jamais.

```bash
UV_USE_IO_URING=0 NODE_OPTIONS="--dns-result-order=ipv4first" eas submit -p ios --profile production --latest
```

- "Generate a new App Store Connect API Key?" → `no` (clé déjà existante, ou en créer une sur
  App Store Connect → Utilisateurs et accès → Intégrations → Clés API).
- Path : `~/Téléchargements/AuthKey_PUW3653VPC.p8`
- Key ID : `PUW3653VPC`
- Issuer ID : `72d2ebc7-5cd2-45e3-9d4a-de0b18d77e31`

## Références

- ASC App ID (ascAppId, déjà dans `eas.json`) : `6772980605`
- Apple Team ID : `23ARWS8L89` (compte individuel)
- Bundle : `com.moobilpay.com`

## 3. Après le submit (manuel, dans le navigateur)

Sur https://appstoreconnect.apple.com/apps/6772980605 :
1. Attendre le traitement du build (~5-10 min, email Apple).
2. Version 1.0 → section **Build** → `+` → sélectionner le build uploadé.
3. Compléter la fiche : captures 1242×2688, description, politique de confidentialité,
   App Privacy, **compte démo** (login/mdp pour qu'Apple teste l'app de paiement).
4. **Ajouter pour examen** → review Apple (~24-48h).
