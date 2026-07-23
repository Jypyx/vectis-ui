<script setup lang="ts">
import { computed, onMounted, provide, ref, useId, watch } from 'vue'

import DropdownPanel from './DropdownPanel.vue'
import { dropdownKey } from './context'
import type { DropdownPlacement } from './context'

/**
 * Panneau déroulant : Popover API (light dismiss natif ; positionnement pur
 * CSS). Deux rôles :
 * - `menu` (défaut) : actions/sous-menus. Le déclencheur invoque par
 *   `popovertarget` (ancre implicite), le focus va au 1er item à l'ouverture,
 *   le clavier (roving focus) vit dans DropdownPanel.
 * - `listbox` : brique du Combobox. Le déclencheur est un `<input role=combobox>`
 *   qui GARDE le focus (le clavier est piloté par le champ, aria-activedescendant) ;
 *   ouverture par `v-model:open` (pas de popovertarget), ancrage statique via
 *   la prop `anchor`. Items en `role="option"`.
 * JS justifié ici : pont v-model ↔ API impérative du popover, focus du 1er item
 * (menu) et retour du focus au déclencheur à la fermeture.
 */
interface DropdownProps {
  placement?: DropdownPlacement
  /** Hauteur minimale des items : 32px (sm) ou 40px (md) ; héritée par les sous-menus. */
  size?: 'sm' | 'md'
  /** Hauteur minimale des items réduite de 4px ; héritée par les sous-menus. */
  compact?: boolean
  /** Sémantique du panneau : `menu` (défaut) ou `listbox` (mode combobox). */
  role?: 'menu' | 'listbox'
  /** listbox : autorise la sélection multiple (aria-multiselectable). */
  multiselectable?: boolean
  /** listbox : ancre statique (dashed-ident) posée par le consommateur sur son
      contrôle — le panneau s'y attache (position-anchor) et cale sa largeur. */
  anchor?: string
}

const props = withDefaults(defineProps<DropdownProps>(), {
  placement: 'bottom-start',
  size: 'sm',
  compact: false,
  role: 'menu',
  multiselectable: false,
  anchor: undefined,
})

const open = defineModel<boolean>('open', { default: false })

/** Props ARIA à poser sur le déclencheur — la forme dépend du rôle. */
type MenuTriggerProps = {
  popovertarget: string
  'aria-haspopup': 'menu'
  'aria-expanded': boolean
  'aria-controls': string
}
type ListboxTriggerProps = {
  role: 'combobox'
  'aria-haspopup': 'listbox'
  'aria-expanded': boolean
  'aria-controls': string
  'aria-autocomplete': 'list'
}

defineSlots<{
  /** Déclencheur : poser `v-bind="triggerProps"` sur un <Button>/<button> (menu)
      ou un champ de saisie (listbox). */
  trigger(props: { triggerProps: MenuTriggerProps | ListboxTriggerProps }): unknown
  /** Les <DropdownItem> / <DropdownGroup> / <DropdownSeparator> */
  default(): unknown
}>()

const panelRef = ref<InstanceType<typeof DropdownPanel> | null>(null)
const dropdownId = useId()
const shown = ref(false)

const triggerProps = computed<MenuTriggerProps | ListboxTriggerProps>(() =>
  props.role === 'listbox'
    ? {
        role: 'combobox',
        'aria-haspopup': 'listbox',
        'aria-expanded': open.value,
        'aria-controls': dropdownId,
        'aria-autocomplete': 'list',
      }
    : {
        popovertarget: dropdownId,
        'aria-haspopup': 'menu',
        'aria-expanded': open.value,
        'aria-controls': dropdownId,
      },
)

// Fermer le panneau racine ferme toute la pile (les sous-panneaux sont ses
// descendants DOM : cascade native du popover).
provide(dropdownKey, { closeAll: () => panelRef.value?.hide(), role: props.role })

function invoker(): HTMLElement | null {
  return document.querySelector(`[popovertarget="${dropdownId}"]`)
}

function onToggle(value: boolean) {
  shown.value = value
  open.value = value
  // En listbox le focus ne quitte jamais le champ : pas de gestion de focus ici.
  if (props.role !== 'menu') return
  if (value) {
    panelRef.value?.focusFirst()
  } else {
    // Le light dismiss laisse le focus orphelin (body) : on le rend au déclencheur.
    const active = document.activeElement
    if (!active || active === document.body || panelRef.value?.el?.contains(active)) {
      invoker()?.focus()
    }
  }
}

// Ouverture/fermeture programmatique via v-model (client uniquement).
watch(open, (value) => {
  if (value === shown.value) return
  if (value) panelRef.value?.show()
  else panelRef.value?.hide()
})

onMounted(() => {
  if (open.value) panelRef.value?.show()
})
</script>

<template>
  <slot name="trigger" :trigger-props="triggerProps" />
  <DropdownPanel
    :id="dropdownId"
    ref="panelRef"
    :placement="placement"
    :size="size"
    :compact="compact"
    :role="role"
    :multiselectable="multiselectable"
    :anchor="anchor"
    @toggle="onToggle"
  >
    <slot />
  </DropdownPanel>
</template>
