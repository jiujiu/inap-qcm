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
