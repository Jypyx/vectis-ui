<script setup lang="ts">
import { VIcon } from '@vectis/ui'

definePageMeta({ layout: 'docs' })
useHead({ title: 'Iconography' })

const basicCode = `<VIcon name="close" />
<VIcon name="favorite" />
<VIcon :render="{ src: '/logo.svg' }" label="Logo" />`

const resolverCode = `import { setIconResolver, ligatureIconResolver } from '@vectis/ui'

setIconResolver(ligatureIconResolver())`

const partialCode = `// this site's own resolver: five icons the library does not ship.
// Answering \`undefined\` hands the name back to the built-in registry,
// which is what makes a PARTIAL mapping legal.
setIconResolver((name, context) => {
  const paths = docsIcons[name]
  if (!paths) return undefined
  return { path: (context.filled && paths[1]) || paths[0] }
})`
</script>

<template>
  <h1>Iconography</h1>
  <p class="vd-lead">
    No icon font is required, and none is bundled. The icons the library renders itself are embedded
    SVG paths — exact replicas of Material Symbols Rounded (weight 400, GRAD 0, optical size 24,
    Apache-2.0 © Google).
  </p>
  <p>
    They weigh about 3.7 kB gzip and are deliberately not tree-shakable — the lookup is by string at
    runtime, which is the price of the design system's autonomy. The built-in registry holds 34
    icons, and each entry is <code>[outline, filled?]</code>: the second path exists only where the
    FILL axis really changes the geometry, which is the case for 15 of the 34.
  </p>
  <DocsDemo>
    <VIcon name="search" :size="24" />
    <VIcon name="close" :size="24" />
    <VIcon name="check_circle" :size="24" />
    <VIcon name="check_circle" filled :size="24" />
    <VIcon name="warning" :size="24" />
    <VIcon name="notifications" :size="24" />
    <VIcon name="notifications" filled :size="24" />
    <VIcon name="schedule" :size="24" />
    <VIcon name="code" :size="24" />
    <span style="font-size: var(--vectis-text-caption-size); color: var(--vectis-color-text-muted)">
      Third and fourth, sixth and seventh: the same name, outline then filled.
    </span>
  </DocsDemo>

  <h2 id="resolution-order">The resolution order</h2>
  <p>
    VIcon resolves its source in this order, and the order is the contract: an explicit
    <code>render</code> → <code>src</code> → <code>name</code> (your resolver, then the built-in
    registry, then the ligature font) → the slot.
  </p>
  <DocsCode lang="vue" :code="basicCode" />
  <p>
    A string is ALWAYS a name; an image or a component is declared explicitly as an object (<code
      >{ src }</code
    >, <code>{ component }</code>, <code>{ path }</code>, <code>{ text }</code>,
    <code>{ class }</code>). There is no heuristic, and that is what lets Iconify-style names such
    as <code>mdi:close</code> reach your resolver intact instead of being mistaken for an address.
  </p>

  <h2 id="wiring-your-own-library">Wiring your own library</h2>
  <DocsCode lang="ts" :code="resolverCode" />
  <p>
    The resolver is consulted BEFORE the built-in registry, or the design system's own icons would
    stay Material for a consumer who wired in their own library. Three factories ship for the three
    families of icon source: <code>ligatureIconResolver</code> for a font whose ligature is the
    glyph, <code>classIconResolver</code> for one driven by a class and a pseudo-element, and
    <code>componentIconResolver</code> for a set shipped as components.
  </p>
  <p>
    Set it at module level — a Nuxt plugin, <code>main.ts</code> — never inside a
    <code>setup()</code>, and never client-only: a resolver installed after hydration makes the
    browser draw different icons from the ones the server sent.
  </p>

  <h3 id="partial-mappings">Partial mappings</h3>
  <p>
    A resolver answering <code>undefined</code> means "I do not know this name", not "draw nothing":
    VIcon then falls back to the registry, and after that to the ligature. That distinction is what
    makes it worth mapping five names and leaving the rest alone — which is precisely what this site
    does, since its chrome needs five icons the library has no reason to ship.
  </p>
  <DocsCode lang="ts" :code="partialCode" />
  <blockquote>
    An unloaded ligature renders its own NAME in plain text, clipped to the icon's box. The layout
    survives either way — but seeing a word where an icon belongs is the symptom of a name nothing
    resolved.
  </blockquote>

  <h2 id="sizing-and-semantics">Sizing and semantics</h2>
  <p>
    Icons are 1em by default and follow the surrounding text. A parent sets the context through
    <code>--vectis-icon-size</code> and <code>--vectis-icon-opsz</code> — which is exactly what
    <code>v-control</code> does for each control size — and a numeric <code>size</code> prop wins
    over it. Note that the optical-size axis only reaches a LIGATURE: the registry's paths are drawn
    at one optical size and cannot follow it.
  </p>
  <p>
    Icons are decorative by default and carry <code>aria-hidden</code>. Giving one a
    <code>label</code> makes it informative instead — which is right when the icon is the only thing
    saying what a control does, and wrong when the text beside it already says so.
  </p>
  <p>
    They are rendered as <code>&lt;svg&gt;&lt;path&gt;</code> and never as a masked background, for
    one reason: under Windows forced-colors a masked background disappears entirely, while
    <code>fill: currentcolor</code> survives.
  </p>
</template>
