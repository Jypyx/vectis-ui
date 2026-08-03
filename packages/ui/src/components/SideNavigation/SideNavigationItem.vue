<script setup lang="ts">
import { computed, inject, provide, useId, useSlots } from 'vue'

import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'
import type { IconSource } from '../Icon/types'
import { sideNavigationKey } from './context'

import { useRootAttrs } from '../../composables/useRootAttrs'

/**
 * Item de navigation latérale. Deux formes, selon la présence du slot #items :
 *
 * - BRANCHE : `<details>`/`<summary>` natifs — état, activation clavier,
 *   exclusivité entre frères (`<details name>`) et animation viennent du
 *   navigateur. La rangée EST le `<summary>`, qui doit contenir tout ce qui
 *   s'affiche sur la ligne : le slot #end y vit donc, d'où le `@click.stop`
 *   (sans lui, tout clic dans ce slot basculerait la branche). Corollaire à
 *   documenter : n'y placer que du contenu NON focusable (chip, badge,
 *   compteur) — le sous-arbre d'un `<summary>` sert de nom accessible et peut
 *   être aplati par certains lecteurs d'écran.
 * - FEUILLE : la rangée est un CONTENEUR et l'action (`<a>`/`<button>`) est
 *   étirée dessus par un `::after` absolu. Le slot #end reste ainsi son FRÈRE —
 *   jamais un contrôle imbriqué dans un lien — tout en gardant la rangée
 *   entière cliquable.
 */
interface SideNavigationItemProps {
  /** Ligne secondaire sous le libellé (le slot #sublabel prime). */
  sublabel?: string
  /**
   * Icône avant le libellé : nom Material Symbols Rounded, ou rendu explicite
   * (`{ src }`, `{ component }`…). Le slot #start prime.
   */
  icon?: IconSource
  /** Feuille rendue en `<a href>` ; IGNORÉ si le slot #items est présent. */
  href?: string
  /** Item de la page courante : surbrillance accent + aria-current. */
  active?: boolean
  /** Item inerte : gris par tokens, hors parcours clavier. */
  disabled?: boolean
  /** Branche ouverte au premier rendu (l'état est ensuite natif). */
  defaultOpen?: boolean
}

// Racine de structure (<li>) : sans cette répartition, `target`, `rel`,
// `download` et les `aria-*` atterriraient sur le <li> au lieu du contrôle.
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<SideNavigationItemProps>(), {
  sublabel: undefined,
  icon: undefined,
  href: undefined,
  active: false,
  disabled: false,
  defaultOpen: false,
})

/**
 * Ouverture d'une branche. Sans v-model, l'état reste celui du DOM
 * (`defaultOpen` en valeur initiale) : la valeur liée ne changeant jamais, Vue
 * ne repatche pas et le basculement natif reste souverain.
 *
 * `null` — et non `undefined` — pour distinguer « non lié » : un modèle typé
 * `boolean` seul est déclaré `type: Boolean` au runtime, or un booléen ABSENT
 * est casté en `false` par Vue, ce qui écraserait `defaultOpen`. Un `default`
 * explicite désarme ce castage.
 */
const open = defineModel<boolean | null>('open', { default: null })

const emit = defineEmits<{
  /**
   * Émis à l'activation d'un item SANS sous-items. Ne jamais déclarer d'emit
   * `click` : Vue le retirerait de `$attrs` et le `@click` du consommateur
   * n'atteindrait plus le lien.
   */
  select: []
}>()

defineSlots<{
  /** Libellé de l'item — OBLIGATOIRE. */
  default(): unknown
  /** Sous-libellé riche (prime sur la prop `sublabel`). */
  sublabel?(): unknown
  /** Contenu libre avant le libellé (prime sur `icon`). */
  start?(): unknown
  /** Contenu libre à droite, avant le chevron. */
  end?(): unknown
  /** Sous-items (SideNavigationItem/Group/Separator, récursif sans limite). */
  items?(): unknown
}>()

const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()

const slots = useSlots()
/**
 * Présence STATIQUE du slot (modèle `hasSubmenu` de MenuItem, `hasPanels` de
 * Tabs) : déterministe en SSR, donc aucun registre réactif ni mismatch
 * d'hydratation. Contrepartie : un #items présent mais vide affiche un chevron
 * sur une liste vide.
 */
const hasChildren = computed(() => !!slots.items)
const tag = computed(() =>
  !hasChildren.value && props.href !== undefined ? ('a' as const) : ('button' as const),
)

const parent = inject(sideNavigationKey, null)

/** Icônes posées par la racine ; l'item reste utilisable seul. */
const expandIcon = computed(() => parent?.expandIcon ?? 'expand_more')
const collapseIcon = computed(() => parent?.collapseIcon)

// Nom de groupe des <details> ENFANTS : frais à chaque niveau, c'est ce qui
// rend l'exclusivité locale à un niveau plutôt que globale au document.
const childrenName = useId()

provide(sideNavigationKey, {
  get name() {
    return parent?.exclusive ? childrenName : undefined
  },
  get exclusive() {
    return parent?.exclusive ?? false
  },
  get expandIcon() {
    return expandIcon.value
  },
  get collapseIcon() {
    return collapseIcon.value
  },
})

const openAttr = computed(() => (open.value ?? props.defaultOpen) || undefined)

// Le <details> est la source de vérité : le modèle est alimenté PAR le DOM.
// L'événement `toggle` ne bulle pas, il est donc écouté sur l'élément lui-même
// et ne remonte jamais d'une branche imbriquée.
function onToggle(event: Event) {
  const value = (event.target as HTMLDetailsElement).open
  if (open.value !== value) open.value = value
}

const ariaCurrent = computed(() =>
  props.active ? (tag.value === 'a' && !hasChildren.value ? 'page' : 'true') : undefined,
)

/*
 * <summary> n'a pas d'attribut `disabled` natif : annuler le clic est le seul
 * moyen de bloquer le basculement (le clavier, lui, est couvert par
 * `tabindex="-1"`). Idiome AccordionItem — surtout pas `pointer-events: none`,
 * qui tuerait `cursor: not-allowed`.
 */
function onSummaryClick(event: MouseEvent) {
  if (props.disabled) event.preventDefault()
}

/*
 * Le slot #end d'une branche vit DANS le <summary> : `stopPropagation` n'y
 * suffirait pas — le basculement du <details> n'est pas un listener mais
 * l'action PAR DÉFAUT du clic, que seul `preventDefault` annule.
 *
 * Sauf si le clic vise déjà un élément activable : il est alors sa PROPRE
 * cible d'activation, le <details> n'est pas concerné, et annuler le défaut
 * casserait sa navigation. Même filtre que le `onPanelMousedown` de
 * `useFieldPanel`, pour la même raison.
 */
function onEndClick(event: MouseEvent) {
  const cible = event.target as Element | null
  if (!cible?.closest('button, a, input, select, textarea, [tabindex]')) event.preventDefault()
}

function onActionClick(event: MouseEvent) {
  // <button disabled> ne reçoit pas le clic ; le lien inerte, si.
  if (props.disabled) {
    event.preventDefault()
    return
  }
  emit('select')
}
</script>

<template>
  <li class="v-side-nav-item" :class="rootClass" :style="rootStyle">
    <details
      v-if="hasChildren"
      class="v-side-nav-branch"
      :name="parent?.name"
      :open="openAttr"
      :data-swap="collapseIcon ? '' : undefined"
      @toggle="onToggle"
    >
      <summary
        v-bind="forwardedAttrs"
        class="v-side-nav-row"
        :data-active="active ? '' : undefined"
        :data-disabled="disabled ? '' : undefined"
        :aria-current="ariaCurrent"
        :aria-disabled="disabled || undefined"
        :tabindex="disabled ? -1 : undefined"
        @click="onSummaryClick"
      >
        <slot name="start">
          <Icon v-if="icon" class="v-side-nav-icon" v-bind="iconProps(icon)" />
        </slot>
        <span class="v-side-nav-content">
          <span class="v-side-nav-label"><slot /></span>
          <span v-if="sublabel !== undefined || $slots.sublabel" class="v-side-nav-sublabel">
            <slot name="sublabel">{{ sublabel }}</slot>
          </span>
        </span>
        <!-- Le slot vit DANS le <summary>, dont TOUT clic bascule le <details> :
             sans `onEndClick`, une pastille ouvrirait la branche. -->
        <span v-if="$slots.end" class="v-side-nav-end" @click="onEndClick"
          ><slot name="end"
        /></span>
        <Icon class="v-side-nav-chevron" v-bind="iconProps(expandIcon)" />
        <!-- Deux chevrons rendus, permutation 100 % CSS sur [open] (idiome Accordion) -->
        <Icon
          v-if="collapseIcon"
          class="v-side-nav-chevron v-side-nav-chevron-open"
          v-bind="iconProps(collapseIcon)"
        />
      </summary>
      <ul class="v-side-nav-children">
        <slot name="items" />
      </ul>
    </details>

    <div
      v-else
      class="v-side-nav-row"
      :data-active="active ? '' : undefined"
      :data-disabled="disabled ? '' : undefined"
    >
      <component
        :is="tag"
        v-bind="forwardedAttrs"
        class="v-side-nav-action"
        :type="tag === 'button' ? 'button' : undefined"
        :disabled="tag === 'button' ? disabled : undefined"
        :href="tag === 'a' && !disabled ? href : undefined"
        :aria-disabled="tag === 'a' && disabled ? 'true' : undefined"
        :aria-current="ariaCurrent"
        @click="onActionClick"
      >
        <slot name="start">
          <Icon v-if="icon" class="v-side-nav-icon" v-bind="iconProps(icon)" />
        </slot>
        <span class="v-side-nav-content">
          <span class="v-side-nav-label"><slot /></span>
          <span v-if="sublabel !== undefined || $slots.sublabel" class="v-side-nav-sublabel">
            <slot name="sublabel">{{ sublabel }}</slot>
          </span>
        </span>
      </component>
      <span v-if="$slots.end" class="v-side-nav-end"><slot name="end" /></span>
    </div>
  </li>
</template>

<style>
@layer vectis.components {
  /*
   * PROFONDEUR — compteur 100 % CSS : ni registre, ni provide/inject, ni style
   * inline, ni prop `level` à passer à la main. La structure fournit deux
   * éléments par niveau (<li> puis <ul>), et chaque élément lit un nom qu'il ne
   * DÉCLARE pas.
   *
   * ⚠ La forme à un seul nom — `--side-nav-level: calc(var(--side-nav-level, 0) + 1)` — est un
   * CYCLE (CSS Variables §3), y compris quand la valeur lue est celle héritée :
   * la propriété tombe en « guaranteed-invalid », `var(--side-nav-level, 0)` retombe
   * partout sur 0 et l'arbre s'affiche PLAT, sans la moindre erreur console.
   */
  .v-side-nav-item {
    --side-nav-parent-level: var(--side-nav-level, 0);
  }

  .v-side-nav-children {
    --side-nav-level: calc(var(--side-nav-parent-level) + 1);
  }

  .v-side-nav-branch {
    /* Le repli natif : l'animation vit sur ::details-content, plus bas. */
    min-inline-size: 0;
  }

  .v-side-nav-row {
    /*
     * Taille : variables `--control-*` héritées du <nav>, seul porteur de
     * `v-control` (styles/control-size.css) — les icônes suivent sans une
     * ligne de CSS, `--vectis-icon-size`/`-opsz` font partie du même bloc.
     *
     * Typo composite, comme .v-menu-item : la TAILLE vient de l'échelle, le
     * leading reste celui de `body-md` (ratio unitless, donc il suit) et le
     * poids reste regular — la recette `control` vaut medium/1, or une rangée
     * peut passer à la ligne et porter un sous-libellé.
     *
     * Le `calc` du retrait est écrit ICI et non dans une variable posée plus
     * haut : une custom property est substituée sur l'élément qui la DÉCLARE,
     * une `--side-nav-pad-start` posée sur la racine serait figée au niveau 0.
     */
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--control-gap);
    min-block-size: var(--control-height);
    padding-block: var(--vectis-space-1);
    padding-inline: calc(
        var(--control-padding-inline) + var(--side-nav-level, 0) * var(--side-nav-indent)
      )
      var(--control-padding-inline);
    border-radius: var(--vectis-radius-sm);
    color: var(--vectis-color-text);
    font-size: var(--control-font-size);
    line-height: var(--vectis-text-body-md-leading);
    list-style: none;
    cursor: pointer;
  }

  /* Le marqueur natif du <summary> : list-style ne suffit pas sur WebKit */
  .v-side-nav-row::-webkit-details-marker {
    display: none;
  }

  .v-side-nav-action {
    /* Rangée feuille : l'action est un enfant, le retrait reste porté par la
       rangée — c'est le fond de survol qui doit rester pleine largeur. */
    flex: 1;
    min-inline-size: 0;
    display: flex;
    align-items: center;
    gap: var(--control-gap);
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    text-align: start;
    text-decoration: none;
    cursor: inherit;
  }

  /*
   * Zone cliquable étendue à TOUTE la rangée, sans envelopper le slot de fin.
   * Peinte comme descendant positionné (CSS 2.1 App. E, étape 8) : elle
   * recouvre le chevron, non positionné, mais passe SOUS `.v-side-nav-end`,
   * postérieur dans l'arbre et positionné lui aussi.
   */
  .v-side-nav-action::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--vectis-radius-sm);
  }

  .v-side-nav-content {
    flex: 1;
    min-inline-size: 0;
    display: flex;
    flex-direction: column;
  }

  .v-side-nav-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .v-side-nav-sublabel {
    overflow: hidden;
    font-size: var(--vectis-text-caption-size);
    color: var(--vectis-color-text-muted);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .v-side-nav-icon {
    flex: none;
    color: var(--vectis-color-text-muted);
  }

  /* Positionné → peint au-dessus de la zone cliquable étendue, donc cliquable. */
  .v-side-nav-end {
    position: relative;
    flex: none;
    display: flex;
    align-items: center;
    gap: var(--vectis-space-1);
  }

  /* Chevron : bas quand fermé, retourné quand ouvert. Rotation sur l'axe
     vertical → aucun miroir RTL (contrairement au chevron latéral de Menu). */
  .v-side-nav-chevron {
    flex: none;
    color: var(--vectis-color-text-muted);
    transition: rotate var(--vectis-duration-base) var(--vectis-ease-default);
  }

  .v-side-nav-branch[open]:not([data-swap]) > .v-side-nav-row > .v-side-nav-chevron {
    rotate: 180deg;
  }

  /* Permutation des deux chevrons (data-swap = collapseIcon fournie) */
  .v-side-nav-branch[data-swap][open]
    > .v-side-nav-row
    > .v-side-nav-chevron:not(.v-side-nav-chevron-open),
  .v-side-nav-branch[data-swap]:not([open]) > .v-side-nav-row > .v-side-nav-chevron-open {
    display: none;
  }

  .v-side-nav-row:hover:not([data-disabled]) {
    background: var(--vectis-color-surface-muted);
  }

  /*
   * Focus : la branche est elle-même focusable ; la feuille ne l'est qu'à
   * travers son action, dont l'anneau est porté par la zone étendue — il
   * encadre donc la rangée entière. `outline-offset` NÉGATIF dans les deux cas :
   * `::details-content` est en `overflow: clip`, un anneau tiré vers
   * l'extérieur y serait rogné.
   */
  .v-side-nav-row:focus-visible,
  .v-side-nav-action:focus-visible::after {
    outline: var(--vectis-focus-ring-width) solid var(--vectis-focus-ring-color);
    outline-offset: calc(var(--vectis-focus-ring-offset) * -1);
  }

  .v-side-nav-action:focus-visible {
    outline: none;
  }

  /* Page courante */
  .v-side-nav-row[data-active] {
    background: var(--vectis-color-accent-surface);
    color: var(--vectis-color-accent-text);
  }

  .v-side-nav-row[data-active] .v-side-nav-label {
    font-weight: var(--vectis-text-label-weight);
  }

  .v-side-nav-row[data-active] .v-side-nav-icon,
  .v-side-nav-row[data-active] .v-side-nav-sublabel,
  .v-side-nav-row[data-active] .v-side-nav-chevron {
    color: inherit;
  }

  .v-side-nav-row[data-active]:hover {
    /* assombrit légèrement la surface accent (idiome MenuItem) */
    background: color-mix(
      in oklab,
      var(--vectis-color-accent-surface),
      var(--vectis-color-accent-text) 8%
    );
  }

  /* Une branche REPLIÉE qui contient la page courante reste signalée. Le
     `:has()` est volontairement descendant : il doit matcher à toute profondeur. */
  .v-side-nav-branch:not([open]):has(.v-side-nav-children [aria-current])
    > .v-side-nav-row:not([data-active]) {
    color: var(--vectis-color-accent-text);
  }

  /* Désactivé : nuances de gris par tokens (jamais d'opacité) */
  .v-side-nav-row[data-disabled] {
    color: var(--vectis-color-text-subtle);
    cursor: not-allowed;
  }

  /* text-muted est plus foncé que text-subtle : tout suit le libellé */
  .v-side-nav-row[data-disabled] .v-side-nav-icon,
  .v-side-nav-row[data-disabled] .v-side-nav-sublabel,
  .v-side-nav-row[data-disabled] .v-side-nav-chevron {
    color: inherit;
  }

  /* Ouverture animée en pur CSS (::details-content, progressive enhancement) */
  .v-side-nav-branch::details-content {
    block-size: 0;
    overflow: clip;
    transition:
      block-size var(--vectis-duration-base) var(--vectis-ease-default),
      content-visibility var(--vectis-duration-base) allow-discrete;
  }

  .v-side-nav-branch[open]::details-content {
    block-size: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    .v-side-nav-chevron,
    .v-side-nav-branch::details-content {
      transition: none;
    }
  }
}
</style>
