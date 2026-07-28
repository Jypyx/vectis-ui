<script setup lang="ts">
import { computed, onMounted, provide, ref, useId, watch } from 'vue'

import MenuPanel from './MenuPanel.vue'
import { menuInvoker, menuKey } from './context'
import type { MenuPlacement } from './context'

/**
 * Menu d'actions (pattern ARIA menu) : Popover API (light dismiss natif ;
 * positionnement pur CSS). Le déclencheur invoque le panneau par
 * `popovertarget` (ancre implicite), le focus va au 1er item à l'ouverture,
 * le clavier (roving focus) vit dans MenuPanel.
 *
 * JS justifié ici : pont v-model ↔ API impérative du popover, focus du 1er item
 * et retour du focus au déclencheur à la fermeture.
 */
interface MenuProps {
  placement?: MenuPlacement
  /** Hauteur minimale des items : 32px (sm), 40px (md) ou 48px (lg) ; héritée par les sous-menus. */
  size?: 'sm' | 'md' | 'lg'
  /** Hauteur minimale des items réduite de 4px ; héritée par les sous-menus. */
  compact?: boolean
  /**
   * Largeur du panneau racine (toute longueur/mot-clé CSS, ex. `max-content`,
   * `16rem`). Les sous-menus gardent la largeur par défaut.
   */
  width?: string
}

// Non assigné : le template lit les props directement (aucun accès en script
// depuis la disparition du mode listbox).
withDefaults(defineProps<MenuProps>(), {
  placement: 'bottom-start',
  size: 'sm',
  compact: false,
  width: undefined,
})

const open = defineModel<boolean>('open', { default: false })

/** Props ARIA à poser sur le déclencheur. */
type MenuTriggerProps = {
  popovertarget: string
  'aria-haspopup': 'menu'
  'aria-expanded': boolean
  'aria-controls': string
}

defineSlots<{
  /** Déclencheur : poser `v-bind="triggerProps"` sur un <Button>/<button>. */
  trigger(props: { triggerProps: MenuTriggerProps }): unknown
  /** Les <MenuItem> / <MenuGroup> / <MenuSeparator> */
  default(): unknown
}>()

const panelRef = ref<InstanceType<typeof MenuPanel> | null>(null)
const menuId = useId()
const shown = ref(false)

const triggerProps = computed<MenuTriggerProps>(() => ({
  popovertarget: menuId,
  'aria-haspopup': 'menu',
  'aria-expanded': open.value,
  'aria-controls': menuId,
}))

// Fermer le panneau racine ferme toute la pile (les sous-panneaux sont ses
// descendants DOM : cascade native du popover).
provide(menuKey, { closeAll: () => panelRef.value?.hide() })

function onToggle(value: boolean) {
  shown.value = value
  open.value = value
  if (value) {
    panelRef.value?.focusFirst()
  } else {
    // Le light dismiss laisse le focus orphelin (body) : on le rend au déclencheur.
    const active = document.activeElement
    if (!active || active === document.body || panelRef.value?.el?.contains(active)) {
      menuInvoker(menuId)?.focus()
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
  <MenuPanel
    :id="menuId"
    ref="panelRef"
    :placement="placement"
    :size="size"
    :compact="compact"
    :width="width"
    @toggle="onToggle"
  >
    <slot />
  </MenuPanel>
</template>
