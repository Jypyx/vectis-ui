<script setup lang="ts">
import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'
import type { IconSource } from '../Icon/types'

/**
 * Rangée d'option du Combobox (`role="option"`), composant INTERNE non exporté.
 * Le focus DOM reste dans le champ : la surbrillance vient de la prop `active`
 * (posée via `aria-activedescendant`), jamais du focus. La sélection ne ferme
 * pas le panneau — le Combobox décide.
 *
 * `disabled` ne pose PAS l'attribut natif : une option désactivée doit rester
 * dans l'arbre d'accessibilité que le champ parcourt, d'où `aria-disabled`.
 *
 * Racine unique : `id` et les écouteurs du consommateur (`@pointermove`…)
 * arrivent par fallthrough natif.
 *
 * Surface volontairement réduite à ce que le Combobox utilise : le libellé
 * passe par le slot #default (que le Combobox alimente avec son propre slot
 * scopé `#option`), pas par une prop. Un seul emplacement d'icône, au début —
 * la fin est occupée par la coche de sélection — d'où `icon` et non
 * `iconStart` (convention Badge/Tab/ToggleItem).
 */
interface ComboboxOptionProps {
  /**
   * Icône avant le libellé : nom d'icône, ou rendu explicite (`{ src }`…).
   */
  icon?: IconSource
  /** Option sélectionnée (aria-selected + coche). */
  selected?: boolean
  /** Option active (surbrillance) — posée par le champ. */
  active?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<ComboboxOptionProps>(), {
  icon: undefined,
  selected: false,
  active: false,
  disabled: false,
})

const emit = defineEmits<{
  /** Émis à l'activation (clic). */
  select: []
}>()

defineSlots<{
  /** Libellé de l'option. */
  default?(): unknown
}>()

function onClick() {
  if (props.disabled) return
  emit('select')
}
</script>

<template>
  <button
    type="button"
    role="option"
    tabindex="-1"
    class="v-combobox-option"
    :aria-selected="selected"
    :aria-disabled="disabled ? 'true' : undefined"
    :data-active="active ? '' : undefined"
    @click="onClick"
  >
    <Icon v-if="icon" v-bind="iconProps(icon)" />
    <span class="v-combobox-option-label"><slot /></span>
    <Icon v-if="selected" name="check" class="v-combobox-option-check" />
  </button>
</template>

<style>
@layer vectis.components {
  .v-combobox-option {
    /* Taille : `--control-*` héritées du panneau, qui porte `v-control`
       (styles/control-size.css) ; les icônes suivent par le même héritage.
       Typo composite comme MenuItem : taille de l'échelle, leading `body-md`
       (ratio unitless) et poids regular. */
    display: flex;
    align-items: center;
    gap: var(--control-gap);
    width: 100%;
    min-height: var(--control-height);
    padding: var(--vectis-space-1) var(--control-padding-inline);
    border: none;
    background: transparent;
    color: var(--vectis-color-text);
    border-radius: var(--vectis-radius-sm);
    font-family: inherit;
    font-size: var(--control-font-size);
    line-height: var(--vectis-text-body-md-leading);
    text-align: start;
    cursor: pointer;
  }

  /* `min-inline-size: 0` : sans lui le minimum automatique du flex item
     empêcherait un libellé long de se comprimer. */
  .v-combobox-option-label {
    flex: 1;
    min-inline-size: 0;
  }

  /* La surbrillance vient du survol ou de `active` (le focus ne vient jamais
     ici : il reste dans le champ). */
  .v-combobox-option:hover:not([aria-disabled='true']),
  .v-combobox-option[data-active] {
    background: var(--vectis-color-surface-muted);
    outline: none;
  }

  .v-combobox-option[aria-selected='true'] {
    color: var(--vectis-color-accent-text);
  }

  /* pas de `disabled` natif ici (l'option reste dans l'arbre a11y du champ) */
  .v-combobox-option[aria-disabled='true'] {
    background: transparent;
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }
}
</style>
