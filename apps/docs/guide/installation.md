# Installation

```bash
pnpm add @vectis/ui vue
```

Vue 3.5 or later is a peer dependency, and it is the only one — the library ships no
runtime dependency of its own.

## Styles

```ts
// main.ts
import '@vectis/ui/styles.css'
```

`styles.css` is the **core**: the reset, the tokens and the chrome shared by every
component, about 3.8 kB gzipped. Each component's own CSS ships with the component and is
pulled in by the import you already write, so you download the CSS of what you actually
use — a lone `VButton` costs 4.6 kB gzipped instead of the 18 kB a single bundled
stylesheet would.

That works because the package declares `sideEffects: ["**/*.css"]`. Do not override it:
without it a bundler is free to prune the stylesheet import that rides along with each
component, and the components render unstyled.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VInput, toast } from '@vectis/ui'

const email = ref('')
</script>

<template>
  <VInput v-model="email" type="email" required placeholder="you@example.com" aria-label="Email" />
  <VButton @click="toast({ message: `Confirmation sent to ${email}`, tone: 'success' })">
    Subscribe
  </VButton>
</template>
```

Everything is a named export, and the build preserves one module per component, so an
import of `VButton` pulls in `VButton` and nothing else.

## Nuxt 3

The library is pre-built as ESM and safe to render on the server. No module, no plugin, no
`build.transpile`:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['@vectis/ui/styles.css'],
})
```

Component CSS travels with its component as a plain static import, which Vite, Nitro and
webpack all turn into a render-blocking `<link>` — including for a lazily loaded route,
whose stylesheet is awaited before the chunk runs.

The one setup that would flash is a hand-rolled SSR server injecting its client CSS
_through JavaScript_ (`vite-plugin-css-injected-by-js`, webpack's `style-loader`): there
the first paint carries the core — tokens, layout, hidden popovers — but not the
components' internal rules. Keep the client CSS extracted to a file and the question does
not arise.

Locale and icon configuration belongs in a **universal** plugin — `plugins/vectis.ts`,
never `plugins/vectis.client.ts`. Both are module-level global state, so configuring them
on the client alone makes the two renders diverge, and the mismatch surfaces as hydration
warnings and a flash of the wrong text.

## Dark mode

The generated stylesheet declares the light palette on `:root` and both themes on
`[data-theme='light']` and `[data-theme='dark']`. Switching is one attribute:

```html
<html data-theme="dark"></html>
```

It applies to **any DOM subtree**, so a dark panel inside a light page — or the reverse —
costs nothing extra, and it drives `color-scheme` along with it, which is what makes
scrollbars and native controls follow.

There is deliberately no `prefers-color-scheme` query anywhere in the library. Resolving
"follow the system" is the host's job, because only the host knows whether the user has
already chosen. The pattern is a stored preference, applied before the first paint:

```html
<script>
  const stored = localStorage.getItem('theme') || 'system'
  const dark =
    stored === 'dark' || (stored !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
</script>
```

Run it inline in `<head>`, before the stylesheet is applied, or a prerendered page paints
light before your script gets to it.

## Browser support

The library targets modern evergreen browsers and uses several platform features without a
fallback, deliberately: the Popover API, `<dialog>`, `<details name>`, `:user-invalid`,
`color-mix()`, `:has()` and `@starting-style` are all Baseline.

CSS anchor positioning is the one exception worth knowing about. Floating panels — menus,
comboboxes, tooltips, pickers — are positioned with it and there is no JavaScript
fallback, so they need Chrome/Edge 125+ or Safari 26+. In Firefox, which has not shipped
it as stable, a panel still opens, is still keyboard-navigable and still announces
correctly; it is simply not anchored to its trigger.
