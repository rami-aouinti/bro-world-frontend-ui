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
For **Chinese version** visit [here](README_CN.md).

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

## 📚 Documentation

For full documentation and usage examples, visit the BroWorld documentation site.

- [Authentication guide](docs/authentication.md) – details the login flow, session
  storage, route guards, and API usage patterns.

## 🔐 Profile page

- The `/profile` route is protected by the `auth` middleware. Visitors without a valid session are redirected to `/login`, and the intended URL is stored so they return to `/profile` after authenticating.
- The page reads the authenticated user from `useAuthSession`, which is hydrated from the `/api/auth/session` endpoint using the active token. Identity, contact, and profile fields come directly from this session payload.
- Quick stats display the number of friends and the total stories count using **Option B** (own stories plus the sum of stories shared by friends). Expired tokens trigger the global API plugin to call `handleUnauthorized`, clearing the session and redirecting back to the login screen.

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
