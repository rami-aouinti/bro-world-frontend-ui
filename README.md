<p align="center">
  <a href="https://github.com/bro-world/bro-world-frontend-ui">
    <img src="./logo.png" alt="Logo" width="150" />
  </a>
</p>
<h1 align="center">
  BroWorld
</h1>
<p align="center">
  <b>Build beautiful websites using Vue & Nuxt.</b><br>
  A curated collection of beautifully designed, reusable components for Vue & Nuxt.
</p>

<p align="center">
  <a href="https://github.com/bro-world/bro-world-frontend-ui/stargazers">
    <img alt="GitHub stars" src="https://img.shields.io/github/stars/bro-world/bro-world-frontend-ui?style=social">
  </a>
  <a href="https://github.com/bro-world/bro-world-frontend-ui/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow.svg">
  </a>  
</p>

<p align="center">🌐 Available Languages</h2>

<p align="center">
  <a href="README.md">🇺🇸 English</a> |
  <a href="README_CN.md">🇨🇳 Chinese</a> |
  <a href="README_IT.md">🇮🇹 Italian</a>
</p>

---

Welcome to **BroWorld**, a community-driven project that brings the beauty and functionality of both [Aceternity UI](https://ui.aceternity.com) and [Magic UI](https://magicui.design) to the [Vue](https://vuejs.org) & [Nuxt](https://nuxt.com) ecosystem! While this project draws inspiration from these sources, it also includes unique custom components contributed by the community and created by us.
For the **Chinese version** visit [here](README_CN.md). For the **Italian version** visit [here](README_IT.md).

## 📚 Table of Contents

1. [About BroWorld](#-about-broworld)
2. [Why BroWorld?](#-why-broworld)
3. [Key Features](#-key-features)
4. [Tech Stack](#-tech-stack)
5. [Getting Started](#-getting-started)
6. [Project Structure](#-project-structure)
7. [Education Module](#-education-module)
8. [Documentation](#-documentation)
9. [Configuration](#-configuration)
10. [Profile Page](#-profile-page)
11. [Testing](#-testing)
12. [Deployment Tips](#-deployment-tips)
13. [Acknowledgments](#-acknowledgments)
14. [Author](#-author)
15. [Contribute](#-contribute)
16. [Sponsorship](#sponsorship)
17. [Repo Stats](#repo-stats)

## ✨ About BroWorld

BroWorld is a collection of elegant, ready-to-use Vue components designed to be flexible and easy to integrate. Rather than being a traditional component library, it allows you to pick, customize, and adapt components as needed, giving you the freedom to shape them to fit your unique project requirements.

## 🚀 Why BroWorld?

BroWorld was created to fill a gap in the Vue community by providing a set of components with the aesthetics and functionality of both Aceternity UI and Magic UI. Our goal is to empower developers to build beautiful applications more efficiently while adding our own custom and community-driven designs.

## 🎯 Key Features

- **Free and Open Source**: Completely [open source](https://github.com/bro-world/bro-world-frontend-ui) under the MIT license.
- **Highly Configurable**: Tailor components to your specific design needs. Check out our [configuration guide](/api/configuration).
- **Diverse Component Range**: A broad selection of [components](/components), inspired by Aceternity UI, Magic UI, and custom contributions, to help you build anything you imagine.
- **Mobile Optimized**: Designed to look great on all devices.
- **Nuxt Compatibility**: Fully compatible with [Nuxt](https://nuxt.com).

## 🧰 Tech Stack

BroWorld combines a modern Vue/Nuxt architecture with a carefully curated tooling stack to streamline development:

- **Framework:** [Nuxt 3](https://nuxt.com) with Vue 3 Composition API and `<script setup>`.
- **Styling:** [Tailwind CSS](https://tailwindcss.com) and [Radix Colors](https://www.radix-ui.com/colors) for consistent design tokens.
- **State Management:** [Pinia](https://pinia.vuejs.org) stores for predictable application state.
- **Content:** [Nuxt Content](https://content.nuxt.com) for documentation and markdown-driven pages.
- **Testing:** [Vitest](https://vitest.dev) and [Vue Test Utils](https://test-utils.vuejs.org) for fast unit testing.
- **Linting & Formatting:** [ESLint](https://eslint.org) and [Prettier](https://prettier.io) with project-tailored rules.

## 🚦 Getting Started

Follow these steps to run the project locally:

```bash
# 1. Install dependencies
pnpm install

# 2. Start the development server with hot-module replacement
pnpm dev

# 3. Visit the local site
open http://localhost:3000
```

> **Tip:** If you prefer npm or yarn you can use them, but the project is optimized for pnpm and a lockfile is already provided.

### Environment Setup Checklist

- Copy `.env.example` to `.env` and update the values to match your environment.
- Provide API base URLs or analytics identifiers if you rely on those services.
- Optional integrations (Redis, analytics, advertising) can remain empty when not needed.
- Restart the dev server after changing environment variables so Nuxt picks up the new values.

### Help centre content

The `/help` experience relies on the mock dataset in `server/mock/help.json`, which stores
every category and article with localized strings.

When you update the help centre:

- Edit `server/mock/help.json` to adjust articles (provide English, French, German, and
  Arabic copies for each field).
- Update the UI strings in `i18n/locales/{en,fr,de,ar}.json` under the `help` namespace to
  keep hero copy, FAQs, and feedback labels aligned.
- Review the Vue pages in `pages/help/` and components in `components/help/` if you need to
  add new layout blocks or change SEO metadata.

## 🗂️ Project Structure

Here's an overview of the most important directories to help you navigate the codebase quickly:

```
.
├── app.vue               # Root application shell
├── features/             # Self-contained feature packages (components, pages, stores, plugins...)
├── modules/              # Nuxt modules (feature loader, shared tooling)
├── components/           # Legacy global components pending migration to features
├── composables/          # Reusable Composition API utilities and hooks
├── content/              # Markdown pages used by Nuxt Content for docs/blog
├── layouts/              # Nuxt layouts for shared page chrome
├── pages/                # Legacy route-based Vue components
├── plugins/              # Nuxt plugins shared across features
├── public/               # Static assets served as-is
├── server/               # Legacy Nitro server routes & API endpoints
├── stores/               # Pinia stores for global state
└── tests/                # Vitest suites, component tests, and utilities
```

Feature work now happens inside `features/<slug>/` directories. Each feature can expose `components/`, `pages/`, `server/`, `stores/`, `composables/`, and `plugins/` folders and they will be registered automatically at build time by the in-repo module located at [`modules/features/module.ts`](modules/features/module.ts). Import any asset from a feature with the `~/features/<slug>` alias (for example `import useFoo from "~/features/foo/stores/foo"`).

Each directory may contain additional `README` or documentation files to describe specific implementation details. Explore the `docs/` folder for deeper explanations of patterns used across the app.

## 🎓 Education Module

The `/education` workspace delivers a complete mock learning journey powered by Nuxt 3, Vuetify 3, and Pinia. Learners can browse categories, follow lessons with inline exercises, complete a final quiz, and generate a downloadable certificate—everything running on local mock data and persisted in the browser.

- **Mock APIs:** The Nitro server exposes REST-style endpoints under `server/api/education/` that serve categories, course details, lesson content, quizzes, and certificate workflows backed by `server/mock/education.json` and helper utilities in `server/utils/education.ts`.
- **State management:** `stores/education.ts` keeps catalogue data, lesson progress, quiz outcomes, and issued certificates in sync with `localStorage`, while shared TypeScript contracts live in `types/education.ts`.
- **Client experience:** Pages in `pages/education/` orchestrate the flow across the catalogue, lessons, quizzes, and certificate viewer using the reusable components housed in `components/education/` plus the html2pdf download helper defined in `plugins/html2pdf.client.ts`.
- **Translations:** English and French locale strings for the entire journey are located in `i18n/locales/en.json` and `i18n/locales/fr.json`.
- **Targeted tests:** Run `pnpm vitest run tests/unit/educationStore.spec.ts` to verify store behaviour, or add Playwright coverage for the multi-step happy path when browser automation is available.

## 📚 Documentation

For full documentation and usage examples, visit the BroWorld documentation site and the local markdown guides in this repository.

- [Authentication guide](docs/authentication.md) – details the login flow, session
  storage, route guards, and API usage patterns.
- [Component catalog](https://bro-world-ui.vercel.app/components) – browse live previews and copy-pasteable code snippets.
- [Layout tokens](docs/layout-tokens.md) – understand the design tokens, spacing, and typography scale used across components.
- [CSS optimization checklist](docs/css-optimization.md) – ensure styles stay performant and consistent across views.
- [Manual QA guide](docs/manual-qa.md) – follow pre-release checklists to validate key user flows.

## ⚙️ Configuration

Environment variables are used to configure external services such as the API,
Redis cache, analytics, and testing tools. To get started locally:

1. Copy `.env.example` to `.env`.
2. Update the values to match your environment (for example, provide your API
   base URL or analytics identifiers).

Redis, analytics, and advertising settings are optional—leave them empty if you
do not use those integrations.

> ℹ️ The `.env.example` file documents every supported environment variable along with inline comments that describe its purpose. When deploying to platforms such as Vercel or Netlify, set these variables using their dashboard or CLI so serverless functions receive the correct runtime configuration.

### Game service proxy

Set `NUXT_PUBLIC_GAME_API_BASE` to the base URL of the BroWorld Game API (defaults to
`https://game.bro-world.org`). The server routes mounted under `/api/game/*` read this value to
forward requests to the external service. Provide the special value `mock` to serve the local
fixtures in [`server/mock/game.ts`](server/mock/game.ts) instead of calling the remote API—handy when
developing offline or when the upstream service is unavailable.

### Feature modules

Nuxt discovers feature packages dynamically through [`modules/features/module.ts`](modules/features/module.ts). Create a new
feature by adding a folder under `features/<slug>/`—the module will register any nested `components/`, `pages/`, `server/`,
`stores/`, `plugins/`, or `composables/` directories without additional configuration. You can opt out of a feature by listing
its slug inside the `featureModules.disabled` array in `nuxt.config.ts`, or explicitly enumerate the features to load with
`featureModules.enabled`. Aliases are generated automatically, so `~/features/<slug>` always resolves to the feature root.

### Redis TTL overrides

Configure the following environment variables to tune how long Redis stores education content and generated certificates:

- `NUXT_REDIS_EDUCATION_TTL` — Expiration (in seconds) for cached course listings and lesson data. Defaults to `300` seconds.
- `NUXT_REDIS_CERTIFICATE_TTL` — Expiration (in seconds) for stored education certificates. Defaults to `604800` seconds (7 days).

## 🔐 Profile page

- The `/profile` route is protected by the `auth` middleware. Visitors without a valid session are redirected to `/login`, and the intended URL is stored so they return to `/profile` after authenticating.
- The page reads the authenticated user from `useAuthSession`, which is hydrated from the `/api/auth/session` endpoint using the active token. Identity, contact, and profile fields come directly from this session payload.
- Quick stats display the number of friends and the total stories count using **Option B** (own stories plus the sum of stories shared by friends). Expired tokens trigger the global API plugin to call `handleUnauthorized`, clearing the session and redirecting back to the login screen.

## ✅ Testing

We use Vitest for both unit and component testing. Run the suite locally with:

```bash
pnpm test
```

Use `pnpm test --watch` while developing a component to receive real-time feedback. For integration tests or Playwright E2E suites (when enabled), follow the instructions in the [`tests/`](tests) directory readme files.

## 🚀 Deployment Tips

- **Static Hosting:** Nuxt's hybrid rendering makes it easy to deploy to Vercel, Netlify, or any Node-compatible host. Run `pnpm build` followed by `pnpm preview` locally to validate the production build before pushing.
- **Server Middleware:** If you rely on server routes within the `server/` directory, ensure the target platform supports Nitro serverless functions.
- **Caching:** Consider enabling [Nuxt Image Optimization](https://image.nuxt.com) or CDN-level caching to speed up media-heavy components.
- **Monitoring:** Hook up your preferred observability tools (Logflare, Sentry, etc.) via environment variables for proactive monitoring.

## 🙏 Acknowledgments

A special thanks to:

- [Aceternity UI](https://ui.aceternity.com) for providing the inspiration and permission to adapt the original designs.
- [Magic UI](https://magicui.design) for its beautiful design inspiration.
- [shadcn-vue](https://www.shadcn-vue.com) for the Vue port of shadcn-ui and contributions to some components.
- [shadcn-docs-nuxt](https://github.com/ZTL-UwU/shadcn-docs-nuxt) for the beautifully crafted Nuxt documentation site.

## 👤 Author

Hi, I'm **BroWorld**. I maintain this project to bring a polished, ready-to-use experience to the Vue ecosystem, inspired by Aceternity UI, Magic UI, and the creativity of the community. I'm continuously working on it to make it better. Feel free to join me on this journey and connect with me on [GitHub](https://github.com/bro-world)!

## 🌟 Contribute

We welcome contributions! If you want to suggest features, report bugs, or help improve the project, feel free to open an issue or submit a pull request on [GitHub](https://github.com/bro-world/bro-world-frontend-ui).

You can also follow this [Contribution Guide](https://inspira-ui.com/getting-started/contribution).

## Sponsorship

You can also support the development of the project by sponsoring the maintainer.

Support the project here: [Sponsor BroWorld](https://github.com/sponsors/bro-world)

## Repo Stats

![Repo Stats](https://repobeats.axiom.co/api/embed/da99e5e9c8ddaaff68b7f57b56ae21d5e0ea2ed2.svg "Repobeats analytics image")
