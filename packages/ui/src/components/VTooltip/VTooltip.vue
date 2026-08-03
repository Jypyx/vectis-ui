<script setup lang="ts">
import { ref, useId } from 'vue'

import Popover from '../VPopover/VPopover.vue'

import { useTimer } from '../../composables/useTimer'

/**
 * Tooltip sur `Popover` (`mode="manual"` : pas de light dismiss, c'est le
 * composant qui pilote). JS justifié : aucune primitive HTML stable ne
 * couvre « montrer au survol/focus avec délai » (`interestfor` est encore
 * expérimental) — le JS gère le délai, pointer/focus et Échap (WCAG 1.4.13).
 *
 * Ancrage 100 % CSS sans ID unique : `anchor-name` statique sur le wrapper,
 * confiné à son sous-arbre par `anchor-scope`. Sans ce confinement, un
 * panneau affiché (top layer, donc « après » tout le document pour la
 * résolution d'ancre) se rattacherait au DERNIER wrapper nommé de la page.
 * Le wrapper reste ici (il porte les gestionnaires pointer/focus) : le
 * `#trigger` de Popover n'est pas utilisé, un déclencheur d'infobulle n'étant
 * pas un invocateur `popovertarget` — il serait basculé au clic — mais un
 * élément DÉCRIT par le panneau.
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
   * panneau flottant persistant (Menu).
   */
  content?(): unknown
}>()

const tooltipId = useId()
/*
 * Popover est piloté impérativement (et non par `v-model:open`) : le focus
 * clavier doit ouvrir SYNCHRONEMENT — un modèle passerait par le watch de
 * Popover, donc par un tick. Le tooltip ne publie aucun état d'ouverture, il
 * n'a rien à faire d'un modèle. Les gardes d'idempotence sont dans usePopover,
 * en amont.
 */
const popoverRef = ref<InstanceType<typeof Popover> | null>(null)

// Délai d'apparition (cf. useTimer : réarmement et annulation au démontage).
const timer = useTimer()

function show(immediate = false) {
  // délai 0 = exécution synchrone (convention useTimer)
  timer.start(() => popoverRef.value?.show(), immediate ? 0 : props.delay)
}

function hide() {
  timer.cancel()
  popoverRef.value?.hide()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') hide()
}
</script>

<template>
  <span
    class="v-tooltip"
    @pointerenter="show()"
    @pointerleave="hide"
    @focusin="show(true)"
    @focusout="hide"
    @keydown="onKeydown"
  >
    <slot :trigger-props="{ 'aria-describedby': tooltipId }" />
    <Popover
      :id="tooltipId"
      ref="popoverRef"
      mode="manual"
      anchor="--tooltip-anchor"
      :placement="placement"
      :surface="false"
      role="tooltip"
      class="v-tooltip-panel"
    >
      <slot name="content">{{ text }}</slot>
    </Popover>
  </span>
</template>

<style>
@layer vectis.components {
  .v-tooltip {
    display: inline-block;
    anchor-name: --tooltip-anchor;
    /* confine le nom d'ancre à ce sous-arbre : chaque panneau (même en top
       layer) résout SON wrapper, pas le dernier wrapper nommé de la page */
    anchor-scope: --tooltip-anchor;
  }

  /* `position-anchor` vient de Popover (prop `anchor`) */
  .v-tooltip-panel {
    width: max-content;
    max-width: min(18rem, calc(100vw - var(--vectis-space-8)));
    padding: var(--vectis-space-1) var(--vectis-space-2);
    /* contraste inversé : gris sombre dans les deux thèmes (plus sombre en dark) */
    background: var(--vectis-color-surface-inverse);
    color: var(--vectis-color-text-on-inverse);
    border: none;
    border-radius: var(--vectis-radius-sm);
    box-shadow: var(--vectis-shadow-2);
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-caption-size);
    line-height: var(--vectis-text-caption-leading);
  }
}
</style>
