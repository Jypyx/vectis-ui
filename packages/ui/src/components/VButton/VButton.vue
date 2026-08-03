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
  variant?: 'solid' | 'outline' | 'ghost' | 'elevated' | 'tonal'
  tone?: 'accent' | 'neutral' | 'danger' | 'success' | 'warning'
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
    class="v-button v-control"
    :href="isLink && !isInert ? href : undefined"
    :type="isLink ? undefined : type"
    :disabled="isLink ? undefined : disabled || loading"
    :aria-disabled="isInertLink ? 'true' : undefined"
    :data-variant="variant"
    :data-tone="tone"
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

  .v-button[data-tone='accent'] {
    --tone-bg-solid: var(--vectis-color-accent);
    --tone-bg-solid-hover: var(--vectis-color-accent-hover);
    --tone-bg-solid-active: var(--vectis-color-accent-active);
    --tone-text-solid: var(--vectis-color-text-on-accent);
    --tone-text-tinted: var(--vectis-color-accent-text);
    --tone-bg-soft: var(--vectis-color-accent-surface);
    --tone-border-soft: var(--vectis-color-accent-border);
  }

  .v-button[data-tone='danger'] {
    --tone-bg-solid: var(--vectis-color-danger);
    --tone-bg-solid-hover: var(--vectis-color-danger-hover);
    --tone-bg-solid-active: var(--vectis-color-danger-active);
    --tone-text-solid: var(--vectis-color-text-on-accent);
    --tone-text-tinted: var(--vectis-color-danger-text);
    --tone-bg-soft: var(--vectis-color-danger-surface);
    --tone-border-soft: var(--vectis-color-danger-border);
  }

  .v-button[data-tone='success'] {
    --tone-bg-solid: var(--vectis-color-success);
    --tone-bg-solid-hover: var(--vectis-color-success-hover);
    --tone-bg-solid-active: var(--vectis-color-success-active);
    --tone-text-solid: var(--vectis-color-text-on-accent);
    --tone-text-tinted: var(--vectis-color-success-text);
    --tone-bg-soft: var(--vectis-color-success-surface);
    --tone-border-soft: var(--vectis-color-success-border);
  }

  .v-button[data-tone='warning'] {
    --tone-bg-solid: var(--vectis-color-warning);
    --tone-bg-solid-hover: var(--vectis-color-warning-hover);
    --tone-bg-solid-active: var(--vectis-color-warning-active);
    /* amber is too light for white: dedicated token (dark text) */
    --tone-text-solid: var(--vectis-color-text-on-warning);
    --tone-text-tinted: var(--vectis-color-warning-text);
    --tone-bg-soft: var(--vectis-color-warning-surface);
    --tone-border-soft: var(--vectis-color-warning-border);
  }

  .v-button[data-tone='neutral'] {
    --tone-bg-solid: var(--vectis-color-surface-muted);
    --tone-bg-solid-hover: color-mix(
      in oklab,
      var(--vectis-color-surface-muted),
      var(--vectis-color-text) 8%
    );
    --tone-bg-solid-active: color-mix(
      in oklab,
      var(--vectis-color-surface-muted),
      var(--vectis-color-text) 14%
    );
    --tone-text-solid: var(--vectis-color-text);
    --tone-text-tinted: var(--vectis-color-text);
    --tone-bg-soft: var(--vectis-color-surface-muted);
    --tone-border-soft: var(--vectis-color-border-strong);
  }

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

  .v-button[data-variant='outline']:hover:not(:disabled, [aria-disabled='true']),
  .v-button[data-variant='ghost']:hover:not(:disabled, [aria-disabled='true']) {
    background: var(--tone-bg-soft);
  }

  .v-button[data-variant='outline']:active:not(:disabled, [aria-disabled='true']),
  .v-button[data-variant='ghost']:active:not(:disabled, [aria-disabled='true']) {
    background: color-mix(in oklab, var(--tone-bg-soft), var(--tone-text-tinted) 8%);
  }

  .v-button[data-variant='elevated'] {
    background: var(--vectis-color-surface-raised);
    color: var(--tone-text-tinted);
    box-shadow: var(--vectis-shadow-2);
  }

  .v-button[data-variant='elevated']:hover:not(:disabled, [aria-disabled='true']) {
    background: color-mix(in oklab, var(--vectis-color-surface-raised), var(--tone-text-tinted) 8%);
    box-shadow: var(--vectis-shadow-3);
  }

  .v-button[data-variant='elevated']:active:not(:disabled, [aria-disabled='true']) {
    background: color-mix(
      in oklab,
      var(--vectis-color-surface-raised),
      var(--tone-text-tinted) 12%
    );
    box-shadow: var(--vectis-shadow-2);
  }

  .v-button[data-variant='tonal'] {
    background: var(--tone-bg-soft);
    color: var(--tone-text-tinted);
  }

  .v-button[data-variant='tonal']:hover:not(:disabled, [aria-disabled='true']) {
    background: color-mix(in oklab, var(--tone-bg-soft), var(--tone-text-tinted) 8%);
  }

  .v-button[data-variant='tonal']:active:not(:disabled, [aria-disabled='true']) {
    background: color-mix(in oklab, var(--tone-bg-soft), var(--tone-text-tinted) 14%);
  }

  .v-button:is(:disabled, [aria-disabled='true']) {
    cursor: not-allowed;
  }

  .v-button[data-loading] {
    opacity: 0.5;
  }

  /* Disabled (outside loading): greys through tokens, never opacity. */
  .v-button:is(:disabled, [aria-disabled='true']):not([data-loading]):is(
      [data-variant='solid'],
      [data-variant='elevated'],
      [data-variant='tonal']
    ) {
    background: var(--vectis-color-surface-muted);
    color: var(--vectis-color-text-subtle);
    box-shadow: none;
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
