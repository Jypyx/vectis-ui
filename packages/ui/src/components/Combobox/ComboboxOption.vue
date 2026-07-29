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
    class="ds-combobox-option"
    :aria-selected="selected"
    :aria-disabled="disabled ? 'true' : undefined"
    :data-active="active ? '' : undefined"
    @click="onClick"
  >
    <Icon v-if="icon" v-bind="iconProps(icon)" />
    <span class="ds-combobox-option-label"><slot /></span>
    <Icon v-if="selected" name="check" class="ds-combobox-option-check" />
  </button>
</template>

<style>
@layer ds.components {
  .ds-combobox-option {
    /* Taille : `--_control-*` héritées du panneau, qui porte `ds-control`
       (styles/control-size.css) ; les icônes suivent par le même héritage.
       Typo composite comme MenuItem : taille de l'échelle, leading `body-md`
       (ratio unitless) et poids regular. */
    display: flex;
    align-items: center;
    gap: var(--_control-gap);
    width: 100%;
    min-height: var(--_control-height);
    padding: var(--ds-space-1) var(--_control-padding-inline);
    border: none;
    background: transparent;
    color: var(--ds-color-text);
    border-radius: var(--ds-radius-sm);
    font-family: inherit;
    font-size: var(--_control-font-size);
    line-height: var(--ds-text-body-md-leading);
    text-align: start;
    cursor: pointer;
  }

  /* `min-inline-size: 0` : sans lui le minimum automatique du flex item
     empêcherait un libellé long de se comprimer. */
  .ds-combobox-option-label {
    flex: 1;
    min-inline-size: 0;
  }

  /* La surbrillance vient du survol ou de `active` (le focus ne vient jamais
     ici : il reste dans le champ). */
  .ds-combobox-option:hover:not([aria-disabled='true']),
  .ds-combobox-option[data-active] {
    background: var(--ds-color-surface-muted);
    outline: none;
  }

  .ds-combobox-option[aria-selected='true'] {
    color: var(--ds-color-accent-text);
  }

  /* pas de `disabled` natif ici (l'option reste dans l'arbre a11y du champ) */
  .ds-combobox-option[aria-disabled='true'] {
    background: transparent;
    color: var(--ds-color-text-subtle);
    cursor: not-allowed;
  }
}
</style>
