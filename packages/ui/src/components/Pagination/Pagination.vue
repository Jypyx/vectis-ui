<script setup lang="ts">
import { computed, ref } from 'vue'

import Button from '../Button/Button.vue'
import ButtonGroup from '../Button/ButtonGroup.vue'
import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'
import IconButton from '../IconButton/IconButton.vue'

/**
 * Pagination composée : chaque pastille est un Button (la page active en
 * `solid`, les autres en `ghost`/`outline`), les contrôles précédent/suivant
 * un Button ou un IconButton, et `attached` rattache le tout dans un
 * ButtonGroup. Aucune règle d'état n'est redéfinie ici — hover, focus,
 * disabled, `prefers-reduced-motion` viennent de Button.
 *
 * Double troncature :
 *  1. logique — fenêtre glissante `boundaryCount` + `siblingCount`, pure
 *     dérivation d'état (aucune API navigateur, SSR-safe) ;
 *  2. responsive — 100 % CSS par container queries sur la nav elle-même,
 *     donc aucun ResizeObserver (voir le bloc @container plus bas).
 *
 * Le seul JS de comportement est la navigation clavier (flèches / Home /
 * End), justifiée en tête de `onKeydown` : aucune primitive native ne
 * déplace le focus entre des boutons frères.
 */
interface PaginationProps {
  /** Nombre total de pages. */
  count: number
  /** Pages voisines affichées de chaque côté de la page courante. */
  siblingCount?: number
  /** Pages affichées à chaque extrémité : ce sont elles qui survivent à la troncature. */
  boundaryCount?: number

  /** Rattache tous les boutons en contrôle segmenté (ButtonGroup). */
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
  /** Icône du contrôle précédent : nom Material Symbols OU URL d'image. */
  prevIcon?: string
  /** Icône du contrôle suivant : nom Material Symbols OU URL d'image. */
  nextIcon?: string
  /** Libellé du contrôle précédent (texte visible et nom accessible). */
  prevLabel?: string
  /** Libellé du contrôle suivant (texte visible et nom accessible). */
  nextLabel?: string

  /** Désactive l'ensemble du composant. */
  disabled?: boolean
  /** Pages désactivées : liste OU prédicat (même convention que `disabledDates` de Calendar). */
  disabledPages?: number[] | ((page: number) => boolean)

  /** Troncature responsive par container queries. */
  responsive?: boolean

  /** Nom accessible de la navigation. */
  label?: string
  /** Nom accessible d'une pastille de page. Défaut : « Page N ». */
  pageLabel?: (page: number) => string
}

const props = withDefaults(defineProps<PaginationProps>(), {
  siblingCount: 1,
  boundaryCount: 1,
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
  prevLabel: 'Page précédente',
  nextLabel: 'Page suivante',
  disabled: false,
  disabledPages: undefined,
  responsive: true,
  label: 'Pagination',
  pageLabel: undefined,
})

const page = defineModel<number>({ default: 1 })

/** Entrée rendue : une pastille de page, ou un marqueur d'ellipse. */
type PaginationItem =
  | { kind: 'page'; key: string; page: number; edge: boolean; distance: number }
  | { kind: 'gap'; key: string }

const total = computed(() => Math.max(Math.trunc(props.count), 1))
const currentPage = computed(() => Math.min(Math.max(page.value, 1), total.value))

function isPageDisabled(n: number): boolean {
  const matcher = props.disabledPages
  if (matcher === undefined) return false
  return Array.isArray(matcher) ? matcher.includes(n) : matcher(n)
}

function pageLabelFor(n: number): string {
  return props.pageLabel ? props.pageLabel(n) : `Page ${n}`
}

/**
 * Fenêtre glissante : bornes + voisins de la page courante, avec un marqueur
 * d'ellipse dès qu'un numéro est sauté. Chaque pastille porte sa distance à
 * la page courante — c'est la clé de tri du masquage responsive, plafonnée à
 * 3 : au-delà, les voisins les plus lointains partagent le premier palier.
 */
const items = computed<PaginationItem[]>(() => {
  const count = total.value
  const current = currentPage.value
  const boundary = Math.max(props.boundaryCount, 0)
  const sibling = Math.max(props.siblingCount, 0)

  const keep = new Set<number>()
  const add = (n: number) => {
    if (n >= 1 && n <= count) keep.add(n)
  }
  for (let i = 1; i <= boundary; i++) add(i)
  for (let i = count - boundary + 1; i <= count; i++) add(i)
  for (let i = current - sibling; i <= current + sibling; i++) add(i)
  // garantit la page courante même avec boundaryCount et siblingCount à 0
  add(current)

  const out: PaginationItem[] = []
  let previous = 0
  for (const n of [...keep].sort((a, b) => a - b)) {
    if (previous && n - previous > 1) out.push({ kind: 'gap', key: `gap-${previous}` })
    out.push({
      kind: 'page',
      key: `page-${n}`,
      page: n,
      edge: n <= boundary || n > count - boundary,
      distance: Math.min(Math.abs(n - current), 3),
    })
    previous = n
  }
  return out
})

/**
 * Cible d'un contrôle : la page activable la plus proche dans la direction
 * donnée — les pages désactivées sont enjambées. `undefined` = butée, donc
 * contrôle désactivé (couvre aussi les extrémités, sans test séparé).
 */
function step(direction: -1 | 1): number | undefined {
  for (let n = currentPage.value + direction; n >= 1 && n <= total.value; n += direction) {
    if (!isPageDisabled(n)) return n
  }
  return undefined
}

const prevTarget = computed(() => step(-1))
const nextTarget = computed(() => step(1))
const prevDisabled = computed(() => props.disabled || prevTarget.value === undefined)
const nextDisabled = computed(() => props.disabled || nextTarget.value === undefined)

function goTo(n: number | undefined) {
  if (n === undefined) return
  page.value = Math.min(Math.max(n, 1), total.value)
}

const navEl = ref<HTMLElement | null>(null)

/**
 * Navigation clavier : aucune primitive native ne déplace le focus entre des
 * boutons frères. Tab reste naturel (chaque pastille visible est un arrêt de
 * tabulation, comme dans une liste de liens) ; les flèches et Home/End ne
 * font que **déplacer le focus** — une pagination ne s'active pas au focus,
 * ce serait une navigation involontaire.
 *
 * Les pastilles sont découvertes par requête DOM (pas de registre) et
 * filtrées sur `display` : celles que les container queries ont masquées ne
 * doivent pas capter le focus. Les flèches sont physiques, donc inversées en
 * RTL où la rangée se lit de droite à gauche.
 */
function onKeydown(event: KeyboardEvent) {
  if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return
  const nav = navEl.value
  if (!nav) return
  const pages = [...nav.querySelectorAll<HTMLElement>('.ds-pagination-page:not(:disabled)')].filter(
    (el) => getComputedStyle(el).display !== 'none',
  )
  if (pages.length === 0) return
  event.preventDefault()

  const forward = (event.key === 'ArrowRight') !== (getComputedStyle(nav).direction === 'rtl')
  const current = pages.indexOf(document.activeElement as HTMLElement)
  const next =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? pages.length - 1
        : current === -1
          ? 0
          : (current + (forward ? 1 : -1) + pages.length) % pages.length
  pages[next]?.focus()
}
</script>

<template>
  <nav
    ref="navEl"
    class="ds-pagination"
    :aria-label="label"
    :data-align="align"
    :data-controls-display="controlsDisplay"
    :data-responsive="responsive ? '' : undefined"
    @keydown="onKeydown"
  >
    <!-- attached : ButtonGroup fusionne les bordures. Il cible ses enfants
         DIRECTS `.ds-button` — d'où l'absence de <ul>/<li>, et une ellipse
         rendue en IconButton plutôt qu'en <span>. -->
    <component :is="attached ? ButtonGroup : 'div'" class="ds-pagination-items">
      <template v-if="showControls">
        <IconButton
          v-if="controlsDisplay === 'icon'"
          class="ds-pagination-control"
          :label="prevLabel"
          :variant="variant"
          tone="neutral"
          :size="size"
          :compact="compact"
          :disabled="prevDisabled"
          @click="goTo(prevTarget)"
        >
          <Icon v-bind="iconProps(prevIcon)" />
        </IconButton>
        <!-- aria-label posé même quand le libellé est visible : les container
             queries le masquent aux largeurs étroites, le nom accessible doit
             y survivre. -->
        <Button
          v-else
          class="ds-pagination-control"
          :variant="variant"
          tone="neutral"
          :size="size"
          :compact="compact"
          :disabled="prevDisabled"
          :aria-label="prevLabel"
          @click="goTo(prevTarget)"
        >
          <template v-if="controlsDisplay === 'both'" #start>
            <Icon v-bind="iconProps(prevIcon)" />
          </template>
          <span class="ds-pagination-control-label">{{ prevLabel }}</span>
        </Button>
      </template>

      <template v-for="item in items" :key="item.key">
        <Button
          v-if="item.kind === 'page'"
          class="ds-pagination-page"
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
        </Button>
        <!-- Ellipse : IconButton inerte (donc un `.ds-button`, la couture du
             groupe reste continue et la hauteur suit size/compact). Masquée
             aux technologies d'assistance, hors tabulation via disabled. -->
        <IconButton
          v-else
          class="ds-pagination-ellipsis"
          label="Pages masquées"
          aria-hidden="true"
          :variant="variant"
          tone="neutral"
          :size="size"
          :compact="compact"
          disabled
        >
          <Icon name="more_horiz" />
        </IconButton>
      </template>

      <template v-if="showControls">
        <IconButton
          v-if="controlsDisplay === 'icon'"
          class="ds-pagination-control"
          :label="nextLabel"
          :variant="variant"
          tone="neutral"
          :size="size"
          :compact="compact"
          :disabled="nextDisabled"
          @click="goTo(nextTarget)"
        >
          <Icon v-bind="iconProps(nextIcon)" />
        </IconButton>
        <Button
          v-else
          class="ds-pagination-control"
          :variant="variant"
          tone="neutral"
          :size="size"
          :compact="compact"
          :disabled="nextDisabled"
          :aria-label="nextLabel"
          @click="goTo(nextTarget)"
        >
          <template v-if="controlsDisplay === 'both'" #end>
            <Icon v-bind="iconProps(nextIcon)" />
          </template>
          <span class="ds-pagination-control-label">{{ nextLabel }}</span>
        </Button>
      </template>
    </component>
  </nav>
</template>

<style>
@layer ds.components {
  .ds-pagination {
    /*
     * `container-type: inline-size` calcule la taille inline SANS le contenu :
     * la nav doit donc être block-level (une inline-flex se réduirait à zéro).
     * Elle occupe la largeur de son parent — c'est ce qui rend la troncature
     * dépendante de la place réellement allouée — et l'alignement passe par
     * `data-align` plutôt que par le contexte.
     */
    display: flex;
    container-type: inline-size;
    container-name: ds-pagination;
  }

  .ds-pagination[data-align='center'] {
    justify-content: center;
  }

  .ds-pagination[data-align='end'] {
    justify-content: flex-end;
  }

  .ds-pagination-items {
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-1);
  }

  /* attached : l'assemblage est fait par les marges négatives de ButtonGroup */
  .ds-button-group.ds-pagination-items {
    gap: 0;
  }

  .ds-pagination-page {
    /*
     * Pastille carrée à un chiffre, qui s'élargit d'elle-même au-delà : même
     * mécanique qu'IconButton, qui lit la variable posée par ds-control sur ce
     * même élément — une seule règle couvre les 5 tailles × compact.
     */
    min-inline-size: var(--_control-height);
    padding-inline: var(--ds-space-2);
  }

  /* l'ellipse n'est pas un bouton désactivé au sens de l'utilisateur */
  .ds-pagination-ellipsis {
    cursor: default;
  }

  /* chevrons : la direction est physique, l'icône se retourne en RTL */
  [dir='rtl'] .ds-pagination-control .ds-icon {
    scale: -1 1;
  }

  /*
   * Troncature responsive — la nav est son propre conteneur de requête, donc
   * les paliers suivent la place allouée au composant, jamais le viewport
   * (aucun ResizeObserver, cf. DataTable). Les seuils sont des littéraux :
   * les conditions @container n'acceptent pas var(). Ils sont calibrés sur
   * size="md" ; pour les cas extrêmes (size xl, count à 5 chiffres),
   * l'échappatoire est `siblingCount` ou `responsive: false`.
   *
   * Chaque seuil est la largeur qu'il FAUT pour afficher le niveau concerné —
   * pas celle qui reste après masquage, sinon la rangée déborde pendant tout
   * l'intervalle. À size md : pastille et contrôle font une hauteur de
   * contrôle de large (2.5rem), la gouttière 0.25rem, soit 2.75rem par
   * élément. Une rangée à 13 éléments (siblingCount 3) demande ~35.5rem,
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
  @container ds-pagination (max-width: 36rem) {
    .ds-pagination[data-responsive] .ds-pagination-page[data-distance='3'] {
      display: none;
    }
  }

  @container ds-pagination (max-width: 31rem) {
    .ds-pagination[data-responsive] .ds-pagination-page[data-distance='2'] {
      display: none;
    }

    /* Un contrôle en mode 'both' coûte ~4× une pastille : le replier en icône
       seule rend plus de place que de sacrifier une voisine, il passe donc
       avant le dernier palier. Jamais en mode 'text' — il ne resterait rien
       de cliquable. */
    .ds-pagination[data-responsive][data-controls-display='both'] .ds-pagination-control-label {
      display: none;
    }
  }

  @container ds-pagination (max-width: 25rem) {
    .ds-pagination[data-responsive] .ds-pagination-page[data-distance='1'] {
      display: none;
    }
  }
}
</style>
