<script setup lang="ts">
/**
 * Placeholder de chargement 100 % CSS : la silhouette d'un composant du design
 * system pendant que son contenu arrive.
 *
 * La racine est un CONTENEUR (modèle VSpinner) et non la silhouette peinte
 * (modèle VProgressLinear) : c'est ce qui rend `lines` gratuit et garde TOUS les
 * sélecteurs uniformes — pas un cas « racine peinte » et un cas « enfant
 * peint ». Elle porte `v-control`, donc `size`/`compact` réutilisent la table
 * unique des hauteurs du DS : un skeleton `md` fait exactement la hauteur d'un
 * VButton `md`.
 *
 * Le composant ne MESURE jamais rien : aucune silhouette n'est déduite du
 * contenu qu'elle remplace, elle est déclarée. Les trois `computed` sont le
 * seul JS — ni événement, ni cycle de vie, ni DOM (précédent assumé de VSpinner
 * depuis son libellé).
 */
import { computed } from 'vue'

import { useMessages } from '../../i18n/state'
import { cssSize } from '../../utils/css'

export type SkeletonShape = 'text' | 'control' | 'pill' | 'circle' | 'surface'
export type SkeletonAnimation = 'wave' | 'pulse' | 'none'
export type SkeletonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface SkeletonLoaderProps {
  /**
   * Silhouette à épouser — chaque valeur pose un rayon du DS et une règle de
   * hauteur :
   * - `text` (défaut) : hauteur `1em`, centrée dans la boîte de ligne héritée —
   *   la silhouette suit la typo du parent et N lignes occupent exactement
   *   N lignes de texte ; rayon pilule.
   * - `control` : hauteur prise sur l'échelle des contrôles (`size`), rayon
   *   interactif — VButton, VInput, Select.
   * - `pill` : idem `control` en rayon pilule — VChip, VBadge.
   * - `circle` : idem `control` en ratio 1:1 — VAvatar, VIconButton rond.
   * - `surface` : rayon de surface, hauteur par défaut au token — carte, image.
   */
  shape?: SkeletonShape
  /**
   * Taille sur l'échelle des contrôles du DS (24/32/40/48/56px). N'agit que sur
   * `control`, `pill` et `circle` : `text` suit la typo héritée et `surface` a
   * sa propre hauteur.
   */
  size?: SkeletonSize
  /** Hauteur réduite de 4px, comme partout ailleurs dans le DS. */
  compact?: boolean
  /**
   * Largeur : nombre → px, chaîne CSS libre sinon (`'100%'`, `'12ch'`). À
   * défaut, la silhouette occupe la largeur disponible.
   */
  width?: number | string
  /** Hauteur, mêmes règles que `width` — prime sur `shape` et `size`. */
  height?: number | string
  /**
   * Nombre de silhouettes empilées. En `shape="text"`, la DERNIÈRE est
   * raccourcie : c'est ce détail qui fait lire « paragraphe » plutôt que
   * « tableau ». Borné à 1 minimum.
   */
  lines?: number
  /**
   * Animation de chargement. `none` fige la silhouette (impression, capture,
   * ou animation pilotée par un parent).
   */
  animation?: SkeletonAnimation
  /**
   * Fond custom (hex, nom CSS ou `oklch()`) — remplace le token. Le reflet de
   * la `wave` en est DÉRIVÉ : il reste correct sans second réglage.
   */
  color?: string
  /**
   * Annonce le chargement (`role="status"`). **Faux par défaut : un skeleton
   * est décoratif** — une page en contient une dizaine, et autant d'annonces
   * concurrentes seraient illisibles. L'annonce appartient au conteneur, qui
   * porte `aria-busy` (précédent VButton).
   */
  announce?: boolean
  /**
   * Texte annoncé ; **implique `announce`**. Défaut : dictionnaire du DS.
   * Préférer un libellé situé (« Chargement des résultats… ») : c'est tout
   * l'intérêt d'annoncer.
   */
  label?: string
}

const props = withDefaults(defineProps<SkeletonLoaderProps>(), {
  shape: 'text',
  size: 'md',
  compact: false,
  width: undefined,
  height: undefined,
  lines: 1,
  animation: 'wave',
  color: undefined,
  announce: false,
  label: undefined,
})

// Garde-fou : `v-for="n in 0"` ne rendrait RIEN — un skeleton invisible, donc
// un bug muet. Un flottant rendrait un nombre de lignes surprenant.
const count = computed(() => Math.max(1, Math.trunc(props.lines)))

// Fournir un `label` vaut demande d'annonce, sinon la prop serait inerte.
const announced = computed(() => props.announce || props.label !== undefined)

const m = useMessages()
// Jamais `.value.x` dans le corps du setup : la valeur serait figée.
const resolvedLabel = computed(() => props.label ?? m.value.common.loading)
</script>

<template>
  <span
    class="v-skeleton v-control"
    :data-shape="shape"
    :data-size="size"
    :data-compact="compact ? '' : undefined"
    :data-animation="animation"
    :data-custom="color !== undefined ? '' : undefined"
    :role="announced ? 'status' : undefined"
    :aria-hidden="announced ? undefined : 'true'"
    :style="{
      '--custom-color': color,
      '--skeleton-w': cssSize(width),
      '--skeleton-h': cssSize(height),
    }"
  >
    <!--
      Le libellé est rendu AVANT les silhouettes, et c'est structurel : la règle
      « dernière ligne raccourcie » s'appuie sur `.v-skeleton-item:last-child`,
      qu'un libellé rendu en dernier casserait. Verrouillé par un test unitaire.
      Il est absolument positionné (.v-visually-hidden), donc jamais un item
      flex. Rendu CONDITIONNEL : dans un sous-arbre `aria-hidden`, ce serait un
      texte mort.
    -->
    <span v-if="announced" class="v-visually-hidden">{{ resolvedLabel }}</span>
    <span v-for="n in count" :key="n" class="v-skeleton-item" />
  </span>
</template>

<style>
@layer vectis.components {
  /*
   * Toute la géométrie tient dans quatre variables locales, posées par la table
   * `[data-shape]` et surchargeables inline par les props de dimension (un
   * style inline gagne toujours sur une règle visant le même élément).
   */
  .v-skeleton {
    /* Fond : token dédié. Aucun rôle existant n'a la bonne valeur dans les DEUX
       thèmes — `surface-muted` est trop pâle en clair pour qu'une pulsation se
       voie, et `border` aurait le bon ton mais le mauvais rôle. */
    --skeleton-base: var(--vectis-color-surface-skeleton);
    /*
     * Reflet DÉRIVÉ du fond (relative color syntax) : +0,06 de clarté OKLCH.
     * Une même déclaration éclaircit correctement en clair — l'écrêtage naturel
     * à L=1 tombe pile sur le blanc de la page — ET en sombre, où le fond
     * (neutral.800) est plus CLAIR que la page (neutral.950) : viser une
     * couleur cible par `color-mix` s'inverserait d'un thème à l'autre, un
     * DELTA de clarté non. Elle suit aussi un `color` custom sans second
     * réglage. Le delta est un ratio, même famille que les opacités.
     */
    --skeleton-highlight: oklch(from var(--skeleton-base) calc(l + 0.06) c h);
    --skeleton-h: var(--control-height);
    --skeleton-radius: var(--vectis-radius-interactive);
    --skeleton-gap: var(--vectis-space-2);
    display: flex;
    flex-direction: column;
    gap: var(--skeleton-gap);
  }

  /* Spécificité (0,2,0) > (0,1,0) : indépendant de l'ordre, contrairement aux
     tones de VProgressLinear qui sont tous au même niveau. */
  .v-skeleton[data-custom] {
    --skeleton-base: var(--custom-color);
  }

  .v-skeleton-item {
    /* ancre du ::after de la wave */
    position: relative;
    /* la hauteur du token est un DÉFAUT : dans un parent de hauteur définie, la
       silhouette la prend (une carte remplit son emplacement) */
    flex: 1 1 auto;
    inline-size: var(--skeleton-w, 100%);
    block-size: var(--skeleton-h);
    /* `clip` et non `hidden` : `hidden` ferait de chaque silhouette un
       conteneur de défilement (précédent VDataTable) */
    overflow: clip;
    border-radius: var(--skeleton-radius);
    background: var(--skeleton-base);
  }

  /* --- Silhouettes ----------------------------------------------------- */

  /*
   * Ligne de texte : hauteur = 1em, donc la TYPO héritée, barre centrée dans la
   * boîte de ligne. Gouttière et padding dérivent du même interlignage, si bien
   * que N lignes occupent exactement N lignes de texte — le remplacement par le
   * contenu réel ne fait pas sauter la mise en page. `max()` protège d'un
   * parent en `line-height` serré, où l'écart deviendrait négatif.
   */
  .v-skeleton[data-shape='text'] {
    --skeleton-h: 1em;
    --skeleton-radius: var(--vectis-radius-pill);
    --skeleton-gap: max(0px, calc(1lh - 1em));
    padding-block: calc(max(0px, calc(1lh - 1em)) / 2);
  }

  /* Une ligne de texte garde sa hauteur typographique : elle ne s'étire pas
     dans un parent haut et ne s'écrase pas dans un parent bas. */
  .v-skeleton[data-shape='text'] .v-skeleton-item {
    flex: none;
  }

  /*
   * Dernière ligne raccourcie — le détail qui fait lire « paragraphe ». Le
   * sélecteur `+` garantit à lui seul qu'il y a au moins deux lignes, et le
   * ratio s'applique à la largeur EFFECTIVE, prop `width` comprise.
   */
  .v-skeleton[data-shape='text'] .v-skeleton-item + .v-skeleton-item:last-child {
    --skeleton-last-line: 0.6;
    inline-size: calc(var(--skeleton-w, 100%) * var(--skeleton-last-line));
  }

  .v-skeleton[data-shape='pill'] {
    --skeleton-radius: var(--vectis-radius-pill);
  }

  /*
   * Cercle : la largeur est TRANSFÉRÉE depuis la hauteur par `aspect-ratio` —
   * `size` seul suffit donc à changer le diamètre. La racine se compose en
   * ligne (comme un VAvatar) au lieu de barrer toute la largeur, et
   * `align-items: start` empêche l'étirement inline : un cercle reste rond.
   */
  .v-skeleton[data-shape='circle'] {
    --skeleton-radius: var(--vectis-radius-pill);
    display: inline-flex;
    align-items: start;
  }

  .v-skeleton[data-shape='circle'] .v-skeleton-item {
    /* `auto` et non 100% : c'est le ratio qui dérive la largeur. Une prop
       `width` explicite reprend la main et assume l'ovale. */
    inline-size: var(--skeleton-w, auto);
    aspect-ratio: 1;
  }

  /*
   * Surface (carte, image, bloc) : sa hauteur ne peut pas être devinée sans
   * mesurer le DOM. Token de défaut, qu'une prop `height` — ou un style
   * consommateur, non layerisé — surcharge. Même précédent que la longueur du
   * VProgressLinear vertical.
   */
  .v-skeleton[data-shape='surface'] {
    --skeleton-h: var(--vectis-control-size-skeleton-surface);
    --skeleton-radius: var(--vectis-radius-surface);
  }

  /* --- Animations ------------------------------------------------------ */

  /*
   * Pulse : un aplat du reflet monte et redescend PAR-DESSUS la silhouette.
   *
   * Faire varier l'opacité de la silhouette elle-même serait plus court, mais
   * la ferait fondre vers le fond de la PAGE — donc éclaircir en thème clair et
   * ASSOMBRIR en thème sombre, à rebours de la wave. Passer par un calque au
   * reflet dérivé donne le même sens dans les deux thèmes, et reste composité
   * (c'est toujours une opacité qu'on anime, sur un pseudo-élément).
   */
  .v-skeleton[data-animation='pulse'] .v-skeleton-item::after {
    content: '';
    position: absolute;
    inset: 0;
    background-color: var(--skeleton-highlight);
    animation: v-skeleton-pulse calc(var(--vectis-duration-slow) * 5) var(--vectis-ease-in-out)
      infinite;
  }

  /*
   * Wave : une bande de brillance traverse la silhouette.
   *
   * Le dégradé est SYMÉTRIQUE (transparent → reflet → transparent) : son angle
   * physique est donc sans effet observable, il n'y a rien à inverser en RTL.
   * Seul le SENS de la course compte, et il s'inverse par `animation-direction`
   * — exact ici parce que la course est `linear`, donc réversible à l'identique
   * (même argument que le mode indéterminé de VProgressLinear, dont la courbe
   * symétrique autorise la relecture à l'envers).
   *
   * `translate` (composited) plutôt qu'une course en propriétés logiques comme
   * VProgressLinear : ce composant n'a pas d'orientation verticale, la seule
   * variable est le RTL — une règle. Le compromis s'inverse donc : une page
   * peut contenir douze skeletons, la composition n'est plus négociable.
   */
  .v-skeleton[data-animation='wave'] .v-skeleton-item::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: linear-gradient(90deg, transparent, var(--skeleton-highlight), transparent);
    animation: v-skeleton-wave calc(var(--vectis-duration-slow) * 5) linear infinite;
  }

  /* Qualifié `wave` : le pulse partage ce calque mais sa course est symétrique,
     l'inverser n'y voudrait rien dire. */
  .v-skeleton[data-animation='wave']:dir(rtl) .v-skeleton-item::after {
    animation-direction: reverse;
  }

  /* Keyframes LOCALES : elles ne servent qu'à ce composant, elles restent donc
     dans son <style>, à l'intérieur du layer (précédent
     `v-progress-linear-indeterminate`). Seule `v-spin`, partagée par deux
     composants, vit hors layer dans styles/utilities.css. */
  @keyframes v-skeleton-pulse {
    from,
    to {
      opacity: 0;
    }

    50% {
      opacity: 1;
    }
  }

  @keyframes v-skeleton-wave {
    from {
      translate: -100% 0;
    }

    to {
      translate: 100% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    /*
     * Doctrine du DS : ralentir, pas supprimer — un placeholder immobile ne dit
     * plus « en cours ». Mais la wave est un DÉPLACEMENT, précisément ce que
     * ces utilisateurs signalent : elle RETOMBE sur la pulsation, qui garde le
     * signal sans translation. Les deux sont fortement ralenties.
     *
     * Les deux animations partagent le même calque : il ne reste qu'à troquer
     * le dégradé mobile contre l'aplat du reflet. La règle est à spécificité
     * ÉGALE de celles de `wave` et de `pulse` — c'est sa position en fin de
     * feuille qui tranche.
     */
    .v-skeleton:is([data-animation='wave'], [data-animation='pulse']) .v-skeleton-item::after {
      background-image: none;
      background-color: var(--skeleton-highlight);
      animation: v-skeleton-pulse calc(var(--vectis-duration-slow) * 15) var(--vectis-ease-in-out)
        infinite;
    }
  }
}
</style>
