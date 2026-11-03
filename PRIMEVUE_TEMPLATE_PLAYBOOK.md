# PrimeVue template playbook

Instructions for Claude: how to take a fresh PrimeTek PrimeVue template (Apollo, Atlantis, Sakai, …) to a production-ready
starter, the way `apollo-vue-7.0.0` was done in October 2026. The reference result is that repo: read its `CLAUDE.md`
and git history (`git log --reverse`) when a step here is unclear. It's the source of truth for patterns and code.

## How to use this

- Work in **phases**, each on its own branch with its own PR, in the order below. Within a phase, make **one commit per
  feature** (Conventional Commits).
- Before each phase, check what the new template already has. Templates differ: menu modes, layout composables vs
  stores, the theme configurator, Tailwind version, Vite version. Adapt the steps; don't copy blindly.
- After every phase run `npm run lint:check`, `npm test` and `npm run build`. After any dependency change, also run
  `npm ci` in a clean copy in the scratchpad. Check the result in the browser with `agent-browser`.
- Keep the project's `CLAUDE.md` current as you go (`/init` first, then update it in every phase). The next session
  depends on it.
- Ask the user before outward actions: pushing, opening or merging PRs, pushing to translation platforms, creating cloud
  resources. Once they say "push it", always check CI afterwards.

## Working conventions (from the user)

- Use their global CLAUDE.md: reply style, `trash` instead of `rm`, Conventional Commits, regression tests for bugs,
  `agent-browser` for the browser, `gh pr view/diff` for PRs.
- Commit trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. PR bodies end with
  `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- GitHub: the user has more than one `gh` account. Ask which account and org own the repo, use
  `GH_TOKEN=$(gh auth token --user <account>)` per command, and never switch the active account. Repos can move between
  orgs (the Apollo repo went `karamconnect/…` → `Karam-Connect/…`), so check `gh repo view` before PRs.
- Hosting is **DigitalOcean App Platform**, not Vercel. Delete any `vercel.json` or `.vercel/` the template ships with.
- CI is **RWX**. Their `rwx` CLI may be logged in as a different user, so don't run it. Fetch docs as markdown with
  `curl https://www.rwx.com/docs/<path>.md` instead.
- Write files to the scratchpad, never `/tmp`. Never print or read secret values from `.env`; load them in node
  (`loadEnv`) and pass them on without printing.
- Pass PR bodies with `--body-file`. Apostrophes inside a `$(cat <<'EOF')` heredoc break bash.

## Phase 0: Recon and setup

1. Find the package manager from the lockfile. Note the versions of Vue, PrimeVue, Vite, Tailwind and ESLint, and the
   Node version.
2. Copy the untouched template to `original_template/` and add it to `.gitignore`. It's the reference for any removed
   demo component.
3. Check for git submodules (PrimeTek templates used a private `apollo-assets` submodule for styles). Commit the files
   as plain files and remove submodule leftovers and workaround scripts.
4. Run `/init` to create `CLAUDE.md`: commands, architecture, conventions. Note the vendored styles folder: never run
   `prettier --write` on it.
5. Pin version-sensitive dev dependencies:
   - `typescript` ~5.9 even in a JS project. Otherwise npm resolves TS 7, whose per-platform packages break `npm ci`.
   - Vitest must match Vite: Vitest 3 for Vite 5 (Vitest 4+ needs Vite 6+).
   - `@intlify/unplugin-vue-i18n` needs Vite 6+; without it, import locale JSON directly.
   - Keep `@primevue/forms` on the same version as `primevue` (v5 of forms is for PrimeVue 5).
   - The intlify ESLint plugin v4 needs ESLint 9 flat config; use v3 with ESLint 8 `.eslintrc`.

## Phase 1: Strip and restructure (PR "template-improvements", part 1)

1. Remove demo pages. Keep **Dashboard** (a few widgets), **Settings**, **Help**, an admin-only example page, the auth
   pages, and Terms.
2. Router: one root route renders the layout with lazy app pages as children. Auth, terms and the catch-all are
   top-level. Route meta:
   - `breadcrumb` (message keys);
   - `search: { icon, keywords, title? }`;
   - `requiresAuth`, `guestOnly`, `roles`;
   - `title` (for pages without a breadcrumb).
3. `router.onError` sends failed lazy imports to the error page, which is imported eagerly so it can't fail the same
   way.
4. Settings is split into sections, one child route each: profile, account, preferences, notifications, appearance. Use
   a `SettingsLayout` (left nav, tab strip below `lg`) built from `SettingsSection` and `SettingsRow` components.
5. "Delete account" needs a typed confirmation phrase in a `ConfirmDialog`.
6. Theme presets are lazy-loaded (`loadPreset(name)`). `main.js` waits for the saved preset before mounting.
7. Widen the content and trim layout padding to taste (ask).

## Phase 2: State, auth, forms, uploads (PR "template-improvements", part 2)

1. **Pinia setup stores** (with HMR snippets): `layout` (persisted `config` + transient `ui` + actions), `user`,
   `preferences`, `todos`, `lock`.
   - Persist with a `usePersistedRef(key, defaults)` helper on VueUse `useStorage`: `app.<key>` keys, defaults
     shallow-merged, malformed values ignored, storage errors swallowed.
   - **Let `useStorage` look up `localStorage` itself** (pass `undefined`). Merely reading `window.localStorage` throws
     when site data is blocked.
   - Cross-tab sync comes free with `useStorage`. Re-apply side effects (theme) when `config` changes in another tab by
     comparing it with what was last applied. Don't listen to `storage` events: VueUse fires them for local writes too.
2. **Vitest unit tests** for the stores: a fresh Pinia and `localStorage.clear()` per test, and `@primeuix/themes`
   mocked. Stop every Pinia created in a spec (`pinia._e.stop()`) so stores don't leak between tests.
3. **Forms**: PrimeVue Forms + Zod 4 (`zodResolver`).
   - Every form field must be in the schema, because `z.object()` strips unknown keys.
   - Avoid `z.literal()` together with a cross-field `.superRefine()`: a literal mismatch aborts before the refinement
     runs.
   - For live validation (change password), validate on mount and on input, `:disabled="!$form.valid"`, and only show
     an error once its field is dirty.
4. **Auth with Better Auth (client only)**:
   - `authClient` + `emailOTPClient()`. With no `VITE_AUTH_URL`, `customFetchImpl` is an in-browser mock server
     returning the real response shapes. Any password works; `admin@…` users get the admin role; reset links and OTP
     codes are logged to the console.
   - A route guard handles `requiresAuth`, `guestOnly`, `roles` and lock state; `safeRedirect()` only allows same-app
     paths.
   - Pages: login, register (with terms), verification (email OTP, resend countdown), forgot and reset password,
     Access Denied, Error/Not Found (a shared `StatusPage`). The auth pages share an `AuthLayout`.
   - **Lock screen**: an overlay rather than a route (the page underneath keeps its state, the app is `inert`). The lock
     persists, and unlock re-runs `signIn.email`.
   - `useSignOut()` also clears the lock.
5. **Filestack** profile photo (use the `filestack:filestack-sdk-integration` skill):
   - Dynamic `import()` so it gets its own chunk.
   - Key from `VITE_FILESTACK_API_KEY`, falling back to the demo key.
   - Square-crop picker; CDN transform URL (resize before output).
   - Low `uploadConfig.retry`, and close the picker on failure.
6. **CI** at this stage was GitHub Actions (Lint, Unit tests and Build jobs on PRs). Phase 6 replaces it with RWX; if
   RWX is already available, go straight to it.

## Phase 3: Tooling (PR "tooling", one commit per library)

1. **VueUse** replaces hand-rolled listeners, timers, observers and storage (`useMediaQuery`, `onClickOutside`,
   `useIntersectionObserver`, `useTimeoutFn`, `useCountdown`, `useNow` with an interval `scheduler`, `onKeyStroke`).
   Import explicitly.
2. **Flagsmith** (`flagsmith-vue`):
   - Every flag goes in `DEFAULT_FLAGS`, published immediately. Fetch nothing without
     `VITE_FLAGSMITH_ENVIRONMENT_ID`.
   - Identify the user by id with the role as a trait, and **re-identify when the id or the role changes**.
   - Example flag: profile photo upload.
3. **Fuse.js** topbar page search through VueUse `useFuse`, built from route `meta.search`. Leave out pages the user's
   role can't open. Keep the pure functions (`buildPageIndex`, `searchPages`) tested.
4. **Vue Test Utils** with a `mountWithApp(component, { path, routes })` helper: Pinia, i18n, PrimeVue with no theme,
   and a memory router. Add component tests, including regression tests for bugs found.
5. **vue-i18n** (Composition API) and **vue-tel-input** (a `PhoneInput` wrapper styled with PrimeVue's global
   form-field tokens, E.164 v-model, validated with `libphonenumber-js`).
6. Skip Pinia ORM unless there's relational backend data.

## Phase 4: Full i18n, languages, RTL, Tolgee (same PR, or its own)

1. **Translate everything**:
   - `$t` in templates; `useI18n().t` in script, with option lists in a `computed`.
   - `<i18n-t>` for sentences containing markup.
   - Zod schemas hold message keys, shown through a `FieldError` component.
   - Better Auth errors are mapped by code (`authErrorMessage`).
   - Numbers through named formats (`$n(v, 'currency')`); dates through `Intl` with the current locale.
   - Charts watch `locale` so their labels rebuild.
   - The phone picker's country names come from `Intl.DisplayNames`; the Filestack picker gets a supported `lang`.
2. **Enforce it with `@intlify/eslint-plugin-vue-i18n`**:
   - Rules: `no-raw-text` (with text attributes such as label, placeholder, header and aria-label), `no-missing-keys`,
     `no-unused-keys` (with ignores for keys used indirectly) and camelCase `key-format-style`.
   - Lint the locale JSON with `jsonc-eslint-parser`.
3. **PrimeVue's own texts** come from `primelocale`, merged over the English snapshot in `syncPrimeVueLocale(app)`.
4. **Languages**:
   - A `LOCALES` list (native names plus the primelocale file); message files loaded with `import.meta.glob`.
   - Regional variants (e.g. `ar-DZ`) hold only overrides and fall back to the base language (`fallbackLocale`).
   - `setLocale` ignores superseded calls (request counter).
   - A test checks every full language has every key.
5. **RTL**: Arabic sets `<html dir="rtl">`, which is all PrimeVue needs.
   - Use logical Tailwind classes (`ms-`/`me-`, `ps-`/`pe-`, `text-start`/`text-end`) and mirror arrow icons.
   - In the layout SCSS, use `margin-inline` for menu-item spacing. The sidebar may stay on the left.
6. **Tolgee** (keep vue-i18n as the runtime; don't adopt `@tolgee/vue`):
   - CLI push/pull via `.tolgeerc.json` (`JSON_ICU`, `forceMode: KEEP`, explicit languages) and a `scripts/tolgee.mjs`
     wrapper that passes the `.env` credentials.
   - Dev-only in-context editing (`src/i18n/tolgee.js`): tag strings with `setPostTranslationHandler` + `tolgee.wrap`,
     and merge platform translations. Load it only when `import.meta.env.DEV && MODE !== 'test'`.
   - **After `npm run build`, check `dist/` for the API key and for Tolgee code.**
   - Production layers the Tolgee **CDN** (`VITE_TOLGEE_CDN_URL`, flat JSON) over the bundled files, in the background
     and once per language. Keep `toMessages` in its own module so production never imports `tolgee.js`.
   - New languages must be created in the Tolgee UI first; a project API key usually can't create them.
   - Draft translations yourself if machine translation isn't available, and say they need native-speaker review.

## Phase 5: Review loop (before merging each PR)

- Request a GitHub Copilot review (GraphQL `requestReviewsByLogin` with `botLogins: ["copilot-pull-request-reviewer"]`
  works when `gh pr edit --add-reviewer` doesn't).
- Verify each finding, fix the real ones with regression tests, then reply and resolve each thread.
- Copilot has a per-user quota. If it runs out, say so and offer your own review instead.

## Phase 6: CI on RWX (use the `rwx:migrate-from-gha` skill, then `rwx:review-gha-migration`)

- `.rwx/ci.yml` on `github.pull_request`, with a CLI trigger for local runs.
- Tasks:
  - `code` (`git/clone`, `github-token: ${{ github.token }}` for private repos);
  - `node` (`nodejs/install`, `node-version-file: .nvmrc`, filtered on `.nvmrc`);
  - `npm-install` (`npm ci`, filtered on the package files);
  - then `lint` (eslint problem matcher), `test` (Vitest JSON → `outputs.test-results`) and `build`, in parallel.
- Status checks named `Lint`, `Unit tests` and `Build` (they appear as `RWX: …`) plus `CI`. A concurrency pool per PR
  with `cancel-running`.
- **`.nvmrc` must be an exact `X.Y.Z`**; `nodejs/install` rejects a bare `24`.
- Nothing in CI may walk `node_modules`:
  - The lint scripts name their targets (`src`, `scripts`, root config files) instead of `.`.
  - Vitest uses `include: ['src/**/__tests__/**/*.spec.js']`.
  - Tailwind v4 uses `@import 'tailwindcss' source(none); @source '../../index.html'; @source '../../src';`. Compare the
    generated selectors before and after.
- Vitest needs `includeTaskLocation: true` for inline failures; git-ignore `tmp/`.
- RWX only runs once its GitHub App (`rwx-integration`) can see the repo. If no RWX status appears at all, it's app
  access, not the config. Once a run passes, delete `.github/workflows/` and update branch protection to the RWX check
  names.
- Keep repo URLs in `.rwx/ci.yml` up to date if the repo moves.

## Phase 7: Accessibility (WCAG 2.2 AA; own branch and PR)

1. **Audit first**, then show the user a prioritised list before changing anything:
   - Inject axe-core with `AGENT_BROWSER_INIT_SCRIPTS=<path>/axe.min.js agent-browser open …`. The daemon can restart
     on a version mismatch and drop the script, so check `typeof axe`.
   - Run axe on every page in light and dark mode, with each preset and a few primary palettes.
   - Walk through with the keyboard (Tab order, visible focus, Escape) and check every page at 375 px (horizontal
     overflow, targets under 24 px).
2. **Fixes**:
   - **Structure:** skip link to `<main id="main-content" tabindex="-1">`; the topbar is a `<header>`; the sidebar root
     is the labelled `<nav>`. One `<h1>` per page (`sr-only` if the breadcrumb already shows the name); card titles
     `<h2>`.
   - **Navigation:**
     - Per-page `document.title` (`router/title.js`, from `meta.title` or the breadcrumb, translated).
     - Move focus to `<main>` when the page (`route.matched[1]`) changes.
     - Escape closes the overlay or mobile menu and refocuses the menu button.
   - **Names:**
     - `aria-label` on icon-only buttons and links; the breadcrumb `<nav>` labelled, with `aria-current`.
     - Image `alt` (PrimeVue `Avatar` uses its `ariaLabel` prop).
     - Hidden headers for empty table columns; read-only `Rating` gets `inert aria-hidden` plus `sr-only` text.
     - `passwordInputProps()` removes the `aria-haspopup`/`aria-expanded` that PrimeVue `Password` puts on its input.
   - **Focus:** `:focus-visible` rings for the layout's own links and buttons, using the `--p-focus-ring-*` tokens.
     Never leave `outline-none` without a replacement.
   - **Contrast:**
     - In light mode, the primary colour per palette is the lightest shade with 4.5:1 against white **and** the page
       background (`accessibleShade`); hover and active are one and two shades darker.
     - Severity buttons (filled, outlined, text) go to the 600/700 shades; unselected SelectButton labels to
       surface-600; dark-mode message text to the 400s.
     - Coloured text uses the 700 shades in light mode.
     - Links inside text are underlined. Apollo's unlayered `a { text-decoration: none }` beats Tailwind utilities, so
       use `underline!`.
     - Add a `theme.spec.js` that checks every palette.
3. The primary colour change is visible, so **ask the user** before applying it. Note that dark text on buttons alone
   doesn't fix it: PrimeVue reuses the primary colour for text, focus rings and links.
4. Add the conventions to `CLAUDE.md` (an Accessibility section).

## Phase 8: Deployment notes

- DigitalOcean App Platform static site: `output_dir: dist`, `catchall_document: index.html` (history-mode router).
  Build-time env vars (`VITE_*`, e.g. `VITE_TOLGEE_CDN_URL`) go on the component; never the dev-only Tolgee keys.
  Offer a `.do/app.yaml` spec.

## Gotchas collected along the way

- PrimeVue component tokens (`--p-select-*`) only exist when that component is on the page; style custom wrappers with
  the global `--p-form-field-*` and `--p-overlay-select-*` tokens.
- `structuredClone` fails on reactive proxies in tests. Use `flushPromises()` after form submits (the Zod resolver is
  async).
- vue-i18n message syntax treats `{ } @ $ |` as special, so pass emails and code as params. Its pipe plurals aren't ICU;
  Tolgee shows them as plain text.
- In dev with Tolgee on, translated strings carry invisible characters, so never compare translated strings in code.
- Vite's dependency optimiser reloads the page mid-navigation after installs, producing bogus "null parentNode" errors.
  Re-test after it settles. It can also leave `vite.config.mjs.timestamp-*.mjs` files behind; delete them.
- `agent-browser` uses tab ids (`t1`), not indexes. Synthetic key events need `bubbles: true`, and Tolgee's Alt+click
  listens on `document`.
- When checking contrast, compute the exact ratios (WCAG relative luminance) instead of guessing. Light and dark mode
  fail on different things.

## Definition of done

- `main` contains all phases.
- RWX Lint, Unit tests and Build pass.
- axe reports nothing across pages, themes and presets.
- `npm ci` works clean.
- `CLAUDE.md` describes everything above as it applies to the new template.
- The user has a one-paragraph summary per PR and knows what needs their action: API keys, the RWX app, branch
  protection, Tolgee languages, native-speaker review.
