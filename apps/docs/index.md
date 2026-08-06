# Vectis UI

A Vue 3 design system, shipped as an npm library and compatible with Nuxt 3 (SSR).

Its principles are few and they are load-bearing: HTML and CSS first with JavaScript as a
last resort, a single typed token source driving every colour and measurement, and no
runtime dependency beyond Vue itself.

This site is built with the design system it documents — the buttons, the navigation, the
search field and the theme switch on this page are the very components described here.

```bash
pnpm add @vectis/ui vue
```

```ts
import { VButton } from '@vectis/ui'
import '@vectis/ui/styles.css'
```
