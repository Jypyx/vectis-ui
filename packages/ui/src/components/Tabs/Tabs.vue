<script setup lang="ts">
import { computed, nextTick, provide, ref, useId, useSlots, watch } from 'vue'

import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'
import type { IconSource } from '../Icon/types'
import IconButton from '../IconButton/IconButton.vue'
import { panelIdFor, tabIdFor, tabsKey } from './context'

import { arrowNavigate, navigableItems } from '../../utils/arrowNav'

import { useRootAttrs } from '../../composables/useRootAttrs'
import { useAriaLabel } from '../../composables/useAriaLabel'
import { useMessages } from '../../i18n/state'

export type TabsVariant = 'flat' | 'outlined' | 'inset'
export type TabsTone = 'accent' | 'neutral' | 'danger' | 'success' | 'warning'
export type TabsSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type TabsOrientation = 'horizontal' | 'vertical'
export type TabsAlign = 'start' | 'center' | 'end'
export type TabsActivation = 'manual' | 'automatic'

/**
 * Barre d'onglets (pattern ARIA tabs) et, optionnellement, ses panneaux.
 *
 * Le composant n'invente aucun bouton : chaque onglet est un `Button` (ghost,
 * ou elevated quand il est actif en variante `inset`), les contrôles de
 * défilement des `IconButton`. Hover, focus, désactivation et
 * `prefers-reduced-motion` viennent donc de `Button`, sans une règle d'état
 * redéfinie ici.
 *
 * SSR-safe : aucun accès DOM hors handlers et `watch({ flush: 'post' })`.
 */
interface TabsProps {
  /**
   * `flat` : onglets ghost soulignés, aucun habillage. `outlined` : `flat` dans
   * une carte (barre ET panneaux). `inset` : contrôle segmenté dans une piste
   * creuse.
   */
  variant?: TabsVariant
  /** Colore l'onglet actif ; les inactifs restent neutres. */
  tone?: TabsTone
  size?: TabsSize
  /** Hauteur réduite de 4px (propagée à tous les boutons). */
  compact?: boolean
  orientation?: TabsOrientation
  /** Gauche/centre/droite en horizontal, haut/milieu/bas en vertical. */
  align?: TabsAlign
  /** Les onglets se partagent toute la largeur (ou hauteur) disponible. */
  grow?: boolean
  /** Affiche deux boutons de défilement, désactivés en butée. */
  scrollButtons?: boolean
  /** Icône du bouton de défilement amont. Défaut selon l'orientation. */
  prevIcon?: IconSource
  /** Icône du bouton de défilement aval. Défaut selon l'orientation. */
  nextIcon?: IconSource
  /** Libellé accessible du bouton de défilement amont. Défaut : dictionnaire du DS. */
  prevLabel?: string
  /** Libellé accessible du bouton de défilement aval. Défaut : dictionnaire du DS. */
  nextLabel?: string
  /** `automatic` : la sélection suit le focus (recommandation APG pour des panneaux instantanés). */
  activation?: TabsActivation
  /** Nom accessible de la liste d'onglets. Défaut : dictionnaire du DS. */
  label?: string
}

const props = withDefaults(defineProps<TabsProps>(), {
  variant: 'flat',
  tone: 'accent',
  size: 'md',
  compact: false,
  orientation: 'horizontal',
  align: 'start',
  grow: false,
  scrollButtons: false,
  prevIcon: undefined,
  nextIcon: undefined,
  prevLabel: undefined,
  nextLabel: undefined,
  activation: 'manual',
  label: undefined,
})

defineSlots<{
  /** Les <Tab> */
  default(): unknown
  /** Les <TabPanel> ; absent, aucun conteneur de panneaux n'est rendu. */
  panels?(): unknown
}>()

const model = defineModel<string | number>()

// Pattern wrapper-root : la racine n'est qu'un conteneur, l'élément
// fonctionnel est la liste. class/style restent sur la racine, tout le reste
// (aria-labelledby, id, data-*) descend sur le [role="tablist"].
defineOptions({ inheritAttrs: false })
const { rootClass, rootStyle, forwardedAttrs: listAttrs } = useRootAttrs()
// Cascade prop > dictionnaire ; pour le nom du tablist, `useAriaLabel` place
// encore `aria-labelledby` et `aria-label` du consommateur au-dessus.
const m = useMessages()
const ariaLabel = useAriaLabel(() => props.label ?? m.value.tabs.label)
const resolvedPrevLabel = computed(() => props.prevLabel ?? m.value.tabs.previous)
const resolvedNextLabel = computed(() => props.nextLabel ?? m.value.tabs.next)

const slots = useSlots()
const baseId = useId()

// Getters : les props de la racine restent réactives à travers l'injection.
provide(tabsKey, {
  get value() {
    return model.value
  },
  select(value: string | number) {
    model.value = value
  },
  tabId: (value: string | number) => tabIdFor(baseId, value),
  panelId: (value: string | number) => panelIdFor(baseId, value),
  /*
   * La présence d'un slot est décidée par le vnode du parent : identique au
   * rendu serveur et au rendu client, donc aucun mismatch d'hydratation — là
   * où un registre alimenté au montage des panneaux en produirait un. En
   * contrepartie `slots` n'est pas réactif : le slot #panels doit être
   * statiquement présent ou absent.
   */
  get hasPanels() {
    return slots.panels !== undefined
  },
  get variant() {
    return props.variant
  },
  get tone() {
    return props.tone
  },
  get size() {
    return props.size
  },
  get compact() {
    return props.compact
  },
  get activation() {
    return props.activation
  },
})

const isVertical = computed(() => props.orientation === 'vertical')
const resolvedPrevIcon = computed(
  () => props.prevIcon ?? (isVertical.value ? 'expand_less' : 'chevron_left'),
)
const resolvedNextIcon = computed(
  () => props.nextIcon ?? (isVertical.value ? 'expand_more' : 'chevron_right'),
)

const listEl = ref<HTMLElement | null>(null)

/*
 * Navigation clavier (implémentation partagée : `utils/arrowNav`). Le handler
 * ne fait QUE déplacer le focus : la sélection au focus (mode `automatic`) est
 * posée par Tab, qui connaît sa valeur typée et n'a donc pas à la faire
 * transiter par un attribut du DOM. Un onglet masqué par le consommateur est
 * écarté par le filtre `display` du helper.
 */
function onKeydown(event: KeyboardEvent) {
  const list = listEl.value
  if (!list) return
  arrowNavigate(event, list, navigableItems(list, '[role="tab"]:not(:disabled)'), {
    vertical: isVertical.value,
  })
}

/*
 * Butées des boutons de défilement — aucune primitive CSS ne peut DÉSACTIVER
 * un bouton selon la position de défilement (`::scroll-button()` le fera
 * nativement, mais Chrome 135+ seulement, et son icône passerait par
 * `content`, donc par une police chargée par le consommateur).
 *
 * Deux sentinelles de 1px observées dans la liste couvrent d'un seul
 * observateur le défilement, le redimensionnement du conteneur et l'ajout ou
 * le retrait d'onglets — là où un ResizeObserver imposerait un second
 * mécanisme pour le même signal (précédent : la sentinelle de pagination du
 * Combobox). Défauts à `true` : boutons désactivés au premier rendu et en SSR,
 * jamais d'état faux. Rien ne déborde ⇒ les deux sentinelles sont visibles ⇒
 * les deux boutons désactivés, sans test séparé.
 */
const startSentinelEl = ref<HTMLElement | null>(null)
const endSentinelEl = ref<HTMLElement | null>(null)
const atStart = ref(true)
const atEnd = ref(true)

watch(
  [listEl, startSentinelEl, endSentinelEl],
  ([root, start, end], _previous, onCleanup) => {
    // IntersectionObserver n'existe ni en SSR ni en jsdom : les butées se
    // vérifient au navigateur (play functions).
    if (!root || !start || !end || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === start) atStart.value = entry.isIntersecting
          else atEnd.value = entry.isIntersecting
        }
      },
      { root },
    )
    observer.observe(start)
    observer.observe(end)
    onCleanup(() => observer.disconnect())
  },
  { flush: 'post' },
)

/** `behavior` omis : le défilement suit `scroll-behavior`, donc reduced-motion. */
function scrollStep(direction: -1 | 1) {
  const list = listEl.value
  if (!list) return
  // appel optionnel : jsdom n'implémente pas le défilement
  if (isVertical.value) {
    list.scrollBy?.({ top: direction * list.clientHeight * 0.8 })
    return
  }
  // `left` est physique : en RTL, « suivant » va vers la gauche.
  const rtl = getComputedStyle(list).direction === 'rtl'
  list.scrollBy?.({ left: direction * list.clientWidth * 0.8 * (rtl ? -1 : 1) })
}

/*
 * Recadrage de l'onglet actif après un changement programmatique du v-model
 * (la navigation clavier, elle, appelle `focus()` : le navigateur recadre
 * seul). Le recadrage est borné à la liste. Les deltas viennent des rects,
 * donc physiques : valables en LTR, RTL et vertical sans test de direction.
 */
watch(model, () => {
  nextTick(() => {
    const list = listEl.value
    const tab = list?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
    if (!list || !tab) return
    const t = tab.getBoundingClientRect()
    const c = list.getBoundingClientRect()
    list.scrollBy?.({
      left: t.left < c.left ? t.left - c.left : t.right > c.right ? t.right - c.right : 0,
      top: t.top < c.top ? t.top - c.top : t.bottom > c.bottom ? t.bottom - c.bottom : 0,
    })
  })
})
</script>

<template>
  <div
    :class="['ds-tabs', rootClass]"
    :style="rootStyle"
    :data-variant="variant"
    :data-orientation="orientation"
    :data-align="align"
    :data-grow="grow ? '' : undefined"
  >
    <div class="ds-tabs-bar">
      <IconButton
        v-if="scrollButtons"
        class="ds-tabs-scroll"
        :label="resolvedPrevLabel"
        tone="neutral"
        :size="size"
        :compact="compact"
        :disabled="atStart"
        @click="scrollStep(-1)"
      >
        <Icon v-bind="iconProps(resolvedPrevIcon)" />
      </IconButton>

      <div
        ref="listEl"
        v-bind="listAttrs"
        class="ds-tabs-list"
        role="tablist"
        :aria-label="ariaLabel"
        :aria-orientation="isVertical ? 'vertical' : undefined"
        @keydown="onKeydown"
      >
        <!-- sentinelles de butée : hors de l'arbre d'accessibilité, un
             `tablist` ne possède que des `tab` -->
        <span
          v-if="scrollButtons"
          ref="startSentinelEl"
          class="ds-tabs-sentinel"
          aria-hidden="true"
        />
        <slot />
        <span
          v-if="scrollButtons"
          ref="endSentinelEl"
          class="ds-tabs-sentinel"
          aria-hidden="true"
        />
      </div>

      <IconButton
        v-if="scrollButtons"
        class="ds-tabs-scroll"
        :label="resolvedNextLabel"
        tone="neutral"
        :size="size"
        :compact="compact"
        :disabled="atEnd"
        @click="scrollStep(1)"
      >
        <Icon v-bind="iconProps(resolvedNextIcon)" />
      </IconButton>
    </div>

    <div v-if="$slots.panels" class="ds-tabs-panels">
      <slot name="panels" />
    </div>
  </div>
</template>

<style>
@layer ds.components {
  .ds-tabs {
    /*
     * Gouttière du cadre : nulle à plat (barre et panneaux à fleur du conteneur
     * d'accueil), posée par `outlined` — idiome `--_table-frame-pad` du
     * DataTable. Fixe, PAS indexée sur `data-size`/`compact` : c'est une mesure
     * de carte, et les `--_control-*` vivent sur les Button descendants (chaque
     * Tab pose son propre `ds-control`), donc hors de portée de la racine.
     */
    --_tabs-frame-pad: 0px;

    display: flex;
    flex-direction: column;
    font-family: var(--ds-text-family);
  }

  /* Vertical : la barre et les panneaux se placent côte à côte */
  .ds-tabs[data-orientation='vertical'] {
    flex-direction: row;
  }

  /*
   * Carte bordée — échelle d'habillage partagée avec Accordion et DataTable ;
   * `flat` (défaut) n'a rien à annuler. Le cadre est sur la RACINE, donc autour
   * de la barre ET des panneaux : la piste de la barre devient le filet de
   * séparation entre les deux, à l'intérieur du cadre.
   *
   * Pas d'`overflow: clip` contrairement au DataTable, dont la table est bord à
   * bord par construction : ici la gouttière laisse partout une bande au moins
   * égale au rayon intérieur (aucune boîte n'atteint un angle, donc aucun rayon
   * emboîté en `calc()` à prévoir), la liste rogne déjà son propre débordement,
   * et une découpe rognerait l'anneau de focus EXTÉRIEUR du TabPanel — le seul
   * qui sorte du composant — en plus d'interdire au consommateur tout contenu
   * de panneau à fleur de bord.
   */
  .ds-tabs[data-variant='outlined'] {
    --_tabs-frame-pad: var(--ds-space-3);

    background: var(--ds-color-surface-raised);
    border: 1px solid var(--ds-color-border);
    border-radius: var(--ds-radius-surface);
  }

  .ds-tabs-bar {
    display: flex;
    /* stretch, pas center : la liste déborde d'1px dans la piste par marge
       négative, un centrage la décalerait d'un demi-pixel */
    align-items: stretch;
    /*
     * L'alignement vit sur la BARRE, pas sur la liste : celle-ci rétrécit
     * (min-size: 0) dès que les onglets débordent, il ne reste alors aucune
     * place à distribuer. Un `justify-content` posé sur un conteneur défilant
     * rendrait au contraire la partie qui déborde du côté start définitivement
     * inatteignable — `scrollLeft` ne peut pas être négatif en LTR.
     */
    justify-content: flex-start;
    gap: var(--ds-space-1);
    /* Gouttière du cadre (0 à plat). Rien au bord de FIN : c'est celui que la
       piste occupe, les onglets doivent rester posés dessus. */
    padding-block-start: var(--_tabs-frame-pad);
    padding-inline: var(--_tabs-frame-pad);
  }

  .ds-tabs[data-orientation='vertical'] .ds-tabs-bar {
    flex-direction: column;
    align-items: stretch;
    /* l'axe de la piste bascule : c'est le bord inline de FIN qui reste à fleur */
    padding-block: var(--_tabs-frame-pad);
    padding-inline-end: 0;
  }

  .ds-tabs[data-align='center'] .ds-tabs-bar {
    justify-content: center;
  }

  .ds-tabs[data-align='end'] .ds-tabs-bar {
    justify-content: flex-end;
  }

  /* Piste des variantes `flat` et `outlined` : sur la barre, pour courir aussi
     sous les boutons de défilement (frères de la liste). Encadrée, c'est elle
     qui sépare la barre des panneaux — d'où le bord de fin laissé sans
     gouttière, sinon elle ne séparerait plus rien. */
  .ds-tabs:is([data-variant='flat'], [data-variant='outlined']) .ds-tabs-bar {
    border-block-end: 1px solid var(--ds-color-border);
  }

  .ds-tabs:is([data-variant='flat'], [data-variant='outlined'])[data-orientation='vertical']
    .ds-tabs-bar {
    border-block-end: none;
    border-inline-start: 1px solid var(--ds-color-border);
  }

  /*
   * Encadré et vertical : la piste MIGRE au bord de fin. À plat elle délimite la
   * colonne d'onglets, donc au bord de départ ; dans une carte ce bord est déjà
   * tenu par la bordure du cadre (deux filets parallèles sinon) et ce qui manque
   * est la frontière barre/panneaux. Spécificité ÉGALE à la règle ci-dessus
   * (0,4,0) : l'ordre tranche, ne pas remonter ce bloc.
   */
  .ds-tabs[data-variant='outlined'][data-orientation='vertical'] .ds-tabs-bar {
    border-inline-start: none;
    border-inline-end: 1px solid var(--ds-color-border);
  }

  .ds-tabs-list {
    display: flex;
    align-items: center;
    gap: var(--ds-space-1);
    overflow: auto;
    /* la liste doit pouvoir passer sous sa taille de contenu, sinon elle
       pousse la barre au lieu de défiler */
    min-inline-size: 0;
    min-block-size: 0;
    scrollbar-width: none;
    scroll-behavior: smooth;
  }

  .ds-tabs[data-orientation='vertical'] .ds-tabs-list {
    flex-direction: column;
    align-items: stretch;
  }

  /* L'indicateur de 2px recouvre la piste de 1px au lieu de s'empiler dessus
     (marges négatives) */
  .ds-tabs:is([data-variant='flat'], [data-variant='outlined']) .ds-tabs-list {
    margin-block-end: -1px;
    /* onglets contigus : sur une piste ils forment une rangée de segments (cf.
       le rayon nul posé par Tab.vue), pas une file de boutons */
    gap: 0;
  }

  /* la liste étant 1px plus haute que les onglets, ceux-ci s'appuient sur son
     bord de fin : l'indicateur tombe alors pile sur la piste */
  .ds-tabs:is([data-variant='flat'], [data-variant='outlined'])[data-orientation='horizontal']
    .ds-tabs-list {
    align-items: flex-end;
  }

  .ds-tabs:is([data-variant='flat'], [data-variant='outlined'])[data-orientation='vertical']
    .ds-tabs-list {
    margin-block-end: 0;
    margin-inline-start: -1px;
  }

  /* Encadré et vertical : plus aucune piste au bord de départ à recouvrir — le
     débordement d'1px glisserait la liste sous la bordure du cadre. Même
     spécificité que la règle ci-dessus : l'ordre tranche. */
  .ds-tabs[data-variant='outlined'][data-orientation='vertical'] .ds-tabs-list {
    margin-inline-start: 0;
  }

  /*
   * Cas limite : `outlined` sans slot #panels — la carte se réduit à la barre.
   * Il n'y a plus de frontière à marquer et la piste doublerait la bordure du
   * cadre, collée à elle : le cadre la remplace, la gouttière se referme sur le
   * bord de fin et la liste cesse de déborder.
   */
  .ds-tabs[data-variant='outlined']:not(:has(> .ds-tabs-panels)) .ds-tabs-bar {
    border-block-end: none;
    border-inline-end: none;
    padding-block-end: var(--_tabs-frame-pad);
    padding-inline-end: var(--_tabs-frame-pad);
  }

  .ds-tabs[data-variant='outlined']:not(:has(> .ds-tabs-panels)) .ds-tabs-list {
    margin-block-end: 0;
  }

  /* Piste creuse de la variante `inset` : portée par le conteneur défilant
     lui-même, sinon son padding ne protège pas l'ombre de l'onglet actif */
  .ds-tabs[data-variant='inset'] .ds-tabs-list {
    background: var(--ds-color-surface-sunken);
    padding: var(--ds-space-1);
    border-radius: var(--ds-radius-surface);
  }

  .ds-tabs[data-grow] .ds-tabs-list {
    flex: 1;
  }

  .ds-tabs-sentinel {
    flex: 0 0 1px;
    align-self: stretch;
  }

  .ds-tabs-scroll {
    flex: none;
    /* la barre est en stretch pour la piste : les contrôles, eux, se centrent
       sur la liste (qui est plus haute qu'eux en variante inset) */
    align-self: center;
  }

  /* chevrons : la direction est physique, l'icône se retourne en RTL */
  [dir='rtl'] .ds-tabs[data-orientation='horizontal'] .ds-tabs-scroll .ds-icon {
    scale: -1 1;
  }

  .ds-tabs-panels {
    min-inline-size: 0;
    /* gouttière du cadre (0 à plat) : le panneau est la zone de contenu de la
       carte, il la prend sur ses quatre côtés */
    padding: var(--_tabs-frame-pad);
  }

  .ds-tabs[data-orientation='vertical'] .ds-tabs-panels {
    flex: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-tabs-list {
      scroll-behavior: auto;
    }
  }
}
</style>
