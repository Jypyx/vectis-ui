<script setup lang="ts">
import { computed, onMounted, ref, useId, watch } from 'vue'

import { usePopover } from '../../composables/usePopover'

/**
 * Panneau flottant générique : Popover API native + ancrage 100 % CSS
 * (`position-anchor`), sans dépendance ni positionnement JS.
 *
 * Ce composant porte UNIQUEMENT la plomberie commune à tous les panneaux du
 * DS : l'élément `[popover]` et son mode, le pont d'état DOM ↔ `v-model:open`
 * (cf. `usePopover`), l'ancrage et le placement (`.ds-overlay`/`.ds-floating`),
 * et l'habillage optionnel (`.ds-panel`). Il ne porte NI rôle ARIA, NI clavier,
 * NI gestion de focus, NI politique de fermeture : c'est ce qui distingue
 * chaque panneau, et ce qui reste chez ses consommateurs (Tooltip, Listbox,
 * DatePicker, TimePicker). Un panneau paramétré par `role` reste proscrit.
 *
 * Deux modes d'ancrage, exclusifs :
 * - slot `#trigger` → le wrapper `.ds-popover` porte l'`anchor-name`, confiné
 *   par `anchor-scope` (nom statique partagé : chaque panneau résout SON
 *   wrapper, pas le dernier nommé de la page — cf. Tooltip) ;
 * - prop `anchor` → le consommateur possède déjà racine et contrôle, il pose
 *   lui-même `anchor-scope`/`anchor-name` et ne fournit que le nom. Le wrapper
 *   passe alors en `display: contents` : aucun nœud de layout ajouté.
 *
 * JS justifié : pont v-model ↔ API impérative du popover, rien d'autre.
 */
export type PopoverPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'

/** Props à poser sur le déclencheur (pattern disclosure). */
export type PopoverTriggerProps = {
  popovertarget: string
  'aria-expanded': boolean
  'aria-controls': string
}

interface PopoverProps {
  /** Id du panneau (cible de `popovertarget`/`aria-controls`). Défaut : généré. */
  id?: string
  placement?: PopoverPlacement
  /**
   * `auto` : light dismiss natif (clic dehors, Échap) et pile de popovers.
   * `manual` : rien n'est automatique, le consommateur ferme lui-même.
   */
  mode?: 'auto' | 'manual'
  /**
   * Ancre statique (dashed-ident, ex. `--tooltip-anchor`) posée par le
   * consommateur sur son contrôle. Prime sur le wrapper interne.
   */
  anchor?: string
  /** Habillage de surface (`.ds-panel` : fond, bordure, ombre, rayon). */
  surface?: boolean
}

const props = withDefaults(defineProps<PopoverProps>(), {
  id: undefined,
  placement: 'bottom-start',
  mode: 'auto',
  anchor: undefined,
  surface: true,
})

const open = defineModel<boolean>('open', { default: false })

const slots = defineSlots<{
  /** Déclencheur : poser `v-bind="triggerProps"` sur un <Button>/<button>. */
  trigger?(props: { triggerProps: PopoverTriggerProps }): unknown
  /** Contenu du panneau. */
  default(): unknown
}>()

/*
 * Les attributs du consommateur (rôle ARIA, aria-*, data-*, class, style,
 * listeners) vont sur le PANNEAU, pas sur le wrapper d'ancrage : c'est le
 * panneau qui est le sujet visuel et sémantique. Variante assumée du pattern
 * wrapper-root du DS, qui garde class/style sur la racine — `useRootAttrs` ne
 * s'applique donc pas ici.
 */
defineOptions({ inheritAttrs: false })

const panelEl = ref<HTMLElement | null>(null)
const generatedId = useId()
const panelId = computed(() => props.id ?? generatedId)

// État d'ouverture et gardes d'idempotence : cf. usePopover. `shown` est
// alimentée par les événements du panneau, jamais posée à la main.
const { shown, syncShown, show, hide } = usePopover(panelEl)

const hasTrigger = computed(() => slots.trigger !== undefined)

const triggerProps = computed<PopoverTriggerProps>(() => ({
  popovertarget: panelId.value,
  'aria-expanded': open.value,
  'aria-controls': panelId.value,
}))

// Une seule déclaration CSS couvre les deux modes : `position-anchor` retombe
// sur le nom du wrapper quand la variable n'est pas posée.
const panelStyle = computed(() => (props.anchor ? { '--anchor-name': props.anchor } : undefined))

function onToggle(event: Event) {
  syncShown(event)
  open.value = shown.value
}

// Ouverture/fermeture programmatique via v-model (client uniquement).
watch(open, (value) => {
  if (value === shown.value) return
  if (value) show()
  else hide()
})

onMounted(() => {
  if (open.value) show()
})

defineExpose({ show, hide, el: panelEl })
</script>

<template>
  <span class="ds-popover" :data-trigger="hasTrigger ? '' : undefined">
    <slot name="trigger" :trigger-props="triggerProps" />
    <div
      :id="panelId"
      ref="panelEl"
      :popover="mode"
      class="ds-overlay ds-popover-panel ds-floating"
      :class="{ 'ds-panel': surface }"
      :data-placement="placement"
      :style="panelStyle"
      v-bind="$attrs"
      @beforetoggle="syncShown"
      @toggle="onToggle"
    >
      <slot />
    </div>
  </span>
</template>

<style>
@layer ds.components {
  /*
   * Sans déclencheur, le wrapper ne sert à rien : `display: contents` le retire
   * du layout (le panneau est en `position: fixed`, il n'en dépend pas) — un
   * `inline-block` vide créerait une line box, donc de la hauteur, chez tous
   * les consommateurs internes.
   */
  .ds-popover {
    display: contents;
  }

  .ds-popover[data-trigger] {
    display: inline-block;
    anchor-name: --popover-anchor;
    /* confine le nom d'ancre à ce sous-arbre : chaque panneau (même en top
       layer) résout SON wrapper, pas le dernier wrapper nommé de la page */
    anchor-scope: --popover-anchor;
  }

  /*
   * Seule déclaration du panneau : AUCUNE dimension ici. `min/max-inline-size`,
   * `max-block-size` et `overflow` varient d'un consommateur à l'autre et
   * seraient arbitrés par l'ordre du bundle à spécificité égale (0,1,0).
   */
  .ds-popover-panel {
    position-anchor: var(--anchor-name, --popover-anchor);
  }
}
</style>
