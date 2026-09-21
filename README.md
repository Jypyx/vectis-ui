<p align="center">
  <a href="https://vectis-ui.com">
    <img src="apps/docs/public/favicon.svg" alt="Vectis UI logo" width="96" />
  </a>
</p>

<h1 align="center">Vectis UI</h1>

<p align="center">
  A Vue 3 component library built for modern browsers.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/vectis-ui"><img src="https://img.shields.io/npm/v/vectis-ui" alt="npm version" /></a>
  <a href="https://github.com/Jypyx/vectis-ui/actions/workflows/ci.yml"><img src="https://github.com/Jypyx/vectis-ui/actions/workflows/ci.yml/badge.svg" alt="CI status" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/vectis-ui" alt="MIT license" /></a>
</p>

<p align="center">
  <a href="https://vectis-ui.com">Documentation</a> ·
  <a href="https://vectis-ui.com/docs/installation/">Installation</a> ·
  <a href="CHANGELOG.md">Changelog</a>
</p>

## Introduction

Vectis UI is a set of Vue 3 components written in TypeScript.
The whole look is driven by CSS custom properties (`--vectis-*`), so you can retheme the library, or a single part of a page, without rebuilding anything. Styles live in cascade layers, which means your own CSS wins without fighting over specificity.

A few things you get out of the box:

- **No runtime dependency** other than Vue itself.
- **Pay for what you import.** Each component ships as its own module with its own stylesheet.
- **SSR-safe**, so it works with Nuxt 3 and 4 without a module or a plugin.
- **Accessible by default.** Keyboard support and ARIA semantics on every component, with axe checks run in CI against both the light and the dark theme.
- **Light and dark themes**, switchable on any DOM subtree with a `data-theme` attribute.
- **English and French** built in, and any other language can be added from your app.
- **No icon font required.** The icons the library draws are embedded SVGs, and you can plug in your own icon set.

## Quick start

Install the package:

```bash
npm install vectis-ui
# or
pnpm add vectis-ui
# or
yarn add vectis-ui
```

Import the global stylesheet once, in your app's entry point:

```ts
// main.ts
import 'vectis-ui/styles.css'
```

Then import the components you need:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VInput } from 'vectis-ui'

const email = ref('')
</script>

<template>
  <VInput v-model="email" type="email" label="Email" />
  <VButton>Subscribe</VButton>
</template>
```

Using Nuxt? Declare the stylesheet in `nuxt.config.ts` instead, so it's injected during server rendering:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['vectis-ui/styles.css'],
})
```

The [installation guide](https://vectis-ui.com/docs/installation/) covers both setups in more detail.

## Documentation

Everything lives on **[vectis-ui.com](https://vectis-ui.com)**, a page per component with live examples and API tables, plus guides on [theming](https://vectis-ui.com/docs/theming/), [iconography](https://vectis-ui.com/docs/iconography/), [internationalization](https://vectis-ui.com/docs/i18n/) and [accessibility](https://vectis-ui.com/docs/accessibility/).

## Browser support

Vectis UI targets recent browsers only:

| Chrome / Edge | Safari | Firefox |
| ------------- | ------ | ------- |
| 134+          | 26+    | 147+    |

Two features set this floor: CSS anchor positioning, used without a JavaScript fallback, and the `closedby` attribute of `<dialog>` (Chrome 134), which keeps a modal open on Escape or on a click outside when it should be. Safari does not implement `closedby` yet, and a small script stands in for it there. Some effects, like entry animations, are progressive enhancements and simply don't play on engines that lack them.

If your bundler targets older browsers, it may rewrite part of the library's CSS during minification. Set `build.cssTarget` to the versions above in your Vite (or Nuxt) config to keep it intact.

## Versioning

Vectis UI follows [Semantic Versioning](https://semver.org/). While the version is still 0.x, a minor release can include breaking changes, so read the [changelog](CHANGELOG.md) before upgrading.

## Contributing

The repository is a pnpm monorepo:

```
packages/ui   the vectis-ui library
apps/docs     the documentation site (Nuxt)
```

To get it running locally:

```bash
corepack enable pnpm
pnpm install
pnpm storybook                     # component workshop on port 6006
pnpm --filter vectis-docs dev      # documentation site on port 3000
```

Before opening a pull request, make sure the full check passes:

```bash
pnpm lint && pnpm format && pnpm typecheck && pnpm test && pnpm build
```

Bug reports and feature requests are welcome in the [issue tracker](https://github.com/Jypyx/vectis-ui/issues).

## License

Vectis UI is released under the [MIT license](LICENSE).

The built-in icons are drawn from [Material Symbols](https://github.com/google/material-design-icons) by Google, used under the Apache License 2.0. See [NOTICE](NOTICE) for details.
