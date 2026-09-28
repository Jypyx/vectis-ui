<script setup lang="ts">
/**
 * Resolve icon render, src and name in priority order. Named icons consult the consumer
 * resolver, embedded drawing and ligature fallback; explicit drawing needs no font.
 */
import { computed, type Component } from 'vue'

import { iconName as nameOf } from './iconProps'
import { ICON_VIEW_BOX } from './icons/viewBox'
import { resolveIcon } from './resolver'
import type { BuiltinIcon, IconRender } from './types'

import { px } from '../../utils/css'

interface IconProps {
  /** Which icon to draw. */
  name?: string | BuiltinIcon
  /**
   * An explicit description of what to draw (an image, a component, a path, a class), which
   * wins over everything else.
   */
  render?: IconRender
  /** The address of an image to use as the icon. It wins over `name`. */
  src?: string
  /**
   * A size in pixels, as a number or a numeric string. Left out, or given something that
   * is not a number, the icon takes the size its context imposes (a button sets one for
   * the icons inside it), and failing that 1em, which makes it follow the surrounding
   * text.
   */
  size?: number | string
  /**
   * What the icon means, for screen readers. Leaving it out marks the icon as
   * decorative and hides it from them, which is the right thing whenever the
   * surrounding text already says what it says.
   */
  label?: string
  /** Draws the filled version of the icon. */
  filled?: boolean
  /**
   * Flips the icon horizontally in a right-to-left context, for a glyph that points at a
   * physical direction: a "previous" chevron points left in English and right in Arabic. Off by
   * default, since most icons mean the same thing in both directions.
   */
  mirrored?: boolean
}

const props = withDefaults(defineProps<IconProps>(), {
  name: undefined,
  render: undefined,
  src: undefined,
  size: undefined,
  label: undefined,
  filled: false,
  mirrored: false,
})

defineSlots<{
  /** An inline SVG, used when none of `render`, `src` and `name` was given. */
  default?(): unknown
}>()

/**
 * The chosen source, labelled with its kind. The public `IconRender` union carries no such
 * label; the consumer writes it by hand and has nothing to tag it with; but the template needs
 * one thing it can branch on reliably, and applying the tag is also where the documented
 * precedence between the shapes gets decided.
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

/**
 * The icon's identity: the name the resolver is asked for, and the one `data-icon`
 * records whatever the drawing turned out to come from.
 */
const iconName = computed(() => nameOf(props.name))

// @fallback
// Ligature is the last resort, reached when neither the resolver nor the registry recognized
// the name.
/**
 * Works out what to draw: an explicit `render` if there is one, then the consumer's resolver,
 * then the icons built into the library. Answering `undefined` here is not a failure; it means
 * the template falls through to the image, the ligature or the slot.
 */
const resolved = computed<Resolved | undefined>(() => {
  if (props.render) return tag(props.render)
  // TRUTHINESS on `src`, the test the template renders the image with: an empty `src=""`
  // renders no image, so it must not stop the name from being drawn either.
  if (props.src || props.name === undefined) return undefined

  const custom = resolveIcon(iconName.value!, { filled: props.filled })
  if (custom) return tag(custom)

  // A bare name has no drawing of its own, so it falls through to the ligature; only
  // one of the library's own icons brings its paths along.
  if (typeof props.name === 'string') return undefined

  const { paths } = props.name
  // A second path is only stored when filling actually changes the drawing, so most
  // icons have one path and fall back to it (see the `BuiltinIcon` type).
  const path = (props.filled ? paths[1] : undefined) ?? paths[0]
  return { kind: 'path', path, viewBox: ICON_VIEW_BOX }
})
</script>

<template>
  <span
    class="v-icon"
    :style="px(size) !== undefined ? { '--vectis-icon-size': px(size) } : undefined"
    :data-icon="iconName"
    :data-filled="filled || undefined"
    :data-mirror="mirrored || undefined"
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
    <span v-else-if="name" class="v-icon-symbol">{{ iconName }}</span>
    <slot v-else />
  </span>
</template>

<style>
@layer vectis.components {
  .v-icon {
    /*
     * How the size is settled, in order of priority: 1. the `size` prop, written inline on the
     * element as --vectis-icon-size; a declaration made on the element itself beats both
     * inheritance and the layer, so it always wins; 2. the variables inherited from an
     * ancestor, which is the context API: a VButton sets them from its own size, and the icons
     * inside follow; 3. 1em, which makes the icon follow the size of the text around it.
     */
    --icon-size: var(--vectis-icon-size, 1em);
    --icon-opsz: var(--vectis-icon-opsz, 24);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    /*
     * The box must not read `--icon-size` again: an `em` there resolves against this element's
     * own font-size, already enlarged by the line below, so a context size of 1.5em drew a box
     * of 2.25em around a glyph of 1.5em.
     */
    font-size: var(--icon-size);
    inline-size: 1em;
    block-size: 1em;
  }

  /*
   * When the icon font has not loaded, a ligature shows as its own name in plain text. Clipping
   * keeps that text inside the square instead of letting it push the layout apart.
   */
  .v-icon:has(> .v-icon-symbol) {
    overflow: hidden;
  }

  .v-icon-symbol {
    /* Declared here and not only under `[data-filled]`: a custom property inherits, so a
       host application setting `--icon-fill` on an ancestor would otherwise fill every
       icon below it. */
    --icon-fill: 0;
    font-family: var(--vectis-font-family-icon);
    font-weight: var(--vectis-font-weight-regular);
    font-style: normal;
    line-height: var(--vectis-font-leading-none);
    letter-spacing: normal;
    text-transform: none;
    white-space: nowrap;
    direction: ltr;
    /*
     * The variable axes of the Material Symbols font. These numbers are the font's own
     * technical contract and not design decisions, which is why they are written literally here
     * rather than taken from tokens; the same tolerance as the opacities.
     */
    font-variation-settings:
      'FILL' var(--icon-fill),
      'wght' 400,
      'GRAD' 0,
      'opsz' var(--icon-opsz);
  }

  .v-icon[data-filled] .v-icon-symbol {
    --icon-fill: 1;
  }

  /* `:dir()` reads the direction the browser computed rather than an attribute spelled on
     an ancestor, and `scale` is the individual property, so it composes with a rotation
     a consumer applies (a disclosure chevron) instead of replacing its transform. */
  .v-icon[data-mirror]:dir(rtl) {
    scale: -1 1;
  }

  .v-icon-img,
  .v-icon > svg {
    inline-size: 100%;
    block-size: 100%;
    object-fit: contain;
  }

  /*
   * Because the design system renders this element itself rather than accepting the usual
   * `<i>`, one rule normalizes it for every such library; `font-style` undoes the italics those
   * conventions carry, and `line-height` stops the inherited line box from pushing the glyph
   * off centre.
   */
  .v-icon-glyph {
    display: block;
    font-style: normal;
    line-height: var(--vectis-font-leading-none);
  }

  /*
   * The fill is set on OUR class and never on `.v-icon > svg`, so that a multicoloured SVG
   * handed in through the slot keeps its own colours instead of being flattened to the text
   * colour. `display: block` removes the gap an inline element leaves under its baseline.
   */
  .v-icon-svg {
    display: block;
    fill: currentcolor;
  }
}
</style>
