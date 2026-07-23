<script setup lang="ts">
import { onMounted, provide, ref, useId, watch } from 'vue'

import DropdownPanel from './DropdownPanel.vue'
import { dropdownKey } from './context'
import type { DropdownPlacement } from './context'

/**
 * Menu déroulant d'actions (pattern ARIA menu) : Popover API (`popovertarget` →
 * liaison déclarative, light dismiss natif ; l'invocateur est l'ancre implicite
 * du panneau, positionné en pur CSS). Le comportement clavier vit dans
 * DropdownPanel (interne, partagé avec les sous-menus). JS justifié ici : pont
 * v-model ↔ API impérative du popover, focus du premier item à l'ouverture,
 * retour du focus au déclencheur à la fermeture.
 */
interface DropdownProps {
  placement?: DropdownPlacement
  /** Hauteur minimale des items : 32px (sm) ou 40px (md) ; héritée par les sous-menus. */
  size?: 'sm' | 'md'
  /** Hauteur minimale des items réduite de 4px ; héritée par les sous-menus. */
  compact?: boolean
}

withDefaults(defineProps<DropdownProps>(), {
  placement: 'bottom-start',
  size: 'sm',
  compact: false,
})

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
  /** Les <DropdownItem> / <DropdownGroup> / <DropdownSeparator> */
  default(): unknown
}>()

const panelRef = ref<InstanceType<typeof DropdownPanel> | null>(null)
const dropdownId = useId()
const shown = ref(false)

// Fermer le panneau racine ferme toute la pile (les sous-panneaux sont ses
// descendants DOM : cascade native du popover).
provide(dropdownKey, { closeAll: () => panelRef.value?.hide() })

function invoker(): HTMLElement | null {
  return document.querySelector(`[popovertarget="${dropdownId}"]`)
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
      popovertarget: dropdownId,
      'aria-haspopup': 'menu' as const,
      'aria-expanded': open,
      'aria-controls': dropdownId,
    }"
  />
  <DropdownPanel
    :id="dropdownId"
    ref="panelRef"
    :placement="placement"
    :size="size"
    :compact="compact"
    @toggle="onToggle"
  >
    <slot />
  </DropdownPanel>
</template>
