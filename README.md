# Atlantis Vue starter

A production-ready starting point built from PrimeTek's commercial [Atlantis](https://primevue.org/templates/atlantis/) v7.0.0 template (Vue 3, PrimeVue 4, Tailwind CSS 4, Vite 5), with the demo content removed.

- Dashboard, sectioned Settings (profile, account, preferences, notifications, appearance), Help, an admin-only example page and Terms
- Better Auth client with an in-browser mock server (any password works; `admin@…` users are admins), lock screen and role-based routes
- Pinia stores persisted to localStorage, PrimeVue Forms with Zod validation, Filestack profile photos
- Vitest tests and CI on RWX

```sh
npm ci
cp .env.example .env   # optional: VITE_AUTH_URL, VITE_FILESTACK_API_KEY
npm run dev
```

`npm test`, `npm run lint:check` and `npm run build` are what CI runs. See [AGENTS.md](./AGENTS.md) for architecture and conventions.

The Atlantis template is licensed by PrimeTek; keep this repository private.
