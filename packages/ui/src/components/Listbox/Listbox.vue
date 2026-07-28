<script setup lang="ts">
import Popover from '../Popover/Popover.vue'

/**
 * Panneau de liste INTERNE (non exporté) : brique du Combobox. Aucune
 * autonomie — le contrôle externe garde le focus et pilote tout. D'où
 * `mode="manual"` (le consommateur ferme au `focusout` / Échap), aucun
 * gestionnaire clavier, et un ancrage STATIQUE par la prop `anchor` : sans
 * invocateur `popovertarget` (invalide sur un `<input>` texte) il n'y a pas
 * d'ancre implicite.
 *
 * Toute la plomberie du popover (élément, état, ancrage, placement, surface)
 * vient de `Popover` ; ne restent ici que le rôle ARIA, les dimensions et le
 * `mousedown` neutralisé.
 *
 * Le panneau porte lui-même `role="listbox"` ET le défilement : c'est le
 * contrat sur lequel s'appuie le consommateur (root d'IntersectionObserver,
 * ancêtre défilant de `scrollIntoView`).
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

// Non assigné : le template lit les props directement.
withDefaults(defineProps<ListboxProps>(), {
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

/*
 * Le focus ne doit jamais quitter le contrôle externe : sans ce preventDefault,
 * cliquer une option le lui retire, le `focusout` du consommateur ferme le
 * panneau AVANT que la sélection ne soit traitée — la sélection à la souris
 * devient inopérante.
 */
function onMousedown(event: MouseEvent) {
  event.preventDefault()
}
</script>

<template>
  <Popover
    :id="id"
    v-model:open="open"
    mode="manual"
    :anchor="anchor"
    :placement="placement"
    role="listbox"
    class="ds-listbox ds-control"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :aria-multiselectable="multiselectable ? 'true' : undefined"
    @mousedown="onMousedown"
  >
    <slot />
  </Popover>
</template>

<style>
@layer ds.components {
  /* Chrome (surface, bordure, ombre, rythme interne) : prop `surface` de
     Popover, qui pose la classe partagée `.ds-panel` (styles/panel.css).
     Tailles : classe partagée `ds-control` posée sur le panneau (voir le
     template) — aucune table locale, les options et les rangées d'état du
     consommateur (`.ds-combobox-state`) consomment les `--_control-*` hérités.
     Contrairement à MenuPanel la classe est inconditionnelle : une liste ne
     s'imbrique jamais dans une autre.
     Ne restent ici que les règles propres à la liste : largeur calée sur
     l'ancre et zone défilante. */
  .ds-listbox {
    min-inline-size: anchor-size(width);
    max-block-size: var(--ds-control-size-listbox-max-block);
    overflow: auto;
  }
}
</style>
