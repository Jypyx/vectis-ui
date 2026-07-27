<script setup lang="ts">
import { computed, provide, useAttrs } from 'vue'

import ButtonGroup from '../Button/ButtonGroup.vue'
import { toggleKey } from './context'

export type ToggleValue = string | number
/** Le type du v-model suit `multiple` : valeur seule (ou null) en simple, tableau en multiple. */
export type ToggleModelValue = ToggleValue | ToggleValue[] | null
export type ToggleVariant = 'ghost' | 'outline'
export type ToggleTone = 'accent' | 'neutral' | 'danger' | 'success' | 'warning'
export type ToggleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ToggleOrientation = 'horizontal' | 'vertical'

/**
 * Groupe de boutons sélectionnables pilotés par un seul v-model. Composé :
 * chaque item est un `Button` (l'item sélectionné en `solid`, les autres en
 * `ghost`/`outline`) et `attached` (défaut) rattache le tout dans un
 * ButtonGroup en contrôle segmenté. Aucune règle d'état n'est redéfinie ici —
 * hover, focus, disabled, `prefers-reduced-motion` viennent de Button.
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
  /** Rattache les items en contrôle segmenté (ButtonGroup). `false` : boutons séparés. */
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
  /** Les <ToggleItem>. */
  default(): unknown
}>()

const model = defineModel<ToggleModelValue>({ default: null })

// `label` n'est qu'un défaut : un aria-label du consommateur le remplace, et un
// aria-labelledby le supprime (sinon les deux noms cohabiteraient).
const attrs = useAttrs()
const ariaLabel = computed(() =>
  attrs['aria-labelledby'] !== undefined
    ? undefined
    : ((attrs['aria-label'] as string | undefined) ?? props.label),
)

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
    if (current.includes(value)) {
      if (props.mandatory && current.length === 1) return // jamais vider le dernier
      model.value = current.filter((v) => v !== value)
    } else {
      model.value = [...current, value]
    }
    return
  }
  if (model.value === value) {
    if (!props.mandatory) model.value = null // re-clic = désélection
    return
  }
  model.value = value
}

// Getters : les props de la racine restent réactives à travers l'injection.
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
 * Navigation clavier : aucune primitive native ne déplace le focus entre des
 * boutons frères. Pas de roving tabindex — chaque item visible est un arrêt de
 * tabulation (modèle Pagination ; le roving est réservé aux composites
 * tablist/radiogroup) — et les flèches et Home/End ne font que DÉPLACER le
 * focus : activer au focus basculerait des valeurs involontairement.
 *
 * Les items sont découverts par requête DOM (pas de registre) et filtrés sur
 * `display` (un item masqué par le consommateur ne capte pas le focus) ; les
 * items disabled sont des <button disabled>, exclus par :not(:disabled). Les
 * flèches horizontales sont physiques, donc inversées en RTL ; les verticales
 * ne le sont pas (l'axe block ne se retourne pas).
 *
 * `event.currentTarget` plutôt qu'une ref template : sur `<component :is>`,
 * une ref renverrait tantôt un élément (div), tantôt une instance (ButtonGroup).
 */
function onKeydown(event: KeyboardEvent) {
  const keys =
    props.orientation === 'vertical'
      ? ['ArrowDown', 'ArrowUp', 'Home', 'End']
      : ['ArrowRight', 'ArrowLeft', 'Home', 'End']
  if (!keys.includes(event.key)) return
  const group = event.currentTarget as HTMLElement
  const items = [...group.querySelectorAll<HTMLElement>('.ds-toggle-item:not(:disabled)')].filter(
    (el) => getComputedStyle(el).display !== 'none',
  )
  if (items.length === 0) return
  event.preventDefault()

  const forward =
    props.orientation === 'vertical'
      ? event.key === 'ArrowDown'
      : (event.key === 'ArrowRight') !== (getComputedStyle(group).direction === 'rtl')
  const current = items.indexOf(document.activeElement as HTMLElement)
  const next =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? items.length - 1
        : current === -1
          ? 0
          : (current + (forward ? 1 : -1) + items.length) % items.length
  items[next]?.focus()
}
</script>

<template>
  <!-- attached : ButtonGroup fusionne les bordures. Il cible ses enfants
       DIRECTS `.ds-button` — ToggleItem a le Button pour racine, jamais de
       wrapper intermédiaire. `orientation`/`data-orientation` en miroir, via
       UNE seule clé (un binding même `undefined` traverserait en fallthrough
       et écraserait le data-orientation que ButtonGroup pose lui-même) :
       ButtonGroup reçoit sa prop, le div détaché l'attribut directement.
       `role="group"` : nécessaire pour la branche div, coïncide avec celui de
       ButtonGroup en attached. -->
  <component
    :is="attached ? ButtonGroup : 'div'"
    v-bind="attached ? { orientation } : { 'data-orientation': orientation }"
    class="ds-toggle"
    role="group"
    :aria-label="ariaLabel"
    @keydown="onKeydown"
  >
    <slot />
  </component>
</template>

<style>
@layer ds.components {
  /*
   * Mode détaché seulement. `:not(.ds-button-group)` : en attached la racine
   * porte les DEUX classes — sans cette garde, `align-items: center` entrerait
   * en conflit d'ordre avec le `stretch` de ButtonGroup (même spécificité).
   * Rend aussi l'ordre d'export non contraignant.
   */
  .ds-toggle:not(.ds-button-group) {
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-1);
  }

  .ds-toggle:not(.ds-button-group)[data-orientation='vertical'] {
    flex-direction: column;
    /* largeurs égalisées, comme ButtonGroup vertical */
    align-items: stretch;
  }
}
</style>
