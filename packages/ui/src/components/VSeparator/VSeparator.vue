<script setup lang="ts">
/** Use a native hr for separator semantics and borders for visibility in forced colours. */
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'

/** Which way the rule runs. */
export type SeparatorOrientation = 'horizontal' | 'vertical'
/** How the rule is stroked. */
export type SeparatorVariant = 'solid' | 'dashed' | 'dotted'
/** Where the content sits along the rule. */
export type SeparatorContentPosition = 'start' | 'center' | 'end'
/** How thick the rule is. */
export type SeparatorSize = 'sm' | 'md' | 'lg'

interface SeparatorProps {
  /** The direction the rule runs in: across by default, or down the page under `vertical`. */
  orientation?: SeparatorOrientation
  /** How the rule is stroked: a continuous line, dashes or dots. */
  variant?: SeparatorVariant
  /**
   * How thick the rule is: a 1px hairline (`sm`, the default), 2px or 4px. A thicker rule marks
   * a stronger break, and makes `dotted` read as dots.
   */
  size?: SeparatorSize
  /**
   * A colour of your own (hex, CSS name or `oklch()`) for the rule. The label and icon keep the
   * muted text colour, so their contrast stays the design system's.
   */
  color?: string
  /** Visible text breaking the rule. It also becomes the separator's accessible name. */
  label?: string
  /** An icon breaking the rule, before the label when both are set (the VIcon contract). */
  icon?: IconSource
  /** Where the label and icon sit along the rule: its start, centre or end. */
  contentPosition?: SeparatorContentPosition
}

withDefaults(defineProps<SeparatorProps>(), {
  orientation: 'horizontal',
  variant: 'solid',
  size: 'sm',
  color: undefined,
  label: undefined,
  icon: undefined,
  contentPosition: 'center',
})

const slots = defineSlots<{
  /** Rich content breaking the rule, after the icon and in place of the label. */
  default?(): unknown
}>()

// A function read by the template, never a `computed`: `slots` is not reactive.
function hasSlot() {
  return slots.default !== undefined
}
</script>

<template>
  <!--
    Aria-orientation is emitted only when it CONTRADICTS what the role already implies: a
    separator is horizontal by default, so stating it would merely restate the role. This is the
    same convention the VTabs tablist follows.
  -->
  <hr
    v-if="!label && !icon && !hasSlot()"
    class="v-separator"
    :data-orientation="orientation"
    :data-variant="variant"
    :data-size="size"
    :aria-orientation="orientation === 'vertical' ? 'vertical' : undefined"
    :style="color !== undefined ? { '--separator-color': color } : undefined"
  />
  <!--
    An <hr> cannot hold content. A separator's children are presentational, so the label is
    repeated as its accessible name; slot-only content is named by the consumer's aria-label.
  -->
  <div
    v-else
    role="separator"
    class="v-separator"
    :data-orientation="orientation"
    :data-variant="variant"
    :data-size="size"
    :data-content-position="contentPosition"
    :aria-orientation="orientation === 'vertical' ? 'vertical' : undefined"
    :aria-label="label"
    :style="color !== undefined ? { '--separator-color': color } : undefined"
  >
    <span class="v-separator-content">
      <VIcon v-if="icon" v-bind="iconProps(icon)" />
      <slot>{{ label }}</slot>
    </span>
  </div>
</template>

<style>
@layer vectis.components {
  .v-separator {
    --separator-color: var(--vectis-color-border);
    --separator-thickness: var(--vectis-control-size-separator-sm);

    flex: none;
    /*
     * `.v-menu-separator` and `.v-listbox-separator` override that margin from THEIR own
     * sheet, and which of the two sheets the consumer's bundler puts last is not ours to
     * decide. Both are therefore written as the compound `.v-separator.v-x-separator`, and
     * every declaration added here falls under the same obligation.
     */
    margin: 0;
    border: 0 solid var(--separator-color);
  }

  .v-separator[data-size='md'] {
    --separator-thickness: var(--vectis-control-size-separator-md);
  }

  .v-separator[data-size='lg'] {
    --separator-thickness: var(--vectis-control-size-separator-lg);
  }

  .v-separator[data-variant='dashed'] {
    border-style: dashed;
  }

  .v-separator[data-variant='dotted'] {
    border-style: dotted;
  }

  /*
   * In ordinary flow it collapses to nothing, silently and with no error; there it is up to the
   * consumer to give it a block-size.
   */
  .v-separator[data-orientation='vertical'] {
    align-self: stretch;
  }

  hr.v-separator[data-orientation='horizontal'] {
    border-block-start-width: var(--separator-thickness);
  }

  hr.v-separator[data-orientation='vertical'] {
    border-inline-start-width: var(--separator-thickness);
  }

  /* With content, the root only lays out; its two pseudo-elements are the strokes. */
  div.v-separator {
    display: flex;
    align-items: center;
    gap: var(--vectis-space-3);
    color: var(--vectis-color-text-muted);
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-caption-size);
    font-weight: var(--vectis-text-caption-weight);
    line-height: var(--vectis-text-caption-leading);
  }

  div.v-separator::before,
  div.v-separator::after {
    content: '';
    flex: 1;
    /* The initial width is `medium` (3px): every side but the stroke's must be zeroed. */
    border-width: 0;
    border-color: inherit;
    border-style: inherit;
  }

  div.v-separator[data-orientation='horizontal']::before,
  div.v-separator[data-orientation='horizontal']::after {
    border-block-start-width: var(--separator-thickness);
  }

  div.v-separator[data-orientation='vertical'] {
    flex-direction: column;
  }

  div.v-separator[data-orientation='vertical']::before,
  div.v-separator[data-orientation='vertical']::after {
    border-inline-start-width: var(--separator-thickness);
  }

  div.v-separator[data-content-position='start']::before,
  div.v-separator[data-content-position='end']::after {
    display: none;
  }

  .v-separator-content {
    --vectis-icon-size: var(--vectis-icon-size-sm);

    display: inline-flex;
    align-items: center;
    gap: var(--vectis-space-2);
  }
}
</style>
