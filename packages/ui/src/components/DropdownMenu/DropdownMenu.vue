<script setup lang="ts">
import { onMounted, provide, ref, watch } from 'vue'
import { useId } from 'vue'

import { dropdownMenuKey } from './context'

/**
 * Menu déroulant : Popover API (`popovertarget` → liaison déclarative, light
 * dismiss et Esc natifs ; l'invocateur est l'ancre implicite du panneau,
 * positionné en pur CSS). JS justifié : le pattern ARIA menu n'est pas couvert
 * par le natif — roving focus aux flèches/Home/End, focus du premier item à
 * l'ouverture, retour du focus au déclencheur à la fermeture.
 */
type Placement = 'bottom-start' | 'bottom-end' | 'bottom' | 'top-start' | 'top-end' | 'top'

interface DropdownMenuProps {
  placement?: Placement
}

withDefaults(defineProps<DropdownMenuProps>(), { placement: 'bottom-start' })

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
  /** Les <DropdownMenuItem> */
  default(): unknown
}>()

const panelEl = ref<HTMLElement | null>(null)
const menuId = useId()
const shown = ref(false)

provide(dropdownMenuKey, { close: () => panelEl.value?.hidePopover() })

function items(): HTMLElement[] {
  const panel = panelEl.value
  if (!panel) return []
  // :disabled ne matche que les <button> ; les items <a> inertes portent aria-disabled
  return [
    ...panel.querySelectorAll<HTMLElement>(
      '[role="menuitem"]:not(:disabled):not([aria-disabled="true"])',
    ),
  ]
}

function invoker(): HTMLElement | null {
  return document.querySelector(`[popovertarget="${menuId}"]`)
}

function onToggle(event: Event) {
  shown.value = (event as ToggleEvent).newState === 'open'
  open.value = shown.value
  if (shown.value) {
    items()[0]?.focus()
  } else {
    // Le light dismiss laisse le focus orphelin (body) : on le rend au déclencheur.
    const active = document.activeElement
    if (!active || active === document.body || panelEl.value?.contains(active)) {
      invoker()?.focus()
    }
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Tab') {
    // Un menu ne se traverse pas au Tab : il se ferme.
    panelEl.value?.hidePopover()
    return
  }
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const list = items()
  if (list.length === 0) return
  const current = list.indexOf(document.activeElement as HTMLElement)
  const next =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? list.length - 1
        : event.key === 'ArrowDown'
          ? (current + 1) % list.length
          : (current - 1 + list.length) % list.length
  list[next]?.focus()
}

// Ouverture/fermeture programmatique via v-model (client uniquement).
watch(open, (value) => {
  const el = panelEl.value
  if (!el || value === shown.value) return
  if (value) el.showPopover()
  else el.hidePopover()
})

onMounted(() => {
  if (open.value) panelEl.value?.showPopover()
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
  <div
    :id="menuId"
    ref="panelEl"
    popover
    role="menu"
    class="ds-menu ds-floating"
    :data-placement="placement"
    @toggle="onToggle"
    @keydown="onKeydown"
  >
    <slot />
  </div>
</template>

<style>
@layer ds.components {
  .ds-menu {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-1);
    min-width: 11rem;
    max-width: min(20rem, calc(100vw - var(--ds-space-8)));
    padding: var(--ds-space-1);
    background: var(--ds-color-surface-overlay);
    color: var(--ds-color-text);
    border: 1px solid var(--ds-color-border);
    border-radius: var(--ds-radius-overlay);
    box-shadow: var(--ds-shadow-4);
    font-family: var(--ds-font-family-sans);
  }
}
</style>
