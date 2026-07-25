# BourseFi - Maquette Nuxt fullstack (Senegal)

Projet Nuxt 4 + Tailwind reproduisant la maquette BourseFi en francais, avec adaptation au contexte senegalais (Dakar, FCFA, Wave, Orange Money, etablissements locaux).

## Stack

- Nuxt 4 (Vue 3 + Nitro API)
- Tailwind CSS
- API fullstack via `server/api/*`
- Persistance via Prisma + SQLite locale
- Journal d'audit des actions sensibles

## Pages principales

- `/` - Landing premium
- `/marketplace` - Recherche de programmes
- `/programmes` et `/programmes/[slug]` - Catalogue + detail formation
- `/etablissements/[slug]` - Fiche etablissement
- `/orientation` - Hub orientation
- `/comparaison` - Matrice de comparaison
- `/candidature` - Formulaire de candidature
- `/paiement` - Paiement securise (Wave/Orange/PayTech)
- `/etudiant/profil` - Espace etudiant (hub unique ; `/etudiant/dashboard` redirige ici)
- `/admin/dashboard` - Espace administration
- `/admin/audit` - Audit des actions admin
- `/partenaire/dashboard` - Espace partenaire institutionnel
- `/partenaire/audit` - Audit partenaire
- `/documents/pre-admission` - Lettre de pre-admission

## API backend (fonctionnelles)

- `GET /api/programmes`
- `GET /api/etablissements`
- `GET /api/dashboard/stats`
- `GET /api/candidatures`
- `POST /api/candidatures`
- `GET /api/paiements`
- `POST /api/paiements`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/audit-logs`

## Installation

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

## Lancer en local

```bash
npm run dev
```

## Build production

```bash
npm run build
npm run preview
```

## Comptes demo seedes

- Admin: `admin@boursefi.sn` / `Admin1234!`
- Partenaire: `partenaire@boursefi.sn` / `Partner1234!`
- Etudiant: `etudiant@boursefi.sn` / `Student1234!`
