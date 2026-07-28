<script setup lang="ts">
import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'

/**
 * Option d'un panneau Listbox (`role="option"`). Le focus DOM reste dans le
 * contrôle externe : la surbrillance vient de la prop `active` (posée par le
 * consommateur via `aria-activedescendant`), jamais du focus. La sélection ne
 * ferme pas le panneau — le consommateur décide via son `v-model:open`.
 *
 * `disabled` ne pose PAS l'attribut natif : une option désactivée doit rester
 * dans l'arbre d'accessibilité que le champ parcourt, d'où `aria-disabled`.
 *
 * Racine unique : `id` et les écouteurs du consommateur (`@pointermove`…)
 * arrivent par fallthrough natif.
 */
interface ListboxOptionProps {
  /** Libellé de l'option (le slot #default prime). */
  label?: string
  /** Sous-libellé sous le label (le slot #sublabel prime). */
  sublabel?: string
  /**
   * Icône avant le libellé : nom Material Symbols Rounded, ou URL
   * d'image/SVG (toute valeur contenant '.', '/' ou ':' est traitée comme
   * une URL). Le slot #start prime.
   */
  iconStart?: string
  /** Icône après le libellé (même détection). Remplacée par la coche si sélectionnée. */
  iconEnd?: string
  /** Option sélectionnée (aria-selected + coche). */
  selected?: boolean
  /** Option active (surbrillance) — posée par le contrôle externe. */
  active?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<ListboxOptionProps>(), {
  label: undefined,
  sublabel: undefined,
  iconStart: undefined,
  iconEnd: undefined,
  selected: false,
  active: false,
  disabled: false,
})

const emit = defineEmits<{
  /** Émis à l'activation (clic). */
  select: []
}>()

defineSlots<{
  /** Libellé de l'option (prime sur la prop `label`). */
  default?(): unknown
  /** Sous-libellé (prime sur la prop `sublabel`). */
  sublabel?(): unknown
  /** Contenu libre avant le libellé (prime sur `iconStart`). */
  start?(): unknown
  /** Contenu libre après le libellé (prime sur `iconEnd`). */
  end?(): unknown
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
    class="ds-listbox-option"
    :aria-selected="selected"
    :aria-disabled="disabled ? 'true' : undefined"
    :data-active="active ? '' : undefined"
    @click="onClick"
  >
    <slot name="start">
      <Icon v-if="iconStart" v-bind="iconProps(iconStart)" />
    </slot>
    <span class="ds-listbox-option-content">
      <span class="ds-listbox-option-label"
        ><slot>{{ label }}</slot></span
      >
      <span v-if="sublabel !== undefined || $slots.sublabel" class="ds-listbox-option-sublabel">
        <slot name="sublabel">{{ sublabel }}</slot>
      </span>
    </span>
    <!-- la coche prend la place de l'emplacement de fin quand l'option est sélectionnée -->
    <Icon v-if="selected" name="check" class="ds-listbox-option-check" />
    <slot v-else name="end">
      <Icon v-if="iconEnd" v-bind="iconProps(iconEnd)" />
    </slot>
  </button>
</template>

<style>
@layer ds.components {
  .ds-listbox-option {
    display: flex;
    align-items: center;
    gap: var(--ds-space-2);
    width: 100%;
    /* variables posées par Listbox.vue — sans fallback, volontairement */
    min-height: calc(var(--_listbox-option-min-h) - var(--_listbox-option-delta));
    padding: var(--ds-space-1) var(--_listbox-option-pad-i);
    border: none;
    background: transparent;
    color: var(--ds-color-text);
    border-radius: var(--ds-radius-sm);
    font-family: inherit;
    font-size: var(--ds-text-body-md-size);
    line-height: var(--ds-text-body-md-leading);
    text-align: start;
    cursor: pointer;
  }

  .ds-listbox-option-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .ds-listbox-option-sublabel {
    font-size: var(--ds-text-caption-size);
    color: var(--ds-color-text-muted);
  }

  /* La surbrillance vient du survol ou de `active` (le focus ne vient jamais
     ici : il reste dans le contrôle externe). */
  .ds-listbox-option:hover:not([aria-disabled='true']),
  .ds-listbox-option[data-active] {
    background: var(--ds-color-surface-muted);
    outline: none;
  }

  .ds-listbox-option[aria-selected='true'] {
    color: var(--ds-color-accent-text);
  }

  /* pas de `disabled` natif ici (l'option reste dans l'arbre a11y du champ) */
  .ds-listbox-option[aria-disabled='true'] {
    background: transparent;
    color: var(--ds-color-text-subtle);
    cursor: not-allowed;
  }

  .ds-listbox-option[aria-disabled='true'] .ds-listbox-option-sublabel {
    color: inherit;
  }
}
</style>
