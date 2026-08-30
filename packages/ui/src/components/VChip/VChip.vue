<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
import type { StyleValue } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import { check as checkIcon } from '../VIcon/icons/check'
import { close as closeIcon } from '../VIcon/icons/close'
import type { IconSource } from '../VIcon/types'
import { useMessages } from '../../i18n/state'

// @core
/**
 * A chip: a small labelled pill standing for a value — a filter in force, a tag, a
 * file chosen, a person picked in a field.
 *
 * What it renders follows what it is asked to DO, and each shape is the native element
 * for it, so focus, keyboard and disabling come free: a chip that can be selected is a
 * button reporting whether it is pressed, one that leads somewhere is a link, one that
 * merely reacts to clicks is a button, and one that does none of those is plain text
 * with no hover at all.
 *
 * A chip that can be removed carries a SECOND button, beside the first and never
 * inside it: a button within a button is invalid HTML and unreachable by keyboard.
 *
 * The only JavaScript makes a disabled link inert — the platform having no `disabled`
 * for links — and splits the attributes the consumer passes between the pill and the
 * element that actually acts.
 */
interface ChipProps {
  /**
   * How strongly the chip is painted: a tinted background, the full colour, or a
   * border alone.
   */
  variant?: 'soft' | 'solid' | 'outline'
  /** What the chip means, expressed as a colour. */
  tone?: 'neutral' | 'accent' | 'danger' | 'success' | 'warning'
  /**
   * A colour of your own (hex, CSS name or `oklch()`), which REPLACES the tone. Every
   * shade it needs — the tinted background, the text, the hover — is derived from that
   * one colour, so it follows the light and the dark theme with nothing to rebuild.
   * Only the contrast of the text on a fully coloured chip is yours to check.
   */
  color?: string
  /** The silhouette: softly rounded corners, or a full pill. */
  shape?: 'chip' | 'pill'
  /** The height of the chip. */
  size?: 'xs' | 'sm'
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
  /** An icon before the label. The `#start` slot replaces it. */
  iconStart?: IconSource
  /** An icon after the label. The `#end` slot replaces it. */
  iconEnd?: IconSource
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
  iconStart: undefined,
  iconEnd: undefined,
  dismissible: false,
  dismissIcon: () => closeIcon,
  dismissLabel: undefined,
  disabled: false,
})

const m = useMessages()
const resolvedDismissLabel = computed(() => props.dismissLabel ?? m.value.common.dismiss)

const selected = defineModel<boolean>('selected', { default: false })

defineEmits<{
  /** The removal button was pressed. The chip is still there: removing it is up to you. */
  dismiss: []
}>()

defineSlots<{
  /** The label. It may be left out entirely, which gives a chip made of icons alone. */
  default?(): unknown
  /** Content before the label, which takes the place of `iconStart`. */
  start?(): unknown
  /** Content after the label, which takes the place of `iconEnd`. */
  end?(): unknown
}>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

/* What the chip does, in order of precedence: staying selected wins over leading
   somewhere, which wins over merely reacting to clicks; asked for none of them, it is
   plain text. */
const isLink = computed(() => !props.selectable && props.href !== undefined)
const actionTag = computed(() =>
  props.selectable ? 'button' : isLink.value ? 'a' : props.clickable ? 'button' : 'span',
)
const isInertLink = computed(() => isLink.value && props.disabled)

const rootStyle = computed<StyleValue>(() => [
  props.color !== undefined ? { '--custom-color': props.color } : undefined,
  attrs.style as StyleValue,
])
const actionAttrs = computed(() => {
  const rest = Object.fromEntries(
    Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style'),
  )
  if (isInertLink.value) delete rest.onClick
  return rest
})

const showCheck = computed(() => props.check && props.selectable && selected.value)

/* An icon and no label at all: the chip becomes a square, as wide as it is tall. */
const slots = useSlots()
const iconOnly = computed(
  () => !slots.default && !!(slots.start || slots.end || props.iconStart || props.iconEnd),
)
</script>

<template>
  <span
    class="v-chip v-control v-tone"
    :class="$attrs.class"
    :style="rootStyle"
    :data-variant="variant"
    :data-tone="tone"
    :data-custom="color !== undefined ? '' : undefined"
    :data-shape="shape"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-selected="selectable && selected ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-icon-only="iconOnly ? '' : undefined"
  >
    <component
      :is="actionTag"
      v-bind="actionAttrs"
      class="v-chip-action"
      :type="actionTag === 'button' ? 'button' : undefined"
      :href="isLink && !disabled ? href : undefined"
      :disabled="actionTag === 'button' ? disabled : undefined"
      :aria-disabled="isInertLink ? 'true' : undefined"
      :aria-pressed="selectable ? selected : undefined"
      @click="selectable && !disabled && (selected = !selected)"
    >
      <VIcon v-if="showCheck" :name="checkIcon" />
      <slot v-else name="start">
        <VIcon v-if="iconStart" v-bind="iconProps(iconStart)" />
      </slot>
      <slot />
      <slot name="end">
        <VIcon v-if="iconEnd" v-bind="iconProps(iconEnd)" />
      </slot>
    </component>
    <button
      v-if="dismissible"
      type="button"
      class="v-chip-remove"
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
    height: var(--control-height);
    border: 1px solid transparent;
    border-radius: var(--vectis-radius-interactive);
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

  /* A custom colour replaces the tone entirely. Every shade it needs is derived from
     that one colour mixed with the theme's own surface and text, so the same value
     produces a legible chip in the light theme and in the dark one, with nothing to
     rebuild. */
  .v-chip[data-custom] {
    --tone-bg-solid: var(--custom-color);
    --tone-bg-solid-hover: color-mix(in oklab, var(--custom-color), var(--vectis-color-text) 8%);
    --tone-bg-solid-active: color-mix(in oklab, var(--custom-color), var(--vectis-color-text) 14%);
    /* Fixed white, whatever the colour: on a fully coloured chip the contrast of the
       text is the consumer's to check, as it is in VBadge. */
    --tone-text-solid: var(--vectis-color-text-on-accent);
    --tone-text-tinted: color-mix(in oklab, var(--custom-color), var(--vectis-color-text) 30%);
    --tone-bg-soft: color-mix(in oklab, var(--custom-color), var(--vectis-color-surface) 85%);
    --tone-border-soft: color-mix(in oklab, var(--custom-color), var(--vectis-color-surface) 60%);
  }

  .v-chip[data-variant='soft'] {
    background: var(--tone-bg-soft);
    color: var(--tone-text-tinted);
  }

  .v-chip[data-variant='solid'] {
    background: var(--tone-bg-solid);
    color: var(--tone-text-solid);
  }

  .v-chip[data-variant='outline'] {
    background: transparent;
    color: var(--tone-text-tinted);
    border-color: var(--tone-border-soft);
  }

  /* A selected chip is painted in the full colour of its CURRENT tone, whichever
     variant it was given. The block sits after the variants at equal specificity, so
     it is the order that lets it win. */
  .v-chip[data-selected] {
    background: var(--tone-bg-solid);
    color: var(--tone-text-solid);
    border-color: transparent;
  }

  /* Hovering and pressing are conditioned on the ACTION being a real control, which
     buys two things at once: a chip that merely displays a value never lights up, and
     hovering the removal button does not repaint the whole chip as though it were
     about to be activated. */
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

  .v-chip[data-variant='outline']:not([data-disabled], [data-selected]):has(
      :is(button, a).v-chip-action:hover
    ) {
    background: var(--tone-bg-soft);
  }

  .v-chip[data-variant='outline']:not([data-disabled], [data-selected]):has(
      :is(button, a).v-chip-action:active
    ) {
    background: color-mix(in oklab, var(--tone-bg-soft), var(--tone-text-tinted) 8%);
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
    height: 100%;
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
  .v-chip-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--control-action-size);
    height: var(--control-action-size);
    margin-inline: calc(var(--vectis-space-1) * -1) var(--vectis-space-1);
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    border-radius: var(--vectis-radius-full);
    cursor: pointer;
    flex: none;
  }

  .v-chip-remove:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: calc(var(--vectis-focus-ring-offset) * -1);
  }

  /* A disabled chip greys out through the colour tokens, which is what makes it follow
     the dark theme without a rule of its own. */
  .v-chip[data-disabled] {
    background: var(--vectis-color-surface-muted);
    color: var(--vectis-color-text-subtle);
    border-color: transparent;
  }

  .v-chip[data-disabled][data-variant='outline'] {
    background: transparent;
    border-color: var(--vectis-color-border);
  }

  .v-chip[data-disabled] :is(:is(button, a).v-chip-action, .v-chip-remove) {
    cursor: not-allowed;
  }

  .v-chip[data-disabled] .v-chip-remove {
    color: inherit;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-chip,
    .v-chip-remove {
      transition: none;
    }
  }
}
</style>
