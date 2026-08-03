<script setup lang="ts">
/**
 * Icon, resolved in this order: image (`src`), then `name` — first the consumer
 * RESOLVER if one is set (`setIconResolver`, see `resolver.ts`), then the
 * BUILT-IN REGISTRY (embedded Material Symbols Rounded SVGs, see `icons.ts`),
 * otherwise the ligature (a font loaded by the CONSUMER, see the README) —
 * otherwise inline SVG through the slot. Decorative by default (aria-hidden);
 * `label` makes it informative (role="img" + aria-label).
 *
 * The order IS the contract: the resolver comes before the registry, otherwise
 * the DS's icons would stay Material for anyone who wired in their own library;
 * and a resolver returning `undefined` hands over to the registry, which is what
 * makes partial mappings usable.
 *
 * The registry is what makes the DS usable WITHOUT an icon font: the icons the
 * library renders itself (crosses, chevrons, VToast tones…) depend on nothing.
 * The ligature stays the fallback for any other name.
 *
 * No BEHAVIOURAL JS here despite the `computed`: no event, no lifecycle, no DOM
 * access — a pure source resolution, evaluated identically on server and client.
 */
import { computed, type Component } from 'vue'

import { builtinIcons, ICON_VIEW_BOX } from './icons'
import { resolveIcon } from './resolver'
import type { IconRender } from './types'

interface IconProps {
  /** Icon name: one of the built-in icons, otherwise a ligature of the consumer's font. */
  name?: string
  /**
   * Explicit render (image, component, path, class…) — takes precedence over
   * everything else. This is the route the `IconSource` props of the DS's
   * components take when the consumer does not supply a plain name.
   */
  render?: IconRender
  /** Image source (URL). Takes precedence over `name`. */
  src?: string
  /**
   * Explicit size in pixels (e.g. :size="32"). Without it: the context size
   * (`--vectis-icon-size` set by a parent, e.g. VButton), otherwise 1em — the
   * icon follows the surrounding text.
   */
  size?: number
  /** Accessible label; absent = a decorative icon (aria-hidden). */
  label?: string
  /**
   * Filled variant (`FILL` axis 1 instead of 0): honoured by the built-in
   * registry when the geometry differs, and by the ligature. No effect on the
   * `src` (image) and inline-SVG sources.
   */
  filled?: boolean
}

const props = withDefaults(defineProps<IconProps>(), {
  name: undefined,
  render: undefined,
  src: undefined,
  size: undefined,
  label: undefined,
  filled: false,
})

defineSlots<{
  /** Inline SVG (used when neither `src` nor `name` is given). */
  default?(): unknown
}>()

/**
 * The chosen shape, tagged: the public `IconRender` union is not discriminated
 * (the consumer has nothing to tag), but the template needs a reliable
 * discriminant — and the tag encodes the documented precedence along the way.
 */
type Resolved =
  | { kind: 'path'; path: string; viewBox: string }
  | { kind: 'component'; component: Component; props?: Record<string, unknown> }
  | { kind: 'src'; src: string }
  | { kind: 'text'; text: string; class?: string }
  | { kind: 'class'; class: string }

function tag(render: IconRender): Resolved {
  if ('path' in render)
    return { kind: 'path', path: render.path, viewBox: render.viewBox ?? ICON_VIEW_BOX }
  if ('component' in render)
    return { kind: 'component', component: render.component, props: render.props }
  if ('src' in render) return { kind: 'src', src: render.src }
  if ('text' in render) return { kind: 'text', text: render.text, class: render.class }
  return { kind: 'class', class: render.class }
}

/** Explicit `render`, then the consumer resolver, then the built-in registry; otherwise the ligature. */
const resolved = computed<Resolved | undefined>(() => {
  if (props.render) return tag(props.render)
  if (props.src !== undefined || props.name === undefined) return undefined

  const custom = resolveIcon(props.name, { filled: props.filled })
  if (custom) return tag(custom)

  const paths: readonly string[] | undefined = (
    builtinIcons as Record<string, readonly string[] | undefined>
  )[props.name]
  // The filled path only exists if the FILL axis changes the geometry (see icons.ts).
  const path = paths && ((props.filled ? paths[1] : undefined) ?? paths[0])
  return path ? { kind: 'path', path, viewBox: ICON_VIEW_BOX } : undefined
})
</script>

<template>
  <span
    class="v-icon"
    :style="size !== undefined ? { '--vectis-icon-size': `${size}px` } : undefined"
    :data-icon="name"
    :data-filled="filled || undefined"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
  >
    <template v-if="resolved">
      <svg
        v-if="resolved.kind === 'path'"
        class="v-icon-svg"
        :viewBox="resolved.viewBox"
        aria-hidden="true"
        focusable="false"
      >
        <path :d="resolved.path" />
      </svg>
      <component
        :is="resolved.component"
        v-else-if="resolved.kind === 'component'"
        v-bind="resolved.props"
      />
      <img v-else-if="resolved.kind === 'src'" class="v-icon-img" :src="resolved.src" alt="" />
      <!-- the interpolation touches the tags: a ligature tolerates no surrounding whitespace -->
      <span v-else-if="resolved.kind === 'text'" class="v-icon-symbol" :class="resolved.class">{{
        resolved.text
      }}</span>
      <span v-else class="v-icon-glyph" :class="resolved.class" />
    </template>
    <img v-else-if="src" class="v-icon-img" :src="src" alt="" />
    <span v-else-if="name" class="v-icon-symbol">{{ name }}</span>
    <slot v-else />
  </span>
</template>

<style>
@layer vectis.components {
  .v-icon {
    /*
     * Size resolution, by priority:
     * 1. the `size` prop (px) — set as an inline --vectis-icon-size on the
     *    element: an own declaration beats inheritance and the layer;
     * 2. --vectis-icon-size / --vectis-icon-opsz inherited from a parent (the
     *    context API: VButton sets them from its own size);
     * 3. 1em — the icon follows the parent's text size.
     */
    --icon-size: var(--vectis-icon-size, 1em);
    --icon-opsz: var(--vectis-icon-opsz, 24);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    inline-size: var(--icon-size);
    block-size: var(--icon-size);
    /* the Material Symbols ligature is sized through font-size */
    font-size: var(--icon-size);
  }

  /* Degraded state when the font is not loaded: the textual name stays inside the
     square instead of breaking the layout. Set on the ONLY branch it protects and
     not on `.v-icon`: a third-party icon font may draw a glyph outside its 1em
     box, which would then be clipped. */
  .v-icon:has(> .v-icon-symbol) {
    overflow: hidden;
  }

  .v-icon-symbol {
    font-family: var(--vectis-font-family-icon);
    font-weight: var(--vectis-font-weight-regular);
    font-style: normal;
    line-height: var(--vectis-font-leading-none);
    letter-spacing: normal;
    text-transform: none;
    white-space: nowrap;
    direction: ltr;
    /* Material Symbols font axes (FILL/wght/GRAD/opsz): a technical contract of
       the font, not design tokens — literal values tolerated, like opacities */
    font-variation-settings:
      'FILL' var(--icon-fill, 0),
      'wght' 400,
      'GRAD' 0,
      'opsz' var(--icon-opsz);
  }

  .v-icon[data-filled] .v-icon-symbol {
    --icon-fill: 1;
  }

  .v-icon-img,
  .v-icon > svg {
    inline-size: 100%;
    block-size: 100%;
    object-fit: contain;
  }

  /* Class font supplied by a resolver (Font Awesome, Phosphor…): the glyph comes
     from a `::before`, sized by `.v-icon`'s `font-size`. The DS owns the element,
     so one rule is enough — `font-style` pre-empts the `<i>` conventions, and
     `line-height` stops the inherited line box off-centring the glyph. */
  .v-icon-glyph {
    display: block;
    font-style: normal;
    line-height: var(--vectis-font-leading-none);
  }

  /* SVG from the built-in registry. `fill` is set on OUR class and never on
     `.v-icon > svg`: a multicolour SVG passed through the slot keeps its colours.
     `display: block` removes the baseline gap under the inline element. */
  .v-icon-svg {
    display: block;
    fill: currentcolor;
  }
}
</style>
