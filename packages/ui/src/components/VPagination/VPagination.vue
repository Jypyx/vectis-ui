<script setup lang="ts">
import { computed, ref } from 'vue'

import VButton from '../VButton/VButton.vue'
import VButtonGroup from '../VButton/VButtonGroup.vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import VIconButton from '../VIconButton/VIconButton.vue'

import { arrowNavigate, navigableItems } from '../../utils/arrowNav'
import { clamp } from '../../utils/number'
import { resolveMatcher } from '../../utils/matcher'

import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages } from '../../i18n/state'

/**
 * VPagination composée : chaque pastille est un VButton, les contrôles
 * précédent/suivant un VButton ou un VIconButton, et `attached` rattache le tout
 * dans un VButtonGroup. Aucune règle d'état n'est redéfinie ici.
 *
 * Double troncature : logique (`totalVisible`, pure dérivation SSR-safe) et
 * responsive (100 % CSS par container queries sur la nav elle-même, donc aucun
 * ResizeObserver). Seul JS de comportement : la navigation clavier, justifiée
 * en tête de `onKeydown`.
 */
interface PaginationProps {
  /** Nombre total de pages. */
  length?: number
  /**
   * Nombre total d'emplacements rendus, ellipses comprises (minimum 5 :
   * première + ellipse + courante + ellipse + dernière). La fenêtre se décale
   * aux extrémités au lieu de rétrécir : la largeur de la barre est stable.
   * Absente : toutes les pages sont rendues.
   */
  totalVisible?: number

  /** Rattache tous les boutons en contrôle segmenté (VButtonGroup). */
  attached?: boolean
  /** Variante des pages NON actives et des contrôles. La page active est toujours `solid`. */
  variant?: 'ghost' | 'outline'
  /** Tone de la page active ; les pages inactives et les contrôles restent neutral. */
  tone?: 'accent' | 'neutral' | 'danger' | 'success' | 'warning'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Hauteur réduite de 4px, propagée à tous les boutons. */
  compact?: boolean
  /** Alignement dans le conteneur : la nav occupe toute la largeur disponible (cf. CSS). */
  align?: 'start' | 'center' | 'end'

  /** Affiche les boutons précédent / suivant. */
  showControls?: boolean
  /** Rendu des contrôles : icône seule, texte seul, ou les deux. */
  controlsDisplay?: 'icon' | 'text' | 'both'
  /** Icône du contrôle précédent : nom, ou rendu explicite. */
  prevIcon?: IconSource
  /** Icône du contrôle suivant : nom, ou rendu explicite. */
  nextIcon?: IconSource
  /** Libellé du contrôle précédent (texte visible et nom accessible). Défaut : dictionnaire du DS. */
  prevLabel?: string
  /** Libellé du contrôle suivant (texte visible et nom accessible). Défaut : dictionnaire du DS. */
  nextLabel?: string

  /** Désactive l'ensemble du composant. */
  disabled?: boolean
  /** Pages désactivées : liste OU prédicat (même convention que `disabledDates` de VCalendar). */
  disabledPages?: number[] | ((page: number) => boolean)

  /** Troncature responsive par container queries. */
  responsive?: boolean

  /** Nom accessible de la navigation. Défaut : dictionnaire du DS. */
  label?: string
  /** Nom accessible d'une pastille de page. Défaut : dictionnaire du DS. */
  pageLabel?: (page: number) => string
}

const props = withDefaults(defineProps<PaginationProps>(), {
  length: 1,
  totalVisible: undefined,
  attached: false,
  variant: 'ghost',
  tone: 'accent',
  size: 'md',
  compact: false,
  align: 'start',
  showControls: true,
  controlsDisplay: 'icon',
  prevIcon: 'chevron_left',
  nextIcon: 'chevron_right',
  prevLabel: undefined,
  nextLabel: undefined,
  disabled: false,
  disabledPages: undefined,
  responsive: false,
  label: undefined,
  pageLabel: undefined,
})

// Cascade prop > dictionnaire ; pour le nom de la nav, `useAriaLabel` place
// encore `aria-labelledby` et `aria-label` du consommateur au-dessus.
const m = useMessages()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.pagination.label)
const resolvedPrevLabel = computed(() => props.prevLabel ?? m.value.pagination.previous)
const resolvedNextLabel = computed(() => props.nextLabel ?? m.value.pagination.next)

const page = defineModel<number>({ default: 1 })

/** Entrée rendue : une pastille de page, ou un marqueur d'ellipse. */
type PaginationItem =
  | { kind: 'page'; key: string; page: number; edge: boolean; distance: number }
  | { kind: 'gap'; key: string }

const total = computed(() => Math.max(Math.trunc(props.length), 1))
const currentPage = computed(() => clamp(page.value, 1, total.value))

const isPageDisabled = computed(() => resolveMatcher(props.disabledPages))

function pageLabelFor(n: number): string {
  return props.pageLabel ? props.pageLabel(n) : m.value.pagination.page(n)
}

/**
 * Troncature logique à emplacements constants : `totalVisible` compte TOUT ce
 * qui est rendu, ellipses comprises. La fenêtre centrale (totalVisible - 4
 * pages) est centrée sur la page courante et se DÉCALE près des extrémités au
 * lieu de rétrécir — la barre garde exactement la même largeur quelle que
 * soit la page courante. Chaque pastille porte sa distance à la page courante
 * — c'est la clé de tri du masquage responsive, plafonnée à 3 : au-delà, les
 * voisins les plus lointains partagent le premier palier.
 */
const items = computed<PaginationItem[]>(() => {
  const count = total.value
  const current = currentPage.value

  const pageItem = (n: number): PaginationItem => ({
    kind: 'page',
    key: `page-${n}`,
    page: n,
    edge: n === 1 || n === count,
    distance: Math.min(Math.abs(n - current), 3),
  })
  const pages = (from: number, to: number): PaginationItem[] => {
    const out: PaginationItem[] = []
    for (let n = from; n <= to; n++) out.push(pageItem(n))
    return out
  }
  const gap = (after: number): PaginationItem => ({ kind: 'gap', key: `gap-${after}` })

  // Sans totalVisible : aucune troncature, toutes les pages sont rendues.
  // Minimum utile : 5 (première + ellipse + courante + ellipse + dernière).
  const visible =
    props.totalVisible === undefined ? count : Math.max(Math.trunc(props.totalVisible), 5)
  if (visible >= count) return pages(1, count)

  const start = current - Math.floor((visible - 5) / 2)
  const end = start + (visible - 5)

  // Près d'une extrémité (l'ellipse de ce côté ne sauterait aucun numéro),
  // la fenêtre s'étire jusqu'à la borne : toujours `visible` emplacements.
  if (start <= 3) return [...pages(1, visible - 2), gap(visible - 2), pageItem(count)]
  if (end >= count - 2) return [pageItem(1), gap(1), ...pages(count - visible + 3, count)]
  return [pageItem(1), gap(1), ...pages(start, end), gap(end), pageItem(count)]
})

/**
 * Cible d'un contrôle : la page activable la plus proche dans la direction
 * donnée — les pages désactivées sont enjambées. `undefined` = butée, donc
 * contrôle désactivé (couvre aussi les extrémités, sans test séparé).
 */
function step(direction: -1 | 1): number | undefined {
  for (let n = currentPage.value + direction; n >= 1 && n <= total.value; n += direction) {
    if (!isPageDisabled.value(n)) return n
  }
  return undefined
}

const prevTarget = computed(() => step(-1))
const nextTarget = computed(() => step(1))
const prevDisabled = computed(() => props.disabled || prevTarget.value === undefined)
const nextDisabled = computed(() => props.disabled || nextTarget.value === undefined)

function goTo(n: number | undefined) {
  if (n === undefined) return
  page.value = clamp(n, 1, total.value)
}

const navEl = ref<HTMLElement | null>(null)

/**
 * Navigation clavier (implémentation partagée : `utils/arrowNav`). Tab reste
 * naturel — chaque pastille visible est un arrêt de tabulation, comme dans une
 * liste de liens. Les pastilles que les container queries ont masquées sont
 * écartées par le filtre `display` du helper : elles ne captent pas le focus.
 */
function onKeydown(event: KeyboardEvent) {
  const nav = navEl.value
  if (!nav) return
  arrowNavigate(event, nav, navigableItems(nav, '.v-pagination-page:not(:disabled)'))
}
</script>

<template>
  <nav
    ref="navEl"
    class="v-pagination"
    :aria-label="ariaLabel"
    :data-align="align"
    :data-controls-display="controlsDisplay"
    :data-responsive="responsive ? '' : undefined"
    @keydown="onKeydown"
  >
    <!-- attached : VButtonGroup fusionne les bordures. Il cible ses enfants
         DIRECTS `.v-button` — d'où l'absence de <ul>/<li>, et une ellipse
         rendue en VIconButton plutôt qu'en <span>. -->
    <component :is="attached ? VButtonGroup : 'div'" class="v-pagination-items">
      <template v-if="showControls">
        <VIconButton
          v-if="controlsDisplay === 'icon'"
          class="v-pagination-control"
          :label="resolvedPrevLabel"
          :variant="variant"
          tone="neutral"
          :size="size"
          :compact="compact"
          :disabled="prevDisabled"
          @click="goTo(prevTarget)"
        >
          <VIcon v-bind="iconProps(prevIcon)" />
        </VIconButton>
        <!-- aria-label posé même quand le libellé est visible : les container
             queries le masquent aux largeurs étroites, le nom accessible doit
             y survivre. -->
        <VButton
          v-else
          class="v-pagination-control"
          :variant="variant"
          tone="neutral"
          :size="size"
          :compact="compact"
          :disabled="prevDisabled"
          :aria-label="resolvedPrevLabel"
          @click="goTo(prevTarget)"
        >
          <template v-if="controlsDisplay === 'both'" #start>
            <VIcon v-bind="iconProps(prevIcon)" />
          </template>
          <span class="v-pagination-control-label">{{ resolvedPrevLabel }}</span>
        </VButton>
      </template>

      <template v-for="item in items" :key="item.key">
        <VButton
          v-if="item.kind === 'page'"
          class="v-pagination-page"
          :variant="item.page === currentPage ? 'solid' : variant"
          :tone="item.page === currentPage ? tone : 'neutral'"
          :size="size"
          :compact="compact"
          :disabled="disabled || isPageDisabled(item.page)"
          :aria-label="pageLabelFor(item.page)"
          :aria-current="item.page === currentPage ? 'page' : undefined"
          :data-edge="item.edge ? '' : undefined"
          :data-distance="!item.edge && item.distance > 0 ? item.distance : undefined"
          @click="goTo(item.page)"
        >
          {{ item.page }}
        </VButton>
        <!-- Ellipse : VIconButton inerte (donc un `.v-button`, la couture du
             groupe reste continue et la hauteur suit size/compact). Masquée
             aux technologies d'assistance, hors tabulation via disabled. -->
        <VIconButton
          v-else
          class="v-pagination-ellipsis"
          :label="m.pagination.hiddenPages"
          aria-hidden="true"
          :variant="variant"
          tone="neutral"
          :size="size"
          :compact="compact"
          disabled
        >
          <VIcon name="more_horiz" />
        </VIconButton>
      </template>

      <template v-if="showControls">
        <VIconButton
          v-if="controlsDisplay === 'icon'"
          class="v-pagination-control"
          :label="resolvedNextLabel"
          :variant="variant"
          tone="neutral"
          :size="size"
          :compact="compact"
          :disabled="nextDisabled"
          @click="goTo(nextTarget)"
        >
          <VIcon v-bind="iconProps(nextIcon)" />
        </VIconButton>
        <VButton
          v-else
          class="v-pagination-control"
          :variant="variant"
          tone="neutral"
          :size="size"
          :compact="compact"
          :disabled="nextDisabled"
          :aria-label="resolvedNextLabel"
          @click="goTo(nextTarget)"
        >
          <template v-if="controlsDisplay === 'both'" #end>
            <VIcon v-bind="iconProps(nextIcon)" />
          </template>
          <span class="v-pagination-control-label">{{ resolvedNextLabel }}</span>
        </VButton>
      </template>
    </component>
  </nav>
</template>

<style>
@layer vectis.components {
  .v-pagination {
    display: flex;
  }

  /*
   * Confinement réservé au mode responsive (toutes les @container ci-dessous en
   * dépendent) : `container-type: inline-size` calcule la taille inline SANS le
   * contenu, la nav doit donc être block-level (une inline-flex se réduirait à
   * zéro) et occupe la largeur de son parent — c'est ce qui rend la troncature
   * dépendante de la place réellement allouée, et ce qui oblige un parent flex
   * à lui donner une largeur (`flex: 1`). Hors responsive, la nav retrouve une
   * largeur intrinsèque et se pose comme n'importe quel contenu. Dans les deux
   * cas l'alignement passe par `data-align`, jamais par le contexte.
   */
  .v-pagination[data-responsive] {
    container-type: inline-size;
    container-name: v-pagination;
  }

  .v-pagination[data-align='center'] {
    justify-content: center;
  }

  .v-pagination[data-align='end'] {
    justify-content: flex-end;
  }

  .v-pagination-items {
    display: inline-flex;
    align-items: center;
    gap: var(--vectis-space-1);
  }

  /* attached : l'assemblage est fait par les marges négatives de VButtonGroup */
  .v-button-group.v-pagination-items {
    gap: 0;
  }

  .v-pagination-page {
    /* Pastille carrée à un chiffre, qui s'élargit d'elle-même au-delà : la
       variable est posée par v-control sur ce même élément, une seule règle
       couvre donc les 5 tailles × compact. */
    min-inline-size: var(--control-height);
    padding-inline: var(--vectis-space-2);
  }

  /* l'ellipse n'est pas un bouton désactivé au sens de l'utilisateur */
  .v-pagination-ellipsis {
    cursor: default;
  }

  /* chevrons : la direction est physique, l'icône se retourne en RTL */
  [dir='rtl'] .v-pagination-control .v-icon {
    scale: -1 1;
  }

  /*
   * Troncature responsive — la nav est son propre conteneur de requête, donc
   * les paliers suivent la place allouée au composant, jamais le viewport
   * (aucun ResizeObserver). Les seuils sont des littéraux :
   * les conditions @container n'acceptent pas var(). Ils sont calibrés sur
   * size="md" ; pour les cas extrêmes (size xl, length à 5 chiffres),
   * l'échappatoire est `totalVisible` ou `responsive: false`.
   *
   * Chaque seuil est la largeur qu'il FAUT pour afficher le niveau concerné —
   * pas celle qui reste après masquage, sinon la rangée déborde pendant tout
   * l'intervalle. À size md : pastille et contrôle font une hauteur de
   * contrôle de large (2.5rem), la gouttière 0.25rem, soit 2.75rem par
   * élément. Une rangée à 13 éléments (totalVisible 11) demande ~35.5rem,
   * 11 éléments ~30rem, 9 éléments ~24.5rem — d'où 36 / 31 / 25rem, marge
   * comprise.
   *
   * Les voisins les plus éloignés tombent en premier. `[data-edge]` (bornes)
   * et la page courante ne portent pas de `data-distance` : ils ne sont donc
   * jamais ciblés. `display: none` les retire aussi de l'ordre de tabulation
   * et de l'arbre d'accessibilité — c'est voulu.
   *
   * Aucune ellipse n'est ajoutée en compensation d'un voisin masqué : elle
   * occupe exactement la largeur d'une pastille, elle ne ferait rien gagner.
   */
  @container v-pagination (max-width: 36rem) {
    .v-pagination[data-responsive] .v-pagination-page[data-distance='3'] {
      display: none;
    }
  }

  @container v-pagination (max-width: 31rem) {
    .v-pagination[data-responsive] .v-pagination-page[data-distance='2'] {
      display: none;
    }

    /* Un contrôle en mode 'both' coûte ~4× une pastille : le replier en icône
       seule rend plus de place que de sacrifier une voisine, il passe donc
       avant le dernier palier. Jamais en mode 'text' — il ne resterait rien
       de cliquable. */
    .v-pagination[data-responsive][data-controls-display='both'] .v-pagination-control-label {
      display: none;
    }
  }

  @container v-pagination (max-width: 25rem) {
    .v-pagination[data-responsive] .v-pagination-page[data-distance='1'] {
      display: none;
    }
  }
}
</style>
