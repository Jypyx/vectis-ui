<script setup lang="ts">
import { onBeforeUnmount, ref, useId } from 'vue'

/**
 * Tooltip sur Popover API (`popover="manual"` : pas de light dismiss, c'est
 * le composant qui pilote). JS justifié : aucune primitive HTML stable ne
 * couvre « montrer au survol/focus avec délai » (`interestfor` est encore
 * expérimental) — le JS gère le délai, pointer/focus et Échap (WCAG 1.4.13).
 *
 * Ancrage 100 % CSS sans ID unique : `anchor-name` statique sur le wrapper ;
 * chaque panneau résout son ancre vers l'élément nommé le plus proche qui le
 * précède dans l'arbre — c'est-à-dire son propre wrapper.
 */
type Placement =
  'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right'

interface TooltipProps {
  /** Contenu du tooltip — texte simple volontairement (role="tooltip"). */
  text: string
  placement?: Placement
  /** Délai d'ouverture au survol, en ms (le focus clavier ouvre immédiatement). */
  delay?: number
}

const props = withDefaults(defineProps<TooltipProps>(), {
  placement: 'top',
  delay: 300,
})

defineSlots<{
  /** Déclencheur : poser `v-bind="triggerProps"` (aria-describedby) sur l'élément focusable. */
  default(props: { triggerProps: { 'aria-describedby': string } }): unknown
}>()

const panelEl = ref<HTMLElement | null>(null)
const tooltipId = useId()
const shown = ref(false)

let timer: ReturnType<typeof setTimeout> | undefined

function show(immediate = false) {
  clearTimeout(timer)
  const doShow = () => {
    if (!shown.value) {
      panelEl.value?.showPopover()
      shown.value = true
    }
  }
  if (immediate) doShow()
  else timer = setTimeout(doShow, props.delay)
}

function hide() {
  clearTimeout(timer)
  if (shown.value) {
    panelEl.value?.hidePopover()
    shown.value = false
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') hide()
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <span
    class="ds-tooltip"
    @pointerenter="show()"
    @pointerleave="hide"
    @focusin="show(true)"
    @focusout="hide"
    @keydown="onKeydown"
  >
    <slot :trigger-props="{ 'aria-describedby': tooltipId }" />
    <div
      :id="tooltipId"
      ref="panelEl"
      popover="manual"
      role="tooltip"
      class="ds-tooltip-panel ds-floating"
      :data-placement="placement"
    >
      {{ text }}
    </div>
  </span>
</template>

<style>
@layer ds.components {
  .ds-tooltip {
    display: inline-block;
    anchor-name: --ds-tooltip-anchor;
  }

  .ds-tooltip-panel {
    position-anchor: --ds-tooltip-anchor;
    width: max-content;
    max-width: min(18rem, calc(100vw - var(--ds-space-8)));
    padding: var(--ds-space-1) var(--ds-space-2);
    /* couleurs inversées : lisible sur les deux thèmes via les tokens sémantiques */
    background: var(--ds-color-text);
    color: var(--ds-color-surface);
    border: none;
    border-radius: var(--ds-radius-sm);
    box-shadow: var(--ds-shadow-2);
    font-family: var(--ds-font-family-sans);
    font-size: var(--ds-font-size-xs);
    line-height: var(--ds-font-leading-snug);
  }
}
</style>
