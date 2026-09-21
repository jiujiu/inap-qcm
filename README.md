# INAP QCM

Plateforme privée de révision dédiée à quatre matières : PGP, DOAP, CGE et CCC.

## Site déployé

**https://jiujiu.github.io/inap-qcm/**

> Utiliser l'URL racine ci-dessus afin de conserver l'interface complète avec connexion Supabase, sauvegarde cloud et accès à la progression.

## Sécurité

- authentification Supabase obligatoire par lien magique ;
- liste blanche d'adresses e-mail dans `allowed_users` ;
- les banques de questions sont stockées dans `quiz_questions` et protégées par RLS ;
- aucun fichier JSON de questions n'est publié par GitHub Pages ;
- `quiz.html`, `dashboard.html` et `erreurs.html` vérifient une session authentifiée et autorisée ;
- progression et erreurs sont stockées dans Supabase et ne sont lisibles que par leur propriétaire autorisé ;
- la clé `sb_publishable_...` est volontairement publique : elle identifie le projet mais ne contourne pas Auth/RLS ;
- aucune clé `service_role` ou `sb_secret` n'est présente dans le navigateur.

## Fonctionnalités

- entraînement matière par matière avec correction immédiate ;
- progression cloud ;
- historique des erreurs ;

## Autoriser un autre utilisateur

Ajouter son adresse e-mail dans la table `public.allowed_users`. Une authentification Supabase valide seule ne suffit pas : l'adresse doit aussi être autorisée.

Les politiques RLS contrôlent ensuite l'accès à `quiz_questions`, `quiz_results` et `quiz_errors`.

## E-mails d'authentification Supabase : SMTP personnalisé

Les deux applications utilisent les Magic Links de Supabase Auth. Le service e-mail intégré de Supabase était limité à 2 e-mails d'authentification par heure sur le projet ; le passage à un SMTP personnalisé a fait passer le limiteur du projet à 30 e-mails/heure. Le réglage `Minimum interval per user = 60` reste distinct : il impose 60 secondes entre deux envois au même utilisateur.

### 1. Essai avec une adresse Free

Configuration testée dans **Supabase → Authentication → Emails → SMTP Settings** :

- Sender email address : adresse `@free.fr` utilisée pour l'envoi ;
- Sender name : `INAP / CTIE QCM` ;
- Host : `smtp.free.fr` ;
- Port : `587` ;
- Minimum interval per user : `60` secondes ;
- Username : adresse Free complète ;
- Password : mot de passe de la boîte Free.

L'authentification SMTP doit être activée côté Free. Ne jamais enregistrer le mot de passe SMTP dans GitHub ou dans le JavaScript du site : il reste uniquement dans la configuration Auth de Supabase.

### 2. Erreur rencontrée avec Free

La demande de Magic Link retournait :

```text
POST /auth/v1/otp → 500
Gomail: could not send email: 550 "5.7.1 Spam Detected - Mail Rejected"
```

Le log Supabase confirmait parallèlement :

```text
Env GOTRUE_RATE_LIMIT_EMAIL_SENT changed, updating Email limiter from 2/1h to 30
```

Conclusion du diagnostic : le SMTP personnalisé était bien pris en compte et la limite Supabase de 2 e-mails/heure avait été levée, mais **Free rejetait le message comme spam**. Un test avec un template minimal, sans `{{ .ConfirmationURL }}` et contenant uniquement `{{ .Token }}`, a produit la même erreur. Le blocage ne venait donc pas du lien Magic Link ou du template.

### 3. Solution retenue : Brevo SMTP

Un compte Brevo gratuit a été créé pour l'envoi transactionnel. Il n'est pas nécessaire de créer une campagne ni une liste de contacts.

Dans **Brevo → Transactionnel → Configuration → Paramètres SMTP** :

- serveur SMTP : `smtp-relay.brevo.com` ;
- port : `587` ;
- connexion / username : identifiant SMTP fourni par Brevo ;
- password : **clé SMTP Brevo**, et non le mot de passe du compte Brevo.

Créer la clé via **Open SMTP key settings**. Ne jamais publier cette clé dans GitHub, dans le README ou dans le frontend.

L'adresse utilisée dans **Sender email address** doit être enregistrée/vérifiée comme expéditeur dans Brevo. Reporter ensuite les valeurs Brevo dans **Supabase → Authentication → Emails → SMTP Settings**, enregistrer, puis demander un nouveau Magic Link. L'envoi peut être contrôlé dans les logs transactionnels Brevo et dans les Auth Logs Supabase.

### Diagnostic rapide

- `429` / rate limit : vérifier les limites Supabase et le délai par utilisateur ;
- `500` sur `/auth/v1/otp` : ouvrir **Auth Logs** pour obtenir l'erreur SMTP réelle ;
- `550 5.7.1 Spam Detected` avec Free : rejet par le serveur Free, pas par le code INAP/CTIE ;
- avec Brevo, vérifier d'abord l'expéditeur, l'identifiant SMTP, la clé SMTP et le port 587.
