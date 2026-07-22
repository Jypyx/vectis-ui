<script setup lang="ts">
import { inject, ref } from 'vue'

import { menuKey } from './context'
import type { MenuPanelPlacement } from './context'

/**
 * Panneau popover INTERNE (non exporté), partagé par Menu (panneau racine) et
 * MenuItem (sous-menus). Popover API : light dismiss natif, l'invocateur
 * `popovertarget` est l'ancre implicite, positionnement pur CSS (floating.css).
 *
 * JS justifié : le pattern ARIA menu n'est pas couvert par le natif —
 * - roving focus aux flèches/Home/End, confiné au panneau courant (les keydown
 *   des sous-panneaux bubblent à travers les panneaux ancêtres : garde sur la
 *   cible de l'événement) ;
 * - Échap ferme TOUTE la pile (le natif ne fermerait que le popover le plus
 *   haut) ; Tab aussi — un menu ne se traverse pas au Tab ;
 * - Flèche gauche (sous-menu) referme et rend le focus à l'item parent.
 */
interface MenuPanelProps {
  /** Id du panneau, posé par le propriétaire (cible des `popovertarget`). */
  id: string
  placement?: MenuPanelPlacement
  /** Panneau de sous-menu : active Flèche gauche, pas de focus automatique. */
  submenu?: boolean
  /** Posé UNIQUEMENT par la racine : les sous-panneaux héritent via CSS. */
  compact?: boolean
}

const props = withDefaults(defineProps<MenuPanelProps>(), {
  placement: 'bottom-start',
  submenu: false,
  compact: false,
})

const emit = defineEmits<{
  /** État d'ouverture du popover (relayé au propriétaire). */
  toggle: [open: boolean]
}>()

defineSlots<{
  /** Les MenuItem / MenuGroup / MenuSeparator. */
  default(): unknown
}>()

const panelEl = ref<HTMLElement | null>(null)
/*
 * Suivi synchrone de l'état d'ouverture : `beforetoggle` est émis pendant
 * show/hidePopover() (et lors du light dismiss), ce qui rend show()/hide()
 * idempotents — hidePopover() sur un popover déjà fermé lève InvalidStateError.
 * `toggle` (asynchrone en navigateur, seul émis par le stub jsdom) confirme.
 */
const shown = ref(false)

const menu = inject(menuKey, null)

function syncShown(event: Event) {
  shown.value = (event as ToggleEvent).newState === 'open'
}

function onToggle(event: Event) {
  syncShown(event)
  emit('toggle', shown.value)
}

function items(): HTMLElement[] {
  const panel = panelEl.value
  if (!panel) return []
  // :disabled ne matche que les <button> ; les items <a> inertes portent
  // aria-disabled. Le filtre confine le roving au panneau courant (les items
  // des sous-panneaux ouverts sont aussi des descendants DOM).
  return [
    ...panel.querySelectorAll<HTMLElement>(
      '[role="menuitem"]:not(:disabled):not([aria-disabled="true"])',
    ),
  ].filter((el) => el.closest('[role="menu"]') === panel)
}

function invoker(): HTMLElement | null {
  return document.querySelector(`[popovertarget="${props.id}"]`)
}

function show() {
  if (!shown.value) panelEl.value?.showPopover()
}

function hide() {
  if (shown.value) panelEl.value?.hidePopover()
}

function closeAll() {
  if (menu) menu.closeAll()
  else hide()
}

function focusFirst() {
  items()[0]?.focus()
}

function onKeydown(event: KeyboardEvent) {
  const panel = panelEl.value
  // seul le panneau qui contient DIRECTEMENT la cible traite l'événement
  if (!panel || (event.target as Element).closest('[role="menu"]') !== panel) return

  if (event.key === 'Tab') {
    closeAll()
    return
  }
  if (event.key === 'Escape') {
    // sans interception, l'Échap natif ne fermerait que ce panneau
    event.preventDefault()
    closeAll()
    return
  }
  if (props.submenu && event.key === 'ArrowLeft') {
    event.preventDefault()
    hide()
    invoker()?.focus()
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

defineExpose({ show, hide, focusFirst, el: panelEl })
</script>

<template>
  <div
    :id="id"
    ref="panelEl"
    popover
    role="menu"
    class="ds-menu ds-floating"
    :data-placement="placement"
    :data-compact="compact ? '' : undefined"
    @beforetoggle="syncShown"
    @toggle="onToggle"
    @keydown="onKeydown"
  >
    <slot />
  </div>
</template>

<style>
@layer ds.components {
  .ds-menu {
    /* API de contexte d'Icon : icônes d'items à la densité sm */
    --ds-icon-size: var(--ds-icon-size-sm);
    --ds-icon-opsz: 20;
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-1);
    min-width: 11rem;
    max-width: min(20rem, calc(100vw - var(--ds-space-8)));
    padding: var(--ds-space-1);
    background: var(--ds-color-surface-overlay);
    color: var(--ds-color-text);
    border: 1px solid var(--ds-color-border);
    border-radius: var(--ds-radius-surface);
    box-shadow: var(--ds-shadow-4);
    font-family: var(--ds-font-family-sans);
  }

  /*
   * Hauteur d'item compacte : la variable est posée sur le panneau RACINE
   * seulement (data-compact) et héritée par les sous-panneaux, descendants
   * DOM — ne jamais la déclarer sur .ds-menu nu, chaque panneau imbriqué la
   * réinitialiserait.
   */
  .ds-menu[data-compact] {
    --_menu-item-min-h: var(--ds-control-size-menu-item-compact);
  }

  /* aligne le 1er sous-item sur l'item parent (compense padding + bordure) */
  .ds-menu .ds-menu[data-placement='right-start'] {
    margin-block-start: calc(-1 * (var(--ds-space-1) + 1px));
  }
}
</style>
