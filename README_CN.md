<p align="center">
  <a href="https://github.com/bro-world/bro-world-frontend-ui">
    <img src="./logo.png" alt="Logo" width="150" />
  </a>
</p>
<h1 align="center">
  Inspira UI
</h1>
<p align="center">
  <b>通过使用 Vue 与 Nuxt 创建美观的网站</b><br>
  一个专门为Vue与Nuxt设计的组件集。
</p>

<p align="center">
  <a href="https://github.com/bro-world/bro-world-frontend-ui/stargazers">
    <img alt="GitHub stars" src="https://img.shields.io/github/stars/bro-world/bro-world-frontend-ui?style=social">
  </a>
  <a href="https://github.com/bro-world/bro-world-frontend-ui/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow.svg">
  </a>  
</p>

<p align="center">🌐 可用语言</p>

<p align="center">
  <a href="README.md">🇺🇸 英文</a> |
  <a href="README_CN.md">🇨🇳 中文</a> |
  <a href="README_IT.md">🇮🇹 意大利文</a>
</p>

---

欢迎光临 [**Inspira UI**](https://inspira-ui.com), 这是一个将 [Aceternity UI](https://ui.aceternity.com) 与 [Magic UI](https://magicui.design) 的美观性与功能性相互结合并带到 [Vue](https://vuejs.org) & [Nuxt](https://nuxt.com) 生态之中的社区性项目。 这个项目不仅从上述资源中吸收了优秀灵感，也包含了由社区贡献并由我们创建的独特定制组件。

## ✨ 关于 Inspira UI

Inspira UI 是一套简洁美观、易于上手且专注于灵活性与自由度的 Vue 组件集合，它设计灵活，易于集成。它区别于传统的组件库，允许您根据需要挑选、自定义和调整组件，让您能够自由塑造它们从而满足独特的项目需求。

## 🚀 为什么选用 Inspira UI?

Inspira UI 的出道旨在填补 Vue 社区生态的一个空白，它提供了一套兼具 Aceternity UI 和 Magic UI 的设计风格和功能的组件。我们的目标是让开发者能够更高效地构建美观的应用程序，同时参考我们独特的设计与社区的设计。

## 🎯 关键特性

- **免费且开源**: 完全于MIT协议开源于： [此处](https://github.com/bro-world/bro-world-frontend-ui)
- **高度个性化**: 根据您的具体设计需求设计组件。可参考我们的 [设计指南](/api/configuration).
- **组件多样化**: 我们有来自于 Aceternity UI，Magic UI与社区贡献的许多 [组件](/components) 来帮助你实现你想呈现的内容
- **移动端支持**: 我们的设计在移动端设备上依旧美观
- **Nuxt兼容性**: 完全与 [Nuxt](https://nuxt.com) 相兼容。

## 📚 参考文档

如果您需要完全的参考文档与使用实例，请参考 [**Inspira UI 官方文档**](https://inspira-ui.com)。[**Inspira UI 官方中文文档**](https://inspira-ui.com/zh-cn)

## 🙏 特别感谢

本项目的致谢名单：

- [Aceternity UI](https://ui.aceternity.com) 感谢您提供灵感并允许我们进行改编。
- [Magic UI](https://magicui.design) 感谢您提供精美的UI设计。
- [shadcn-vue](https://www.shadcn-vue.com) 感谢您提供 shadcn-ui 的 Vue 端口与其他必要组件。
- [shadcn-docs-nuxt](https://github.com/ZTL-UwU/shadcn-docs-nuxt) 感谢您提供精心制作的 Nuxt 文档网站。

## 👤 作者的话

你好呀，这里是项目维护者 [BroWorld](https://github.com/bro-world)。受 Aceternity UI、Magic UI 和社区贡献的启发，我持续维护这个项目，为 Vue 生态系统带来类似的体验。为了让这个项目越来越好，我正在努力完善各项内容，欢迎你加入这个旅程，与我一起让 BroWorld 成长！

## 🌟 贡献

我们接受任何形式的贡献！如果你想建议我们添加更多内容、报告 bug、或帮助我们优化这个项目，请随时开一个 issue 或者提交任意 Pull Request (PR) 在 [这里](https://github.com/bro-world/bro-world-frontend-ui)。

为了保证项目的合理运行，请您在发布贡献时参照我们的 [贡献手册](https://inspira-ui.com/getting-started/contribution).

### 中文翻译

- 页面翻译

需要修改 `i18n\locales` 目录下 `en.json` `zh-cn.json` 两个文件响应内容。格式大致如下：

```json
// en.json
{
  // 其他翻译...
  "common": {
    "InspiraUIPro": "Inspira UI Pro" // 英译显示的内容
  }
  // 其他翻译...
}
```

```json
// zh-cn.json
{
  // 其他翻译...
  "common": {
    "InspiraUIPro": "Inspira UI 专业版" // 中文显示的内容
  }
  // 其他翻译...
}
```

在对应的页面 vue 文件中使用

```vue
<template>
  <!-- template 需要双花括号来解析 -->
  {{ $t("common.InspiraUIPro") }}
</template>

<script setup lang="ts"></script>
```

- 文档翻译

在 `content\zh-cn` 目录下创建或修改对应文件内容即可。

## 赞助我们

如果您想支持我们的开发进程，您可以请我们喝杯咖啡：

支持与赞助请访问 [此链接](https://github.com/sponsors/bro-world) 。

