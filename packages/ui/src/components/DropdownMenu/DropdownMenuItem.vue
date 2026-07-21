<script setup lang="ts">
import { inject } from 'vue'

import { dropdownMenuKey } from './context'

/**
 * Item de menu (role="menuitem", pattern ARIA menu). tabindex="-1" : le focus
 * est piloté par le parent (roving focus). La sélection émet `select` puis
 * ferme le menu via le contexte injecté.
 */
interface DropdownMenuItemProps {
  disabled?: boolean
  /** Item destructif (couleur danger). */
  danger?: boolean
}

const props = withDefaults(defineProps<DropdownMenuItemProps>(), {
  disabled: false,
  danger: false,
})

const emit = defineEmits<{
  /** Émis à l'activation (clic ou Entrée/Espace), avant fermeture du menu. */
  select: []
}>()

defineSlots<{
  /** Libellé de l'item */
  default(): unknown
  /** Icône optionnelle (aria-hidden conseillé) */
  icon?(): unknown
}>()

const menu = inject(dropdownMenuKey, null)

function onClick() {
  if (props.disabled) return
  emit('select')
  menu?.close()
}
</script>

<template>
  <button
    type="button"
    role="menuitem"
    tabindex="-1"
    class="ds-menu-item"
    :disabled="disabled"
    :data-danger="danger ? '' : undefined"
    @click="onClick"
  >
    <slot name="icon" />
    <slot />
  </button>
</template>

<style>
@layer ds.components {
  .ds-menu-item {
    display: flex;
    align-items: center;
    gap: var(--ds-space-2);
    width: 100%;
    padding: var(--ds-space-2) var(--ds-space-3);
    border: none;
    background: transparent;
    color: var(--ds-color-text);
    border-radius: var(--ds-radius-sm);
    font-size: var(--ds-font-size-sm);
    line-height: var(--ds-font-leading-none);
    text-align: start;
    cursor: pointer;
  }

  /* Le focus EST la surbrillance (roving focus programmatique → :focus, pas :focus-visible) */
  .ds-menu-item:hover:not(:disabled),
  .ds-menu-item:focus {
    background: var(--ds-color-surface-muted);
    outline: none;
  }

  .ds-menu-item[data-danger] {
    color: var(--ds-color-danger-text);
  }

  .ds-menu-item[data-danger]:hover:not(:disabled),
  .ds-menu-item[data-danger]:focus {
    background: var(--ds-color-danger-surface);
  }

  .ds-menu-item:disabled {
    color: var(--ds-color-text-subtle);
    cursor: not-allowed;
  }
}
</style>
