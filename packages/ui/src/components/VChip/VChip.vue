<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
import type { StyleValue } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import { useMessages } from '../../i18n/state'

/**
 * A chip. The native elements cover focus, keyboard and disabling: selectable →
 * <button aria-pressed> (v-model:selected), clickable → <button> (the native click
 * through fallthrough), href → <a>. Dismissible → a second sibling <button> — never
 * a nested button (invalid HTML). With no interaction, a static rendering (a span,
 * no hover). The only JS is the "inert link" bridge (href removed + aria-disabled +
 * onClick filtered) and the attrs split (class/style on the root, the rest on the
 * action element).
 */
interface ChipProps {
  /** tonal = tinted background (the default), solid = full colour, outline = a border. */
  variant?: 'tonal' | 'solid' | 'outline'
  tone?: 'neutral' | 'accent' | 'danger' | 'success' | 'warning'
  /**
   * A custom colour from the consumer (hex, CSS name or oklch()) which REPLACES the
   * tone: set inline as `--custom-color`, with every shade (soft background, tinted
   * text, hover…) derived by color-mix from the theme tokens — it adapts light/dark
   * with no rebuild. The contrast of the solid text (white) stays the consumer's
   * responsibility.
   */
  color?: string
  /** chip = --vectis-radius-interactive rounded corners (the default), pill = a pill. */
  shape?: 'chip' | 'pill'
  size?: 'xs' | 'sm'
  /** Height reduced by 4px; padding, typography and icons unchanged. */
  compact?: boolean
  /** The action element becomes <button type="button">; the click is native (fallthrough). */
  clickable?: boolean
  /** Rendered as <a>. disabled → an inert link (href removed + aria-disabled). */
  href?: string
  /** Toggle: an aria-pressed button bound to v-model:selected. Wins over href/clickable. */
  selectable?: boolean
  /** A check icon before the label when selected — it REPLACES the start slot
      (iconStart / the #start slot) so the two are never combined. */
  check?: boolean
  /** Icon before the label (the #start slot wins). */
  iconStart?: IconSource
  /** Icon after the label (the #end slot wins). */
  iconEnd?: IconSource
  /** A removal button emitting `dismiss` (making it disappear is up to the consumer). */
  dismissible?: boolean
  /** Icon of the removal button. */
  dismissIcon?: IconSource
  /** Accessible label of the removal button. Default: the DS dictionary. */
  dismissLabel?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<ChipProps>(), {
  variant: 'tonal',
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
  dismissIcon: 'close',
  dismissLabel: undefined,
  disabled: false,
})

const m = useMessages()
const resolvedDismissLabel = computed(() => props.dismissLabel ?? m.value.common.dismiss)

const selected = defineModel<boolean>('selected', { default: false })

defineEmits<{
  /** Emitted on a click on the removal button. */
  dismiss: []
}>()

defineSlots<{
  /** Label (optional: an icon-only chip) */
  default?(): unknown
  /** Content before the label (wins over iconStart) */
  start?(): unknown
  /** Content after the label (wins over iconEnd) */
  end?(): unknown
}>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

/* Interactivity priority: selectable > href > clickable > static. */
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

/* Icon alone (no label): the chip becomes square (width = height). */
const slots = useSlots()
const iconOnly = computed(
  () => !slots.default && !!(slots.start || slots.end || props.iconStart || props.iconEnd),
)
</script>

<template>
  <span
    class="v-chip v-control"
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
      <VIcon v-if="showCheck" name="check" />
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
  /* Sizes/compact: explicit height through the shared v-control class
     (styles/control-size.css); the TS union restricts it to xs/sm */
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

  .v-chip[data-tone='accent'] {
    --tone-bg-solid: var(--vectis-color-accent);
    --tone-bg-solid-hover: var(--vectis-color-accent-hover);
    --tone-bg-solid-active: var(--vectis-color-accent-active);
    --tone-text-solid: var(--vectis-color-text-on-accent);
    --tone-text-tinted: var(--vectis-color-accent-text);
    --tone-bg-soft: var(--vectis-color-accent-surface);
    --tone-border-soft: var(--vectis-color-accent-border);
  }

  .v-chip[data-tone='danger'] {
    --tone-bg-solid: var(--vectis-color-danger);
    --tone-bg-solid-hover: var(--vectis-color-danger-hover);
    --tone-bg-solid-active: var(--vectis-color-danger-active);
    --tone-text-solid: var(--vectis-color-text-on-accent);
    --tone-text-tinted: var(--vectis-color-danger-text);
    --tone-bg-soft: var(--vectis-color-danger-surface);
    --tone-border-soft: var(--vectis-color-danger-border);
  }

  .v-chip[data-tone='success'] {
    --tone-bg-solid: var(--vectis-color-success);
    --tone-bg-solid-hover: var(--vectis-color-success-hover);
    --tone-bg-solid-active: var(--vectis-color-success-active);
    --tone-text-solid: var(--vectis-color-text-on-accent);
    --tone-text-tinted: var(--vectis-color-success-text);
    --tone-bg-soft: var(--vectis-color-success-surface);
    --tone-border-soft: var(--vectis-color-success-border);
  }

  .v-chip[data-tone='warning'] {
    --tone-bg-solid: var(--vectis-color-warning);
    --tone-bg-solid-hover: var(--vectis-color-warning-hover);
    --tone-bg-solid-active: var(--vectis-color-warning-active);
    /* Amber is too light for white: a dedicated token (dark text) */
    --tone-text-solid: var(--vectis-color-text-on-warning);
    --tone-text-tinted: var(--vectis-color-warning-text);
    --tone-bg-soft: var(--vectis-color-warning-surface);
    --tone-border-soft: var(--vectis-color-warning-border);
  }

  /* A divergence from VButton: VButton's neutral solid (surface-muted) would be
     indistinguishable from the tonal. A full text/surface inversion rather than
     surface-inverse: in dark, surface-inverse = surface-muted (neutral-800), so a
     selected neutral chip would be invisible — text (neutral-50 in dark, neutral-900
     in light) stays distinct from the tonal background in both themes */
  .v-chip[data-tone='neutral'] {
    --tone-bg-solid: var(--vectis-color-text);
    --tone-bg-solid-hover: color-mix(
      in oklab,
      var(--vectis-color-text),
      var(--vectis-color-surface) 8%
    );
    --tone-bg-solid-active: color-mix(
      in oklab,
      var(--vectis-color-text),
      var(--vectis-color-surface) 14%
    );
    --tone-text-solid: var(--vectis-color-surface);
    --tone-text-tinted: var(--vectis-color-text);
    --tone-bg-soft: var(--vectis-color-surface-muted);
    --tone-border-soft: var(--vectis-color-border-strong);
  }

  /* Custom colour (--custom-color inline): replaces the tone, with every shade
     derived by color-mix from the theme tokens (surface/text swap between light and
     dark → automatic adaptation). Block placed AFTER the tones: equal specificity, the
     last one wins. */
  .v-chip[data-custom] {
    --tone-bg-solid: var(--custom-color);
    --tone-bg-solid-hover: color-mix(in oklab, var(--custom-color), var(--vectis-color-text) 8%);
    --tone-bg-solid-active: color-mix(in oklab, var(--custom-color), var(--vectis-color-text) 14%);
    /* A fixed white: the contrast against a light colour is the consumer's
       responsibility */
    --tone-text-solid: var(--vectis-color-text-on-accent);
    --tone-text-tinted: color-mix(in oklab, var(--custom-color), var(--vectis-color-text) 30%);
    --tone-bg-soft: color-mix(in oklab, var(--custom-color), var(--vectis-color-surface) 85%);
    --tone-border-soft: color-mix(in oklab, var(--custom-color), var(--vectis-color-surface) 60%);
  }

  .v-chip[data-variant='tonal'] {
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

  /* Selected: the solid rendering of the CURRENT tone/colour, whatever the variant
     (block after the variants, equal specificity) */
  .v-chip[data-selected] {
    background: var(--tone-bg-solid);
    color: var(--tone-text-solid);
    border-color: transparent;
  }

  /* Hover/active, scoped to the interactive action element — a static chip has no
     hover at all, and hovering the removal button does not change the chip's
     background */
  .v-chip[data-variant='tonal']:not([data-disabled], [data-selected]):has(
      :is(button, a).v-chip-action:hover
    ) {
    background: color-mix(in oklab, var(--tone-bg-soft), var(--tone-text-tinted) 8%);
  }

  .v-chip[data-variant='tonal']:not([data-disabled], [data-selected]):has(
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

  /* Icon alone: a square action — the aspect-ratio follows the chip's height (with
     no new dimension) */
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

  /* No background, even on hover (the .v-input-action pattern). The icon takes the
     chip's colour WHOLE: dimming currentcolor by 30% dropped the cross to 3.9:1 on a
     tinted chip and 2.8:1 on a solid one — and since the DS registry carries no cross,
     it is drawn as a ligature, i.e. a real text node the contrast rule applies to. The
     hover affordance is the cursor. */
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

  /* Disabled: greys through tokens (overridden by the dark theme) */
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
