
# BourseFi Senegal - Nuxt 3

Projet frontend migre vers **Nuxt 3** avec une architecture propre, reusable et maintenable.
Le rendu reprend fidèlement l'experience de la version precedente, renommee en **BourseFi Senegal**.

## Stack

- `Nuxt 3` (Vue 3 + SSR-ready)
- `Tailwind CSS` via `@nuxtjs/tailwindcss`
- Structure modulaire par domaine (`components`, `composables`, `data`, `types`)

## Structure

- `pages/index.vue`: composition de la landing page
- `components/layout`: header global
- `components/sections`: sections de la homepage (hero, piliers, catalog, CTA)
- `components/application`: modal candidature multi-etapes
- `composables/useApplicationForm.ts`: etat et actions du formulaire
- `data/schools.ts`: donnees des ecoles partenaires
- `types/application.ts`: typage du domaine candidature
- `plugins/reveal.client.ts`: animation au scroll reutilisable (`v-reveal`)
- `server/api/applications.post.ts`: endpoint Nuxt pour soumettre la candidature
- `assets/css/main.css`: styles globaux et classes utilitaires
- `public/images/boursefi-logo.png`: logo de marque

## Demarrage

```bash
npm install
npm run dev
```

Application disponible sur `http://localhost:3000`.

## Build production

```bash
npm run build
npm run preview
```

## Bonnes pratiques appliquees

- Separation claire UI / donnees / logique metier.
- Typage TypeScript du formulaire et du catalogue.
- Theme Tailwind centralise dans `tailwind.config.ts`.
- Validation par etapes et soumission vers API interne Nuxt.
- Nommage coherent et structure prete a evoluer (API, auth, i18n, etc.).
  # BourseFi
