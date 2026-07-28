<script setup lang="ts">
import { computed, nextTick, provide, ref, useId, useSlots, watch } from 'vue'

import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'
import IconButton from '../IconButton/IconButton.vue'
import { panelIdFor, tabIdFor, tabsKey } from './context'

import { arrowNavigate, navigableItems } from '../../utils/arrowNav'

import { useRootAttrs } from '../../composables/useRootAttrs'
import { useAriaLabel } from '../../composables/useAriaLabel'

export type TabsVariant = 'line' | 'inset'
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
  /** `line` : onglets ghost soulignés. `inset` : contrôle segmenté dans une piste creuse. */
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
  /** Icône du bouton de défilement amont : nom Material ou URL. Défaut selon l'orientation. */
  prevIcon?: string
  /** Icône du bouton de défilement aval : nom Material ou URL. Défaut selon l'orientation. */
  nextIcon?: string
  prevLabel?: string
  nextLabel?: string
  /** `automatic` : la sélection suit le focus (recommandation APG pour des panneaux instantanés). */
  activation?: TabsActivation
  /** Nom accessible de la liste d'onglets. */
  label?: string
}

const props = withDefaults(defineProps<TabsProps>(), {
  variant: 'line',
  tone: 'accent',
  size: 'md',
  compact: false,
  orientation: 'horizontal',
  align: 'start',
  grow: false,
  scrollButtons: false,
  prevIcon: undefined,
  nextIcon: undefined,
  prevLabel: 'Onglets précédents',
  nextLabel: 'Onglets suivants',
  activation: 'manual',
  label: 'Onglets',
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
const ariaLabel = useAriaLabel(() => props.label)

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
        :label="prevLabel"
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
        :label="nextLabel"
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
    display: flex;
    flex-direction: column;
    font-family: var(--ds-text-family);
  }

  /* Vertical : la barre et les panneaux se placent côte à côte */
  .ds-tabs[data-orientation='vertical'] {
    flex-direction: row;
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
  }

  .ds-tabs[data-orientation='vertical'] .ds-tabs-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .ds-tabs[data-align='center'] .ds-tabs-bar {
    justify-content: center;
  }

  .ds-tabs[data-align='end'] .ds-tabs-bar {
    justify-content: flex-end;
  }

  /* Piste de la variante `line` : sur la barre, pour courir aussi sous les
     boutons de défilement (frères de la liste) */
  .ds-tabs[data-variant='line'] .ds-tabs-bar {
    border-block-end: 1px solid var(--ds-color-border);
  }

  .ds-tabs[data-variant='line'][data-orientation='vertical'] .ds-tabs-bar {
    border-block-end: none;
    border-inline-start: 1px solid var(--ds-color-border);
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
  .ds-tabs[data-variant='line'] .ds-tabs-list {
    margin-block-end: -1px;
  }

  /* la liste étant 1px plus haute que les onglets, ceux-ci s'appuient sur son
     bord de fin : l'indicateur tombe alors pile sur la piste */
  .ds-tabs[data-variant='line'][data-orientation='horizontal'] .ds-tabs-list {
    align-items: flex-end;
  }

  .ds-tabs[data-variant='line'][data-orientation='vertical'] .ds-tabs-list {
    margin-block-end: 0;
    margin-inline-start: -1px;
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
