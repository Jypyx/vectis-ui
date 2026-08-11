<script setup lang="ts">
// @core
/**
 * An icon, whatever the icons of the host application happen to be made of. The
 * component's real work is deciding WHERE the drawing comes from, and it asks in a
 * fixed order: an explicit render first, then an image address, then the name —
 * which is offered to the consumer's own resolver if one was installed, then to the
 * registry of icons built into the library, and finally to a ligature font. A raw
 * SVG can always be passed through the slot instead.
 *
 * That order IS the contract. The resolver is asked before the registry, otherwise
 * the design system's own icons would stay Material for a consumer who has wired in
 * their own library; and a resolver that answers `undefined` for a name simply hands
 * over to the registry, which is what makes a PARTIAL mapping usable.
 *
 * The registry is what allows the design system to work with no icon font at all:
 * the icons the library draws by itself — crosses, chevrons, toast tones — depend on
 * nothing being installed. The ligature remains the fallback for every other name.
 *
 * Despite the `computed`, there is no behavioural JavaScript here: no event, no
 * lifecycle, no DOM. It is a pure choice of source, which the server and the browser
 * make identically.
 */
import { computed, type Component } from 'vue'

import { builtinIcons, ICON_VIEW_BOX } from './icons'
import { resolveIcon } from './resolver'
import type { IconRender } from './types'

interface IconProps {
  /**
   * The name of the icon. It is offered to the consumer's resolver, then to the
   * icons built into the library, and finally left to the icon font as a ligature.
   */
  name?: string
  /**
   * An explicit description of what to draw — an image, a component, a path, a class
   * — which wins over everything else. This is the route every `IconSource` prop of
   * the design system takes when it is given something other than a plain name.
   */
  render?: IconRender
  /** The address of an image to use as the icon. It wins over `name`. */
  src?: string
  /**
   * A size in pixels. Left out, the icon takes the size its context imposes — a
   * button sets one for the icons inside it — and failing that 1em, which makes it
   * follow the surrounding text.
   */
  size?: number
  /**
   * What the icon means, for screen readers. Leaving it out marks the icon as
   * decorative and hides it from them, which is the right thing whenever the
   * surrounding text already says what it says.
   */
  label?: string
  /**
   * Draws the filled version of the icon. The built-in icons honour it wherever
   * filling actually changes the drawing, and the ligature font always does. It
   * means nothing for an image or an inline SVG, whose shape is fixed.
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
  /** An inline SVG, used when neither `src` nor `name` was given. */
  default?(): unknown
}>()

/**
 * The chosen source, labelled with its kind. The public `IconRender` union carries
 * no such label — the consumer writes it by hand and has nothing to tag it with —
 * but the template needs one thing it can branch on reliably, and applying the tag
 * is also where the documented precedence between the shapes gets decided.
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

// @fallback — the ladder itself: every rung hands over to the next one, and the
// ligature is the last resort, reached when neither the resolver nor the registry
// recognized the name.
/**
 * Works out what to draw: an explicit `render` if there is one, then the consumer's
 * resolver, then the icons built into the library. Answering `undefined` here is not
 * a failure — it means the template falls through to the image, the ligature or the
 * slot.
 */
const resolved = computed<Resolved | undefined>(() => {
  if (props.render) return tag(props.render)
  if (props.src !== undefined || props.name === undefined) return undefined

  const custom = resolveIcon(props.name, { filled: props.filled })
  if (custom) return tag(custom)

  const paths: readonly string[] | undefined = (
    builtinIcons as Record<string, readonly string[] | undefined>
  )[props.name]
  // A second path is only stored when filling actually changes the drawing, so most
  // icons have one path and fall back to it (see icons.ts).
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
      <!-- The interpolation is written flush against the tags: a ligature is matched
           on the exact text, and any surrounding whitespace would break it -->
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
     * How the size is settled, in order of priority:
     * 1. the `size` prop, written inline on the element as --vectis-icon-size — a
     *    declaration made on the element itself beats both inheritance and the
     *    layer, so it always wins;
     * 2. the variables inherited from an ancestor, which is the context API: a
     *    VButton sets them from its own size, and the icons inside follow;
     * 3. 1em, which makes the icon follow the size of the text around it.
     */
    --icon-size: var(--vectis-icon-size, 1em);
    --icon-opsz: var(--vectis-icon-opsz, 24);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    inline-size: var(--icon-size);
    block-size: var(--icon-size);
    /* a ligature is text, so it is the font-size that sizes it */
    font-size: var(--icon-size);
  }

  /* When the icon font has not loaded, a ligature shows as its own name in plain
     text. Clipping keeps that text inside the square instead of letting it push the
     layout apart. The rule is scoped to the ONE branch it protects rather than to
     `.v-icon`: a third-party icon font may legitimately draw outside its 1em box,
     and clipping everything would cut those glyphs. */
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
    /* The variable axes of the Material Symbols font. These numbers are the font's
       own technical contract and not design decisions, which is why they are written
       literally here rather than taken from tokens — the same tolerance as the
       opacities. */
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

  /* An icon coming from a class-based font, as Font Awesome and Phosphor ship them:
     the glyph is drawn by a `::before`, at the font-size `.v-icon` has set. Because
     the design system renders this element itself rather than accepting the usual
     `<i>`, one rule normalizes it for every such library — `font-style` undoes the
     italics those conventions carry, and `line-height` stops the inherited line box
     from pushing the glyph off centre. */
  .v-icon-glyph {
    display: block;
    font-style: normal;
    line-height: var(--vectis-font-leading-none);
  }

  /* An SVG drawn from the built-in icons. The fill is set on OUR class and never on
     `.v-icon > svg`, so that a multicoloured SVG handed in through the slot keeps
     its own colours instead of being flattened to the text colour. `display: block`
     removes the gap an inline element leaves under its baseline. */
  .v-icon-svg {
    display: block;
    fill: currentcolor;
  }
}
</style>
