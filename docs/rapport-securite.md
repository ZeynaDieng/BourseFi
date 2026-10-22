# Rapport de sécurité — correction et vérification des 6 vulnérabilités

**Projet :** BourseFi (Nuxt 4 / Nitro / Prisma)
**Date :** 2026-10-22
**Branche :** `main` (modifications non commitées)
**Périmètre :** six vulnérabilités identifiées + tests de sécurité et de non-régression, typecheck, build.
**Environnement :** local/test uniquement. Aucune donnée réelle, aucun test intrusif, aucun déploiement en production.

---

## 1. Résumé exécutif

| Indicateur | Valeur |
|---|---|
| Vulnérabilités examinées | 6 / 6 |
| Vulnérabilités corrigées + testées localement | 6 / 6 |
| Fichiers de test | 8 (`tests/unit` + `tests/security`) |
| Tests exécutés | **80** |
| Tests réussis | **80** |
| Tests échoués | 0 |
| Tests bloqués / non exécutés | 0 |
| Typecheck (`nuxi typecheck`) | Outil réparé — exécutable. 225 erreurs **préexistantes**, 0 introduite par la correction |
| Build (`nuxt build`) | ✅ Succès (code de sortie 0) |

**Distinction des niveaux de validation :**
- **Corrigé + testé localement** : les 6 vulnérabilités (tests automatisés verts, exécutant les vrais handlers).
- **Validation en production restant à faire** : comportements dépendant d'un service externe réel — envoi d'email Brevo/SMTP, base PostgreSQL (unicité `P2002`, `mode: 'insensitive'`), et constance temporelle réelle (anti-timing). Voir §7 (risques résiduels).

---

## 2. Méthode de test

Les tests ne réimplémentent pas la logique : ils **importent et exécutent les vrais gestionnaires** de `server/api/**` via un routeur `h3` (`toWebHandler`), avec `Request`/`Response` standards.

Seules les dépendances externes sont simulées (`tests/helpers/setup-mocks.ts`) :
- `server/utils/prisma` → base en mémoire (`tests/helpers/fake-db.ts`) via `Proxy` ;
- `server/utils/email` → emails capturés en mémoire (`__sentEmails`), avec interrupteur d'échec `__emailShouldFail` ;
- `server/utils/audit` et `server/utils/notifications` → neutralisés.

Conséquence : la **logique de sécurité testée est le code réel de production**. Les limites portent uniquement sur les composants mockés (voir §7).

Commandes réellement exécutées :

```
npx vitest run                 # 80 tests — 8 fichiers — tous verts
npm install -D typescript@5.9.3 vue-tsc@3.0.11
npx nuxi typecheck             # outil réparé ; 225 erreurs préexistantes (hors périmètre)
npx nuxt build                 # code de sortie 0 — « ✨ Build complete! »
```

---

## 3. Déblocage du typecheck

**Symptôme initial :** `npx nuxi typecheck` échouait avec
`Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './lib/tsc' is not defined`.

**Cause réelle :** ni `typescript` ni `vue-tsc` n'étaient présents dans les dépendances du projet. `nuxi typecheck` les résout depuis le projet ; faute de les trouver, il a installé à la volée les **dernières versions**, dont `typescript@7.0.2` — le portage natif (preview) de TypeScript, qui a supprimé l'export `./lib/tsc` dont dépend `vue-tsc`. Incompatibilité d'outillage, **sans rapport avec le code applicatif**.

**Correctif (changements de dépendances minimisés) :** ajout en `devDependencies` d'un couple compatible et stable avec Nuxt 4 / Vue 3.5 :
- `typescript@5.9.3` (dernière 5.x stable — **pas** la preview 7.x) ;
- `vue-tsc@3.0.11` (ligne 3.0 stable).

**Résultat :** l'outil s'exécute désormais. Il révèle **225 erreurs de type préexistantes** réparties dans ~55 fichiers de tout le projet (paiements, relances email, pages Vue, `nuxt.config.ts`, etc.).

**Preuve que la correction de sécurité n'introduit aucune nouvelle erreur de type :**
`git stash -u` (retour à l'état d'origine) → `npx nuxi typecheck` = **225 erreurs**. État avec corrections → **225 erreurs**. Les quelques erreurs situées dans des fichiers touchés par la sécurité (`bourses.get.ts`, `bourses/[slug].get.ts`, `activer-compte.post.ts`, `admin/candidatures.vue`) sont **identiques au baseline** (seuls les numéros de ligne glissent, les imports ajoutés décalant le code). La nature de ces erreurs (ex. `programme.fraisDossier: number | null` vs `number` attendu par `BourseRow`) est une dette de typage Prisma préexistante, confirmée par le fait que les **mêmes** erreurs apparaissent dans des fichiers **non touchés** (`server/api/partner/bourses.get.ts`, `server/api/admin/bourses.get.ts`).

> Ces 225 erreurs sont **hors périmètre** de la mission de sécurité et n'ont pas été corrigées (consigne : limiter les changements). Elles n'empêchent pas le build (voir §4).

---

## 4. Build Nuxt

`npx nuxt build` → **code de sortie 0**, message final `✨ Build complete!`, sortie Nitro générée dans `.output/`.

Nuxt/Nitro transpile sans vérification de types stricte (`nuxt.config.ts` ne définit pas `typescript.typeCheck`), donc les 225 erreurs de type ci-dessus ne bloquent pas le build.

Avertissements observés, **non bloquants et sans impact sécurité** :
- `Browserslist: caniuse-lite is 6 months old` — données de compatibilité navigateurs à rafraîchir (cosmétique).
- `[nuxt:module-preload-polyfill] Sourcemap is likely to be incorrect` — avertissement de sourcemap d'un plugin interne Nuxt (cosmétique).

---

## 5. Vérification des avertissements observés pendant les tests

Avertissement h3 répété :
`[h3] Please prefer using 'message' for longer error messages instead of 'statusMessage'. In the future, 'statusMessage' will be sanitized by default.`

**Analyse :** avertissement de **compatibilité ascendante** de h3, pas une faille. `statusMessage` est la raison HTTP ; une future version de h3 la nettoiera (suppression des caractères de contrôle/retours ligne). Les handlers l'utilisent pour transmettre des messages de validation, tous mono-lignes.

**Impact sécurité : aucun.** En particulier, sur les routes anti-énumération, les messages d'erreur 400 sont **identiques** que le compte existe ou non — propriété vérifiée par les tests `V3.4` (mot de passe oublié) et `V4.8` (inscription). Le futur « sanitize » ne révélerait rien de plus.

**Décision : aucun changement de comportement.** Migrer `statusMessage` → `message` maintenant serait injustifié (consigne « ne pas changer le comportement sans justification ») et risquerait de modifier les corps de réponse sur lesquels les tests anti-énumération s'appuient. À planifier plus tard, comme simple dette de compatibilité h3.

---

## 6. Détail par vulnérabilité (preuves)

### V1 — Mots de passe générés prévisibles (`BourseFi${1000..9999}!`)

**Problème initial :** l'activation de compte générait un mot de passe à partir de `Math.random()` dans un espace de ~9000 valeurs, le communiquait en clair (réponse/email).

**Correction :** `server/utils/one-time-token.ts` — plus aucun mot de passe généré. Création d'un compte avec un hash **inutilisable** (`unusablePasswordHash`, bcrypt sur un secret aléatoire jamais communiqué) + envoi d'un **lien d'activation** à jeton aléatoire 256 bits (`randomBytes(32)`, base64url), **stocké haché** (SHA-256), **expirant** (72 h activation / 1 h reset), **à usage unique**, **lié à un seul compte**. Handlers : `activer-compte.post.ts`, `creer-direct.post.ts`, `admin/users/index.post.ts`, consommation dans `reset-password.post.ts`.

**Fichier de test :** `tests/security/v1-generated-passwords.test.ts` (11 tests).

| Test | Vérifie | Résultat |
|---|---|---|
| V1.1 | `Math.random` forcé à 0 → le mot de passe `BourseFi1000!` **ne** fonctionne **pas** | ✅ |
| V1.2 | Aucune réponse admin ne renvoie `tempPassword`/`generatedPassword` ni motif `BourseFi\d{4}!` | ✅ |
| V1.3 | L'email ne contient aucun mot de passe ; contient un lien à jeton ≥ 43 car. (256 bits) | ✅ |
| V1.4 | Jeton stocké **haché** (jamais en clair) et TTL ≤ 72 h | ✅ |
| V1.5 | Deux activations → deux jetons différents (pas d'espace prévisible) | ✅ |
| V1.6 | Le jeton définit le mot de passe **une seule fois** (rejeu → 400) | ✅ |
| V1.7 | Jeton **expiré** refusé (400) | ✅ |
| V1.8 | **Anti-contournement** : jeton de A + champs `email`/`userId` d'une victime → le compte B n'est **jamais** modifié | ✅ |
| V1.9 | Jeton forgé / tronqué / hash brut / vide / espace → 400 | ✅ |
| V1.10 | Activer un compte **existant** ne réinitialise pas son mot de passe actuel | ✅ |
| V1.11 | `creer-direct` ne communique pas de mot de passe et envoie un lien d'activation | ✅ |

**Assertions clés :** `bcrypt.compare('BourseFi1000!', hash) === false` ; `user.resetPasswordToken === sha256(token)` ; rejeu → 400 ; `updateMany` borné à `{ id: user.id }`.
**Limites :** unicité et recherche insensible à la casse simulées (fake-db) ; à confirmer sur PostgreSQL réel.

---

### V2 — Mot de passe par défaut `BourseFi2026!` imposé par le frontend

**Problème initial :** valeur `BourseFi2026!` préremplie côté back-office et acceptée telle quelle par le backend.

**Correction :** plus aucune valeur préremplie côté Vue ; les handlers **ignorent** tout champ `password` envoyé par le frontend (schémas Zod sans `password`, commentaires explicites dans `creer-direct.post.ts` / `activer-compte.post.ts` / `admin/users/index.post.ts`). L'utilisateur choisit toujours son mot de passe via le lien d'activation.

**Fichier de test :** `tests/security/v2-default-password.test.ts` (6 tests).

| Test | Vérifie | Résultat |
|---|---|---|
| V2.1 | Aucune valeur fixe/générée dans `candidatures.vue` et `users.vue` (`BourseFi20\d\d!`, `password: '...'`) | ✅ |
| V2.2 | Aucun mot de passe littéral ni `Math.random()`-password côté serveur | ✅ |
| V2.3 | `creer-direct` **ignore** un `password: 'BourseFi2026!'` imposé | ✅ |
| V2.4 | Deux comptes créés le même jour n'ont **pas** de secret commun | ✅ |
| V2.5 | Création admin d'utilisateur : `password` du frontend ignoré | ✅ |
| V2.6 | `activer-compte` ignore un `password` imposé | ✅ |

**Assertions clés :** `bcrypt.compare('BourseFi2026!', hash) === false` après chaque route ; `rawBody`/emails ne contiennent jamais `BourseFi2026!`.
**Limites :** V2.1/V2.2 sont des analyses statiques (grep) des sources — robustes contre une réintroduction littérale, mais ne couvrent pas une regénération dynamique indirecte (couverte par V2.3–V2.6 au niveau comportemental).

---

### V3 — Énumération de comptes via « mot de passe oublié »

**Problème initial :** le champ `emailSent` (et les écarts de réponse) permettait de distinguer un compte existant d'un compte inexistant.

**Correction :** `forgot-password.post.ts` renvoie une **réponse publique unique** (`PUBLIC_RESPONSE`, même statut/corps/champs) dans tous les cas ; jeton généré systématiquement ; envoi email non attendu (`void sendEmail(...)`) pour homogénéiser le temps de réponse ; aucun champ conditionnel.

**Fichier de test :** `tests/security/v3-forgot-password.test.ts` (5 tests).

| Test | Vérifie | Résultat |
|---|---|---|
| V3.1 | Existant vs inexistant : statut, corps, **clés** et **cookies** identiques ; pas de `emailSent` | ✅ |
| V3.2 | Indistinguable **même si l'envoi d'email échoue** pour le compte existant | ✅ |
| V3.3 | Variantes casse/espaces : réponse identique **et** seul le compte légitime reçoit le lien | ✅ |
| V3.4 | Entrée invalide (email malformé / vide / corps cassé) : **400 identique** | ✅ |
| V3.5 | (Non-régression) le lien de réinitialisation fonctionne réellement ; `resetPasswordToken` nullifié après usage | ✅ |

**Assertions clés :** `publicShape(a)` (statut+corps+clés triées+cookies triés) `toEqual` `publicShape(b)`.
**Limites :** l'**égalité temporelle** réelle (anti-timing) n'est pas mesurée (difficilement testable de façon fiable) ; le code homogénéise le travail (hash/jeton systématiques, envoi non bloquant) mais la constance exacte reste à confirmer en production.

---

### V4 — Énumération de comptes à l'inscription

**Problème initial :** l'inscription renvoyait `409 « Cet email est déjà utilisé »`, révélant l'existence du compte ; session ouverte immédiatement.

**Correction :** `register.post.ts` renvoie la **même réponse publique** (200, `PUBLIC_RESPONSE`, aucun cookie de session) que l'email soit nouveau ou déjà pris ; en cas de doublon, le **propriétaire légitime** est prévenu par email (sans jeton) et aucun compte n'est modifié ; course concurrente `P2002` → même réponse ; compte créé **non vérifié**, session ouverte seulement après vérification d'email ; si l'email échoue, pas d'auto-vérification ni de session.

**Fichier de test :** `tests/security/v4-register.test.ts` (8 tests).

| Test | Vérifie | Résultat |
|---|---|---|
| V4.1 | Email existant vs nouveau : statut, corps et cookies identiques ; **aucun** `bf_session` | ✅ |
| V4.2 | Variante de casse d'un email existant : pas de doublon, réponse identique, mot de passe d'origine intact | ✅ |
| V4.3 | Doublon : le propriétaire est prévenu (1 email, **sans jeton**), aucun compte modifié | ✅ |
| V4.4 | (Non-régression) inscription légitime → compte non vérifié + email ; login bloqué (403) tant que non vérifié ; `verify-email` → session ; login OK | ✅ |
| V4.5 | Email normalisé en minuscules à la création | ✅ |
| V4.6 | Échec d'envoi d'email → compte **non** auto-vérifié, **pas** de session, pas de `emailSent` | ✅ |
| V4.7 | Le mot de passe du corps n'est **jamais** journalisé (`console.log`/`warn`) | ✅ |
| V4.8 | Champs invalides : **400 identique** indépendamment de l'existence | ✅ |

**Assertions clés :** `publicShape(a) toEqual publicShape(b)` ; `setCookie` sans `bf_session=` ; `tokenFromEmail(mail) === null` pour l'email d'avertissement du doublon.
**Note de conception :** la route **admin** `POST /api/admin/users` renvoie volontairement `409` sur doublon — c'est acceptable car authentifiée et réservée aux administrateurs (acteur de confiance). L'anti-énumération ne concerne que la route **publique** `/api/auth/register`.
**Limites :** gestion de la course `P2002` dépend du vrai moteur PostgreSQL (simulée ici).

---

### V5 — Fuite de champs internes dans `/api/bourses` et `/api/etablissements`

**Problème initial :** les réponses publiques exposaient des champs internes (`partnerId`, `commissionRate`, `notesInternes`, `sourceUrl`, contacts inactifs, etc.).

**Correction :** sérialisation par **liste blanche** dans `server/utils/bourse-serialize.ts` et les handlers `bourses.get.ts`, `bourses/[slug].get.ts`, `etablissements.get.ts` : seuls les champs publics sont renvoyés ; contacts inactifs filtrés ; éléments inactifs/archivés masqués aux anonymes.

**Fichier de test :** `tests/security/v5-public-apis.test.ts` (7 tests).

| Test | Vérifie | Résultat |
|---|---|---|
| V5.1 | `/api/bourses` : **aucun** champ de la liste interdite (19 champs : `partnerId`, `commissionRate`, `notesInternes`, `sourceUrl`, `createdAt`…) ; pas de `intranet.boursefi.local` ni de contact inactif | ✅ |
| V5.2 | `/api/bourses` : données publiques **conservées** (`slug`, `titre`, `partnerName`, `tarifs`, `quota`, …) | ✅ |
| V5.3 | `/api/bourses/[slug]` : même liste blanche | ✅ |
| V5.4 | `/api/etablissements` : aucun champ interne ; pas de `commission 12` ni `Scraping interne` | ✅ |
| V5.5 | `/api/etablissements` : données publiques conservées ; contacts réduits aux 5 champs publics | ✅ |
| V5.6 | `?active=false` **anonyme** ne révèle pas les éléments inactifs/archivés | ✅ |
| V5.7 | `?active=false` reste disponible pour un **administrateur** | ✅ |

**Assertions clés :** parcours récursif `collectKeys()` de toute la réponse ; `rawBody` ne contient aucun secret ; `contacts[0]` strictement égal aux 5 clés publiques.
**Limites :** la liste des champs interdits testés (19) est représentative mais non exhaustive de tout le schéma Prisma ; comme la sérialisation est une **liste blanche** (opt-in), un nouveau champ interne n'est pas exposé par défaut — l'approche est donc intrinsèquement robuste à l'ajout de colonnes. Pas de route publique `/api/etablissements/[slug]` (seule la liste existe) : surface couverte intégralement.

---

### V6 — Politique de mot de passe trop faible (4 caractères, aucune exclusion)

**Problème initial :** minimum 4 caractères, aucune liste d'exclusion ; incohérence entre les parcours.

**Correction :** politique **unique** partagée `shared/password-policy.ts` (`checkPassword`) : 10–128 caractères, au moins une lettre **et** un chiffre/symbole, refus des mots de passe courants/interdits et répétitions, refus si contient l'email. Appliquée **côté serveur** à l'inscription (`register.post.ts`), la réinitialisation/activation (`reset-password.post.ts`) et la modification admin (`admin/users/[id].patch.ts`).

**Fichiers de test :** `tests/security/v6-password-policy.test.ts` (7 tests) + `tests/unit/password-policy.test.ts` (21 tests unitaires).

| Test | Vérifie | Résultat |
|---|---|---|
| V6.1 | Inscription : 8 mots de passe faibles/interdits → **400**, aucun compte créé | ✅ |
| V6.2 | Inscription : mot de passe contenant l'email refusé ; trop long (>128) refusé | ✅ |
| V6.3 | (Non-régression) mot de passe conforme **accepté** | ✅ |
| V6.4 | Réinitialisation : faible refusé (**jeton conservé**), conforme accepté | ✅ |
| V6.5 | Activation (lien admin) : **mêmes** règles | ✅ |
| V6.6 | Modification admin (`newPassword`) : mêmes règles ; mot de passe cible inchangé si refus | ✅ |
| V6.7 | Types inattendus (nombre, tableau, objet, `null`) → 400 | ✅ |
| unit ×21 | Longueur min/max, composition, courants, répétitions, fragments interdits, email, normalisation accents | ✅ |

**Assertions clés :** cohérence des 4 parcours (inscription/reset/activation/modif admin) via la même fonction ; en cas de refus au reset, le **jeton reste valide** (l'utilisateur peut corriger) ; `bcrypt.compare('Cible-Secret-321', hash)` reste vrai après un refus.
**Limites :** `COMMON_PASSWORDS`/`FORBIDDEN_FRAGMENTS` sont des listes volontairement courtes (pas un dictionnaire type zxcvbn/HIBP) ; elles bloquent les cas classiques mais pas toute faiblesse statistique. Évolution possible, non requise par le périmètre.

---

## 7. Tests de sécurité complémentaires & non-régression (Section D)

**Fichier :** `tests/security/d-complementary.test.ts` (15 tests).

**D.1 — Autorisations des routes administratives**
| Test | Vérifie | Résultat |
|---|---|---|
| D.1.1 | 4 routes admin : non authentifié → **401**, étudiant → **403**, partenaire → **403** ; aucun effet de bord | ✅ |
| D.1.2 | Session **expirée** ou **forgée** → 401 | ✅ |
| D.1.3 | Administrateur autorisé → 200 | ✅ |
| D.1.4 | Un admin ne peut pas retirer son propre rôle → 400 | ✅ |

**D.2 — Protections contre les tentatives répétées** (`server/utils/rate-limit.ts` : limite par IP **et** par clé, l'IP via `X-Forwarded-For` étant falsifiable)
| Test | Vérifie | Résultat |
|---|---|---|
| D.2.1 | Connexion : 10 échecs → 401, 11ᵉ → **429** (par IP) | ✅ |
| D.2.2 | Connexion : rotation de `X-Forwarded-For` ne contourne pas la limite **par compte** | ✅ |
| D.2.3 | Mot de passe oublié : limite par IP **et** par adresse ciblée | ✅ |
| D.2.4 | Réinitialisation : limite par IP | ✅ |
| D.2.5 | Inscription : limite par IP | ✅ |

**D.3 — Cas limites & non-régression**
| Test | Parcours couvert | Résultat |
|---|---|---|
| D.3.1 | **Connexion** légitime OK + 401 identique (mauvais mdp vs compte inconnu) | ✅ |
| D.3.2 | Connexion insensible à la casse de l'email | ✅ |
| D.3.3 | Connexion sans CSRF → 403 | ✅ |
| D.3.4 | Vérification d'email : jeton manquant → 400, inconnu → ≥400 | ✅ |
| D.3.5 | Reset : corps malformé / types invalides → 400 | ✅ |
| D.3.6 | **Consultation des bourses** : slug inexistant → 404 | ✅ |

**Couverture de non-régression par parcours demandé :**
- **Inscription** → V4.4, V6.3, D.2.5 ✅
- **Connexion** → D.3.1, D.3.2, D.3.3, D.2.1, D.2.2 ✅
- **Activation de compte** → V1.6, V1.10, V6.5 ✅
- **Récupération de mot de passe** → V3.5, V6.4 ✅
- **Consultation des bourses / API publiques** → V5.2, V5.5, V5.6, V5.7, D.3.6 ✅
- **Autorisations administratives** → D.1.1–D.1.4 ✅

**Parcours explicitement NON couverts (à documenter) :**
1. **Rejeu d'un jeton de vérification d'email valide** : D.3.4 teste jeton manquant/inconnu mais pas le rejeu d'un jeton *valide* déjà consommé. Le handler `verify-email.get.ts` met le jeton à `null` après usage → un rejeu renvoie 404 (comportement **sûr**), mais cela n'est pas asserté par un test dédié.
2. **Égalité temporelle (anti-timing)** sur `/forgot-password` et `/register` : non mesurée (voir V3). Le code homogénéise le travail mais la constance réelle reste à valider.
3. **Comportement réel PostgreSQL** : unicité `P2002`, `mode: 'insensitive'`, atomicité de `updateMany` — simulés par la fake-db, à valider sur la vraie base.
4. **Envoi d'email réel** (Brevo/SMTP) : mocké ; à valider en préproduction (contenu des liens, non-divulgation de secret).
5. **Déni de service distribué** / rate-limit en environnement multi-instances : le compteur `rate-limit.ts` est **en mémoire par processus** — inefficace derrière plusieurs instances/serverless. Risque résiduel d'infrastructure (voir §8 et Annexe A).

---

## Annexe A — Audit du rate-limiting en production (Phase 2, 2026-10-22)

**Objectif :** déterminer si le rate-limiting en mémoire (R1) est suffisant pour le déploiement réel sur VPS Contabo, et si une intégration Redis est justifiée.

**Méthode :** audit du dépôt uniquement (code, configuration, documentation). **Aucun accès au VPS Contabo n'a été effectué** — toute affirmation ci-dessous porte sur le code/la doc du dépôt, pas sur l'état réel du serveur, sauf mention contraire explicite.

### A.1 — Constat (analyse locale, non vérifié sur le VPS au moment de l'audit initial)

| Élément | Constat | Source |
|---|---|---|
| Mode de lancement documenté | `pm2 start .output/server/index.mjs --name boursefi` — mode fork, aucun flag `-i`, aucun `instances` | `docs/deploiement-production.md` §7 |
| Fichier `ecosystem.config.js` / Docker / docker-compose | **Absent** du dépôt | recherche exhaustive, hors `node_modules` |
| CI/CD (`.github/workflows`) | **Absent** | recherche exhaustive |
| Stockage des sessions | PostgreSQL (modèle Prisma `Session`), déjà partagé entre instances | `prisma/schema.prisma:261` |
| Stockage du rate-limiting | `Map` en mémoire, **par processus**, non partagé | `server/utils/rate-limit.ts` |
| Redis configuré/utilisé | **Non** — `ioredis`/`@upstash/redis` présents seulement comme dépendances transitives optionnelles de `unstorage` (via `nitropack`) ; aucun import applicatif, aucune config `nitro.storage`, aucune variable `REDIS_URL` | `package-lock.json`, `nuxt.config.ts`, `.env.example` |
| Routes protégées | `/api/contact`, `/api/auth/{login,register,forgot-password,reset-password}` — limites listées en §6 (V-tests) et rappelées en A.2 | `server/api/**` |

**Conclusion de l'analyse locale initiale :** selon le code et la documentation du dépôt, le déploiement cible est **mono-instance**. Dans ce scénario, le rate-limiting en mémoire protège correctement (il n'y a qu'un seul compteur, pas de dilution entre processus).

### A.1.bis — Vérification effectuée sur le VPS (2026-10-22, confirmée par l'utilisateur)

Contrairement à A.1 (déduit du dépôt), les éléments suivants ont été **vérifiés directement sur le VPS Contabo de production**, et me sont rapportés par l'utilisateur à cette date :

| Élément | Résultat constaté sur le VPS | Statut |
|---|---|---|
| Nombre d'instances PM2 pour BourseFi | **Une seule instance**, en **mode fork** | ✅ Vérifié sur le VPS, 2026-10-22 |
| Routage Nginx | `proxy_pass` dirige tout le trafic vers **`127.0.0.1:3000`** uniquement (un seul backend, pas d'upstream multi-port/multi-process) | ✅ Vérifié sur le VPS, 2026-10-22 |

**Ce que cela confirme :** le scénario mono-instance supposé en A.1 est **conforme à la réalité de production actuelle**. Le rate-limiting en mémoire ([server/utils/rate-limit.ts](../server/utils/rate-limit.ts)) protège donc effectivement les routes listées en A.2, sans dilution entre processus, **à la date de cette vérification**.

**Limite de cette vérification :** il s'agit d'un **constat ponctuel** (snapshot au 2026-10-22), rapporté par l'utilisateur et non ré-exécuté directement par l'assistant sur le VPS (pas d'accès SSH depuis cet environnement). Elle ne garantit pas l'état futur : tout changement ultérieur de la configuration PM2 (passage à `-i max`, ajout d'un `ecosystem.config.js` avec plusieurs instances) ou de la configuration Nginx (ajout d'un second backend/upstream) invaliderait cette conclusion **sans qu'aucune alerte automatique ne le signale** — la protection redeviendrait silencieusement insuffisante. Une revérification périodique (ou une alerte de configuration) est recommandée avant tout changement d'infrastructure.

### A.2 — Décision prise

Après présentation de l'audit et de la recommandation (intégration Redis avec repli automatique en mémoire, comportement inchangé si `REDIS_URL` absente), **l'utilisateur a choisi de ne pas modifier l'implémentation actuelle** :

> « Non, garder l'implémentation en mémoire telle quelle. »

**Conséquence :** `server/utils/rate-limit.ts` et toutes les routes qui l'utilisent restent **inchangés**. Aucune dépendance ajoutée, aucun fichier modifié pendant cette phase d'audit (confirmé par `git status` avant/après : seul ce rapport a été créé/modifié).

### A.3 — Risque résiduel accepté (R1 — mis à jour après vérification VPS)

| Condition | Statut du risque |
|---|---|
| Déploiement réel = 1 seul processus PM2 en mode fork, Nginx → un seul backend `127.0.0.1:3000` | **Risque faible, accepté — vérifié sur le VPS le 2026-10-22** (voir A.1.bis) |
| Déploiement réel = plusieurs instances PM2 (`-i > 1`) ou plusieurs VPS derrière un load-balancer | **Risque réel si cette situation survient** — chaque instance a son propre compteur ; la limite effective est multipliée par le nombre d'instances (ex. 4 instances × 10 tentatives/15 min = 40 tentatives effectives sur `/login`) |
| Redémarrages PM2 fréquents (déploiements successifs) | **Risque mineur** — les compteurs sont réinitialisés à chaque redémarrage, fenêtre de contournement courte et bornée |

**R1 — statut final :** ✅ **Risque accepté, conditionné et vérifié à ce jour.** La vérification VPS du 2026-10-22 confirme que la condition de validité (une seule instance) est actuellement remplie. **R1 n'est pas éliminé — il est surveillé** : il redevient actif de plein droit dès que l'architecture PM2/Nginx change (scaling vertical `-i max`, deuxième VPS, load-balancer). Toute évolution de ce type doit déclencher une nouvelle revérification de ce point avant mise en production, et une réévaluation de l'intégration Redis (proposée en Annexe A, déclinée pour l'instant).

### A.4 — Aucune implémentation réalisée

Conformément au choix de l'utilisateur :
- Aucun code modifié (`rate-limit.ts` inchangé).
- Aucune dépendance ajoutée.
- Aucun test ajouté pour cette phase (rien de nouveau à tester).
- Les 80 tests de sécurité et le build restent dans l'état documenté en §9 (phase 1) — non ré-exécutés dans cette phase car aucun code n'a changé.

---

## Annexe B — Compatibilité Node.js : production (25.9.0) vs développement (22.12.0)

**Objectif :** vérifier si l'écart entre le Node.js de production (25.9.0, rapporté par l'utilisateur) et celui utilisé en développement/CI local (22.12.0) présente un risque, **sans modifier la version du serveur de production**.

**Méthode :** aucune donnée externe n'a été consultée (pas de recherche web). Les vérifications ci-dessous reposent sur (1) les métadonnées `engines` déclarées par les dépendances installées localement, et (2) une exécution **empirique réelle** de la suite de tests, du build et du serveur buildé sous Node 25.9.0, obtenue en installant cette version via `nvm` dans l'environnement de développement local (action réversible, sans rapport avec le VPS).

### B.1 — Vérification statique : plages `engines` déclarées

| Paquet | Version installée | `engines.node` déclaré | Node 22.12.0 | Node 25.9.0 |
|---|---|---|---|---|
| `nuxt` | 4.4.4 | `^20.19.0 \|\| >=22.12.0` | ✅ compatible | ✅ compatible |
| `nitropack` | 2.13.4 | `^20.19.0 \|\| >=22.12.0` | ✅ compatible | ✅ compatible |
| `@prisma/client` / `prisma` | 6.16.2 | `>=18.18` | ✅ compatible | ✅ compatible |
| `sharp` | 0.34.5 | `^18.17.0 \|\| ^20.3.0 \|\| >=21.0.0` | ✅ compatible | ✅ compatible |
| `vitest` | 3.2.7 | `^18.0.0 \|\| ^20.0.0 \|\| >=22.0.0` | ✅ compatible | ✅ compatible |
| `typescript` | 5.9.3 | `>=14.17` | ✅ compatible | ✅ compatible |

Le projet lui-même (`package.json`) **ne déclare aucun champ `engines`** et aucun `.nvmrc`/`.node-version` — rien n'empêche techniquement `npm install`/`npm run build` de s'exécuter sous l'une ou l'autre version.

**Constat :** aucune dépendance ne plafonne sa version maximale de Node. Aucune incompatibilité n'est **déclarée** par les métadonnées des paquets.

### B.2 — Vérification empirique réelle (exécutée localement, pas sur le VPS)

Node 25.9.0 a été installé via `nvm` dans l'environnement de développement (`nvm install 25.9.0`), puis utilisé pour exécuter, **sans réinstaller `node_modules`** (donc avec exactement les mêmes fichiers que sous Node 22.12.0) :

| Vérification | Commande | Résultat sous Node 25.9.0 |
|---|---|---|
| Version réellement installée | `node -v` | `v25.9.0` |
| Ligne de release | `process.release.lts` | `undefined` → **confirme que Node 25 est une ligne "Current", jamais passée en LTS** (les majeures impaires de Node.js ne deviennent jamais LTS ; seules les majeures paires le deviennent) |
| Suite de tests | `npx vitest run` | ✅ **80/80 tests passés**, identique à Node 22.12.0 |
| Build Nuxt | `npx nuxt build` | ✅ **Succès, code de sortie 0**, identique à Node 22.12.0 |
| Démarrage du serveur buildé | `node .output/server/index.mjs` (port 3099 temporaire) | ✅ Démarrage propre, aucun message d'échec de chargement de module natif (`sharp`, moteur Prisma) ; requête `GET /` → **HTTP 200** |

Après ces vérifications, l'environnement a été **restauré à Node 22.12.0** et un rebuild a confirmé qu'aucun fichier suivi par git n'avait été modifié (`git status` identique avant/après).

### B.3 — Analyse et recommandation

- **Aucune régression fonctionnelle détectée** entre Node 22.12.0 et 25.9.0 sur ce projet : tests, build et démarrage serveur se comportent de façon identique.
- **Point d'attention non fonctionnel, mais réel :** Node 25.x est une ligne **"Current"**, pas **LTS** — confirmé empiriquement (`process.release.lts === undefined`). Par politique de publication de Node.js, les lignes non-LTS ont une durée de vie courte (support ~6 mois) et reçoivent moins de validation par l'écosystème (moins de paquets testés explicitement contre elles en production) qu'une ligne LTS comme 22.x ou 24.x. Faire tourner la production sur une ligne Current expose à devoir migrer plus souvent et avec moins de préavis que sur une LTS.
- **Recommandation (non exécutée, nécessite votre validation) :** envisager, à moyen terme et lors d'une fenêtre de maintenance planifiée, un passage du VPS vers une ligne **LTS** (22.x en maintenance, ou 24.x en LTS active à ce jour) plutôt que de rester sur 25.x. **Aucune urgence** : aucun dysfonctionnement n'a été détecté, cette recommandation relève de la gestion du cycle de vie, pas d'une vulnérabilité.
- **Conformément à la demande, la version de Node en production n'a pas été modifiée** et aucune action n'a été effectuée sur le VPS.

### B.4 — Limites de cette vérification

- Testée en local sur **macOS (Darwin arm64)** : le VPS Contabo est vraisemblablement Linux x86_64 — les binaires natifs de `sharp` et le moteur Prisma sont spécifiques à la plateforme/architecture. Le résultat « aucun échec de chargement de module natif » obtenu ici **ne garantit pas** l'absence de problème sur l'OS/architecture réelle du VPS ; seul un test direct sur le VPS (ou un environnement Linux équivalent) le confirmerait pleinement.
- La connexion PostgreSQL réelle n'a pas été exercée pendant ce test (`.env` local vide) : seul le démarrage HTTP et le chargement des modules ont été vérifiés, pas une requête de bout en bout vers la base de données sous Node 25.
- Aucune charge/performance comparée entre les deux versions n'a été mesurée.

---

## Annexe C — Checklist de préproduction et de déploiement (avec sauvegarde et retour arrière)

Cette checklist distingue explicitement ce qui a été **réellement vérifié** dans le cadre de cette mission (code local + un constat VPS ponctuel rapporté par l'utilisateur) de ce qui **reste à faire** avant tout déploiement.

### C.1 — Déjà vérifié (à ce jour, 2026-10-22)

| # | Contrôle | Résultat | Preuve |
|---|---|---|---|
| 1 | 80 tests de sécurité/non-régression | ✅ 80/80 | §9, Annexe B.2 |
| 2 | Build Nuxt (Node 22.12.0, environnement de dev) | ✅ succès | §4 |
| 3 | Build Nuxt + tests sous Node 25.9.0 (local, macOS) | ✅ succès, identique à Node 22 | Annexe B.2 |
| 4 | Démarrage du serveur buildé sous Node 25.9.0 (local) | ✅ HTTP 200, pas d'échec de module natif | Annexe B.2 |
| 5 | Typecheck exécutable (outil réparé) | ✅ 0 erreur introduite par les corrections de sécurité | §3 |
| 6 | Nombre d'instances PM2 en production | ✅ 1 instance, mode fork | Annexe A.1.bis — **rapporté par l'utilisateur après vérification VPS**, non ré-exécuté par l'assistant |
| 7 | Routage Nginx en production | ✅ un seul backend `127.0.0.1:3000` | Annexe A.1.bis — **idem** |
| 8 | Aucune régression sur les 6 vulnérabilités corrigées | ✅ confirmé par les 80 tests | §6 |

### C.2 — Reste à faire avant un déploiement (non vérifié dans cette mission)

| # | Contrôle | Pourquoi c'est nécessaire |
|---|---|---|
| 1 | Exécuter `npx vitest run`, `npx nuxt build` et `npx nuxi typecheck` **sur le VPS lui-même** (ou un environnement Linux identique), pas seulement en local macOS | Les modules natifs (`sharp`, moteur Prisma) sont spécifiques à l'OS/architecture (Annexe B.4) |
| 2 | Vérifier la version de Node réellement active sur le VPS (`node -v` via SSH) et confirmer qu'elle correspond bien à 25.9.0 tel que rapporté | Cette mission s'est basée sur une information rapportée, pas sur une lecture directe |
| 3 | Vérifier que `prisma generate` régénère correctement le client sur le VPS après tout changement de dépendances | Le client Prisma est lié à la plateforme de génération |
| 4 | Tester manuellement les parcours critiques en préproduction : inscription, connexion, mot de passe oublié, activation de compte par un admin, consultation des bourses | Couvre les parcours utilisateurs réels, au-delà des tests automatisés (environnement réel : vraie base PostgreSQL, vrai envoi d'email Brevo/SMTP) |
| 5 | Confirmer la configuration `BREVO`/SMTP réelle (IP du VPS autorisée côté Brevo) | Mentionné comme prérequis dans `docs/deploiement-production.md`, non vérifiable depuis le code |
| 6 | Vérifier qu'aucun `ecosystem.config.js` ou configuration Nginx alternative n'existe en dehors de ce qui a été inspecté le 2026-10-22 | Garantir que R1 (Annexe A) reste valide au moment précis du déploiement |

### C.3 — Sauvegarde avant déploiement

| Étape | Commande (sur le VPS, à exécuter manuellement) | Statut |
|---|---|---|
| Sauvegarde de la base PostgreSQL | `pg_dump -U <user> -Fc boursefi > /var/backups/boursefi_$(date +%Y%m%d_%H%M).dump` | **À faire avant chaque déploiement** — non exécuté dans cette mission (pas d'accès VPS) |
| Sauvegarde du répertoire `uploads/` (CNI, attestations) | `tar -czf /var/backups/uploads_$(date +%Y%m%d_%H%M).tar.gz /var/www/BourseFi/uploads` | **À faire** |
| Sauvegarde du `.env` de production | `cp /var/www/BourseFi/.env /var/backups/env_$(date +%Y%m%d_%H%M).bak` (fichier à protéger, ne jamais committer) | **À faire** |
| Relevé de l'état PM2 courant | `pm2 save && cp ~/.pm2/dump.pm2 /var/backups/pm2_dump_$(date +%Y%m%d_%H%M).pm2` | **À faire** |
| Relevé du commit Git actuellement déployé | `git rev-parse HEAD > /var/backups/deployed_commit_$(date +%Y%m%d_%H%M).txt` | **À faire** |

### C.4 — Étapes de déploiement (rappel, aucune exécutée dans cette mission)

1. Sauvegardes (C.3) effectuées et vérifiées (taille de fichier > 0, dump restaurable sur un environnement de test si possible).
2. `git pull` / déploiement du nouveau commit sur le VPS.
3. `npm install` (ou `npm ci` si un lockfile cohérent est maintenu).
4. `npx prisma generate` puis, si le schéma a changé, `npx prisma db push` (ou migration contrôlée selon la stratégie Prisma retenue).
5. `npm run build`.
6. `pm2 restart boursefi` (redémarrage, pas de arrêt/démarrage séparé, pour minimiser la coupure).
7. Vérification immédiate : `pm2 list` (1 instance, statut `online`), `curl -I https://boursefi.sn`, test manuel d'une connexion et d'une consultation de bourse.
8. Surveillance des logs (`pm2 logs boursefi`) pendant les minutes suivant le déploiement.

### C.5 — Retour arrière (rollback)

| Scénario | Procédure |
|---|---|
| Le nouveau code ne démarre pas / erreurs 500 généralisées | `git checkout <commit_précédent>` (relevé en C.3) → `npm install` → `npx prisma generate` → `npm run build` → `pm2 restart boursefi` |
| Le schéma de base de données a été modifié et pose problème | Restaurer le dump PostgreSQL de C.3 : `pg_restore -U <user> -d boursefi --clean /var/backups/boursefi_<horodatage>.dump` **avant** de revenir au code précédent, pour éviter une incohérence schéma/code |
| Fichiers uploadés corrompus/perdus | Restaurer `/var/backups/uploads_<horodatage>.tar.gz` |
| Le retour arrière du code seul ne suffit pas | Restaurer aussi `pm2_dump_<horodatage>.pm2` avec `pm2 resurrect` après avoir remis le code et la base en cohérence |

**Point de vigilance spécifique à cette mission :** si un futur déploiement change l'architecture PM2/Nginx (passage à plusieurs instances), **revérifier R1** (Annexe A.3) et réévaluer l'intégration Redis avant de considérer le rate-limiting comme suffisant.

---

## 8. Risques résiduels

| # | Risque | Gravité | Statut |
|---|---|---|---|
| R1 | Rate-limiting **en mémoire par processus** : contournable en déploiement multi-instances / serverless (chaque instance a son propre compteur) | Moyenne (si multi-instance) | **Accepté, conditionné et vérifié le 2026-10-22** — VPS confirmé mono-instance (PM2 fork, Nginx → un seul `127.0.0.1:3000`). Redevient actif si l'architecture change (Annexe A, A.3) |
| R2 | Constance temporelle (anti-timing énumération) non mesurée | Faible/Moyenne | **À valider en production** |
| R3 | 225 erreurs de type préexistantes (hors périmètre sécurité) | Faible (build OK) | **Non traité** (dette projet) |
| R4 | Listes `COMMON_PASSWORDS`/`FORBIDDEN_FRAGMENTS` courtes (pas de dictionnaire type HIBP/zxcvbn) | Faible | **Accepté** (améliorable) |
| R5 | Avertissement h3 `statusMessage` (compatibilité future) | Négligeable | **Accepté** — sans impact sécurité (§5) |
| R6 | Comportements dépendant de PostgreSQL / email réels | — | **Validation production restant à faire** |
| R7 | Node.js 25.9.0 (production) est une ligne **Current, non-LTS** (fin de vie ~6 mois après sortie), alors que le développement utilise Node 22.12.0 (LTS) | Moyenne (cycle de vie), aucune régression fonctionnelle détectée | **Testé empiriquement en local (80/80 tests + build + boot serveur sous Node 25.9.0, voir Annexe B) — migration vers une LTS recommandée à moyen terme, non urgente** |

---

## 9. Tableau récapitulatif des tests

| Fichier de test | Tests | Réussis | Échoués | Bloqués | Non exécutés |
|---|---|---|---|---|---|
| `tests/security/v1-generated-passwords.test.ts` | 11 | 11 | 0 | 0 | 0 |
| `tests/security/v2-default-password.test.ts` | 6 | 6 | 0 | 0 | 0 |
| `tests/security/v3-forgot-password.test.ts` | 5 | 5 | 0 | 0 | 0 |
| `tests/security/v4-register.test.ts` | 8 | 8 | 0 | 0 | 0 |
| `tests/security/v5-public-apis.test.ts` | 7 | 7 | 0 | 0 | 0 |
| `tests/security/v6-password-policy.test.ts` | 7 | 7 | 0 | 0 | 0 |
| `tests/security/d-complementary.test.ts` | 15 | 15 | 0 | 0 | 0 |
| `tests/unit/password-policy.test.ts` | 21 | 21 | 0 | 0 | 0 |
| **TOTAL** | **80** | **80** | **0** | **0** | **0** |

| Vérification | Commande | Résultat |
|---|---|---|
| Tests | `npx vitest run` | ✅ 80/80 |
| Typecheck (outil) | `npx nuxi typecheck` | ✅ Réparé & exécutable |
| Typecheck (code sécurité) | `npx nuxi typecheck` | ✅ 0 erreur introduite (225 préexistantes, hors périmètre) |
| Build | `npx nuxt build` | ✅ Code de sortie 0 |

---

## 10. État de la mission

- [x] Les 6 vulnérabilités examinées individuellement.
- [x] Corrections réalisables implémentées (déjà présentes dans l'arbre de travail, non écrasées).
- [x] Tests de sécurité écrits et exécutés (80/80 verts).
- [x] Tests de non-régression exécutés et documentés (§7).
- [x] Rapport distinguant corrigé / partiellement validé / risques résiduels.
- [x] Blocage typecheck résolu ; build exécuté et documenté.

**Conclusion :** les 6 vulnérabilités sont **corrigées et vérifiées localement** par des tests automatisés exécutant le code réel de production. Restent à valider **en environnement réel** : la constance temporelle (R2), les comportements dépendant de PostgreSQL et de l'email (R6), et le rate-limiting en déploiement multi-instances (R1). **Aucun déploiement en production n'a été effectué.**

---

## Annexe D — Audit de compatibilité avant déploiement (Phase 3, 2026-10-22)

**Objectif :** vérifier, avant tout déploiement, que les corrections de sécurité ne risquent pas de casser BourseFi actuellement en production ni de supprimer/modifier des données existantes.

**Méthode :** comparaison `git diff` fichier par fichier entre l'arbre de travail et `HEAD` (dernier commit `6267e23`, 2026-10-13 — pris comme référence de « version actuellement déployée », sous réserve que ce soit bien le commit en production, voir D.7). Aucune commande destructive, aucune migration, aucun accès au VPS. Tests et build ré-exécutés localement pour confirmation finale.

### D.1 — Comparaison avec la version actuellement déployée (`HEAD` = `6267e23`)

Fichiers réellement modifiés par la phase de sécurité, avec nature du changement :

| Fichier | Nature du changement | Risque de rupture |
|---|---|---|
| `server/api/auth/login.post.ts` | Ajout limite par email, email normalisé en minuscule + recherche insensible à la casse, comparaison bcrypt factice si utilisateur introuvable | Faible — contrat de réponse (200/401/403/429) inchangé |
| `server/api/auth/register.post.ts` | Réponse publique unique (200, sans `email`/`emailSent`), **suppression de la connexion automatique après inscription**, politique de mot de passe (10 car. min. au lieu de 4) | **Moyen — changement de contrat de réponse et de flux, voir D.2** |
| `server/api/auth/forgot-password.post.ts` | Réponse publique unique (200, sans `emailSent`), jeton haché, envoi email non bloquant | Faible — déjà anti-énumération avant (champ `emailSent` en moins) |
| `server/api/auth/reset-password.post.ts` | Jeton recherché par hash (ancien jeton en clair invalidé), politique de mot de passe (10 car.), `emailVerified: true` ajouté au succès | **Transitoire — voir D.2 (liens envoyés avant déploiement)** |
| `server/api/admin/candidatures/[id]/activer-compte.post.ts` | Plus de mot de passe généré ; **ne modifie plus le mot de passe d'un compte existant** (ancien comportement l'écrasait) ; réponse sans `tempPassword` | Aucun — correction d'un comportement destructeur préexistant, pas une régression |
| `server/api/admin/candidatures/creer-direct.post.ts` | Idem ; `password` du frontend ignoré ; réponse `tempPassword: null` | Aucun |
| `server/api/admin/users/index.post.ts` | Idem ; réponse sans `generatedPassword`, ajout `activationEmailSent` | Aucun (toujours une création, pas de mise à jour d'existant) |
| `server/api/admin/users/[id].patch.ts` | `newPassword` soumis à la politique (10 car. min. au lieu de 4) | Faible — rejette désormais certains mots de passe admin courts (4-9 car.) auparavant acceptés |
| `server/api/bourses.get.ts`, `server/api/bourses/[slug].get.ts` | Nouvelle fonction `serializePublicBourse` : retire `partnerId`, `etablissementContactVerifiedAt`, `programmeSourceType`, `programmeSourceUrl`, `status` des réponses **publiques** uniquement | Faible — voir D.2 (vérifié : aucune page publique ne lit ces champs) |
| `server/api/etablissements.get.ts` | Retire `status`, `contactVerifiedAt`, `source` ; réduit `contacts` à 5 champs publics, filtre les contacts inactifs | Faible — idem, vérifié sans usage public |
| `server/utils/bourse-serialize.ts` | Ajout de `serializePublicBourse`/`toPublicContact`/`toPublicTarif` ; **`serializeBourse` existant (utilisé par admin/partenaire) est inchangé** | Aucun pour admin/partenaire |
| `server/utils/rate-limit.ts` | Ajout de `rateLimitKey` (limite par email, en plus de la limite par IP existante) | Aucun — purement additif |
| `server/utils/one-time-token.ts` (nouveau) | Nouveau module, aucun fichier existant cassé par son ajout | Aucun |
| `shared/password-policy.ts` (nouveau) | Nouveau module | Aucun |
| `app/pages/admin/candidatures.vue`, `app/pages/admin/users.vue`, `app/pages/auth/register.vue`, `app/pages/auth/reset-password.vue`, `app/pages/postuler/[slug].vue` | Mis à jour en cohérence avec les nouveaux contrats de réponse ci-dessus (plus de lecture de `password`/`tempPassword`/`generatedPassword`/`emailSent`) | Aucun — vérifié champ par champ, voir D.2 |

**Fichiers confirmés NON modifiés (donc non concernés par ce risque) :** `prisma/schema.prisma` (aucune migration), `server/utils/email.ts`, `server/utils/csrf.ts`, `server/api/paiements*`, `server/api/candidatures.get.ts`, pages `app/pages/etudiant/**`. Confirmé par `git diff --stat HEAD` : sortie vide pour chacun.

### D.2 — Parcours vérifiés : inscription, connexion, candidature, paiement, envoi d'e-mails

| Parcours | Ce qui a changé | Vérification effectuée | Résultat |
|---|---|---|---|
| **Inscription** | Plus de connexion automatique après inscription ; réponse `{ ok, message }` au lieu de `{ ok, email, emailSent, message }` | Diff de `app/pages/auth/register.vue` : le code ne lit plus `response.email`/`response.emailSent`, affiche `response.message` tel quel, ne tente plus d'auto-connexion | ✅ Cohérent — pas de champ manquant lu côté frontend |
| **Candidature aux bourses (inscription inline pendant la candidature)** | **Changement de flux réel** : l'étudiant qui s'inscrit *pendant* sa candidature (`postuler/[slug].vue`) n'est plus automatiquement connecté ni renvoyé à la suite du formulaire | Diff de `postuler/[slug].vue` : l'ancien code appelait `afterAuthSuccess()` (supposant une session) ; le nouveau bascule en mode « connexion » et affiche un message demandant de vérifier l'email avant de revenir finaliser la candidature | ✅ Cohérent techniquement, **mais changement d'expérience utilisateur réel à communiquer** (voir D.6) |
| **Connexion** | Email normalisé + recherche insensible à la casse ; limite par email ajoutée | Tests D.3.1–D.3.3 (§7) ; `git diff` confirme le contrat de réponse (200/401/403) inchangé | ✅ Pas de régression testée |
| **Paiement** | **Aucune modification** | `git diff --stat HEAD -- server/api/paiements*` → vide | ✅ Hors périmètre, zéro risque de cette phase |
| **Envoi d'e-mails** | `server/utils/email.ts` (Brevo/SMTP) **inchangé** ; seuls les *contenus* des emails d'activation/réinitialisation changent (lien à jeton au lieu d'un mot de passe en clair) | `git diff --stat HEAD -- server/utils/email.ts` → vide ; contenu des templates vérifié dans §6 (V1, V3) | ✅ Mécanisme d'envoi intact, contenu mis à jour intentionnellement |
| **Activation de compte (admin)** | Ne modifie plus le mot de passe d'un compte **existant** (ancien bug corrigé) | Test V1.10 (§6) ; diff D.1 | ✅ Comportement plus sûr, pas de régression |

### D.3 — Compatibilité Prisma / PostgreSQL de production — aucune migration nécessaire

- **`prisma/schema.prisma` n'a reçu aucune modification** (`git diff --stat HEAD -- prisma/` vide) : aucune colonne ajoutée, supprimée ou retypée.
- Le projet n'utilise pas de dossier `prisma/migrations/` (confirmé absent) : le schéma est appliqué via `prisma db push`, qui n'a rien à appliquer puisque le schéma n'a pas changé.
- Toutes les colonnes utilisées par le nouveau code (`resetPasswordToken`, `resetPasswordExpires`, `emailVerified`, `emailVerificationToken`) **existaient déjà** et étaient déjà utilisées par l'ancien code (seule la *valeur* stockée dans `resetPasswordToken` change de nature : un hash SHA-256 au lieu d'un jeton en clair — même type de colonne `String?`, aucune contrainte de taille affectée).
- **Conséquence pour `npx prisma generate`/`db push` en production :** aucune action nécessaire, aucun risque de perte de colonne/table.

### D.4 — Risque identifié : jetons de réinitialisation en clair émis avant le déploiement

**Le seul effet de bord sur des données existantes identifié :** si un utilisateur a demandé une réinitialisation de mot de passe (`/forgot-password`) **avant** le déploiement de cette correction, le jeton qui lui a été envoyé par email est stocké **en clair** dans `resetPasswordToken` (ancien format). Après déploiement, `reset-password.post.ts` recherche désormais `resetPasswordToken` par **hash SHA-256** du jeton reçu — un jeton en clair pré-existant en base ne correspondra à aucun hash recherché.

- **Pas de perte de données** : la ligne `resetPasswordToken`/`resetPasswordExpires` reste en base, juste invalide pour ce mécanisme ; l'utilisateur peut simplement refaire une demande « mot de passe oublié » après déploiement.
- **Impact réel :** transitoire, limité aux liens de réinitialisation envoyés dans l'heure précédant le déploiement (durée de vie `RESET_TOKEN_TTL_MS` = 1 h) et pas encore utilisés. Aucun impact sur les liens d'activation déjà utilisés ou sur les comptes eux-mêmes.
- **Recommandation :** déployer de préférence en dehors d'une période de forte demande de réinitialisation, ou prévenir que les liens « mot de passe oublié » envoyés juste avant la mise à jour doivent être redemandés après coup.

### D.5 — Autre point de vigilance identifié (non exécutable sans accès à la base de production)

Les recherches par email sont désormais **insensibles à la casse** (`mode: 'insensitive'`) dans : `login.post.ts`, `register.post.ts`, `forgot-password.post.ts`, `activer-compte.post.ts`, `creer-direct.post.ts`, `admin/users/index.post.ts`. La colonne `User.email` porte une contrainte `@unique` **sensible à la casse** (index Postgres standard) : rien n'empêche, en théorie, que deux lignes diffèrent uniquement par la casse (ex. `Jean@mail.com` et `jean@mail.com`) si une telle paire a été créée par le passé via un chemin de code antérieur à la normalisation systématique.

- **Si une telle paire existe**, les nouvelles recherches insensibles à la casse ne sélectionneront qu'**une seule** des deux lignes (comportement de `findFirst`, non déterministe sans `orderBy` explicite), ce qui pourrait faire percevoir à l'un des deux titulaires qu'il n'a plus de compte lors d'une connexion avec la casse qu'il utilisait auparavant.
- **Cette vérification n'a pas pu être effectuée** : elle nécessite un accès en lecture à la base PostgreSQL de production, qui n'a pas été sollicité dans le cadre de cette mission.
- **Recommandation avant déploiement (requête de lecture seule, à exécuter par vous ou votre DBA) :**
  ```sql
  SELECT lower(email) AS email_normalise, count(*) 
  FROM "User" 
  GROUP BY lower(email) 
  HAVING count(*) > 1;
  ```
  Si cette requête renvoie 0 ligne, le risque est écarté. Si elle renvoie des lignes, les comptes concernés sont à identifier et fusionner/renommer manuellement **avant** le déploiement.

### D.6 — Changement d'expérience utilisateur à communiquer (pas un bug)

Le parcours **candidature aux bourses avec inscription inline** change réellement de comportement : un étudiant qui créait un compte *pendant* sa candidature pouvait auparavant continuer immédiatement (session automatique). Désormais, il doit **vérifier son email avant de revenir finaliser sa candidature**. C'est une conséquence volontaire de la correction V4 (anti-énumération) et non une régression technique, mais c'est un changement opérationnel que l'équipe support/communication devrait connaître avant le déploiement, pour anticiper d'éventuelles questions d'étudiants.

### D.7 — Compatibilité Node.js VPS/dev — déjà traitée (Annexe B), rappel

La vérification de compatibilité entre Node 25.9.0 (production, rapporté) et Node 22.12.0 (développement) a été effectuée en Annexe B : 80/80 tests et build identiques sous les deux versions, serveur buildé démarré avec succès sous Node 25.9.0 en local (HTTP 200, aucun échec de module natif). Limite rappelée : testé sur macOS arm64 local, pas sur l'OS/architecture réelle du VPS (Annexe B.4, Annexe C.2).

**Hypothèse à vérifier explicitement avant déploiement :** cette Annexe D suppose que le commit `6267e23` (`HEAD`) est bien celui actuellement déployé sur le VPS. Cela n'a pas été confirmé par une lecture directe du VPS dans le cadre de cette mission (ex. `git -C /var/www/BourseFi rev-parse HEAD` sur le serveur). Si le VPS exécute un commit différent, cette comparaison devrait être refaite contre le commit réel.

### D.8 — Récapitulatif des vérifications de cette phase

| # | Vérification demandée | Statut | Preuve |
|---|---|---|---|
| 1 | Comparaison avec la version déployée | ✅ Faite (`git diff HEAD`, fichier par fichier) | D.1 — sous réserve de D.7 |
| 2 | Parcours inscription/connexion/candidature/paiement/email | ✅ Vérifiés (diff + tests existants) | D.2 |
| 3 | Compatibilité Prisma/PostgreSQL, migrations destructives | ✅ Aucune migration, aucun changement de schéma | D.3 |
| 4 | Suppression/modification de données existantes | ⚠️ Un effet de bord transitoire identifié (jetons de reset en clair pré-déploiement) ; aucune perte de données | D.4 |
| 5 | Variables d'environnement, routes API, Node.js | ✅ Aucune nouvelle variable requise (`NUXT_PUBLIC_SITE_URL` seule, déjà existante) ; aucune route renommée/supprimée ; Node.js déjà traité en Annexe B | D.3 (routes), D.7, Annexe B |
| 6 | Tests exécutés | ✅ 80/80 (`npx vitest run`), build ✅ (`npx nuxt build`, exit 0) | Ré-exécutés le 2026-10-22 |
| 7 | Déploiement, migration, suppression | ✅ Aucun effectué | — |

**Conclusion de cette phase :** aucune régression fonctionnelle détectée sur les parcours demandés ; aucune migration destructive n'est nécessaire ; le seul effet de bord sur des données existantes est transitoire et sans perte (D.4). Deux vérifications restent à faire **avant** le déploiement : confirmer l'absence de doublons d'email insensibles à la casse en base réelle (D.5, requête SQL fournie, lecture seule) et confirmer que `6267e23` est bien le commit actuellement en production (D.7).

---

## Annexe E — Vérifications finales avant déploiement (Phase 4, 2026-10-22)

**Règle appliquée pendant cette phase :** aucune modification de code, aucune commande d'écriture, aucun accès destructeur, aucun déploiement. Toutes les actions ci-dessous sont des lectures (git, fichiers locaux, ou tentatives de connexion explicitement limitées à la base **locale/test**, jamais la production).

### E.1 — Vérification de la requête SQL de détection de doublons (Annexe D.5)

**Requête retrouvée dans `docs/rapport-securite.md`, Annexe D.5 :**
```sql
SELECT lower(email) AS email_normalise, count(*) 
FROM "User" 
GROUP BY lower(email) 
HAVING count(*) > 1;
```

**Vérification de la logique :** correcte. La colonne `email` porte une contrainte `@unique` **sensible à la casse** (confirmé dans `prisma/schema.prisma:229`) — deux lignes ne peuvent donc être identiques caractère pour caractère, mais peuvent différer uniquement par la casse (ex. `Jean@Mail.com` / `jean@mail.com`). `GROUP BY lower(email) HAVING count(*) > 1` isole exactement ces groupes : toute ligne retournée correspond nécessairement à au moins deux adresses qui ne diffèrent que par la casse.

**Test de syntaxe effectué (sur la base LOCALE/TEST uniquement, PAS la production) :**
```
npx prisma db execute --schema prisma/schema.prisma --stdin <<'SQL'
SELECT lower(email) AS email_normalise, count(*) FROM "User" GROUP BY lower(email) HAVING count(*) > 1;
SQL
→ "Script executed successfully."
```
Ceci confirme uniquement que la requête est **syntaxiquement valide** pour PostgreSQL via Prisma. La base interrogée est `postgresql://localhost:5432/boursefi` (valeur de `DATABASE_URL` dans le `.env` local, confirmée par introspection `prisma db pull`) — **une base locale de développement, sans aucun rapport avec la production**. Aucune conclusion sur les données de production ne peut être tirée de ce test.

**Accès à la base de production : absent.** Aucune chaîne de connexion vers une base PostgreSQL de production n'est configurée dans cet environnement, et aucun accès SSH au VPS n'est disponible depuis cet environnement. **Ce contrôle n'a donc PAS été effectué sur les données réelles de production.** Je ne prétends pas qu'il l'a été.

**Comment l'exécuter vous-même, en lecture seule, sur la production :**

1. Connectez-vous au VPS : `ssh <utilisateur>@<ip_vps>`
2. Lancez `psql` avec les identifiants de production (ceux de `DATABASE_URL` dans le `.env` de production) :
   ```bash
   psql "$DATABASE_URL" -c "SELECT lower(email) AS email_normalise, count(*) FROM \"User\" GROUP BY lower(email) HAVING count(*) > 1;"
   ```
3. **Protection supplémentaire recommandée** (défense en profondeur, en plus du fait qu'un `SELECT` seul n'écrit rien) :
   ```sql
   BEGIN TRANSACTION READ ONLY;
   SELECT lower(email) AS email_normalise, count(*) FROM "User" GROUP BY lower(email) HAVING count(*) > 1;
   ROLLBACK;
   ```
   `READ ONLY` fait échouer toute requête d'écriture accidentelle dans la même session.
4. **Variante ne retournant qu'un nombre, sans aucune adresse email** (recommandée si le résultat doit être communiqué sans exposer de données personnelles) :
   ```sql
   SELECT count(*) AS groupes_de_doublons
   FROM (SELECT lower(email) FROM "User" GROUP BY lower(email) HAVING count(*) > 1) t;
   ```
   Un résultat de `0` écarte le risque ; un résultat `> 0` signale des comptes à examiner manuellement (par vous, avec accès aux données) avant le déploiement.

**Statut : ⚠️ non vérifié sur la production — requête prête, syntaxe validée, accès manquant.**

### E.2 — Commit des corrections de sécurité vs commit déployé sur le VPS

**Constat : aucun commit ne contient actuellement les corrections de sécurité.** `git log --oneline -5` confirme que `HEAD` (`6267e23b75cfc14543bc961d19e40c5c45a8ac46`, 2026-10-13) est le dernier commit existant. Toutes les corrections (6 vulnérabilités + tests) sont des **modifications non committées de l'arbre de travail**, confirmées par `git status` et `git diff --stat HEAD` (20 fichiers suivis modifiés, 4 nouveaux fichiers/dossiers non suivis : `server/utils/one-time-token.ts`, `shared/password-policy.ts`, `tests/`, `vitest.config.ts`).

**Conséquence directe :** il n'existe pas de « commit des corrections de sécurité » à comparer au commit déployé sur le VPS — il faudra d'abord **créer ce commit** avant de pouvoir le déployer. Je n'ai pas créé ce commit moi-même, conformément à la règle « ne modifie pas le code pendant cette phase de vérification » (créer un commit fige l'historique git, ce qui sort du périmètre d'une vérification en lecture seule).

**Comparaison avec le commit actuellement déployé sur le VPS : impossible depuis cet environnement.** Aucun accès SSH au VPS n'est disponible ici ; le hash du commit réellement en production n'a jamais été communiqué dans cette conversation (seuls l'état PM2 et la configuration Nginx l'ont été, pas de hash git). **Je ne suppose pas que `6267e23` est ce qui est déployé** — c'est une hypothèse à vérifier, pas un fait établi.

**Pour confirmer vous-même :**
```bash
# Sur le VPS :
git -C /var/www/BourseFi rev-parse HEAD

# En local, à comparer :
git rev-parse HEAD   # = 6267e23b75cfc14543bc961d19e40c5c45a8ac46
```
Si les deux hash correspondent, la comparaison faite en Annexe D (contre `HEAD` local) est bien pertinente pour la production. Sinon, elle doit être refaite contre le commit réellement déployé.

**Fichiers modifiés et nature fonctionnelle des changements :** liste complète déjà détaillée en Annexe D.1 (20 fichiers suivis + 4 ajouts). Diffstat : `20 files changed, 937 insertions(+), 331 deletions(-)` (hors `tests/`, non suivi par `git diff --stat HEAD` car nouveau).

**Les 80 tests et le build concernent-ils le code exact à déployer ?** Oui, directement : `tests/helpers/server.ts` importe et exécute les fichiers sources réels de `server/api/**` (pas une copie ni une réimplémentation), et `npx nuxt build` compile l'arbre de travail actuel. Comme aucun fichier n'a changé entre les exécutions de tests de cette session et maintenant (`git status` identique), les résultats « 80/80 » et « build exit 0 » réexécutés ci-dessous portent bien sur le code qui serait déployé **si un commit était créé à partir de l'état actuel sans modification supplémentaire**.

**Ré-exécution de confirmation (2026-10-22) :**
```
npx vitest run   → Test Files 8 passed (8) ; Tests 80 passed (80)
npx nuxt build   → exit code 0, "✨ Build complete!"
```

**Migration Prisma / variable d'environnement supplémentaire :** aucune des deux. Confirmé à nouveau : `git diff --stat HEAD -- prisma/` vide (aucun changement de schéma) ; seule variable utilisée par le code modifié, `NUXT_PUBLIC_SITE_URL`, déjà présente dans `.env.example` et déjà utilisée avant cette phase de sécurité (voir Annexe D.3).

### E.3 — Fonctionnalités sensibles : récapitulatif final

| Parcours | Vérifié | Régression détectée | Communication nécessaire |
|---|---|---|---|
| Inscription + vérification email | ✅ Code + tests V4, D.3.4 | Aucune | Non |
| Connexion + réinitialisation mot de passe | ✅ Code + tests V1, V3, V6, D.2, D.3 | Aucune | Non |
| Candidature à une bourse (dont inscription inline) | ✅ Code (`postuler/[slug].vue` diff) | Aucune techniquement | **Oui** — l'étudiant ne reprend plus automatiquement sa candidature après inscription inline, doit vérifier son email d'abord (Annexe D.6) |
| Paiement et confirmation | ✅ `git diff --stat HEAD -- server/api/paiements*` → vide | Aucune (hors périmètre, fichiers non touchés) | Non |
| Envoi des e-mails (Brevo/SMTP) | ✅ `server/utils/email.ts` inchangé, contenu des templates vérifié (§6) | Aucune sur le mécanisme d'envoi | Non (changement de contenu attendu : lien au lieu de mot de passe) |
| Accès aux candidatures et données des étudiants existants | ✅ `server/api/candidatures.get.ts` et `app/pages/etudiant/**` inchangés (`git diff --stat` vide) | Aucune | Non |

### E.4 — Protection des données : risques confirmés vs théoriques

| Question | Statut | Détail |
|---|---|---|
| Suppression de données existantes | **Confirmé : non** | Aucune requête `delete`/`drop` ajoutée ; aucune migration ; `session.deleteMany` sur reset-password est un comportement préexistant inchangé |
| Modification de données existantes | **Confirmé : un seul cas, positif** | L'ancien `activer-compte` écrasait le mot de passe d'un compte existant ; le nouveau code ne le fait plus (correction, pas régression — Annexe D.1) |
| Blocage de comptes existants | **Confirmé : non introduit** | Le contrôle `emailVerified` → 403 à la connexion **existait déjà** avant cette phase (hors du diff de `login.post.ts`) ; la politique de mot de passe ne s'applique qu'à la création/au changement de mot de passe, jamais à la connexion — un compte avec un mot de passe court créé avant cette phase continue de se connecter normalement |
| Invalidation de liens envoyés avant déploiement | **Confirmé : oui, transitoire** | Les jetons « mot de passe oublié » en clair envoyés dans l'heure précédant le déploiement cesseront de fonctionner (Annexe D.4) ; aucune perte de données, l'utilisateur redemande simplement un lien |
| Erreurs d'authentification ou de candidature | **Théorique, non confirmé** | Dépend de l'existence de doublons d'email ne différant que par la casse en production (E.1) — requête prête, non exécutée sur la production |
| Problèmes liés à la configuration actuelle du serveur | **Confirmé sans blocage** (mono-instance vérifié, Node 25.9.0 fonctionnel en test local) + **théorique restant** (comportement des modules natifs non vérifié directement sur l'OS/l'architecture du VPS, Annexe B.4) | Rate-limiting : vérifié mono-instance le 2026-10-22 (Annexe A.1.bis) ; Node.js : testé fonctionnellement compatible en local macOS, pas sur le VPS Linux lui-même |

### E.5 — Tableau récapitulatif final

| Contrôle effectué | Résultat observé | Preuve / test disponible | Risque restant | Action recommandée |
|---|---|---|---|---|
| Doublons d'email insensibles à la casse en production | **Non vérifié** — pas d'accès à la base de production | Requête SQL fournie et validée syntaxiquement sur base locale (E.1) | Théorique, impact limité (connexion d'un compte minoritaire) si doublons existent | Exécuter la requête de comptage (E.1, point 4) via `psql` sur le VPS avant déploiement |
| Commit contenant les corrections de sécurité | **Inexistant** — modifications non committées | `git status`, `git log` (E.2) | Aucun déploiement possible sans créer d'abord ce commit | Créer le commit (hors périmètre de cette vérification), puis le déployer explicitement |
| Commit actuellement déployé sur le VPS | **Non vérifié depuis cet environnement** | Aucun accès SSH disponible ici | Comparaison Annexe D faite contre `HEAD` local, pertinence à confirmer | Exécuter `git -C /var/www/BourseFi rev-parse HEAD` sur le VPS et comparer à `6267e23` |
| Fichiers modifiés et nature fonctionnelle | ✅ Fait | `git diff --stat HEAD`, Annexe D.1 (20 fichiers, +937/-331) | Aucun | — |
| 80 tests + build sur le code exact à déployer | ✅ Confirmé | Ré-exécutés le 2026-10-22 : 80/80, build exit 0 | Aucun, sous réserve qu'aucun fichier ne change avant la création du commit | Créer le commit immédiatement après cette vérification, sans modification intermédiaire |
| Migration Prisma nécessaire | ✅ Aucune | `git diff --stat HEAD -- prisma/` vide | Aucun | — |
| Nouvelle variable d'environnement nécessaire | ✅ Aucune | Grep exhaustif des `process.env.*` dans le code modifié (Annexe D.3) | Aucun | — |
| Parcours sensibles (inscription, connexion, candidature, paiement, email, accès étudiant) | ✅ Tous vérifiés | §6, §7, Annexe D.2, E.3 | UX : candidature avec inscription inline change de flux (communication requise) | Informer l'équipe support avant déploiement (Annexe D.6) |
| Suppression/modification/blocage de données existantes | ✅ Analysé | Annexe D.4, E.4 | Un effet transitoire confirmé (liens reset pré-déploiement), aucune perte | Communiquer sur le renouvellement des liens de réinitialisation si déploiement en période de forte demande |
| Compatibilité Node.js VPS (25.9.0) / dev (22.12.0) | ✅ Testé fonctionnellement (local) | Annexe B — 80/80 + build + démarrage serveur sous Node 25.9.0 | Non testé sur l'OS/architecture réelle du VPS (modules natifs `sharp`/Prisma) | Exécuter au minimum `node .output/server/index.mjs` et un `curl` de test directement sur le VPS après build, avant bascule complète |
| Rate-limiting mono-instance | ✅ Vérifié sur le VPS le 2026-10-22 | Annexe A.1.bis | Redevient actif si l'architecture change | Revérifier si l'architecture PM2/Nginx change |

### E.6 — Conclusion

**PRÊT SOUS RÉSERVE.**

Aucune régression fonctionnelle confirmée, aucune migration destructive, aucune perte de données identifiée, et les 80 tests + le build portent bien sur le code qui serait déployé. Mais trois vérifications **précises et non optionnelles** restent à effectuer avant un déploiement, car elles n'ont pas pu être réalisées depuis cet environnement (absence d'accès) :

1. **Exécuter la requête de détection de doublons d'email (E.1)** sur la base de production réelle (lecture seule, `psql`, quelques secondes).
2. **Créer le commit git** contenant ces corrections (actuellement à l'état de modifications non committées) — sans quoi il n'y a rien de précis à déployer.
3. **Confirmer le commit réellement actif sur le VPS** (`git -C /var/www/BourseFi rev-parse HEAD`) pour s'assurer que la comparaison de cette Annexe (faite contre `6267e23` local) est bien pertinente.

Aucune de ces trois actions ne nécessite d'écriture sur la production ni de risque pour les données ; elles sont bloquantes uniquement parce qu'elles n'ont pas pu être vérifiées depuis cet environnement, pas parce qu'un problème a été détecté.

---

## Annexe F — Préparation du déploiement : procédures prêtes, non exécutées (Phase 5, 2026-10-22)

**Règle appliquée :** aucune commande d'écriture sur le VPS ou la base de production n'a été exécutée. Seule l'étape F.1 (purement locale, en lecture) a été ré-exécutée pour confirmation. Les étapes F.2 à F.4 sont des **procédures prêtes à l'emploi**, à exécuter par vous (ou avec votre autorisation explicite), pas par cet assistant qui n'a pas d'accès au VPS ni à la base de production.

### F.1 — Confirmation locale (exécutée)

| Commande | Objectif | Résultat obtenu (2026-10-22) |
|---|---|---|
| `git status --short` | Lister tous les fichiers suivis modifiés et non suivis | 20 fichiers suivis modifiés + 4 chemins non suivis (`docs/rapport-securite.md`, `server/utils/one-time-token.ts`, `shared/password-policy.ts`, `tests/`, `vitest.config.ts`) — liste identique à toutes les vérifications précédentes de cette mission |
| `git diff --stat HEAD` | Mesurer l'ampleur du changement par rapport au dernier commit | `20 files changed, 937 insertions(+), 331 deletions(-)` |
| `npx vitest run` | Ré-exécuter la suite de tests sur l'état actuel | ✅ `Test Files 8 passed (8)` / `Tests 80 passed (80)` |
| `npx nuxt build` | Ré-exécuter le build sur l'état actuel | ✅ code de sortie 0, `✨ Build complete!` |

**Aucune dérive détectée** depuis la dernière vérification de cette mission : même liste de fichiers, mêmes résultats de tests et de build.

### F.2 — Procédure : identifier le commit réellement déployé sur le VPS (lecture seule, aucun redémarrage)

À exécuter **par vous**, via SSH sur le VPS :

| Commande | Objectif | Résultat attendu |
|---|---|---|
| `ssh <utilisateur>@<ip_vps>` | Ouvrir une session sur le VPS | Invite de commande distante |
| `cd /var/www/BourseFi` | Se placer dans le répertoire du projet (chemin du guide de déploiement) | Changement de répertoire silencieux |
| `git status --short` | Vérifier qu'il n'y a **aucune modification non committée directement sur le VPS** (signe d'un correctif manuel fait hors git, à ne jamais écraser sans l'avoir d'abord sauvegardé) | Idéalement vide. Si non vide → s'arrêter et m'en informer avant toute autre étape |
| `git rev-parse HEAD` | Obtenir le hash exact du commit actuellement checkouté | Un hash de commit (40 caractères), à comparer à `6267e23b75cfc14543bc961d19e40c5c45a8ac46` (HEAD local actuel) |
| `git log -1 --format="%H %ci %s"` | Contexte humain : date et message du commit déployé | Une ligne avec hash, date, message |
| `git branch --show-current` | Confirmer la branche réellement déployée | `main` (attendu) |
| `pm2 describe boursefi \| grep -iE "exec cwd\|script path\|instances\|exec mode\|status"` | Confirmer que le processus PM2 réellement actif tourne bien depuis ce répertoire, en mode fork, une instance — sans redémarrer ni recharger quoi que ce soit (`describe` est une lecture de l'état interne de PM2) | `exec mode: fork_mode`, `instances: 1`, chemin cohérent avec `/var/www/BourseFi/.output/server` |

**Aucune de ces commandes ne modifie un fichier ni ne redémarre un processus.** `git status`/`rev-parse`/`log`/`branch` sont des lectures pures de l'historique git ; `pm2 describe` interroge l'état du démon PM2 sans effet de bord (contrairement à `pm2 restart`/`reload`/`reset`, qu'il ne faut PAS utiliser ici).

**Ce que je ferai du résultat :** si le hash correspond à `6267e23`, la comparaison de l'Annexe D reste valide telle quelle. S'il diffère, je referai le diff ciblé contre ce commit précis avant d'aller plus loin.

### F.3 — Procédure : vérification des doublons d'email, strictement en lecture seule, sans donnée personnelle

À exécuter **par vous**, sur le VPS, après l'étape F.2 :

| Commande | Objectif | Résultat attendu |
|---|---|---|
| `grep '^DATABASE_URL=' .env \| sed -E 's#://[^@]*@#://***:***@#'` | Visualiser la cible de connexion **sans exposer les identifiants** à l'écran/dans un historique | Une ligne du type `DATABASE_URL="postgresql://***:***@<host>:5432/<db>"` |
| Lancer `psql` avec cette URL (voir bloc ci-dessous) | Exécuter la vérification en lecture stricte | Un seul nombre, aucune adresse email |

Bloc à exécuter tel quel (copier-coller) :
```bash
psql "$(grep '^DATABASE_URL=' .env | cut -d'=' -f2- | tr -d '"')" <<'SQL'
BEGIN TRANSACTION READ ONLY;
SELECT count(*) AS groupes_de_doublons
FROM (SELECT lower(email) FROM "User" GROUP BY lower(email) HAVING count(*) > 1) t;
ROLLBACK;
SQL
```
- `BEGIN TRANSACTION READ ONLY` fait **échouer toute commande d'écriture** si une venait à être tapée par erreur dans la même session — défense en profondeur, en plus du fait que la requête elle-même est un `SELECT` pur.
- `ROLLBACK` referme la transaction sans rien valider (même une transaction en lecture seule n'a rien à valider, mais ferme proprement la session).
- La requête ne renvoie qu'un **nombre** (`groupes_de_doublons`), jamais une adresse email.

**Ce qu'il faut me communiquer :** uniquement ce nombre. **Ne me transmettez aucune adresse email.** Si le résultat est `0`, le risque théorique identifié en Annexe D.5/E.1 est écarté. S'il est `> 0`, n'allez pas plus loin de votre côté sans m'en informer : nous déciderons ensemble s'il faut identifier et traiter ces comptes avant le déploiement.

### F.4 — Procédure de commit et de déploiement réversible (préparée, NON exécutée)

**Rien ci-dessous n'a été exécuté.** Chaque bloc est présenté avec son objectif et le résultat attendu ; j'attends votre autorisation explicite, étape par étape, avant d'exécuter quoi que ce soit qui touche le VPS ou la base de production. La création du commit local (F.4.a) peut être faite dès que vous le souhaitez, indépendamment du reste — elle ne touche que ce dépôt local.

#### F.4.a — Création du commit (local uniquement, aucun impact VPS)

| Commande | Objectif | Résultat attendu |
|---|---|---|
| `git add app/ server/ shared/ tests/ vitest.config.ts docs/rapport-securite.md` | Indexer les fichiers de la correction de sécurité (et sa documentation), sans `package-lock.json`/`package.json` traités séparément si vous préférez un commit distinct pour les dépendances (`typescript`/`vue-tsc`) | Fichiers indexés, visibles via `git status` |
| `git status` | Vérifier précisément ce qui sera committé avant de valider | Liste des fichiers indexés, à relire attentivement |
| `git commit -m "fix(security): corrige 6 vulnérabilités (mots de passe, énumération, API publiques, politique de mot de passe)"` *(message indicatif, à ajuster avec vous)* | Créer le commit | Un nouveau hash de commit, enfant de `6267e23` |
| `git log --oneline -3` | Confirmer la création | Le nouveau commit apparaît en tête |

#### F.4.b — Sauvegarde sur le VPS, AVANT tout déploiement (non exécutée)

| Commande | Objectif | Résultat attendu |
|---|---|---|
| `pg_dump -U <user> -Fc boursefi > /var/backups/boursefi_$(date +%Y%m%d_%H%M).dump` | Sauvegarde complète de la base PostgreSQL de production | Fichier `.dump` non vide |
| `tar -czf /var/backups/uploads_$(date +%Y%m%d_%H%M).tar.gz /var/www/BourseFi/uploads` | Sauvegarde des fichiers uploadés (CNI, attestations) | Archive `.tar.gz` non vide |
| `cp /var/www/BourseFi/.env /var/backups/env_$(date +%Y%m%d_%H%M).bak` | Sauvegarde de la configuration de production | Copie du `.env` |
| `pm2 save && cp ~/.pm2/dump.pm2 /var/backups/pm2_dump_$(date +%Y%m%d_%H%M).pm2` | Sauvegarde de l'état PM2 courant | Copie du dump PM2 |
| `git -C /var/www/BourseFi rev-parse HEAD > /var/backups/deployed_commit_$(date +%Y%m%d_%H%M).txt` | Noter le commit exact avant bascule, pour un retour arrière précis | Fichier texte avec le hash actuel |

#### F.4.c — Déploiement (non exécuté — nécessitera votre autorisation explicite, commande par commande)

| Commande | Objectif | Résultat attendu |
|---|---|---|
| `git fetch && git checkout <nouveau_commit_ou_branche>` | Faire passer le VPS sur le code corrigé | Working tree du VPS sur le nouveau commit |
| `npm install` | Installer les dépendances (dont `typescript`/`vue-tsc` ajoutés) | Installation sans erreur |
| `npx prisma generate` | Régénérer le client Prisma (schéma inchangé, mais client à relier à la nouvelle version) | Génération réussie |
| `npm run build` | Construire l'application | `✨ Build complete!` |
| `pm2 restart boursefi` | Bascule effective (redémarrage, pas arrêt/démarrage séparé) | PM2 `status: online`, nouvelle instance |
| `pm2 list` puis `curl -I https://boursefi.sn` | Vérification immédiate post-déploiement | 1 instance `online`, `HTTP/2 200` |

#### F.4.d — Retour arrière (rollback), rappel (déjà détaillé en Annexe C.5)

| Scénario | Commande | Objectif |
|---|---|---|
| Code en échec | `git checkout <hash_noté_en_F.4.b>` puis réinstaller/rebuilder/`pm2 restart` | Revenir au code précédent |
| Base incohérente | `pg_restore -U <user> -d boursefi --clean /var/backups/boursefi_<horodatage>.dump` | Revenir à l'état de données précédent |
| Fichiers uploadés perdus | Extraire `/var/backups/uploads_<horodatage>.tar.gz` | Restaurer les fichiers |

### F.5 — État à ce stade

Aucune commande des sections F.2, F.3, F.4.b et F.4.c n'a été exécutée. Seule F.1 (locale, lecture) a été effectuée. **En attente de votre retour** avant toute étape suivante impliquant le VPS ou la base de production, et avant la création du commit (F.4.a) si vous souhaitez d'abord valider son contenu exact avec moi.

---

## Annexe G — Découverte et analyse du script de déploiement réel : `deploy.sh` (Phase 6, 2026-10-22)

**Constat important : un fichier de déploiement automatisé existe et n'avait pas été identifié dans les phases précédentes.** Les recherches antérieures (Annexe A) cherchaient `ecosystem*.config*`, `Dockerfile*`, `docker-compose*`, `.github/workflows` — toutes absentes — mais pas le motif `deploy*.sh`. Une recherche élargie l'a trouvé. Cette annexe corrige et complète l'Annexe A/F en conséquence. **Lecture seule effectuée ; rien n'a été exécuté, modifié, ni déployé.**

### G.1 — Localisation exacte

| Élément | Valeur |
|---|---|
| Chemin local (ce dépôt) | `/Users/mac/BourseFi/deploy.sh` (racine du projet) |
| Chemin probable sur le VPS | `/var/www/BourseFi/deploy.sh` (même arborescence que `docs/deploiement-production.md`, **non confirmé par une lecture directe du VPS**) |
| Suivi par git ? | Oui — `git log --follow -- deploy.sh` → 3 commits : `795f47d` (création, « ajout de deploy.sh pour mises à jour en une commande »), `49e5eb2` (ajout temporaire d'une étape d'import), `330bd5e` (retrait de cette étape, 2026-09-19) |
| Modifié par les corrections de sécurité ? | **Non** — `git status --short -- deploy.sh` vide : fichier identique à `HEAD`, aucune modification en cours |
| Permissions | `-rwxr-xr-x` (exécutable) |
| Référencé dans `docs/deploiement-production.md` ou `README.md` ? | **Non, aucune mention.** Seul l'historique git révèle son existence et son rôle — c'est un script d'astreinte non documenté en prose |

### G.2 — Contenu intégral (reproduit pour traçabilité)

```bash
#!/bin/bash
# Script de Mise à Jour Automatique du Serveur BourseFi (Production)
set -e

echo "🚀 [BourseFi] Mise à jour du serveur en cours..."

# 1. Pull la dernière version depuis GitHub
echo "📥 Récupération des modifications Git..."
git pull origin main

# 2. Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# 3. Mettre à jour Prisma
echo "🗄️ Génération du client Prisma et mise à jour BDD..."
npx prisma generate
npx prisma db push

# 4. Build de production Nuxt
echo "🔨 Compilation de l'application (npm run build)..."
npm run build

# 5. Redémarrer PM2
echo "🔄 Redémarrage du processus PM2..."
pm2 restart boursefi || pm2 restart all

echo "✅ [BourseFi] Déploiement terminé avec succès ! Le site est en ligne et à jour."
```

### G.3 — Méthode de déploiement réellement utilisée (déduite de ce script)

1. **Synchronisation du code :** `git pull origin main` — le VPS récupère et fusionne la branche `main` depuis **GitHub** (pas un `scp`/`rsync` de fichiers, pas un `git checkout <hash>` ciblé). Le script doit être exécuté depuis la racine du projet (là où se trouvent `.git`, `package.json`, `.env`) ; il ne fait pas de `cd` lui-même.
2. **Démarrage/redémarrage :** `pm2 restart boursefi`, avec **repli automatique sur `pm2 restart all`** en cas d'échec de la première commande.
3. **Chargement des variables d'environnement :** le script ne charge rien explicitement (pas de `source .env`, pas d'`export`). Le chargement repose entièrement sur les mécanismes internes de Prisma CLI et de Nitro/Nuxt, qui lisent automatiquement le fichier `.env` présent à la racine du projet (comportement standard de ces outils, non spécifique à ce script) — **ceci n'a pas été vérifié par une exécution réelle sur le VPS**, seulement déduit du fonctionnement documenté de Prisma/Nitro.

### G.4 — Risques identifiés : écrasement, suppression, migrations, réinitialisation de données

| Risque | Analyse | Statut pour UN déploiement avec l'état actuel du dépôt |
|---|---|---|
| `git pull origin main` écrase des modifications locales sur le VPS | Si le working tree du VPS contient des modifications non committées (correctifs manuels faits directement sur le serveur), `git pull` peut échouer (conflit, le script s'arrête grâce à `set -e`) ou, en l'absence de conflit, **fusionner silencieusement** en conservant les deux jeux de changements — mais si un fichier a été modifié aux deux endroits sur les mêmes lignes, le pull échoue proprement plutôt que d'écraser silencieusement | **Risque réel, non vérifié** — nécessite de confirmer `git status --short` propre sur le VPS avant toute exécution (déjà recommandé en F.2) |
| `npx prisma db push` lance une synchronisation de schéma à **chaque déploiement, sans exception** | `db push` sans l'option `--accept-data-loss` refuse par défaut d'appliquer un changement destructeur (il échoue plutôt que de supprimer silencieusement une colonne/table) — mais la commande *s'exécute bien à chaque fois*, ce n'est pas une opération conditionnelle | **Sans risque pour CE déploiement précis** : `prisma/schema.prisma` n'a reçu aucune modification (confirmé Annexe D.3) → `db push` n'aura rien à synchroniser, commande sans effet. **Risque structurel à garder en tête pour les déploiements futurs** qui modifieraient le schéma : le script ne fait aucune sauvegarde avant de lancer `db push` |
| `pm2 restart all` (repli) | Si `pm2 restart boursefi` échoue pour une raison quelconque (nom de process différent, démon PM2 instable), le script **redémarre tous les processus PM2 de la machine**, pas seulement BourseFi | **Risque réel si d'autres applications tournent sous le même démon PM2** — non vérifié : je ne sais pas si le VPS héberge d'autres services PM2 que `boursefi` |
| Aucune sauvegarde avant `db push`/`build`/`restart` | Le script ne fait **aucun** `pg_dump`, aucune copie de `.env`, aucun `pm2 save` avant d'agir | **Confirmé : la procédure de sauvegarde que j'ai proposée (Annexe F.4.b) n'existe PAS dans le processus réel actuel.** Elle devra être exécutée manuellement, séparément, avant de lancer `deploy.sh` |
| Suppression de fichiers | Aucune commande `rm`/`rm -rf` dans le script | **Aucun risque identifié dans ce script** |
| Réinitialisation de données | Aucun `prisma migrate reset`, aucun `--force-reset`, aucun `TRUNCATE`/`DROP` | **Aucun risque identifié dans ce script** |

### G.5 — Comparaison avec la procédure proposée en Annexe F.4

| Point | Annexe F.4 (proposée) | `deploy.sh` (réel) | Écart |
|---|---|---|---|
| Récupération du code | `git fetch && git checkout <commit>` | `git pull origin main` | **Écart réel** — le mécanisme réel suppose que le commit des corrections soit **poussé sur `origin/main` (GitHub)**, pas seulement committé localement. Un commit local non poussé ne serait **jamais récupéré** par ce script |
| Dépendances | `npm install` | `npm install` | Identique |
| Prisma | `npx prisma generate` (seul, car schéma inchangé) | `npx prisma generate && npx prisma db push` (systématique) | Ma procédure omettait `db push` ; sans risque ici (schéma inchangé) mais à aligner pour rester fidèle au process réel |
| Build | `npm run build` | `npm run build` | Identique |
| Redémarrage | `pm2 restart boursefi` | `pm2 restart boursefi \|\| pm2 restart all` | Ma procédure ne mentionnait pas le repli vers `pm2 restart all` — **à surveiller spécifiquement le jour du déploiement** (vérifier que le premier `pm2 restart boursefi` réussit, pour ne jamais atteindre le repli) |
| Sauvegarde préalable | Proposée (F.4.b) : `pg_dump`, uploads, `.env`, dump PM2 | **Absente du script réel** | Confirmé — la sauvegarde doit rester une étape **manuelle, ajoutée par vous**, avant `deploy.sh` ; ce n'est pas redondant, c'est un filet de sécurité qui n'existe pas dans l'automatisation actuelle |

**Conséquence pratique directe :** avant de pouvoir utiliser `deploy.sh` pour ce déploiement, le commit des corrections de sécurité (F.4.a, non encore créé) devra être **poussé vers `origin/main` sur GitHub** — pas seulement committé localement — sans quoi `git pull origin main` sur le VPS ne récupérera rien de nouveau.

### G.6 — Ce qui a été réellement vérifié vs ce qui n'a pas pu être confirmé

**Vérifié (lecture seule, dans ce dépôt local) :**
- Existence, chemin exact et contenu intégral de `deploy.sh`.
- Historique git complet du fichier (création + 2 modifications ultérieures).
- Absence de modification de `deploy.sh` par la phase de corrections de sécurité en cours.
- Absence de toute mention de `deploy.sh` dans la documentation (`docs/deploiement-production.md`, `README.md`).
- Absence de `Dockerfile`, `docker-compose.yml`, fichier `ecosystem.config.*`, ou workflow CI/CD (`.github/workflows`, etc.) dans l'ensemble du dépôt.
- Cohérence entre les commandes Prisma du script et celles documentées dans le guide de déploiement initial (§5).

**Non confirmé (nécessite un accès au VPS, non disponible depuis cet environnement) :**
- Que `deploy.sh` existe bien à `/var/www/BourseFi/deploy.sh` sur le VPS réel, avec le même contenu que la version locale (le fichier pourrait avoir été édité directement sur le serveur, hors git).
- Que le fichier `.env` de production est bien chargé sans erreur par Prisma/Nitro au moment où `deploy.sh` s'exécute (déduit du comportement standard des outils, pas observé en conditions réelles).
- Si d'autres applications PM2 coexistent sur le même VPS (pertinent pour le risque du repli `pm2 restart all`).
- Que le working tree git du VPS est propre (`git status --short` vide) avant un futur `git pull`.
- Que le commit `6267e23` (HEAD local) correspond bien au commit actuellement déployé (point déjà soulevé en Annexe E.2/F.2, toujours en attente).

### G.7 — Précautions nécessaires avant toute mise en production, mises à jour avec cette découverte

1. **Pousser le commit des corrections vers `origin/main`** avant toute tentative d'exécution de `deploy.sh` (sans quoi le script ne récupérera rien).
2. **Exécuter manuellement les sauvegardes (Annexe F.4.b)** avant de lancer `deploy.sh` — elles ne sont pas intégrées au script.
3. **Vérifier `git status --short` sur le VPS** avant le `git pull` (via `deploy.sh` ou manuellement) pour écarter tout correctif local non committé qui serait en conflit.
4. **Confirmer qu'aucune autre application ne dépend du même démon PM2**, pour évaluer l'impact réel d'un éventuel repli vers `pm2 restart all`.
5. **Surveiller la sortie de `deploy.sh` en direct** (ne pas le lancer en arrière-plan sans supervision) pour intercepter immédiatement un échec de `prisma db push` ou de `pm2 restart boursefi`, grâce à `set -e` qui arrête le script au premier échec — mais seulement si quelqu'un observe cette sortie.
6. **Rien de ce qui précède n'a été exécuté.** Cette annexe est une analyse, pas une action.

---

## Annexe H — Tests en temps réel, serveur local réellement démarré (Phase 7, 2026-10-22)

**Objectif :** dépasser la suite `vitest` (qui mocke Prisma/l'email) pour exercer le code exact des corrections de sécurité contre un **vrai serveur Nitro/h3** écoutant sur un port réel, une **vraie base PostgreSQL locale**, avec de vrais cookies de session/CSRF — sans jamais toucher au VPS ni à la production, et sans jamais contacter la véritable API Brevo.

**Isolation appliquée :** un serveur `npm run dev` a été lancé avec `BREVO_API_KEY`, `NUXT_BREVO_API_KEY`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` **surchargés à vide pour ce seul processus** (`dotenv` ne réécrit jamais une variable déjà présente dans l'environnement du shell) — le fichier `.env` sur disque n'a jamais été modifié. Un processus de développement préexistant, lancé par l'utilisateur sur le port 3000, a été détecté et volontairement ignoré ; Nuxt a automatiquement basculé mon instance de test sur le **port 3001**, confirmé intact et fonctionnel après coup.

### H.1 — Parcours exécutés contre le serveur réel + la vraie base PostgreSQL locale

| Test | Requête | Résultat observé | Conforme |
|---|---|---|---|
| A | Inscription, mot de passe `1234` | `400` — message V6 exact | ✅ |
| B | Inscription, mot de passe conforme | `200`, réponse publique unique, **aucun cookie de session** | ✅ |
| — | Vérification DB réelle | Utilisateur créé, `emailVerified=false`, hash bcrypt 60 car., jeton de vérification présent | ✅ |
| — | Log serveur | `[email] non configuré -> email ignoré` + `[AUTH_REGISTER] Échec d'envoi` — confirme qu'aucun email réel n'est parti et que l'échec ne contourne pas la vérification | ✅ |
| C | Connexion avant vérification d'email | `403` — message pré-existant (non introduit par cette phase) | ✅ |
| D | `GET /api/auth/verify-email?token=...` (jeton lu en base, ma ligne de test) | `200` + `Set-Cookie: bf_session=...; HttpOnly; SameSite=Lax` | ✅ |
| E | Connexion après vérification | `200` + nouveau cookie de session | ✅ |
| F | Réinscription avec le même email (anti-énumération) | `200`, réponse **identique** à B, toujours **1 seul compte** en base, email au propriétaire existant *tenté puis ignoré* (sans jeton) | ✅ |
| G | Mot de passe oublié : compte existant vs inexistant | `200`/`200`, corps de réponse **strictement identiques** ; en base : jeton haché (64 car.) + expiration future posés pour le compte existant | ✅ |
| H | Réinitialisation, mot de passe faible, jeton valide (simulé — voir H.2) | `400`, jeton **conservé** | ✅ |
| I | Réinitialisation, mot de passe conforme | `200` | ✅ |
| J | Rejeu du même jeton | `400` — jeton nullifié en base après usage | ✅ |
| K | Ancienne session (ouverte avant le reset) | `GET /api/auth/me` → `{"user":null}` — session bien invalidée | ✅ |
| L | Connexion avec le **nouveau** mot de passe | `200` | ✅ |
| M | Connexion avec l'**ancien** mot de passe | `401` | ✅ |
| N | Candidature à une bourse réelle, connecté | `200`, candidature créée (`status: DOCUMENT_EMIS`) | ✅ |
| O | Même candidature, anonyme | `401 — Authentification requise` | ✅ |
| P | `/api/bourses` sur 593 bourses réelles | Aucun des 19 champs internes de la liste blanche détecté | ✅ |
| Q | `?active=false` en anonyme sur données réelles | Même nombre de résultats qu'en mode normal → le drapeau est bien ignoré sans session admin | ✅ |

### H.2 — Limite assumée : redemption du jeton « mot de passe oublié »

Le jeton en clair d'un email de réinitialisation n'est **jamais persisté** nulle part (propriété de sécurité voulue) : avec l'envoi d'email désactivé pour cet essai, il n'existe aucun moyen de le récupérer tel que l'utilisateur le recevrait. Pour tester quand même la **redemption** complète (tests H–J), j'ai simulé la réception de l'email en générant moi-même un jeton aléatoire, calculé son SHA-256 (même algorithme que `server/utils/one-time-token.ts`), et écrit ce hash directement dans la colonne `resetPasswordToken` de **ma seule ligne de test**, avec une expiration future — reproduisant exactement ce que le serveur aurait écrit si l'email avait été envoyé et reçu. Le test H–J porte donc bien sur le code réel de `reset-password.post.ts` (recherche par hash, consommation atomique, politique de mot de passe), pas sur une version simulée de cette logique.

### H.3 — Nettoyage effectué après les tests

| Action | Résultat |
|---|---|
| Suppression de `Notification`, `Candidature`, `Session`, `User` créés pour `test.live.*@example.test` | Confirmé : `0` ligne restante pour cet email |
| Arrêt du serveur de test (port 3001) | Confirmé |
| Vérification que le serveur préexistant de l'utilisateur (port 3000) fonctionne toujours | `HTTP 200` sur `/api/bourses` après coup |
| `git status --short` | Identique à avant les tests — aucun fichier suivi modifié |
| Ré-exécution finale de `npx vitest run` et `npx nuxt build` | 80/80 ✅, build exit 0 ✅ |

### H.4 — Ce que cette phase apporte par rapport à la suite `vitest`

La suite automatisée (§2, 80 tests) exécute déjà le code réel des handlers, mais avec Prisma et l'email **mockés**. Cette phase live confirme, en plus, que l'intégralité de la chaîne fonctionne identiquement avec : le **vrai moteur PostgreSQL** (recherche insensible à la casse, contraintes `@unique`, `updateMany` atomique), le **vrai serveur HTTP** Nitro/h3 (cookies `Set-Cookie`, en-têtes CSRF, middleware de rate-limit), et un **vrai cycle de vie de session** (invalidation après reset, cookie `httpOnly`/`SameSite=Lax`). Aucune régression constatée ; tous les comportements observés correspondent exactement à ceux documentés dans les sections précédentes (§6, §7, Annexe D).

**Toujours non vérifié depuis cet environnement :** le comportement sur le VPS réel lui-même (OS/architecture Linux, `deploy.sh`, PM2) — cette phase reste un test **local**, pas une validation en production.

---

## Annexe I — Confirmation directe sur le VPS : commit déployé, architecture PM2, dérive `package-lock.json` (Phase 8, 2026-10-22)

**Exécuté par l'utilisateur sur le VPS, résultats communiqués ici pour traçabilité. Rien n'a été exécuté par l'assistant sur le VPS (toujours aucun accès direct).**

### I.1 — `git status --short` sur le VPS

```
 M package-lock.json
```

**Seul fichier divergent, et uniquement des suppressions :**
```
git diff --stat -- package-lock.json
 package-lock.json | 167 --------------------------------------------------------------------------------------------
 1 file changed, 167 deletions(-)
```

**Analyse :** les 167 lignes supprimées sont exclusivement des entrées `node_modules/*` marquées `"optional": true, "peer": true` (ex. `@electric-sql/pglite`, `aws-ssl-profiles`, `commander`, `magicast@0.3.5`, `generate-function`) — des dépendances optionnelles/peer de `prisma`/`nitropack`, jamais importées par le code applicatif. Ce profil (suppressions pures, uniquement des entrées optionnelles) est la signature d'un `npm install` exécuté sur le VPS avec une version de `npm` dont la résolution diffère légèrement de celle ayant produit le lockfile committé — un artefact mécanique, **pas une modification manuelle de code, pas un problème de sécurité**.

**Risque résiduel identifié :** si le commit des corrections de sécurité (qui modifie aussi `package-lock.json`, +534 lignes) est poussé puis récupéré via `git pull origin main` alors que cette dérive est encore présente sur le VPS, la fusion de ce fichier pourrait soit échouer proprement (le script `deploy.sh` s'arrête grâce à `set -e`, sans dégât), soit réussir silencieusement dans un état incertain du lockfile.

**Recommandation (non exécutée, nécessite une autorisation explicite avant toute commande d'écriture sur le VPS) :** faire correspondre `package-lock.json` du VPS à `HEAD` avant de pousser la nouvelle version :
```bash
git checkout -- package-lock.json
git status --short   # doit redevenir vide
```
Ceci est une opération à faible risque (le fichier est entièrement régénérable via `npm install`, aucune perte de donnée possible), mais reste une commande d'écriture sur le VPS — je ne la recommande qu'à exécuter, pas à lancer moi-même.

### I.2 — Commit réellement déployé : **confirmé identique au commit de référence de ce rapport**

| Commande (VPS) | Résultat |
|---|---|
| `git rev-parse HEAD` | `6267e23b75cfc14543bc961d19e40c5c45a8ac46` |
| `git log -1 --format="%H %ci %s"` | `6267e23... 2026-10-13 02:03:06 +0000 feat(attestation): montant pris en charge pour EHES (backoffice)` |
| `git branch --show-current` | `main` |

**Conclusion majeure :** le commit déployé en production (`6267e23b75cfc14543bc961d19e40c5c45a8ac46`) est **identique** au `HEAD` local utilisé comme référence dans toute l'Annexe D de ce rapport. Le point précédemment marqué « non vérifié » (Annexe E.2, E.5, F.2, F.5, G.6) est désormais **confirmé par une lecture directe du VPS**. La comparaison fichier par fichier de l'Annexe D s'applique donc directement à la production réelle, sans hypothèse résiduelle sur ce point.

### I.3 — Architecture PM2 : confirmation directe (renforce le constat verbal antérieur de l'Annexe A.1.bis)

```
pm2 describe boursefi | grep -iE "exec cwd|script path|instances|exec mode|status"
│ status            │ online                                     │
│ script path       │ /var/www/BourseFi/.output/server/index.mjs │
│ exec cwd          │ /var/www/BourseFi                          │
│ exec mode         │ fork_mode                                  │
```

Confirme directement (plutôt que par simple déclaration) : une seule instance active, mode fork, chemin d'exécution cohérent avec `docs/deploiement-production.md`. Le rate-limiting en mémoire (R1) reste donc valide dans les conditions actuelles — cette lecture renforce, sans la remplacer, la vérification déjà actée en Annexe A.1.bis.

### I.4 — État mis à jour des points bloquants (Annexe E.5 / F.5)

| Point | Statut avant cette phase | Statut après |
|---|---|---|
| Commit réellement déployé sur le VPS | Non vérifié, hypothèse | **✅ Confirmé identique à `HEAD` local** |
| Architecture PM2 (mono-instance, fork) | Rapporté verbalement | **✅ Confirmé par lecture directe (`pm2 describe`)** |
| Doublons d'email en production | Non vérifié | Toujours en attente (Annexe F.3) |
| Commit des corrections de sécurité | Inexistant | Toujours en attente (F.4.a, non créé) |
| Dérive `package-lock.json` sur le VPS | Inconnue | **Identifiée et expliquée (I.1)** — résolution proposée, non exécutée |
| Node 25.9.0 sur l'OS/architecture réelle du VPS | Non vérifié | Toujours en attente |
