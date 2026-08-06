<script setup lang="ts">
import { VIcon, VButton } from '@vectis/ui'
</script>

# Icons

**No icon font is required.** The icons the library renders itself — `VDialog`'s cross,
`VMenu`'s chevrons, the toasts' tone icons, `VDataTable`'s sort glyphs — are embedded SVG
paths, exact replicas of Material Symbols Rounded at weight 400, grade 0, optical size 24.

They weigh about 2 kB gzipped and are deliberately not tree-shakable, because the lookup
happens at runtime by name. That is the price of the design system's autonomy, and it is
paid once.

<DocsDemo align="center">
  <VIcon name="check_circle" :size="28" />
  <VIcon name="warning" :size="28" />
  <VIcon name="search" :size="28" />
  <VIcon name="expand_more" :size="28" />
  <VIcon name="close" :size="28" />
</DocsDemo>

## Resolution order

`VIcon` resolves its source in a fixed order, and the order **is** the contract:

1. an explicit `render` prop,
2. the `src` prop,
3. the `name` prop — first your resolver, then the built-in registry, then a ligature,
4. the default slot.

Your resolver comes before the registry, otherwise the library's own icons would stay
Material for anyone who wired in a different set. And a resolver returning `undefined`
hands over to the registry, which is what makes **partial** mappings usable.

```vue
<VIcon name="close" />
<!-- the built-in registry: SVG, no font -->
<VIcon name="favorite" />
<!-- outside the registry: a ligature from your icon font -->
<VIcon src="/logo.svg" label="Logo" />
<!-- an image -->
<VIcon><svg><!-- … --></svg></VIcon>
<!-- an inline SVG -->
```

## Names versus renderings

Every icon prop in the library accepts a name **or** an explicit rendering, and there is
no heuristic between them: a string is _always_ a name, while an image or a component is
declared as an object.

```vue
<VButton icon-start="download">Export</VButton>
<VBreadcrumb :separator="{ src: '/chevron.svg' }" :items="items" />
<VMenuItem label="Open" :icon-start="{ component: FolderIcon }" />
```

That is precisely what lets Iconify-style names such as `mdi:close` or `fa6-solid:xmark`
reach your resolver instead of being mistaken for a URL.

## Sizing

An icon is `1em` by default, so it follows the surrounding text. A numeric `size` prop
overrides that in pixels and always wins.

With no prop, any ancestor can drive the context by setting `--vectis-icon-size` and
`--vectis-icon-opsz` — which is exactly what the shared control-size class does, so an
icon inside a `VButton` follows the button's size with no configuration.

`--vectis-icon-opsz` only affects a **ligature**: it is a font axis, and it has no hold on
an embedded SVG, an image or a third-party component. The size applies to every source.

## Wiring your own library

`setIconResolver` takes a function returning one of five shapes — `{ path }`,
`{ component }`, `{ src }`, `{ text }`, `{ class }` — or `undefined` to defer. Three
factories cover the common families:

```ts
// main.ts, or a universal Nuxt plugin — at MODULE level, never inside a setup()
import { setIconResolver, classIconResolver } from '@vectis/ui'

// Font Awesome, Phosphor, Bootstrap Icons — class-based fonts
setIconResolver(
  classIconResolver({
    aliases: { close: 'xmark', expand_more: 'angle-down', check_circle: 'circle-check' },
    className: (name) => `fa-solid fa-${name}`,
  }),
)
```

```ts
// Lucide, Untitled UI — SVG sets as Vue components with a single <svg> root
import { componentIconResolver } from '@vectis/ui'
import { X, Check, ChevronDown } from 'lucide-vue-next'

setIconResolver(
  componentIconResolver({
    components: { close: X, check: Check, expand_more: ChevronDown },
    props: () => ({ strokeWidth: 1.75 }),
  }),
)
```

```ts
// Material Symbols, ligature-based IcoMoon builds — this one also routes the library's
// own icons through the font, which restores the --vectis-icon-opsz optical axis.
import { ligatureIconResolver } from '@vectis/ui'

setIconResolver(ligatureIconResolver())
```

`classIconResolver` is **strict** by default: a registry name missing from your alias
table falls back to the embedded SVG rather than emitting a class that draws nothing. Your
own names always pass through.

This site is itself a partial resolver. Its chrome needs six icons the registry does not
carry — `menu`, `computer`, `light_mode`, `dark_mode`, `open_in_new`, `content_copy` —
so it answers for those and lets the other thirty come from the library.

## Server-side rendering

Set the resolver at module level. The state lives in the process, which is right for
configuration and wrong for per-request state.

Above all, never install it client-only: the server would render the built-in SVG and the
client yours, which is a hydration mismatch on every icon. Font Awesome's "SVG with JS"
mode, which rewrites elements in the DOM, is unsupported for the same reason — use its CSS
mode.

## Loading an icon font

Still useful for names of your own. The library's `--vectis-font-family-icon` token is
what a ligature is rendered with, so switching to another ligature-based font needs no
resolver at all — just override the token.

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
/>
```

`display=block` avoids flashing the icon's name in full while the font loads. With no font
at all the layout still holds, since the textual name stays inside the icon's box.

## Accessibility

Icons are **decorative by default** (`aria-hidden`), so a button's accessible name stays
its label. The `label` prop makes one informative instead, adding `role="img"` and the
name.

The `data-icon` attribute carries the requested name whatever the source ends up being — a
stable hook for your own CSS and for tests.
