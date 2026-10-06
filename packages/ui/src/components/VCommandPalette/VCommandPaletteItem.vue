<script setup lang="ts">
// @a11y
/**
 * One row of VCommandPalette: a button, or a link when the command has an address, so that
 * opening it in a new tab stays native. Focus stays in the search field, which points here
 * through aria-activedescendant; the row is never focused and never natively disabled.
 */

import VHotkeys from '../VHotkeys/VHotkeys.vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'

interface CommandPaletteItemProps {
  label: string
  /** Renders the row as a link to this address. */
  href?: string
  icon?: IconSource
  /** A second line, under the label. */
  description?: string
  /** A shortcut shown at the end of the row. */
  shortcut?: string
  /** Marks the row the search field currently points at. */
  active?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<CommandPaletteItemProps>(), {
  href: undefined,
  icon: undefined,
  description: undefined,
  shortcut: undefined,
  active: false,
  disabled: false,
})

const emit = defineEmits<{
  /** The row was clicked, or Enter was pressed in the search field while it was active. */
  select: [event: MouseEvent]
}>()

defineSlots<{
  /** The label, and the description under it. */
  default?(): unknown
}>()

function onClick(event: MouseEvent) {
  if (props.disabled) {
    event.preventDefault()
    return
  }
  emit('select', event)
}
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :type="href ? undefined : 'button'"
    :href="disabled ? undefined : href"
    role="option"
    tabindex="-1"
    class="v-command-palette-item"
    :aria-selected="active"
    :aria-disabled="disabled ? 'true' : undefined"
    :data-active="active ? '' : undefined"
    @click="onClick"
  >
    <VIcon v-if="icon" v-bind="iconProps(icon)" class="v-command-palette-item-icon" />
    <span class="v-command-palette-item-text">
      <slot>
        <span class="v-command-palette-item-label">{{ label }}</span>
        <span v-if="description" class="v-command-palette-item-description">{{ description }}</span>
      </slot>
    </span>
    <VHotkeys v-if="shortcut" :keys="shortcut" class="v-command-palette-item-shortcut" />
  </component>
</template>

<style>
@layer vectis.components {
  /*
   * The dimensions are inherited from the list, which carries the shared size class. The label
   * keeps the line height of body text, a unitless ratio, because a long one may wrap.
   */
  .v-command-palette-item {
    display: flex;
    align-items: center;
    gap: var(--control-gap);
    inline-size: 100%;
    min-block-size: var(--control-height);
    padding: var(--vectis-space-1) var(--control-padding-inline);
    border: none;
    border-radius: var(--vectis-radius-interactive);
    background: transparent;
    color: var(--vectis-color-text);
    font-family: inherit;
    font-size: var(--control-font-size);
    line-height: var(--vectis-text-body-md-leading);
    text-align: start;
    text-decoration: none;
    cursor: pointer;
  }

  .v-command-palette-item-icon {
    flex: none;
    color: var(--vectis-color-text-muted);
  }

  /* The zero minimum lets a long label shrink and wrap rather than push the shortcut out. */
  .v-command-palette-item-text {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-inline-size: 0;
  }

  .v-command-palette-item-description {
    font-size: var(--vectis-text-caption-size);
    line-height: var(--vectis-text-caption-leading);
    color: var(--vectis-color-text-muted);
  }

  .v-command-palette-item-shortcut {
    flex: none;
    color: var(--vectis-color-text-muted);
  }

  /* There is no focus rule on purpose: the focus stays in the search field. */
  .v-command-palette-item:hover:not([aria-disabled='true']),
  .v-command-palette-item[data-active] {
    background: var(--vectis-color-surface-muted);
  }

  .v-command-palette-item[aria-disabled='true'] {
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }

  .v-command-palette-item[aria-disabled='true'] .v-command-palette-item-icon,
  .v-command-palette-item[aria-disabled='true'] .v-command-palette-item-description {
    color: inherit;
  }

  /* Forced colours flatten the background, which is all the active row is painted with. */
  @media (forced-colors: active) {
    .v-command-palette-item[data-active] {
      outline: var(--vectis-focus-ring-width) solid Highlight;
      outline-offset: calc(-1 * var(--vectis-focus-ring-width));
    }
  }
}
</style>
