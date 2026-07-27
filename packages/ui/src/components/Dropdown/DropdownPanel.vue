<script setup lang="ts">
import { computed, inject, ref } from 'vue'

import { dropdownKey } from './context'
import type { DropdownPanelPlacement } from './context'

/**
 * Panneau popover INTERNE (non exporté), partagé par Dropdown (panneau racine)
 * et DropdownItem (sous-menus). Popover API : light dismiss natif, l'invocateur
 * `popovertarget` est l'ancre implicite, positionnement pur CSS (floating.css).
 *
 * JS justifié : le pattern ARIA menu n'est pas couvert par le natif —
 * - roving focus aux flèches/Home/End, confiné au panneau courant (les keydown
 *   des sous-panneaux bubblent à travers les panneaux ancêtres : garde sur la
 *   cible de l'événement) ;
 * - Échap ferme LE NIVEAU COURANT (comme Flèche gauche en sous-menu, avec
 *   retour du focus à l'item parent) ; Tab ferme toute la pile — un menu ne
 *   se traverse pas au Tab.
 */
interface DropdownPanelProps {
  /** Id du panneau, posé par le propriétaire (cible des `popovertarget`). */
  id: string
  placement?: DropdownPanelPlacement
  /** Panneau de sous-menu : active Flèche gauche, pas de focus automatique. */
  submenu?: boolean
  /**
   * Posé UNIQUEMENT par la racine (pas de défaut : les sous-panneaux ne
   * rendent pas data-size) : les sous-panneaux héritent via CSS.
   */
  size?: 'sm' | 'md'
  /** Posé UNIQUEMENT par la racine : les sous-panneaux héritent via CSS. */
  compact?: boolean
  /** `menu` (défaut) ou `listbox` (mode combobox : pas de roving focus, popover manual). */
  role?: 'menu' | 'listbox'
  /** listbox : aria-multiselectable. */
  multiselectable?: boolean
  /** listbox : ancre statique (dashed-ident) → position-anchor + anchor-size. */
  anchor?: string
  /**
   * Largeur du panneau (toute longueur/mot-clé CSS, ex. `max-content`).
   * Posée UNIQUEMENT par la racine : les sous-panneaux ne rendent pas
   * data-width et gardent la largeur par défaut.
   */
  width?: string
}

const props = withDefaults(defineProps<DropdownPanelProps>(), {
  placement: 'bottom-start',
  submenu: false,
  size: undefined,
  compact: false,
  role: 'menu',
  multiselectable: false,
  anchor: undefined,
  width: undefined,
})

const emit = defineEmits<{
  /** État d'ouverture du popover (relayé au propriétaire). */
  toggle: [open: boolean]
}>()

defineSlots<{
  /** Les DropdownItem / DropdownGroup / DropdownSeparator. */
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

const dropdown = inject(dropdownKey, null)

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

// L'option `source` de showPopover() n'est pas encore dans lib.dom (TS 5.9).
type PopoverWithSource = HTMLElement & { showPopover(options?: { source?: HTMLElement }): void }

function show(source?: HTMLElement) {
  // `source` rétablit la relation d'invocateur lors des ouvertures
  // PROGRAMMATIQUES (survol, clavier) : sans elle, pas d'ancre implicite ni
  // de rattachement à la pile — le panneau perdrait son positionnement.
  // L'invocation par clic (popovertarget) pose cette relation nativement.
  if (!shown.value)
    (panelEl.value as PopoverWithSource | null)?.showPopover(source ? { source } : undefined)
}

function hide() {
  if (shown.value) panelEl.value?.hidePopover()
}

function closeAll() {
  if (dropdown) dropdown.closeAll()
  else hide()
}

function focusFirst() {
  items()[0]?.focus()
}

// listbox : le clavier est piloté par le champ externe (le focus n'est jamais
// dans le panneau) — on évite que le clic sur une option sorte le focus du champ.
function onMousedown(event: MouseEvent) {
  if (props.role === 'listbox') event.preventDefault()
}

function onKeydown(event: KeyboardEvent) {
  if (props.role === 'listbox') return
  const panel = panelEl.value
  // seul le panneau qui contient DIRECTEMENT la cible traite l'événement
  if (!panel || (event.target as Element).closest('[role="menu"]') !== panel) return

  if (event.key === 'Tab') {
    closeAll()
    return
  }
  if (event.key === 'Escape' || (props.submenu && event.key === 'ArrowLeft')) {
    // Échap ne ferme QUE ce niveau. preventDefault : le close request natif
    // fermerait le popover sans rendre le focus à l'item parent (et notre
    // hide() l'aurait déjà fermé). Racine : le retour de focus au déclencheur
    // est géré par le onToggle de Dropdown.
    event.preventDefault()
    hide()
    if (props.submenu) invoker()?.focus()
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

// Style inline : ancre statique (listbox) et/ou largeur explicite (prop width).
const panelStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.anchor) style['--_anchor'] = props.anchor
  if (props.width) style['--_dropdown-width'] = props.width
  return Object.keys(style).length > 0 ? style : undefined
})

defineExpose({ show, hide, focusFirst, el: panelEl })
</script>

<template>
  <div
    :id="id"
    ref="panelEl"
    :popover="role === 'listbox' ? 'manual' : 'auto'"
    :role="role"
    class="ds-dropdown ds-floating"
    :data-placement="placement"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-role="role === 'listbox' ? 'listbox' : undefined"
    :data-anchored="anchor ? '' : undefined"
    :data-width="width ? '' : undefined"
    :style="panelStyle"
    :aria-multiselectable="role === 'listbox' && multiselectable ? 'true' : undefined"
    @beforetoggle="syncShown"
    @toggle="onToggle"
    @keydown="onKeydown"
    @mousedown="onMousedown"
  >
    <slot />
  </div>
</template>

<style src="./DropdownPanel.tokens.css"></style>
<style>
@layer ds.components {
  .ds-dropdown {
    /* API de contexte d'Icon : icônes d'items 20px/opsz 20 pour les deux
       tailles (sm et md) — constante, donc déclarable sur .ds-dropdown nu sans
       piège d'héritage */
    --ds-icon-size: var(--ds-icon-size-md);
    --ds-icon-opsz: 20;
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-1);
    min-inline-size: var(--ds-control-size-dropdown-min);
    max-inline-size: min(var(--ds-control-size-dropdown-max), calc(100vw - var(--ds-space-8)));
    padding: var(--ds-space-1);
    background: var(--ds-color-surface-overlay);
    color: var(--ds-color-text);
    border: 1px solid var(--ds-color-border);
    border-radius: var(--ds-radius-surface);
    box-shadow: var(--ds-shadow-4);
    font-family: var(--ds-font-family-sans);
  }

  /* (taille/densité des items : DropdownPanel.tokens.css) */

  /* aligne le 1er sous-item sur l'item parent (compense padding + bordure) */
  .ds-dropdown .ds-dropdown[data-placement='right-start'] {
    margin-block-start: calc(-1 * (var(--ds-space-1) + 1px));
  }

  /* Mode listbox (Combobox) : largeur calée sur le contrôle ancré, liste
     défilante ; ancrage statique via la prop `anchor` du consommateur. */
  .ds-dropdown[data-role='listbox'] {
    min-inline-size: anchor-size(width);
    max-inline-size: none;
    max-height: var(--ds-control-size-listbox-max-block);
    overflow: auto;
  }

  /* Largeur explicite (prop width) : rendue par le panneau RACINE seulement —
     les sous-panneaux ne posent pas data-width, la variable héritée est donc
     inerte chez eux. Le plafond viewport de max-inline-size reste. */
  .ds-dropdown[data-width] {
    min-inline-size: 0;
    inline-size: var(--_dropdown-width);
  }

  .ds-dropdown[data-anchored] {
    position-anchor: var(--_anchor);
  }
}
</style>
