<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { usePopover } from '../../composables/usePopover'

/**
 * Panneau de liste INTERNE (non exporté) : brique du Combobox.
 *
 * Contrairement au Menu, il n'a AUCUNE autonomie — le contrôle externe (champ
 * `role="combobox"`) garde le focus et pilote tout : clavier, surbrillance par
 * `aria-activedescendant`, ouverture et fermeture. D'où :
 * - `popover="manual"` : pas de light dismiss (le consommateur ferme au
 *   `focusout` / Échap) ;
 * - aucun gestionnaire clavier ni roving focus (le focus n'entre jamais ici) ;
 * - ancrage STATIQUE par la prop `anchor` — il n'y a pas d'invocateur
 *   `popovertarget` (invalide sur un `<input>` texte), donc pas d'ancre
 *   implicite. `anchor-name`/`anchor-scope` restent posés par le consommateur
 *   sur son propre sous-arbre.
 *
 * Le panneau porte lui-même `role="listbox"` ET le défilement : c'est le
 * contrat sur lequel s'appuie le consommateur (root d'IntersectionObserver,
 * ancêtre défilant de `scrollIntoView`).
 *
 * JS justifié : pont v-model ↔ API impérative du popover, et `mousedown`
 * neutralisé (cf. onMousedown).
 */
export type ListboxPlacement =
  'bottom-start' | 'bottom-end' | 'bottom' | 'top-start' | 'top-end' | 'top'

interface ListboxProps {
  /** Id du panneau, posé par le consommateur (cible de son `aria-controls`). */
  id: string
  /** Ancre statique (dashed-ident) posée par le consommateur sur son contrôle. */
  anchor: string
  placement?: ListboxPlacement
  /** Hauteur minimale des options : 32px (sm), 40px (md) ou 48px (lg). */
  size?: 'sm' | 'md' | 'lg'
  /** Hauteur minimale des options réduite de 4px. */
  compact?: boolean
  /** Sélection multiple (aria-multiselectable). */
  multiselectable?: boolean
}

const props = withDefaults(defineProps<ListboxProps>(), {
  placement: 'bottom-start',
  size: 'sm',
  compact: false,
  multiselectable: false,
})

const open = defineModel<boolean>('open', { default: false })

defineSlots<{
  /** Les <ListboxOption>, plus les états et sentinelles du consommateur. */
  default(): unknown
}>()

const panelEl = ref<HTMLElement | null>(null)
// État d'ouverture et gardes d'idempotence : cf. usePopover.
const { shown, syncShown, show, hide } = usePopover(panelEl)

function onToggle(event: Event) {
  syncShown(event)
  open.value = shown.value
}

/*
 * Le focus ne doit jamais quitter le contrôle externe : sans ce preventDefault,
 * cliquer une option le lui retire, le `focusout` du consommateur ferme le
 * panneau AVANT que la sélection ne soit traitée — la sélection à la souris
 * devient inopérante.
 */
function onMousedown(event: MouseEvent) {
  event.preventDefault()
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

const panelStyle = computed(() => ({ '--_anchor': props.anchor }))
</script>

<template>
  <div
    :id="id"
    ref="panelEl"
    popover="manual"
    role="listbox"
    class="ds-panel ds-listbox ds-floating ds-control"
    :data-placement="placement"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :style="panelStyle"
    :aria-multiselectable="multiselectable ? 'true' : undefined"
    @beforetoggle="syncShown"
    @toggle="onToggle"
    @mousedown="onMousedown"
  >
    <slot />
  </div>
</template>

<style>
@layer ds.components {
  /* Chrome (surface, bordure, ombre, rythme interne) : classe partagée
     `.ds-panel` (styles/panel.css). Tailles : classe partagée `ds-control`
     posée sur le panneau (voir le template) — aucune table locale, les options
     et les rangées d'état du consommateur (`.ds-combobox-state`) consomment
     les `--_control-*` hérités. Contrairement à MenuPanel la classe est
     inconditionnelle : une liste ne s'imbrique jamais dans une autre.
     Ne restent ici que les règles propres à la liste : largeur calée sur
     l'ancre et zone défilante. */
  .ds-listbox {
    position-anchor: var(--_anchor);
    min-inline-size: anchor-size(width);
    max-block-size: var(--ds-control-size-listbox-max-block);
    overflow: auto;
  }
}
</style>
