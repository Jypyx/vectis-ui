<script setup lang="ts">
import { inject } from 'vue'

import { dropdownMenuKey } from './context'

/**
 * Item de menu (role="menuitem", pattern ARIA menu). tabindex="-1" : le focus
 * est piloté par le parent (roving focus). La sélection émet `select` puis
 * ferme le menu via le contexte injecté. Avec `href`, l'item est un <a>
 * (item de navigation, permis par ARIA) ; un <a> n'a pas de `disabled`
 * natif → pattern « lien inerte » de Button (href retiré + aria-disabled).
 */
interface DropdownMenuItemProps {
  disabled?: boolean
  /** Item destructif (couleur danger). */
  danger?: boolean
  /** Rendu <a role="menuitem"> (item de navigation). disabled → lien inerte. */
  href?: string
}

const props = withDefaults(defineProps<DropdownMenuItemProps>(), {
  disabled: false,
  danger: false,
  href: undefined,
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
  <component
    :is="href !== undefined ? 'a' : 'button'"
    role="menuitem"
    tabindex="-1"
    class="ds-menu-item"
    :type="href !== undefined ? undefined : 'button'"
    :disabled="href !== undefined ? undefined : disabled"
    :href="href !== undefined && !disabled ? href : undefined"
    :aria-disabled="href !== undefined && disabled ? 'true' : undefined"
    :data-danger="danger ? '' : undefined"
    @click="onClick"
  >
    <slot name="icon" />
    <slot />
  </component>
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
    text-decoration: none;
    cursor: pointer;
  }

  /* Le focus EST la surbrillance (roving focus programmatique → :focus, pas :focus-visible) */
  .ds-menu-item:hover:not(:disabled, [aria-disabled='true']),
  .ds-menu-item:focus {
    background: var(--ds-color-surface-muted);
    outline: none;
  }

  .ds-menu-item[data-danger] {
    color: var(--ds-color-danger-text);
  }

  .ds-menu-item[data-danger]:hover:not(:disabled, [aria-disabled='true']),
  .ds-menu-item[data-danger]:focus {
    background: var(--ds-color-danger-surface);
  }

  /* :disabled ne s'applique qu'au <button> ; le lien inerte passe par aria-disabled */
  .ds-menu-item:disabled,
  .ds-menu-item[aria-disabled='true'] {
    color: var(--ds-color-text-subtle);
    cursor: not-allowed;
  }
}
</style>
