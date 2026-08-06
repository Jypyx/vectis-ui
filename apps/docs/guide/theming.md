# Theming

Everything visual in Vectis UI is a custom property, generated from a typed TypeScript
source in DTCG format. Component styles contain no raw value, which is what makes a theme
a matter of redefining variables rather than overriding rules.

## Two levels

**Primitives** are the raw scales: OKLCH palettes (`--vectis-color-indigo-500`), spacing
(`--vectis-space-4`), type, radii, shadows, durations and easings.

**Semantics** are the only ones components read: `--vectis-color-surface`,
`--vectis-color-text-muted`, `--vectis-color-accent`, `--vectis-radius-interactive`,
`--vectis-focus-ring-color`, and the typography recipes such as
`--vectis-text-heading-2-size`.

The distinction matters when you retheme. Changing a primitive moves everything derived
from it; changing a semantic moves one role. A theme is almost always a handful of
semantics.

## Runtime overrides

There is no build step. A theme is CSS:

```css
/* a "coral" theme: a new accent, and pill-shaped controls */
:root {
  --vectis-color-accent: oklch(58% 0.2 25);
  --vectis-color-accent-hover: oklch(51% 0.19 25);
  --vectis-radius-interactive: 9999px;
}
```

…or JavaScript, on a subtree if you like:

```ts
panel.style.setProperty('--vectis-color-accent', 'oklch(58% 0.2 25)')
```

## Why your overrides win

The library's CSS lives in cascade layers, declared in this order:

```
vectis.reset < vectis.tokens < vectis.components < vectis.utilities
```

An unlayered rule beats every layer, whatever its specificity — so **any style you write
outside a layer wins automatically**, and overriding a component never turns into a
specificity war.

Every sheet the library emits re-declares that order, which is what makes it hold no
matter which one your bundler happens to place first.

This site is built on that guarantee: its own stylesheets are deliberately unlayered, and
that is how the mobile navigation drawer reshapes a `VDialog` into a full-height panel
without a single `!important`.

## Dark mode

```html
<html data-theme="dark"></html>
```

The attribute works on any subtree, and it also drives `color-scheme`, which is what makes
scrollbars and native form controls follow. See
[Installation](/guide/installation#dark-mode) for the pre-paint script that avoids a flash
on a server-rendered page.

## Component-level variables

Beyond the tokens, components expose local variables you may find in devtools —
`--tone-bg-solid`, `--control-height`, `--fill-fraction` and their kin. These are
**private and non-contractual**: they are qualified by their component or by the
cross-cutting contract they implement, and they may change without a major version.

Only `--vectis-*` is public API.

## Reading the tokens programmatically

```ts
import { tokens, flattenTokens } from '@vectis/ui/tokens'

// [{ path: ['color', 'surface'], cssName: '--vectis-color-surface', token: {…} }, …]
const semanticColors = flattenTokens(tokens.semantic.color, ['color'])
```

`@vectis/ui/tokens.json` exposes the same source as raw JSON, for tooling and
configuration export.
