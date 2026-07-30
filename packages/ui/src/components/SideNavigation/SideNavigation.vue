<script setup lang="ts">
import { provide, ref, useId } from 'vue'

import type { IconSource } from '../Icon/types'
import { sideNavigationKey } from './context'

import { arrowNavigate } from '../../utils/arrowNav'
import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages } from '../../i18n/state'

/**
 * Navigation verticale de barre latérale : une arborescence de liens rendue
 * INLINE (rien ne flotte), repliable niveau par niveau, composée par
 * sous-composants — `SideNavigationItem`, `SideNavigationGroup`,
 * `SideNavigationSeparator`.
 *
 * `<ul>`/`<li>` et non des div comme Menu : le pattern ARIA `menu` interdit les
 * listes (il n'admet que `menuitem`/`group`), une navigation est l'inverse — le
 * comptage et la relation d'imbrication SONT l'information de hiérarchie.
 *
 * Le repli est natif (`<details>`/`<summary>`, cf. SideNavigationItem) : état,
 * clavier d'activation, exclusivité entre frères (`<details name>`) et
 * animation viennent du navigateur. Seul JS de comportement du composant : la
 * navigation aux flèches ci-dessous.
 */
interface SideNavigationProps {
  /** Nom accessible de la <nav>. Défaut : dictionnaire du DS. */
  label?: string
  /** Hauteur des rangées : 32px (sm) ou 40px (md). Héritée par TOUS les niveaux. */
  size?: 'sm' | 'md'
  /** Densité : −4px de hauteur. N'est PAS un mode « rail d'icônes replié ». */
  compact?: boolean
  /**
   * Un seul sous-niveau ouvert à la fois PAR NIVEAU (attribut natif
   * `<details name>`). Défaut `false` : une barre latérale garde normalement
   * plusieurs sections ouvertes.
   */
  exclusive?: boolean
  /** Chevron des branches repliées : nom d'icône, ou rendu explicite (`{ src }`…). */
  expandIcon?: IconSource
  /** Chevron des branches dépliées ; absent = `expandIcon` pivotée de 180°. */
  collapseIcon?: IconSource
}

const props = withDefaults(defineProps<SideNavigationProps>(), {
  label: undefined,
  size: 'md',
  compact: false,
  exclusive: false,
  expandIcon: 'expand_more',
  collapseIcon: undefined,
})

defineSlots<{
  /** Les `SideNavigationItem` / `SideNavigationGroup` / `SideNavigationSeparator`. */
  default(): unknown
}>()

const m = useMessages()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.sideNavigation.label)

// Nom de groupe des <details> de PREMIER niveau ; chaque item en fournit un
// autre à ses propres enfants (cf. context.ts).
const rootName = useId()

provide(sideNavigationKey, {
  get name() {
    return props.exclusive ? rootName : undefined
  },
  get exclusive() {
    return props.exclusive
  },
  get expandIcon() {
    return props.expandIcon
  },
  get collapseIcon() {
    return props.collapseIcon
  },
})

const rootEl = ref<HTMLElement | null>(null)

/**
 * Cibles du focus : le <summary> d'une branche, l'action d'une feuille. Les
 * items désactivés sont écartés — `:disabled` ne matche que les <button>, un
 * lien inerte et un summary passent par `aria-disabled` (modèle MenuPanel).
 */
const ROW_SELECTOR = ':is(summary, .ds-side-nav-action):not(:disabled):not([aria-disabled="true"])'

/**
 * Écarte tout ce qui vit sous une branche REPLIÉE — sauf son propre <summary>,
 * qui reste focusable. Le contenu d'un <details> fermé n'est pas `display:
 * none` (le navigateur le « saute ») : le filtre de `navigableItems` ne le
 * verrait pas. On passe donc notre PROPRE liste à `arrowNavigate`, ce qui évite
 * au passage un `getComputedStyle` par rangée (précédent TimePicker).
 */
function reachable(el: HTMLElement, root: HTMLElement): boolean {
  for (
    let child: HTMLElement = el, parent = el.parentElement;
    parent && child !== root;
    child = parent, parent = parent.parentElement
  ) {
    if (parent.tagName === 'DETAILS' && !(parent as HTMLDetailsElement).open) {
      if (child.tagName !== 'SUMMARY') return false
    }
  }
  return true
}

/*
 * Seul JS de comportement : aucune primitive native ne déplace le focus entre
 * des liens frères. Contrat du DS (utils/arrowNav) — les flèches DÉPLACENT le
 * focus, jamais elles n'activent. Pas de roving tabindex : chaque rangée
 * visible reste un arrêt de tabulation (modèle Toggle), comme le veut le
 * pattern « disclosure navigation ».
 */
function onKeydown(event: KeyboardEvent) {
  const root = rootEl.value
  if (!root) return
  const items = [...root.querySelectorAll<HTMLElement>(ROW_SELECTOR)].filter((el) =>
    reachable(el, root),
  )
  arrowNavigate(event, root, items, { vertical: true })
}
</script>

<template>
  <nav
    ref="rootEl"
    class="ds-side-nav ds-control"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :aria-label="ariaLabel"
    @keydown="onKeydown"
  >
    <ul class="ds-side-nav-list">
      <slot />
    </ul>
  </nav>
</template>

<style>
@layer ds.components {
  .ds-side-nav {
    /*
     * Retrait d'un niveau de hiérarchie : exactement la place que tient une
     * icône de début (icône + gouttière), pour que le libellé d'un sous-item
     * tombe sur la MÊME VERTICALE que celui de son parent. Les deux variables
     * sont posées par `ds-control` sur cette même racine — le retrait suit donc
     * l'échelle des tailles sans table locale, et un consommateur qui repose
     * `--ds-icon-size` le voit suivre. Hérité par tous les niveaux.
     */
    --_indent: calc(var(--ds-icon-size) + var(--_control-gap));

    font-family: var(--ds-text-family);
    /* Repli animé de `::details-content` : autorise block-size 0 → auto
       (progressive enhancement, idiome Accordion). Hérité par les items. */
    interpolate-size: allow-keywords;
  }

  /*
   * Reset commun aux trois listes, déclaré UNE fois chez le propriétaire de la
   * racine plutôt que recopié dans trois SFC — aucun arbitrage de cascade
   * possible, ces classes n'existent nulle part ailleurs.
   *
   * `flex` et non `block` : il supprime tout margin collapsing, donc la marge
   * d'un groupe ne peut pas fuir hors d'une branche repliée (block-size: 0).
   */
  .ds-side-nav-list,
  .ds-side-nav-children,
  .ds-side-nav-group-list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
  }
}
</style>
