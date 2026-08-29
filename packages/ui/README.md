# @vectis/ui

A **Vue 3 + TypeScript** design system, **Nuxt 3 (SSR)** compatible, built on the platform's native primitives: the Popover API, CSS Anchor Positioning, `<details name>`, `:user-invalid`… JavaScript is a last resort, never a reflex.

## Principles

- **HTML and CSS first.** Menus, tooltips and toasts rest on the Popover API (`popovertarget`, the top layer, native light dismiss) and CSS anchor positioning — **no positioning library**. Accordions are `<details name>`. Where JS exists, it is justified by a comment in the component.
- **Zero runtime dependency** besides `vue` (a peer dependency).
- **All styling goes through design tokens** (`--vectis-*`), overridable at runtime with no rebuild.
- **Real tree-shaking**: ESM, one module per component, named imports.

## Installation

```bash
pnpm add @vectis/ui vue
```

```ts
// main.ts
import '@vectis/ui/styles.css'
```

`styles.css` is the **core**: the reset, the tokens and the chrome shared by every component (4.33 kB gzip). Each component's own CSS ships with the component and is pulled in by the import you already write — nothing else to add, and you download the CSS of what you use. A single `VButton` costs 4.87 kB gzip of CSS instead of the 21.58 kB of a bundled stylesheet.

Those figures are measured, not estimated: `pnpm --filter @vectis/ui bench:size` prints them from the built artefact and holds them to a committed baseline, so they cannot drift out of step with the library again.

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

## Nuxt 3

The library is pre-built as ESM and SSR-safe (no `window`/`document` access outside the client lifecycle). No module and no plugin needed:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['@vectis/ui/styles.css'],
})
```

```vue
<script setup lang="ts">
import { VButton, VBadge } from '@vectis/ui'
</script>
```

Named imports are tree-shaken by Vite/Nitro. No `build.transpile` required.

Component CSS travels with the component as a plain static `import`, which Vite, Nitro and webpack all turn into a render-blocking `<link>` — including for a lazily loaded route, whose stylesheet is awaited before the chunk runs. The one setup that would flash is a hand-rolled SSR server that injects its client CSS **through JavaScript** (`vite-plugin-css-injected-by-js`, webpack's `style-loader`): there, the first paint carries the core (tokens, layout, hidden popovers) but not the components' internal rules. Keep the client CSS extracted to a file and the question does not arise.

For the locale and the icons, put the configuration in a **universal** plugin — `plugins/vectis.ts`, never `plugins/vectis.client.ts`: a client-only configuration would make the server and client renders diverge, hence a hydration mismatch. See [Internationalization](#internationalization).

## Theming

### Token architecture

Two levels of custom properties, generated from a typed TypeScript source (a format inspired by the [W3C DTCG](https://design-tokens.github.io/community-group/format/)):

- **Primitives**: OKLCH palettes (`--vectis-color-indigo-500`), spacing scales (`--vectis-space-4`), type, radii, shadows, durations/easings.
- **Semantics** — the only ones components consume: `--vectis-color-surface`, `--vectis-color-text-muted`, `--vectis-color-accent`, `--vectis-radius-interactive`, `--vectis-focus-ring-color`…

### Dark mode

```html
<html data-theme="dark"></html>
```

`data-theme` works on **any DOM subtree** (a dark panel inside a light page, or the reverse) and also drives `color-scheme` (scrollbars, native controls).

### Runtime overrides — no rebuild

Every customization is a redefinition of custom properties, in CSS:

```css
/* a "coral" theme: accent + pill radii */
:root {
  --vectis-color-accent: oklch(58% 0.2 25);
  --vectis-color-accent-hover: oklch(51% 0.19 25);
  --vectis-radius-interactive: 9999px;
}
```

…or in JavaScript, on a subtree included:

```ts
panel.style.setProperty('--vectis-color-accent', 'oklch(58% 0.2 25)')
```

The design system's CSS lives in layers (`vectis.reset < vectis.tokens < vectis.components < vectis.utilities`): **any non-layered consumer style wins automatically** — overriding a component never calls for a specificity war. Every sheet the library emits re-declares that order, so it holds whichever one your bundler happens to place first.

### Programmatic access to the tokens

```ts
import { tokens, flattenTokens } from '@vectis/ui/tokens'

// [{ path: ['color', 'surface'], cssName: '--vectis-color-surface', token: {...} }, …]
const semanticColors = flattenTokens(tokens.semantic.color, ['color'])
```

`@vectis/ui/tokens.json` exposes the same source as raw JSON (tooling, configuration export). It is the foundation of the theming app to come: modify the object, inject the variables, export the config.

## Icons

**No icon font is required.** The icons the library renders itself — `VDialog`'s cross, `VDatePicker`'s and `VMenu`'s chevrons, the toasts' tone icons, `VDataTable`'s sorting… — are **embedded SVGs**, exact replicas of Material Symbols Rounded (wght 400 · GRAD 0 · opsz 24, Apache-2.0 © Google). They weigh ~3.6 kB gzip and are not tree-shakable: that is the price of the design system's autonomy. It is a real cost rather than a rounding error — the registry is the largest single item in a lone `VButton`'s JavaScript, which comes to 8.12 kB gzip once `VIcon`, `VSpinner` and the dictionary are pulled in with it.

The `VIcon` component resolves its source in this order: **an explicit `render` → `src` → `name` (the consumer resolver, then the built-in registry, then the ligature) → the slot**.

```vue
<VIcon name="close" />
<!-- the built-in registry: SVG, no font needed -->
<VIcon name="favorite" />
<!-- outside the registry: a ligature from YOUR icon font -->
<VIcon src="/logo.svg" label="Logo" />
<!-- an image -->
<VIcon><svg …/></VIcon>
<!-- an inline SVG (the slot) -->
```

- **Decorative by default** (`aria-hidden`); the `label` prop makes it informative (`role="img"` + `aria-label`).
- The **`data-icon`** attribute carries the requested name whatever the source — a stable hook for consumer CSS and for tests.
- Size: **1em by default** — the icon follows the surrounding text. Override freely in pixels through `:size="32"`. With no prop, any parent can drive the context by setting the **`--vectis-icon-size`** and **`--vectis-icon-opsz`** custom properties (which is what the shared `v-control` class does — VButton, VInput, VTextarea, VInputOTP, VChip… — according to the control's size); the numeric prop wins over the context. `VSpinner` follows the same principle (1em + `:size` in px), with no context API.
- **`--vectis-icon-opsz` only applies to the ligature**: it is a font variable axis, with no hold on a built-in SVG, an image or a third-party component. The size, by contrast, applies to every source.

### Every icon prop takes a name **or** an explicit rendering

```vue
<VButton icon-start="download">Export</VButton>
<VBreadcrumb :separator="{ src: '/chevron.svg' }" :items="items" />
<VMenuItem label="Open" :icon-start="{ component: FolderIcon }" />
```

A string is **always** an icon name; an image or a component is declared as an object (`{ src }`, `{ component }`, `{ path }`, `{ text }`, `{ class }`). That is what lets Iconify-style naming conventions (`mdi:close`, `fa6-solid:xmark`) work.

### Wiring your own icon library

`setIconResolver` is consulted **before** the built-in registry; returning `undefined` means "I do not know this name" and hands over to the registry, then to the ligature. **Partial** mappings are therefore usable. The `VectisIconName` type enumerates the names to cover.

```ts
// main.ts / plugins/icons.ts — at MODULE level, never inside a setup()
import { setIconResolver, classIconResolver } from '@vectis/ui'

// Font Awesome, Phosphor, Bootstrap Icons… (class-based fonts + ::before)
// `fa-solid` unconditionally: the Free tier only draws a small fraction of the
// catalogue in Regular, so mapping `filled: false` onto it would render empty
// squares. FA's outline/filled pair requires the Pro tier.
setIconResolver(
  classIconResolver({
    aliases: { close: 'xmark', expand_more: 'angle-down', check_circle: 'circle-check' },
    className: (name) => `fa-solid fa-${name}`,
  }),
)

// Lucide, Untitled UI… (SVG sets as Vue components, a single <svg> root)
import { componentIconResolver } from '@vectis/ui'
import { X, Check, ChevronDown } from 'lucide-vue-next'
setIconResolver(
  componentIconResolver({
    components: { close: X, check: Check, expand_more: ChevronDown },
    props: () => ({ strokeWidth: 1.75 }),
  }),
)

// Material Symbols, ligature-based IcoMoon… — ALSO renders the design system's 20
// icons through the font, which restores the --vectis-icon-opsz optical axis
// (20 at xs/sm/md).
import { ligatureIconResolver } from '@vectis/ui'
setIconResolver(ligatureIconResolver())
```

`classIconResolver` is **strict** by default: a built-in registry name absent from your alias table falls back to the embedded SVG rather than producing a nonexistent class (an empty square). Your own names always pass through.

For a one-off need, `setIconResolver` accepts any function returning one of the five shapes: `{ path }`, `{ component }`, `{ src }`, `{ text }`, `{ class }`.

> **SSR** — set the resolver at module level (a Nuxt plugin, `main.ts`), never inside a `setup()`: the state lives in the process, which is correct for configuration and wrong for per-request state. Above all, **do not install it client-only** (`plugins/*.client.ts`): the server would render the built-in SVG and the client your library — a hydration mismatch. Font Awesome in "SVG with JS" mode (which replaces elements in the DOM) is not supported: use its CSS mode.

**Loading an icon font stays useful** for your own names. An example with Material Symbols Rounded through Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
/>
```

(or self-host the variable woff2, e.g. the `material-symbols` npm package). `display=block` avoids flashing the icon name in full. With no font loaded, the layout is preserved (the textual name stays inside the icon's box). Overriding the `--vectis-font-family-icon` token is enough to switch to another **ligature-based** font (Material Symbols Outlined/Sharp, an IcoMoon build) — with no resolver.

On `VButton`: the `icon-start` / `icon-end` props take an icon name or an explicit rendering (the `#start`/`#end` slots stay available for custom content and win over the props). `VButton` also accepts `href` (rendered as `<a>`; `disabled`/`loading` produce an inert link: `href` removed + `aria-disabled`) and `compact` (height reduced by 4px: 20/28/36/44/52px depending on the `xs`–`xl` size).

The `xs`–`xl` scale is not exposed by every component: those embedding a text input (`VInput`, `VTextarea`, `VInputOTP`, `VCombobox`, `VDateInput`, `VTimeInput`) restrict themselves to **`sm` / `md` / `lg`** (32/40/48px, default `md`), `compact` remaining available; `VChip` restricts itself to `xs`/`sm`.

## Internationalization

No user-facing text is hardcoded in the components: everything comes from a dictionary. The design system is **English by default** and ships French; any other language is added on the consumer side.

Two things are settled separately: the **words** come from the dictionary, the **formats** (month and day names, date field order, hour cycle, first day of the week) derive from `Intl` from the locale tag. Setting a locale with no matching dictionary therefore already gives correct dates, with labels left in English.

### Switching the design system to French

```ts
// main.ts
import { fr, registerMessages, setLocale } from '@vectis/ui'

registerMessages('fr', fr)
setLocale('fr-FR')
```

French is **opt-in**: it only enters your bundle if you import it.

Set a **complete** BCP 47 tag. `Intl` accepts `'en'`, but applies the language's default conventions to it — `'en'` means 12 h and a week starting on Sunday, which is not `'en-GB'`.

### Adjusting a few words

An override is **partial**: what you do not write stays unchanged, and successive calls on the same language accumulate.

```ts
import { registerMessages } from '@vectis/ui'

registerMessages('en', {
  dataTable: { empty: 'Nothing to display' },
  common: { close: 'Quit' },
})
```

### Adding a language the design system does not ship

The same gesture as enabling French — there are not two categories of dictionary. What you do not write falls back to English, never to an empty string: a partial dictionary is usable from its very first key.

```ts
import { registerMessages, setLocale, type VectisMessagesInput } from '@vectis/ui'

const de: VectisMessagesInput = {
  common: { loading: 'Wird geladen…', close: 'Schließen' },
  pagination: { previous: 'Vorherige Seite', next: 'Nächste Seite', page: (p) => `Seite ${p}` },
}

registerMessages('de', de)
setLocale('de-DE')
```

An entry depending on a value is a **TypeScript function**, not a placeholder string: no plural engine and no ICU syntax to learn. Type the constant as `VectisMessagesInput` for key autocompletion, or as `VectisMessages` to have the compiler require full coverage.

The key is the **language subtag** alone: `registerMessages('de', …)` covers `de-DE`, `de-AT` and `de-CH`.

### Precedence

A text prop set on a component stays **authoritative**: the global translation only changes the defaults. For containers' accessible names, the full chain is `aria-labelledby` › `aria-label` › the `label` prop › the dictionary › English.

`VDatePicker`, `VDateInput`, `VTimePicker` and `VTimeInput` keep their `locale` prop, which takes precedence; without it, they follow the global locale.

```vue
<VDateInput />
<!-- the global locale -->
<VDateInput locale="ja-JP" />
<!-- forced -->
```

### Limit: one locale per process

The configuration lives at module level, like the icons': **a single locale per process**. A server-rendered site serving `/fr` and `/en` from the same Node process cannot rely on it to vary the language per request — it must pass the text props explicitly.

## Components

| Area      | Components                                                                                                                                                                                                           |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actions   | `VButton`, `VIconButton`, `VChip` (selectable, dismissible)                                                                                                                                                          |
| Forms     | `VInput`, `VTextarea`, `VCheckbox`, `VRadio`, `VSwitch`, `VSlider` (single/range), `VInputOTP`, `VCombobox` (search, multi)                                                                                          |
| Overlays  | `VTooltip`, `VMenu` + `VMenuItem`/`VMenuGroup`/`VMenuSeparator` (recursive submenus)                                                                                                                                 |
| Structure | `VAccordion` + `VAccordionItem`, `VDataTable` (sorting, responsive), `VBreadcrumb` (data-driven, truncation)                                                                                                         |
| Feedback  | `VToaster` + `toast()` (notifications), `VBadge`, `VAvatar`, `VSpinner`, `VSkeletonLoader` (loading silhouettes), `VProgressLinear`, `VProgressCircular`, `VIcon` (built-in SVGs, a font, an image or an inline SVG) |

Implementation notes worth knowing:

- **VSlider range** superimposes two native `<input type="range">` (each thumb stays a real keyboard/ARIA slider); the JS only prevents them crossing.
- **VDataTable responsive**: the `stack` mode is pure CSS (container queries) — under a 640px container, rows become cards and the headers are re-injected through `::before + data-label`.
- **VCombobox** follows the ARIA combobox/listbox pattern (`aria-activedescendant`, focus stays in the input); the panel is aligned on the control through `anchor-size(width)`.
- **VToast**: mount `<VToaster />` once (at the app root), then call `toast({ message, tone, ... })` from anywhere — a component, a store, an API response (client only, never during SSR). Placements as Popover API stacks (the top layer), auto-dismiss (5 s by default, `duration: 0` = persistent, paused on hover), `dismissToast(id?)` to close programmatically.

Cross-cutting conventions:

- Prop-driven variants → `data-variant` / `data-tone` / `data-size` attributes (targetable in CSS).
- `v-model` wherever state exists (`v-model:open` for VMenu).
- Floating elements take their trigger from a scoped slot: `<template #trigger="{ triggerProps }"><VButton v-bind="triggerProps">…</VButton></template>` — `popovertarget` and the ARIA attributes are set for you.
- Forms: the visual error state comes from native `:user-invalid` (zero validation JS); the `invalid` prop forces the state for server-side validation.

The living documentation (stories, tokens page, theme switch): `pnpm storybook`.

## Browser support

Target: **modern browsers** — Chrome/Edge 125+, Safari 26+, Firefox 147+.

- Baseline, no compromise: the Popover API, `<dialog>`, `<details name>`, `:user-invalid`, `:has()`, `color-mix()`, `@layer`, custom properties.
- **CSS Anchor Positioning** (VTooltip, VMenu and its submenus, VCombobox): shipped with no JS fallback, a deliberate choice — every engine above the floor implements it, Firefox from 147.
- Pure progressive enhancement (clean degradation when unsupported): `@starting-style`/`allow-discrete` animations, `field-sizing: content` (VTextarea `auto-grow`), `::details-content` + `interpolate-size` (the VAccordion animation), and the scroll shadows of `VDialog` (`container-type: scroll-state`, Chrome/Edge 133+ — elsewhere the hairlines simply stay invisible).

## Accessibility

Keyboard navigation and ARIA semantics on every component: the ARIA menu pattern (roving focus, focus returned to the trigger), `role="switch"`, tooltips linked by `aria-describedby` and dismissible with Escape (WCAG 1.4.13), `role="status"`/`role="alert"` according to criticality, an accessible label **required** on `VIconButton`. `prefers-reduced-motion` respected everywhere. Storybook's a11y addon audits every story.

## Security model

The package has **no runtime dependency** beyond Vue, makes **no network request**, and reads no
storage. It renders no consumer string as HTML: there is no `v-html` anywhere in the library.

One contract is yours, and it is the standard one for a component library: **the design system does
not filter URL schemes.** `href` (`VButton`, `VChip`, `VAvatar`, `VMenuItem`, `VSideNavigationItem`,
`VBreadcrumb`) and `src` (`VIcon`, `VAvatar`) are passed through untouched, so a `javascript:` URL
coming from your data runs on click. Validate it where the data enters your application — with
particular care for `VBreadcrumb`, whose `items[].href` is typically built from a CMS or an API
rather than written by hand.

Custom colour props (`color` on `VChip`, `VBadge`, `VAvatar`, `VDatePicker` events) are written to CSS
custom properties through `style.setProperty`, so they cannot escape the `style` attribute — but a
hostile value can still be a valid `url(…)`, i.e. a tracking beacon. Treat them as data to validate
if they come from outside your application.

## Contributing

```bash
corepack enable pnpm
pnpm install
pnpm storybook          # development
pnpm lint && pnpm format && pnpm typecheck && pnpm test && pnpm build && pnpm build-storybook
```

- **Tokens**: never edit `src/styles/tokens.css` or `src/tokens/tokens.json` (generated) — change the `src/tokens/*.ts` source then run `pnpm tokens`.
- **A new component**: a `src/components/VX/` folder with `VX.vue` (non-scoped styles in `@layer vectis.components`, semantic tokens only, variants through `data-*`), `VX.stories.ts` (default, variants, states, edge cases, play functions), `VX.test.ts` (logic only — browser behaviour is tested in the play functions), and the named export in `src/index.ts`. The Storybook `title` and the `.mdx` heading are written **without the `V`** — the only exception to the prefix.
- **Its CSS ships as `dist/components/VX/VX.css`, imported by `VX.js`.** No rule may depend on where another component's sheet lands: a declaration that would collide with another component's at equal specificity is qualified (`[data-size]`, a compound class, a descendant) or routed through the custom property the target reads. `pnpm build` checks the mechanism.
- Any behavioural JS must be justified by a comment: "can modern HTML/CSS do it?" comes first.
