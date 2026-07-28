<script setup lang="ts">
import { computed, inject, ref } from 'vue'

import { usePopover } from '../../composables/usePopover'
import { menuInvoker, menuKey } from './context'
import type { MenuPanelPlacement } from './context'
import { arrowNavigate } from '../../utils/arrowNav'

/**
 * Panneau popover INTERNE (non exporté), partagé par Menu (panneau racine)
 * et MenuItem (sous-menus). Popover API : light dismiss natif, l'invocateur
 * `popovertarget` est l'ancre implicite, positionnement pur CSS (floating.css),
 * chrome commun via `.ds-panel` (panel.css).
 *
 * JS justifié : le pattern ARIA menu n'est pas couvert par le natif —
 * - roving focus aux flèches/Home/End, confiné au panneau courant (les keydown
 *   des sous-panneaux bubblent à travers les panneaux ancêtres : garde sur la
 *   cible de l'événement) ;
 * - Échap ferme LE NIVEAU COURANT (comme Flèche gauche en sous-menu, avec
 *   retour du focus à l'item parent) ; Tab ferme toute la pile — un menu ne
 *   se traverse pas au Tab.
 */
interface MenuPanelProps {
  /** Id du panneau, posé par le propriétaire (cible des `popovertarget`). */
  id: string
  placement?: MenuPanelPlacement
  /** Panneau de sous-menu : active Flèche gauche, pas de focus automatique. */
  submenu?: boolean
  /**
   * Posé UNIQUEMENT par la racine (pas de défaut : les sous-panneaux ne
   * rendent pas data-size) : les sous-panneaux héritent via CSS.
   */
  size?: 'sm' | 'md' | 'lg'
  /** Posé UNIQUEMENT par la racine : les sous-panneaux héritent via CSS. */
  compact?: boolean
  /**
   * Largeur du panneau (toute longueur/mot-clé CSS, ex. `max-content`).
   * Posée UNIQUEMENT par la racine : les sous-panneaux ne rendent pas
   * data-width et gardent la largeur par défaut.
   */
  width?: string
}

const props = withDefaults(defineProps<MenuPanelProps>(), {
  placement: 'bottom-start',
  submenu: false,
  size: undefined,
  compact: false,
  width: undefined,
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
// État d'ouverture, gardes d'idempotence et option `source` : cf. usePopover.
const { shown, syncShown, show, hide } = usePopover(panelEl)

const menu = inject(menuKey, null)

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
  if (event.key === 'Escape' || (props.submenu && event.key === 'ArrowLeft')) {
    // Échap ne ferme QUE ce niveau. preventDefault : le close request natif
    // fermerait le popover sans rendre le focus à l'item parent (et notre
    // hide() l'aurait déjà fermé). Racine : le retour de focus au déclencheur
    // est géré par le onToggle de Menu.
    event.preventDefault()
    hide()
    if (props.submenu) menuInvoker(props.id)?.focus()
    return
  }
  // Roving vertical partagé (`utils/arrowNav`) mais sur NOTRE liste : elle
  // exclut aussi les items aria-disabled et confine le roving au panneau
  // courant, deux choses que le sélecteur générique ne fait pas.
  arrowNavigate(event, panel, items(), { vertical: true })
}

// Style inline : largeur explicite (prop width) uniquement.
const panelStyle = computed(() => (props.width ? { '--_menu-width': props.width } : undefined))

defineExpose({ show, hide, focusFirst, el: panelEl })
</script>

<template>
  <div
    :id="id"
    ref="panelEl"
    popover="auto"
    role="menu"
    class="ds-overlay ds-panel ds-menu ds-floating"
    :class="{
      /*
       * `ds-control` sur la RACINE seulement : elle pose les `--_control-*`
       * (hauteur, paddings, gap, typo, contexte Icon) depuis
       * styles/control-size.css, et les sous-panneaux — descendants DOM —
       * en héritent. La poser aussi sur eux les casserait : `.ds-control`
       * redéfinit `--_control-height` depuis `--_control-height-base` SANS
       * la condition `[data-compact]` (absente des sous-panneaux), qui y
       * reviendrait donc à sa valeur non compacte.
       */
      'ds-control': !submenu,
    }"
    :data-placement="placement"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-width="width ? '' : undefined"
    :style="panelStyle"
    @beforetoggle="syncShown"
    @toggle="onToggle"
    @keydown="onKeydown"
  >
    <slot />
  </div>
</template>

<style>
@layer ds.components {
  /* Chrome (surface, bordure, ombre, rythme interne) : classe partagée
     `.ds-panel` (styles/panel.css). Tailles : classe partagée `ds-control`
     posée ci-dessus sur le panneau RACINE (voir le template) — aucune table
     locale, les items consomment les `--_control-*` hérités. Ne restent ici
     que les règles propres au menu déroulant. */
  .ds-menu {
    min-inline-size: var(--ds-control-size-menu-min);
    max-inline-size: min(var(--ds-control-size-menu-max), calc(100vw - var(--ds-space-8)));
  }

  /* aligne le 1er sous-item sur l'item parent (compense padding + bordure) */
  .ds-menu .ds-menu[data-placement='right-start'] {
    margin-block-start: calc(-1 * (var(--ds-space-1) + 1px));
  }

  /* Largeur explicite (prop width) : rendue par le panneau RACINE seulement —
     les sous-panneaux ne posent pas data-width, la variable héritée est donc
     inerte chez eux. Le plafond viewport de max-inline-size reste. */
  .ds-menu[data-width] {
    min-inline-size: 0;
    inline-size: var(--_menu-width);
  }
}
</style>
