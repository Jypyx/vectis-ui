<script setup lang="ts">
import { onBeforeUnmount, ref, useId } from 'vue'

/**
 * Tooltip sur Popover API (`popover="manual"` : pas de light dismiss, c'est
 * le composant qui pilote). JS justifié : aucune primitive HTML stable ne
 * couvre « montrer au survol/focus avec délai » (`interestfor` est encore
 * expérimental) — le JS gère le délai, pointer/focus et Échap (WCAG 1.4.13).
 *
 * Ancrage 100 % CSS sans ID unique : `anchor-name` statique sur le wrapper,
 * confiné à son sous-arbre par `anchor-scope`. Sans ce confinement, un
 * panneau affiché (top layer, donc « après » tout le document pour la
 * résolution d'ancre) se rattacherait au DERNIER wrapper nommé de la page.
 */
type Placement =
  'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right'

interface TooltipProps {
  /** Contenu texte du tooltip (le slot #content prime s'il est fourni). */
  text?: string
  placement?: Placement
  /** Délai d'ouverture au survol, en ms (le focus clavier ouvre immédiatement). */
  delay?: number
}

const props = withDefaults(defineProps<TooltipProps>(), {
  text: undefined,
  placement: 'top',
  delay: 300,
})

defineSlots<{
  /** Déclencheur : poser `v-bind="triggerProps"` (aria-describedby) sur l'élément focusable. */
  default(props: { triggerProps: { 'aria-describedby': string } }): unknown
  /**
   * Contenu riche à la place de `text`. NON interactif uniquement (mise en
   * forme, kbd, icônes) : le tooltip se ferme dès que le pointeur quitte le
   * déclencheur et `aria-describedby` aplatit le contenu en texte — un lien
   * ou bouton y serait inatteignable. Pour de l'interactif, préférer un
   * panneau flottant persistant (Dropdown).
   */
  content?(): unknown
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
      <slot name="content">{{ text }}</slot>
    </div>
  </span>
</template>

<style>
@layer ds.components {
  .ds-tooltip {
    display: inline-block;
    anchor-name: --ds-tooltip-anchor;
    /* confine le nom d'ancre à ce sous-arbre : chaque panneau (même en top
       layer) résout SON wrapper, pas le dernier wrapper nommé de la page */
    anchor-scope: --ds-tooltip-anchor;
  }

  .ds-tooltip-panel {
    position-anchor: --ds-tooltip-anchor;
    width: max-content;
    max-width: min(18rem, calc(100vw - var(--ds-space-8)));
    padding: var(--ds-space-1) var(--ds-space-2);
    /* contraste inversé : gris sombre dans les deux thèmes (plus sombre en dark) */
    background: var(--ds-color-surface-inverse);
    color: var(--ds-color-text-on-inverse);
    border: none;
    border-radius: var(--ds-radius-sm);
    box-shadow: var(--ds-shadow-2);
    font-family: var(--ds-text-family);
    font-size: var(--ds-text-caption-size);
    line-height: var(--ds-text-caption-leading);
  }
}
</style>
