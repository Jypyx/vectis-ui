<script setup lang="ts">
import { computed, inject, useSlots } from 'vue'

import VButton from '../VButton/VButton.vue'
import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import type { IconSource } from '../VIcon/types'
import { tabsKey } from './context'

/**
 * Un onglet. C'est un `VButton` : tone, variante, taille, focus et
 * désactivation viennent de lui, seuls les attributs ARIA du pattern tabs sont
 * ajoutés (ils traversent le fallthrough de VButton jusqu'au <button> rendu).
 *
 * L'onglet reste rendu hors d'un `VTabs` (comme VAccordionItem hors VAccordion),
 * simplement jamais sélectionné.
 */
interface TabProps {
  /** Identifie l'onglet et le `VTabPanel` correspondant. */
  value: string | number
  /** Libellé visible ; le slot par défaut prime. */
  label?: string
  /** Icône de début : nom, ou rendu explicite. */
  icon?: IconSource
  /** Onglet inerte : ni cliquable ni atteignable, gris par tokens. */
  disabled?: boolean
}

const props = withDefaults(defineProps<TabProps>(), {
  label: undefined,
  icon: undefined,
  disabled: false,
})

defineSlots<{
  /** Contenu libre de l'onglet (remplace `label`). */
  default?(): unknown
}>()

const slots = useSlots()
const tabs = inject(tabsKey, null)

const selected = computed(() => tabs != null && tabs.value === props.value)
const tabId = computed(() => tabs?.tabId(props.value))
const panelId = computed(() => (tabs?.hasPanels ? tabs.panelId(props.value) : undefined))

/** Aucun libellé visible : l'onglet se réduit à un carré, comme un VIconButton. */
const iconOnly = computed(() => Boolean(props.icon) && !props.label && !slots.default)

/*
 * Activation automatique (option APG) : la sélection suit le focus. Elle vit
 * ici et non dans le handler clavier de VTabs, qui devrait sinon faire transiter
 * la valeur par un attribut du DOM — et perdrait l'union `string | number`.
 */
function onFocus() {
  if (tabs?.activation === 'automatic' && !props.disabled) tabs.select(props.value)
}
</script>

<template>
  <VButton
    :id="tabId"
    class="v-tab"
    role="tab"
    :aria-selected="selected ? 'true' : 'false'"
    :aria-controls="panelId"
    :tabindex="selected ? 0 : -1"
    :variant="selected && tabs?.variant === 'inset' ? 'elevated' : 'ghost'"
    :tone="selected ? (tabs?.tone ?? 'accent') : 'neutral'"
    :size="tabs?.size ?? 'md'"
    :compact="tabs?.compact ?? false"
    :disabled="disabled"
    :data-icon-only="iconOnly ? '' : undefined"
    @click="tabs?.select(value)"
    @focus="onFocus"
  >
    <template v-if="icon" #start>
      <VIcon v-bind="iconProps(icon)" />
    </template>
    <!-- le libellé est enveloppé : `text-overflow` ne s'applique pas au texte
         anonyme d'un conteneur flex, et `grow` doit pouvoir le tronquer -->
    <span v-if="!iconOnly" class="v-tab-label"
      ><slot>{{ label }}</slot></span
    >
  </VButton>
</template>

<style>
@layer vectis.components {
  /*
   * Surcharges de VButton qualifiées par [data-size] (toujours rendu par
   * VButton) : elles battent .v-button[data-variant='…'] quel que soit l'ordre
   * du CSS bundlé — même hack de spécificité que .v-icon-button.
   */
  .v-tab[data-size] {
    /* ancre de l'indicateur ::after ; .v-button ne pose pas de position */
    position: relative;
    /*
     * Jamais compressé : c'est CE QUI produit le débordement de la liste. Sans
     * `flex: none`, les onglets rétréciraient jusqu'à leur taille min-content
     * et le défilement ne se déclencherait jamais.
     */
    flex: none;
    white-space: nowrap;
  }

  .v-tab[data-size][data-icon-only] {
    padding-inline: 0;
    min-inline-size: var(--control-height);
  }

  /*
   * L'onglet vit dans un conteneur `overflow: auto` qui rognerait un
   * outline-offset positif : anneau intérieur.
   */
  .v-tab[data-size]:focus-visible {
    outline-offset: calc(var(--vectis-focus-ring-offset) * -1);
  }

  .v-tab-label {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .v-tabs[data-grow] .v-tab[data-size] {
    flex: 1 1 0;
    min-inline-size: 0;
  }

  /* Rayon emboîté dans la piste creuse (rayon de surface moins son padding) */
  .v-tabs[data-variant='inset'] .v-tab[data-size] {
    border-radius: calc(var(--vectis-radius-surface) - var(--vectis-space-1));
  }

  /*
   * Sur une piste, les onglets sont des SEGMENTS contigus et à angles droits :
   * ce sont l'indicateur et la piste qui découpent la barre, pas la silhouette
   * des boutons. Un rayon laisserait des angles clairs au-dessus du filet, et un
   * écart couperait la rangée de surbrillances au survol. Le `gap` est retiré
   * sur la liste et non ici (c'est elle qui le pose) ; celui de la barre reste,
   * il sépare les boutons de défilement, pas les onglets.
   */
  .v-tabs:is([data-variant='flat'], [data-variant='outlined']) .v-tab[data-size] {
    border-radius: 0;
  }

  /*
   * Encadrée, la rangée reprend son rayon aux seules EXTRÉMITÉS — coutures
   * internes carrées, idiome VButtonGroup, mais transposé sur le seul bord que la
   * piste n'occupe pas (elle tient l'autre). Le rayon est celui du bouton et non
   * celui de la carte : la rangée est en retrait du cadre par la gouttière, elle
   * n'a pas sa découpe à épouser. `:first-of-type`/`:last-of-type` et non
   * `:first-child`/`:last-child` — les sentinelles de butée du défilement sont
   * les vrais premier et dernier enfants de la liste (ce sont des `span`, les
   * onglets les seuls `button`).
   */
  .v-tabs[data-variant='outlined'] .v-tab[data-size]:first-of-type {
    border-start-start-radius: var(--vectis-radius-interactive);
  }

  .v-tabs[data-variant='outlined'][data-orientation='horizontal'] .v-tab[data-size]:last-of-type {
    border-start-end-radius: var(--vectis-radius-interactive);
  }

  /* vertical : la piste ayant migré au bord de fin, le bord libre est celui de
     départ — les extrémités de la colonne y arrondissent leurs coins */
  .v-tabs[data-variant='outlined'][data-orientation='vertical'] .v-tab[data-size]:last-of-type {
    border-end-start-radius: var(--vectis-radius-interactive);
  }

  /*
   * Indicateur des variantes `flat` et `outlined`. `currentColor` plutôt qu'une
   * variable privée de VButton : il suit le tone de l'onglet actif ET le gris de
   * l'état désactivé, sans couplage.
   */
  .v-tabs:is([data-variant='flat'], [data-variant='outlined']) .v-tab[data-size]::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    inset-block-end: 0;
    block-size: var(--vectis-control-size-tab-indicator);
    background: currentColor;
    opacity: 0;
    transition: opacity var(--vectis-duration-fast) var(--vectis-ease-default);
  }

  .v-tabs:is([data-variant='flat'], [data-variant='outlined'])[data-orientation='vertical']
    .v-tab[data-size]::after {
    inset-block: 0;
    inset-inline: auto;
    inset-inline-start: 0;
    block-size: auto;
    inline-size: var(--vectis-control-size-tab-indicator);
  }

  .v-tabs:is([data-variant='flat'], [data-variant='outlined'])
    .v-tab[data-size][aria-selected='true']::after {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-tabs:is([data-variant='flat'], [data-variant='outlined']) .v-tab[data-size]::after {
      transition: none;
    }
  }
}
</style>
