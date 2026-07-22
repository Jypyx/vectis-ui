<script setup lang="ts">
import { onMounted, provide, ref, useId, watch } from 'vue'

import MenuPanel from './MenuPanel.vue'
import { menuKey } from './context'
import type { MenuPlacement } from './context'

/**
 * Menu d'actions (pattern ARIA menu) : Popover API (`popovertarget` → liaison
 * déclarative, light dismiss natif ; l'invocateur est l'ancre implicite du
 * panneau, positionné en pur CSS). Le comportement clavier vit dans MenuPanel
 * (interne, partagé avec les sous-menus). JS justifié ici : pont v-model ↔ API
 * impérative du popover, focus du premier item à l'ouverture, retour du focus
 * au déclencheur à la fermeture.
 */
interface MenuProps {
  placement?: MenuPlacement
  /** Items à 32px de hauteur minimale (36px sinon) ; hérité par les sous-menus. */
  compact?: boolean
}

withDefaults(defineProps<MenuProps>(), { placement: 'bottom-start', compact: false })

const open = defineModel<boolean>('open', { default: false })

defineSlots<{
  /** Déclencheur : poser `v-bind="triggerProps"` sur un <Button> / <button>. */
  trigger(props: {
    triggerProps: {
      popovertarget: string
      'aria-haspopup': 'menu'
      'aria-expanded': boolean
      'aria-controls': string
    }
  }): unknown
  /** Les <MenuItem> / <MenuGroup> / <MenuSeparator> */
  default(): unknown
}>()

const panelRef = ref<InstanceType<typeof MenuPanel> | null>(null)
const menuId = useId()
const shown = ref(false)

// Fermer le panneau racine ferme toute la pile (les sous-panneaux sont ses
// descendants DOM : cascade native du popover).
provide(menuKey, { closeAll: () => panelRef.value?.hide() })

function invoker(): HTMLElement | null {
  return document.querySelector(`[popovertarget="${menuId}"]`)
}

function onToggle(value: boolean) {
  shown.value = value
  open.value = value
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
  <slot
    name="trigger"
    :trigger-props="{
      popovertarget: menuId,
      'aria-haspopup': 'menu' as const,
      'aria-expanded': open,
      'aria-controls': menuId,
    }"
  />
  <MenuPanel
    :id="menuId"
    ref="panelRef"
    :placement="placement"
    :compact="compact"
    @toggle="onToggle"
  >
    <slot />
  </MenuPanel>
</template>
