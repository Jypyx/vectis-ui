<script setup lang="ts">
import { computed, onMounted, provide, ref, useId, watch } from 'vue'

import VMenuPanel from './VMenuPanel.vue'
import { menuInvoker, menuKey } from './context'
import type { MenuPlacement } from './context'

/**
 * An action menu (the ARIA menu pattern): Popover API (native light dismiss; pure
 * CSS positioning). The trigger invokes the panel through `popovertarget` (the
 * implicit anchor), focus goes to the first item on opening, and the keyboard
 * (roving focus) lives in VMenuPanel.
 *
 * JS justified here: the v-model ↔ imperative popover API bridge, focusing the
 * first item, and returning focus to the trigger on closing.
 */
interface MenuProps {
  placement?: MenuPlacement
  /** Minimum height of the items: 32px (sm), 40px (md) or 48px (lg); inherited by the submenus. */
  size?: 'sm' | 'md' | 'lg'
  /** Minimum height of the items reduced by 4px; inherited by the submenus. */
  compact?: boolean
  /**
   * Width of the root panel (any CSS length/keyword, e.g. `max-content`, `16rem`).
   * The submenus keep the default width.
   */
  width?: string
  /**
   * The root panel cannot be narrower than its trigger (it stays free to widen for
   * its content). Submenus are unaffected.
   */
  matchTrigger?: boolean
}

// Not assigned: the template reads the props directly.
withDefaults(defineProps<MenuProps>(), {
  placement: 'bottom-start',
  size: 'sm',
  compact: false,
  width: undefined,
  matchTrigger: false,
})

const open = defineModel<boolean>('open', { default: false })

/** ARIA props to set on the trigger. */
type MenuTriggerProps = {
  popovertarget: string
  'aria-haspopup': 'menu'
  'aria-expanded': boolean
  'aria-controls': string
}

defineSlots<{
  /** Trigger: set `v-bind="triggerProps"` on a <VButton>/<button>. */
  trigger(props: { triggerProps: MenuTriggerProps }): unknown
  /** The <VMenuItem> / <VMenuGroup> / <VMenuSeparator> elements. */
  default(): unknown
}>()

const panelRef = ref<InstanceType<typeof VMenuPanel> | null>(null)
const menuId = useId()
const shown = ref(false)

const triggerProps = computed<MenuTriggerProps>(() => ({
  popovertarget: menuId,
  'aria-haspopup': 'menu',
  'aria-expanded': open.value,
  'aria-controls': menuId,
}))

// Closing the root panel closes the whole stack (the subpanels are its DOM
// descendants: the popover's native cascade).
provide(menuKey, { closeAll: () => panelRef.value?.hide() })

function onToggle(value: boolean) {
  shown.value = value
  open.value = value
  if (value) {
    panelRef.value?.focusFirst()
  } else {
    // Light dismiss leaves the focus orphaned (on body): hand it back to the trigger.
    const active = document.activeElement
    if (!active || active === document.body || panelRef.value?.el?.contains(active)) {
      menuInvoker(menuId)?.focus()
    }
  }
}

// Programmatic opening/closing through v-model (client only).
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
  <VMenuPanel
    :id="menuId"
    ref="panelRef"
    :placement="placement"
    :size="size"
    :compact="compact"
    :width="width"
    :match-trigger="matchTrigger"
    @toggle="onToggle"
  >
    <slot />
  </VMenuPanel>
</template>
