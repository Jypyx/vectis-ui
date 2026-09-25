<script setup lang="ts">
// @a11y
/**
 * A small labelled pill standing for a value: a filter in force, a tag, a chosen file, a
 * person picked in a field.
 *
 * What it renders follows what it is asked to DO, each shape being the native element for
 * it, so focus, keyboard and disabling come free: selectable is a button with `aria-pressed`,
 * `href` is a link, `clickable` is a button, and none of those is plain text with no hover.
 *
 * A dismissible chip carries a SECOND button BESIDE the first, never inside it — a button
 * within a button is invalid HTML and unreachable by keyboard.
 *
 * The only JS makes a disabled link inert, the platform having no `disabled` for links, and
 * splits the consumer's attributes between the pill and the element that acts.
 */

import { computed, onMounted, ref, useAttrs } from 'vue'
import type { StyleValue, VNode } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
// TRAP — neither import may be named after a prop (`check`, `checkIcon`): every top-level
// binding of a `<script setup>` reaches the template, where it shadows the prop of that name.
import { check as checkMark } from '../VIcon/icons/check'
import { close as closeIcon } from '../VIcon/icons/close'
import type { IconSource } from '../VIcon/types'
import { useMessages } from '../../i18n/state'

import { useInertLink } from '../../composables/useInertLink'
import { useRootAttrs } from '../../composables/useRootAttrs'
import { customColorStyle } from '../../utils/css'
import { isDev } from '../../utils/env'
import { flattenSlot } from '../../utils/vnode'

/** How much visual weight the chip carries. */
export type ChipVariant = 'soft' | 'solid' | 'outline'

/** What the chip means, in colour. */
export type ChipTone = 'neutral' | 'accent' | 'danger' | 'success' | 'warning'

/** The silhouette: softly rounded, or a full pill. */
export type ChipShape = 'chip' | 'pill'

/** The height of the chip: 24 or 32 pixels. */
export type ChipSize = 'xs' | 'sm'

interface ChipProps {
  /**
   * How strongly the chip is painted: a tinted background, the full colour, or a
   * border alone.
   */
  variant?: ChipVariant
  /**
   * What the chip means, expressed as a colour: `neutral` by default, then `accent` for
   * something singled out and `danger`/`success`/`warning` for a state being reported. A
   * chip may report a state where a button may not, which is why it offers five.
   */
  tone?: ChipTone
  /**
   * A colour of your own (hex, CSS name or `oklch()`), which REPLACES the tone. Every
   * shade it needs (the tinted background, the text, the hover) is derived from that
   * one colour, so it follows the light and the dark theme with nothing to rebuild.
   * Only the contrast of the text on a fully coloured chip is yours to check.
   */
  color?: string
  /** The silhouette: softly rounded corners, or a full pill. */
  shape?: ChipShape
  /** The height of the chip. */
  size?: ChipSize
  /** Takes 4px off the height, leaving the padding, the text and the icons as they are. */
  compact?: boolean
  /** Makes the chip a button that reacts to clicks, without holding a state. */
  clickable?: boolean
  /**
   * Where the chip leads, which makes it a link. A disabled link is made inert by
   * hand.
   */
  href?: string
  /**
   * Makes the chip something that stays chosen, bound to `v-model:selected`. It wins
   * over `href` and `clickable`.
   */
  selectable?: boolean
  /**
   * Shows a tick before the label while the chip is selected. It REPLACES whatever
   * start icon was given, so the two are never shown together.
   */
  check?: boolean
  /** The icon of that tick, a built-in check mark by default. `iconFilled` does not reach it. */
  checkIcon?: IconSource
  /** An icon before the label. The `#start` slot replaces it. */
  iconStart?: IconSource
  /** An icon after the label. The `#end` slot replaces it. */
  iconEnd?: IconSource
  /**
   * Renders `iconStart` and `iconEnd` in their filled form (the font's `FILL` axis). It has
   * no effect on the `#start`/`#end` slots, whose icons the consumer builds, nor on the tick
   * or the removal cross.
   */
  iconFilled?: boolean
  /**
   * Adds a button that asks for the chip to be removed. It only EMITS that request:
   * actually taking the chip away is the consumer's decision.
   */
  dismissible?: boolean
  /** The icon of that removal button. */
  dismissIcon?: IconSource
  /**
   * What the removal button does, in words. It falls back to the design system
   * dictionary.
   */
  dismissLabel?: string
  /** Makes the chip unusable, greyed out through the colour tokens. */
  disabled?: boolean
}

const props = withDefaults(defineProps<ChipProps>(), {
  variant: 'soft',
  tone: 'neutral',
  color: undefined,
  shape: 'chip',
  size: 'xs',
  compact: false,
  clickable: false,
  href: undefined,
  selectable: false,
  check: false,
  checkIcon: () => checkMark,
  iconStart: undefined,
  iconEnd: undefined,
  iconFilled: false,
  dismissible: false,
  dismissIcon: () => closeIcon,
  dismissLabel: undefined,
  disabled: false,
})

const m = useMessages()
const resolvedDismissLabel = computed(() => props.dismissLabel ?? m.value.common.dismiss)

/**
 * Whether the chip is selected, which is also what makes it selectable at all: binding this
 * turns it into a toggle button and takes precedence over `href` and `clickable`. It starts
 * unselected.
 */
const selected = defineModel<boolean>('selected', { default: false })

defineEmits<{
  /** The removal button was pressed. The chip is still there: removing it is up to you. */
  dismiss: []
}>()

const slots = defineSlots<{
  /** The label. It may be left out entirely, which gives a chip made of icons alone. */
  default?(): unknown
  /** Content before the label, which takes the place of `iconStart`. */
  start?(): unknown
  /** Content after the label, which takes the place of `iconEnd`. */
  end?(): unknown
}>()

defineOptions({ inheritAttrs: false })

// The wrapper-root split: the pill is the box a consumer positions, and the ACTION is the
// element that is focused, named and clicked, so everything else goes there.
const { rootClass, rootStyle: consumerStyle, forwardedAttrs } = useRootAttrs()

/* What the chip does, in order of precedence: staying selected wins over leading
   somewhere, which wins over merely reacting to clicks; asked for none of them, it is
   plain text. A selectable chip is therefore never a link, whatever `href` says. */
const {
  isLink,
  isInertLink,
  linkHref,
  attrs: actionAttrs,
} = useInertLink({
  href: () => (props.selectable ? undefined : props.href),
  inert: () => props.disabled,
  attrs: () => forwardedAttrs.value,
})
const actionTag = computed(() =>
  props.selectable ? 'button' : isLink.value ? 'a' : props.clickable ? 'button' : 'span',
)

const rootStyle = computed<StyleValue>(() => [customColorStyle(props.color), consumerStyle.value])

const actionEl = ref<HTMLElement | null>(null)

const showCheck = computed(() => props.check && props.selectable && selected.value)

// TRAP — a function read by the template, never a `computed`: `slots` is not reactive, so a
// computed would keep its first answer while a slot behind a `v-if` comes and goes.
/**
 * An icon and no label at all: the chip becomes a square, as wide as it is tall. The default
 * slot is asked what it RENDERS, not whether it was passed: a wrapper forwarding an empty
 * label still hands one down.
 */
function iconOnly() {
  return (
    flattenSlot(slots.default?.() as VNode[] | undefined).length === 0 &&
    !!(slots.start || slots.end || props.iconStart || props.iconEnd)
  )
}

// @devwarn
// A chip drawn with an icon alone has no accessible name: the icon is decorative, so a
// clickable, selectable or linked one is announced as a bare button or link. Nothing fails
// visibly, hence the message. Read once, on mount, off the rendered pill: calling the slot
// here, outside the render, would draw a Vue warning of its own.
if (isDev) {
  const attrs = useAttrs()
  onMounted(() => {
    if (
      actionTag.value !== 'span' &&
      actionEl.value?.parentElement?.hasAttribute('data-icon-only') &&
      attrs['aria-label'] === undefined &&
      attrs['aria-labelledby'] === undefined
    ) {
      console.warn(
        '[VChip] a chip made of an icon alone has no accessible name: set aria-label or aria-labelledby on it.',
      )
    }
  })
}

// A template ref on the chip reaches the pill, a layout box; the element that is focused,
// named and clicked is the action inside it.
defineExpose({
  /** Moves the focus to the chip's action: its button or link. */
  focus: (options?: FocusOptions) => actionEl.value?.focus(options),
  /** The action element, which is also where the consumer's attributes land. */
  el: actionEl,
})
</script>

<template>
  <span
    :class="['v-chip v-control v-tone v-variant', rootClass]"
    :style="rootStyle"
    :data-variant="variant"
    :data-tone="tone"
    :data-custom="color !== undefined ? '' : undefined"
    :data-shape="shape"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-selected="selectable && selected ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-icon-only="iconOnly() ? '' : undefined"
  >
    <component
      :is="actionTag"
      ref="actionEl"
      :aria-disabled="isInertLink ? 'true' : undefined"
      :aria-pressed="selectable ? selected : undefined"
      v-bind="actionAttrs"
      class="v-chip-action"
      :type="actionTag === 'button' ? 'button' : undefined"
      :href="linkHref"
      :disabled="actionTag === 'button' ? disabled : undefined"
      @click="selectable && !disabled && (selected = !selected)"
    >
      <VIcon v-if="showCheck" v-bind="iconProps(checkIcon)" />
      <slot v-else name="start">
        <VIcon v-if="iconStart" v-bind="iconProps(iconStart)" :filled="iconFilled" />
      </slot>
      <slot />
      <slot name="end">
        <VIcon v-if="iconEnd" v-bind="iconProps(iconEnd)" :filled="iconFilled" />
      </slot>
    </component>
    <button
      v-if="dismissible"
      type="button"
      class="v-chip-dismiss"
      :aria-label="resolvedDismissLabel"
      :disabled="disabled"
      @click="$emit('dismiss')"
    >
      <VIcon v-bind="iconProps(dismissIcon)" />
    </button>
  </span>
</template>

<style>
@layer vectis.components {
  /* The height comes from the shared size class set on this element. The scale itself
     holds five steps; the component's type restricts it to the two smallest, a chip
     larger than that being a button. */
  .v-chip {
    display: inline-flex;
    align-items: center;
    block-size: var(--control-height);
    border: 1px solid transparent;
    border-radius: var(--vectis-radius-chip);
    font-family: var(--vectis-text-family);
    font-size: var(--control-font-size);
    font-weight: var(--vectis-text-control-weight);
    line-height: var(--vectis-text-control-leading);
    transition:
      background-color var(--vectis-duration-fast) var(--vectis-ease-default),
      border-color var(--vectis-duration-fast) var(--vectis-ease-default),
      color var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-chip[data-shape='pill'] {
    border-radius: var(--vectis-radius-pill);
  }

  /* The tone table itself lives in styles/tones.css, in a layer below the components.
     All five tones are taken exactly as they come; the only values redefined here are
     those of a custom colour, and they win over the shared table by LAYER rather than
     by order, so no bundling can change the outcome. */

  /* A custom colour replaces the tone entirely. The shared table derives the four values
     every adopter reads (styles/tones.css, `.v-tone[data-custom]`); the chip adds the
     three only it paints, its hover and active steps and its outline, from the same colour
     mixed with the theme's own text and surface. */
  .v-chip[data-custom] {
    --tone-bg-solid-hover: color-mix(in oklab, var(--custom-color), var(--vectis-color-text) 8%);
    --tone-bg-solid-active: color-mix(in oklab, var(--custom-color), var(--vectis-color-text) 14%);
    --tone-border-soft: color-mix(in oklab, var(--custom-color), var(--vectis-color-surface) 60%);
  }

  /* A selected chip is painted in the full colour of its CURRENT tone, whichever variant it
     was given. It COMPOUNDS `.v-variant`: the variant table weighs (0,2,0) like this rule and
     lives in another sheet, so at equal specificity the winner would be whichever one the
     consumer's bundler put last. At (0,3,0) it wins by construction. */
  .v-variant.v-chip[data-selected] {
    background: var(--tone-bg-solid);
    color: var(--tone-text-solid);
    border-color: transparent;
  }

  /* Hovering and pressing are conditioned on the ACTION being a real control, which
     buys two things at once: a chip that merely displays a value never lights up, and
     hovering the removal button does not repaint the whole chip as though it were
     about to be activated. */
  /* The same steps as VButton's, rule for rule: an outline sits on the soft surface while
     hovered and one tint further when pressed, and that tint is where a soft chip starts
     on hover. Held in each sheet rather than in `variants.css`, which every consumer
     downloads whether or not it renders a single button or chip. */
  .v-chip[data-variant='outline']:not([data-disabled], [data-selected]):has(
      :is(button, a).v-chip-action:hover
    ) {
    background: var(--tone-bg-soft);
  }

  .v-chip[data-variant='outline']:not([data-disabled], [data-selected]):has(
      :is(button, a).v-chip-action:active
    ),
  .v-chip[data-variant='soft']:not([data-disabled], [data-selected]):has(
      :is(button, a).v-chip-action:hover
    ) {
    background: color-mix(in oklab, var(--tone-bg-soft), var(--tone-text-tinted) 8%);
  }

  .v-chip[data-variant='soft']:not([data-disabled], [data-selected]):has(
      :is(button, a).v-chip-action:active
    ) {
    background: color-mix(in oklab, var(--tone-bg-soft), var(--tone-text-tinted) 14%);
  }

  .v-chip[data-variant='solid']:not([data-disabled]):has(:is(button, a).v-chip-action:hover),
  .v-chip[data-selected]:not([data-disabled]):has(:is(button, a).v-chip-action:hover) {
    background: var(--tone-bg-solid-hover);
  }

  .v-chip[data-variant='solid']:not([data-disabled]):has(:is(button, a).v-chip-action:active),
  .v-chip[data-selected]:not([data-disabled]):has(:is(button, a).v-chip-action:active) {
    background: var(--tone-bg-solid-active);
  }

  .v-chip-action {
    display: inline-flex;
    align-items: center;
    gap: var(--control-gap);
    block-size: 100%;
    padding-block: 0;
    padding-inline: var(--control-padding-inline);
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    border-radius: inherit;
    text-decoration: none;
    cursor: default;
  }

  /* With an icon and no label the action becomes square, its width taken from its own
     height through the ratio rather than from a new measurement to keep in step. */
  .v-chip[data-icon-only] .v-chip-action {
    aspect-ratio: 1;
    justify-content: center;
    padding-inline: 0;
  }

  :is(button, a).v-chip-action {
    cursor: pointer;
  }

  :is(button, a).v-chip-action:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  /* The removal button carries no background of its own, not even on hover — the same
     treatment as a field's inner buttons — and the cursor is what signals it can be
     used.

     Its icon takes the chip's colour AT FULL strength. Dimming it, as one would
     instinctively do for a secondary control, took the cross down to 3.9:1 on a tinted
     chip and 2.8:1 on a solid one. That matters because the cross is drawn from the
     icon font here, and a glyph from a font is real text, to which the contrast rule
     applies. */
  .v-chip-dismiss {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--control-action-size);
    block-size: var(--control-action-size);
    margin-inline: calc(var(--vectis-space-1) * -1) var(--vectis-space-1);
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    border-radius: var(--vectis-radius-pill);
    cursor: pointer;
    flex: none;
  }

  .v-chip-dismiss:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: calc(-1 * var(--vectis-focus-ring-width));
  }

  /* A disabled chip greys out through the colour tokens, which is what makes it follow
     the dark theme without a rule of its own. */
  .v-variant.v-chip[data-disabled] {
    background: var(--vectis-color-surface-muted);
    color: var(--vectis-color-text-subtle);
    border-color: transparent;
  }

  .v-variant.v-chip[data-disabled][data-variant='outline'] {
    background: transparent;
    border-color: var(--vectis-color-border);
  }

  .v-chip[data-disabled] :is(:is(button, a).v-chip-action, .v-chip-dismiss) {
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-chip {
      transition: none;
    }
  }

  /*
   * Windows forced colors replace every background with the page's, so a selected chip would look
   * exactly like the others there: the fill is its only cue, the state being in an ARIA
   * attribute a sighted reader never sees. It takes the system's own selection pair
   * instead, and opts out of the forcing for that element alone so the pair is painted.
   *
   * TRAP — the class is repeated to reach (0,6,0). The variant, hover and active rules
   * reach (0,5,0), and with the forcing turned off any of them that still won would paint
   * its tone over the selection, with HighlightText on top of it.
   */
  @media (forced-colors: active) {
    .v-chip.v-chip.v-chip.v-chip[data-selected]:not([data-disabled]) {
      forced-color-adjust: none;
      background-color: Highlight;
      color: HighlightText;
      border-color: Highlight;
      outline-color: CanvasText;
    }
  }
}
</style>
