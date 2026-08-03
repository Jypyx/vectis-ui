<script setup lang="ts">
import { provide } from 'vue'

import VButtonGroup from '../VButton/VButtonGroup.vue'
import { toggleKey } from './context'

import { toggleValue } from '../../utils/array'
import { arrowNavigate, navigableItems } from '../../utils/arrowNav'

import { useAriaLabel } from '../../composables/useAriaLabel'

export type ToggleValue = string | number
/** Le type du v-model suit `multiple` : valeur seule (ou null) en simple, tableau en multiple. */
export type ToggleModelValue = ToggleValue | ToggleValue[] | null
export type ToggleVariant = 'ghost' | 'outline'
export type ToggleTone = 'accent' | 'neutral' | 'danger' | 'success' | 'warning'
export type ToggleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ToggleOrientation = 'horizontal' | 'vertical'

/**
 * Groupe de boutons sélectionnables pilotés par un seul v-model. Composé :
 * chaque item est un `VButton` (l'item sélectionné en `solid`, les autres en
 * `ghost`/`outline`) et `attached` (défaut) rattache le tout dans un
 * VButtonGroup en contrôle segmenté. Aucune règle d'état n'est redéfinie ici —
 * hover, focus, disabled, `prefers-reduced-motion` viennent de VButton.
 *
 * Le JS de comportement se limite au pont clic → v-model (`select` : bascule
 * simple/multiple + garde `mandatory`, irréalisable en HTML/CSS) et à la
 * navigation clavier (flèches / Home / End), justifiée en tête de `onKeydown`.
 */
interface ToggleProps {
  /** Sélection multiple : le v-model devient un tableau de valeurs. */
  multiple?: boolean
  /**
   * La dernière valeur sélectionnée ne peut jamais être désélectionnée. Pure
   * garde à la désélection : ne force AUCUNE sélection initiale.
   */
  mandatory?: boolean
  /** Rattache les items en contrôle segmenté (VButtonGroup). `false` : boutons séparés. */
  attached?: boolean
  orientation?: ToggleOrientation
  /** Variante des items NON sélectionnés. L'item sélectionné est toujours `solid`. */
  variant?: ToggleVariant
  /** Tone de l'item sélectionné ; les items non sélectionnés restent neutral. */
  tone?: ToggleTone
  size?: ToggleSize
  /** Hauteur réduite de 4px, propagée à tous les items. */
  compact?: boolean
  /** Désactive le groupe entier. */
  disabled?: boolean
  /** Remplit l'icône (axe FILL de Material Symbols) de l'item sélectionné. */
  selectedIconFilled?: boolean
  /** Nom accessible du groupe. Fortement recommandé (aucun défaut générique n'a de sens). */
  label?: string
}

const props = withDefaults(defineProps<ToggleProps>(), {
  multiple: false,
  mandatory: false,
  attached: true,
  orientation: 'horizontal',
  variant: 'ghost',
  tone: 'accent',
  size: 'md',
  compact: false,
  disabled: false,
  selectedIconFilled: false,
  label: undefined,
})

defineSlots<{
  /** Les <VToggleItem>. */
  default(): unknown
}>()

const model = defineModel<ToggleModelValue>({ default: null })

const ariaLabel = useAriaLabel(() => props.label)

function isSelected(value: ToggleValue): boolean {
  return props.multiple
    ? Array.isArray(model.value) && model.value.includes(value)
    : model.value === value
}

/*
 * Pont clic → v-model. En multiple, le tableau n'est JAMAIS muté en place :
 * nouvelle référence à chaque écriture (réactivité des v-model consommateurs) ;
 * un v-model null ou scalaire hérité du mode simple est normalisé en [].
 * Pas de garde `disabled` : un <button disabled> n'émet pas de click.
 */
function select(value: ToggleValue) {
  if (props.multiple) {
    const current = Array.isArray(model.value) ? model.value : []
    if (props.mandatory && current.length === 1 && current.includes(value)) return
    model.value = toggleValue(current, value)
    return
  }
  if (model.value === value) {
    if (!props.mandatory) model.value = null
    return
  }
  model.value = value
}

provide(toggleKey, {
  isSelected,
  select,
  get variant() {
    return props.variant
  },
  get tone() {
    return props.tone
  },
  get size() {
    return props.size
  },
  get compact() {
    return props.compact
  },
  get disabled() {
    return props.disabled
  },
  get selectedIconFilled() {
    return props.selectedIconFilled
  },
})

/*
 * Navigation clavier (implémentation partagée : `utils/arrowNav`). Pas de
 * roving tabindex — chaque item visible est un arrêt de tabulation (modèle
 * VPagination ; le roving est réservé aux composites tablist/radiogroup). Les
 * items disabled sont des <button disabled>, exclus par le sélecteur.
 *
 * `event.currentTarget` plutôt qu'une ref template : sur `<component :is>`,
 * une ref renverrait tantôt un élément (div), tantôt une instance (VButtonGroup).
 */
function onKeydown(event: KeyboardEvent) {
  const group = event.currentTarget as HTMLElement
  arrowNavigate(event, group, navigableItems(group, '.v-toggle-item:not(:disabled)'), {
    vertical: props.orientation === 'vertical',
  })
}
</script>

<template>
  <!-- attached : VButtonGroup fusionne les bordures. Il cible ses enfants
       DIRECTS `.v-button` — VToggleItem a le VButton pour racine, jamais de
       wrapper intermédiaire. `orientation`/`data-orientation` en miroir, via
       UNE seule clé (un binding même `undefined` traverserait en fallthrough
       et écraserait le data-orientation que VButtonGroup pose lui-même) :
       VButtonGroup reçoit sa prop, le div détaché l'attribut directement.
       `role="group"` : nécessaire pour la branche div, coïncide avec celui de
       VButtonGroup en attached. -->
  <component
    :is="attached ? VButtonGroup : 'div'"
    v-bind="attached ? { orientation } : { 'data-orientation': orientation }"
    class="v-toggle"
    role="group"
    :aria-label="ariaLabel"
    @keydown="onKeydown"
  >
    <slot />
  </component>
</template>

<style>
@layer vectis.components {
  /*
   * Mode détaché seulement. `:not(.v-button-group)` : en attached la racine
   * porte les DEUX classes — sans cette garde, `align-items: center` entrerait
   * en conflit d'ordre avec le `stretch` de VButtonGroup (même spécificité).
   * Rend aussi l'ordre d'export non contraignant.
   */
  .v-toggle:not(.v-button-group) {
    display: inline-flex;
    align-items: center;
    gap: var(--vectis-space-1);
  }

  .v-toggle:not(.v-button-group)[data-orientation='vertical'] {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
