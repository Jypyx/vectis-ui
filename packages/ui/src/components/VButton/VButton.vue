<script setup lang="ts">
/**
 * Action button, and the reference model for the tone/variant tables.
 *
 * The native <button> (or <a> in link mode) covers focus, keyboard and
 * disabling. The only behavioural JS is the "inert link" bridge: an <a> has no
 * native `disabled`, so disabled/loading on a link removes the href (not
 * focusable, no navigation), sets aria-disabled for assistive technologies, and
 * filters the click handlers out of the fallthrough to reproduce the total
 * inertness of a <button disabled>.
 */
import { computed, useAttrs } from 'vue'
import type { ButtonHTMLAttributes } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import VSpinner from '../VSpinner/VSpinner.vue'

interface ButtonProps {
  variant?: 'solid' | 'outline' | 'ghost' | 'soft'
  tone?: 'accent' | 'neutral' | 'danger'
  /**
   * Raises the button: a shadow that rises on hover and settles back on press,
   * whatever the variant. On `ghost` and `outline`, which have no background of
   * their own, it also paints the raised surface — in the dark theme a shadow over
   * the page background has nothing casting it.
   */
  elevated?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Height reduced by 4px; padding, type and icons unchanged. */
  compact?: boolean
  /** Renders an <a> instead of a <button>. disabled/loading → an inert link (no href). */
  href?: string
  /** Ignored in link rendering. */
  type?: ButtonHTMLAttributes['type']
  disabled?: boolean
  /**
   * Shows a spinner, disables the button and sets aria-busy. The spinner
   * REPLACES the start slot (iconStart / #start) so a spinner and an icon are
   * never shown together.
   */
  loading?: boolean
  /** Icon rendered before the label (the #start slot wins). */
  iconStart?: IconSource
  /** Icon rendered after the label (the #end slot wins). */
  iconEnd?: IconSource
  /**
   * Fills iconStart/iconEnd (the font's `FILL` axis). No effect on the
   * #start/#end slots, whose VIcon is supplied by the consumer.
   */
  iconFilled?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'solid',
  tone: 'accent',
  elevated: false,
  size: 'md',
  compact: false,
  href: undefined,
  type: 'button',
  disabled: false,
  loading: false,
  iconStart: undefined,
  iconEnd: undefined,
  iconFilled: false,
})

defineSlots<{
  /** The button label */
  default(): unknown
  /** Content before the label (an icon; aria-hidden is advised) */
  start?(): unknown
  /** Content after the label */
  end?(): unknown
}>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const isLink = computed(() => props.href !== undefined)
const isInert = computed(() => props.disabled || props.loading)
const isInertLink = computed(() => isLink.value && isInert.value)
const passedAttrs = computed(() => {
  if (!isInertLink.value) return attrs
  const rest = { ...(attrs as Record<string, unknown>) }
  delete rest.onClick
  return rest
})
</script>

<template>
  <component
    :is="isLink ? 'a' : 'button'"
    v-bind="passedAttrs"
    class="v-button v-control v-tone"
    :href="isLink && !isInert ? href : undefined"
    :type="isLink ? undefined : type"
    :disabled="isLink ? undefined : disabled || loading"
    :aria-disabled="isInertLink ? 'true' : undefined"
    :data-variant="variant"
    :data-tone="tone"
    :data-elevated="elevated ? '' : undefined"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-loading="loading ? '' : undefined"
    :aria-busy="loading || undefined"
  >
    <!-- aria-hidden: the button already carries aria-busy, so this avoids the
         VSpinner's role="status" announcing a second time -->
    <span v-if="loading" class="v-button-spinner" aria-hidden="true">
      <VSpinner />
    </span>
    <slot v-else name="start">
      <VIcon v-if="iconStart" v-bind="iconProps(iconStart)" :filled="iconFilled" />
    </slot>
    <slot />
    <slot name="end">
      <VIcon v-if="iconEnd" v-bind="iconProps(iconEnd)" :filled="iconFilled" />
    </slot>
  </component>
</template>

<style>
@layer vectis.components {
  .v-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--control-gap);
    height: var(--control-height);
    padding-inline: var(--control-padding-inline);
    border: 1px solid transparent;
    border-radius: var(--vectis-radius-interactive);
    font-family: var(--vectis-text-family);
    font-size: var(--control-font-size);
    font-weight: var(--vectis-text-control-weight);
    line-height: var(--vectis-text-control-leading);
    text-decoration: none;
    cursor: pointer;
    transition:
      background-color var(--vectis-duration-fast) var(--vectis-ease-default),
      border-color var(--vectis-duration-fast) var(--vectis-ease-default),
      color var(--vectis-duration-fast) var(--vectis-ease-default),
      box-shadow var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-button:focus-visible {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: var(--vectis-focus-ring-offset);
  }

  /* The tone table lives in styles/tones.css (class `v-tone`, layer vectis.tokens),
     shared with VChip and VToast. VButton overrides not a single tone: it is the
     reference model those values were taken from. */

  .v-button[data-variant='solid'] {
    background: var(--tone-bg-solid);
    color: var(--tone-text-solid);
  }

  .v-button[data-variant='solid']:hover:not(:disabled, [aria-disabled='true']) {
    background: var(--tone-bg-solid-hover);
  }

  .v-button[data-variant='solid']:active:not(:disabled, [aria-disabled='true']) {
    background: var(--tone-bg-solid-active);
  }

  .v-button[data-variant='outline'] {
    background: transparent;
    color: var(--tone-text-tinted);
    border-color: var(--tone-border-soft);
  }

  .v-button[data-variant='ghost'] {
    background: transparent;
    color: var(--tone-text-tinted);
  }

  /* `:not([data-elevated])` makes these DISJOINT from the elevation rules below,
     rather than merely less specific: nothing then arbitrates the background of a
     raised ghost by a one-step specificity margin, so a declaration added to either
     set later cannot silently leak into the other. */
  .v-button[data-variant='outline']:not([data-elevated]):hover:not(
      :disabled,
      [aria-disabled='true']
    ),
  .v-button[data-variant='ghost']:not([data-elevated]):hover:not(
      :disabled,
      [aria-disabled='true']
    ) {
    background: var(--tone-bg-soft);
  }

  .v-button[data-variant='outline']:not([data-elevated]):active:not(
      :disabled,
      [aria-disabled='true']
    ),
  .v-button[data-variant='ghost']:not([data-elevated]):active:not(
      :disabled,
      [aria-disabled='true']
    ) {
    background: color-mix(in oklab, var(--tone-bg-soft), var(--tone-text-tinted) 8%);
  }

  .v-button[data-variant='soft'] {
    background: var(--tone-bg-soft);
    color: var(--tone-text-tinted);
  }

  .v-button[data-variant='soft']:hover:not(:disabled, [aria-disabled='true']) {
    background: color-mix(in oklab, var(--tone-bg-soft), var(--tone-text-tinted) 8%);
  }

  .v-button[data-variant='soft']:active:not(:disabled, [aria-disabled='true']) {
    background: color-mix(in oklab, var(--tone-bg-soft), var(--tone-text-tinted) 14%);
  }

  /* Elevation is ORTHOGONAL to the variant: the shadow scale applies to all four,
     the raised surface only to the two that have no background of their own. The
     `:is()` is not decoration — it carries the (0,3,0) that beats the ghost/outline
     base (0,2,0) with no dependency on the rule order. */
  .v-button[data-elevated] {
    box-shadow: var(--vectis-shadow-2);
  }

  .v-button[data-elevated]:is([data-variant='ghost'], [data-variant='outline']) {
    background: var(--vectis-color-surface-raised);
  }

  .v-button[data-elevated]:hover:not(:disabled, [aria-disabled='true']) {
    box-shadow: var(--vectis-shadow-3);
  }

  .v-button[data-elevated]:is([data-variant='ghost'], [data-variant='outline']):hover:not(
      :disabled,
      [aria-disabled='true']
    ) {
    background: color-mix(in oklab, var(--vectis-color-surface-raised), var(--tone-text-tinted) 8%);
  }

  .v-button[data-elevated]:active:not(:disabled, [aria-disabled='true']) {
    box-shadow: var(--vectis-shadow-2);
  }

  .v-button[data-elevated]:is([data-variant='ghost'], [data-variant='outline']):active:not(
      :disabled,
      [aria-disabled='true']
    ) {
    background: color-mix(
      in oklab,
      var(--vectis-color-surface-raised),
      var(--tone-text-tinted) 12%
    );
  }

  .v-button:is(:disabled, [aria-disabled='true']) {
    cursor: not-allowed;
  }

  .v-button[data-loading] {
    opacity: 0.5;
  }

  /* Disabled (outside loading): greys through tokens, never opacity. These three are
     (0,4,0) and already beat the (0,3,0) raised background, whatever the order. */
  .v-button:is(:disabled, [aria-disabled='true']):not([data-loading]):is(
      [data-variant='solid'],
      [data-variant='soft']
    ) {
    background: var(--vectis-color-surface-muted);
    color: var(--vectis-color-text-subtle);
  }

  .v-button:is(:disabled, [aria-disabled='true']):not([data-loading])[data-variant='outline'] {
    background: transparent;
    color: var(--vectis-color-text-subtle);
    border-color: var(--vectis-color-border);
  }

  .v-button:is(:disabled, [aria-disabled='true']):not([data-loading])[data-variant='ghost'] {
    background: transparent;
    color: var(--vectis-color-text-subtle);
  }

  /* The shadow needs its OWN rule: no variant declares one, so none of the three
     above cancels it, and a disabled raised ghost would go on casting shadow-2. */
  .v-button:is(:disabled, [aria-disabled='true']):not([data-loading])[data-elevated] {
    box-shadow: none;
  }

  .v-button-spinner {
    /* A box the size of an icon (the spinner replaces iconStart): no width jump
       when switching to loading. font-size = the box size, so the VSpinner (1em)
       fills it exactly. */
    width: var(--vectis-icon-size);
    height: var(--vectis-icon-size);
    font-size: var(--vectis-icon-size);
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-button {
      transition: none;
    }
  }
}
</style>
