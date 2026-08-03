<script setup lang="ts">
/**
 * Progression en donut : SVG piloté par CSS, aucun JS de calcul. Le <svg> n'a
 * PAS de viewBox (1 unité utilisateur = 1 px) et les cercles sont positionnés
 * par les propriétés SVG2 `cx`/`cy`/`r` en longueurs pures — un viewBox fixe
 * imposerait de convertir l'épaisseur en unités de viewBox, donc de connaître
 * le ratio en JS et de le recalculer à chaque changement de taille.
 * `pathLength=100` normalise le chemin : stroke-dashoffset s'exprime alors
 * directement en pourcentage.
 *
 * Nom accessible : passer `aria-label` (fallthrough). Le rôle progressbar est
 * « children presentational » : le label affiché au centre n'est PAS annoncé.
 */
import { useProgressValue } from '../../composables/useProgressValue'
import { useMessages } from '../../i18n/state'
import { px } from '../../utils/css'

interface ProgressCircularProps {
  /** Valeur courante, bornée à [0, max]. */
  value?: number
  /** Borne haute (la borne basse est toujours 0). */
  max?: number
  /** Progression inconnue : animation continue, `value` ignorée. */
  indeterminate?: boolean
  /** Couleur sémantique. */
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'neutral'
  /**
   * Couleur custom (hex, nom CSS ou oklch()) — remplace le tone. Les nuances
   * (piste) sont dérivées par color-mix avec les tokens de thème.
   */
  color?: string
  /**
   * Diamètre, **en pixels** : `96` comme `'96'` donnent 96px. Défaut : token.
   */
  size?: number | string
  /**
   * Épaisseur du trait, **en pixels** : `8` comme `'8'` donnent 8px.
   * Défaut : 4px (token).
   */
  thickness?: number | string
  /** Bouts du trait arrondis (défaut) ou francs. */
  shape?: 'rounded' | 'square'
  /** Affiche la progression en pourcentage au centre (ignoré en indéterminé). */
  showValue?: boolean
}

const props = withDefaults(defineProps<ProgressCircularProps>(), {
  value: 0,
  max: 100,
  indeterminate: false,
  tone: 'accent',
  color: undefined,
  size: undefined,
  thickness: undefined,
  shape: 'rounded',
  showValue: false,
})

defineSlots<{
  /** Contenu au centre du donut ; prime sur `showValue`. */
  default?(props: { value: number; max: number; percent: number }): unknown
}>()

/* Le « % » et l'espace INSÉCABLE qui le précède sont une convention de
   langue (l'anglais n'en met pas) : ils vivent donc au dictionnaire. Le
   slot scopé reste la voie pour un format arbitraire. */
const m = useMessages()

const { clamped, fraction } = useProgressValue(
  () => props.value,
  () => props.max,
)
</script>

<template>
  <span
    class="v-progress-circular"
    role="progressbar"
    :data-tone="tone"
    :data-custom="color !== undefined ? '' : undefined"
    :data-shape="shape"
    :data-indeterminate="indeterminate ? '' : undefined"
    :aria-valuenow="indeterminate ? undefined : clamped"
    aria-valuemin="0"
    :aria-valuemax="max"
    :style="{
      '--fill-fraction': String(fraction),
      '--custom-color': color,
      '--progress-diameter': px(size),
      '--progress-thickness': px(thickness),
    }"
  >
    <svg class="v-progress-circular-svg" aria-hidden="true">
      <circle class="v-progress-circular-track" pathLength="100" />
      <circle class="v-progress-circular-bar" pathLength="100" />
    </svg>
    <span v-if="!indeterminate && (showValue || $slots.default)" class="v-progress-circular-label">
      <slot :value="clamped" :max="max" :percent="fraction * 100">
        {{ m.progress.percent(Math.round(fraction * 100)) }}
      </slot>
    </span>
  </span>
</template>

<style>
@layer vectis.components {
  /* Les custom properties de dimension sont déclarées sur la racine : le style
     inline posé par les props gagne ainsi systématiquement. */
  .v-progress-circular {
    --progress-diameter: var(--vectis-control-size-progress-circular-diameter);
    --progress-thickness: var(--vectis-control-size-progress-circular-thickness);
    display: inline-grid;
    inline-size: var(--progress-diameter);
    block-size: var(--progress-diameter);
    vertical-align: middle;
  }

  .v-progress-circular-svg,
  .v-progress-circular-label {
    grid-area: 1 / 1;
  }

  .v-progress-circular-svg {
    inline-size: 100%;
    block-size: 100%;
    /* Départ à midi. Propriété individuelle : elle se COMPOSE avec l'animation
       de `transform` du mode indéterminé au lieu d'être écrasée par elle. */
    rotate: -90deg;
  }

  /* RTL : la progression suit le sens de lecture (anti-horaire). Les
     propriétés individuelles se composent dans l'ordre translate → rotate →
     scale, donc le miroir s'applique avant la rotation de midi. */
  .v-progress-circular:dir(rtl) .v-progress-circular-svg {
    scale: 1 -1;
  }

  /* Géométrie 100 % CSS, en longueurs pures (aucun pourcentage : la résolution
     de `r` en pourcentage dépend de la « diagonale normalisée », inutile de
     s'y exposer puisque le diamètre est toujours une longueur). */
  .v-progress-circular-track,
  .v-progress-circular-bar {
    cx: calc(var(--progress-diameter) / 2);
    cy: calc(var(--progress-diameter) / 2);
    /* max(0px, …) : une épaisseur ≥ diamètre donnerait un rayon négatif, qui
       est une erreur SVG (élément non rendu) — on dégrade sur un rayon nul. */
    r: max(0px, calc((var(--progress-diameter) - var(--progress-thickness)) / 2));
    fill: none;
    stroke-width: var(--progress-thickness);
  }

  .v-progress-circular-track {
    stroke: var(--progress-track);
  }

  .v-progress-circular-bar {
    stroke: var(--progress-fill);
    stroke-linecap: round;
    stroke-dasharray: 100;
    stroke-dashoffset: calc(100 - 100 * var(--fill-fraction));
    transition: stroke-dashoffset var(--vectis-duration-base) var(--vectis-ease-default);
  }

  .v-progress-circular[data-shape='square'] .v-progress-circular-bar {
    stroke-linecap: butt;
  }

  /* Pas de couleur de repli du texte : le label est dans le trou du donut, sur
     le fond de page, donc en couleur de texte courante. */
  .v-progress-circular[data-tone='accent'] {
    --progress-fill: var(--vectis-color-accent);
    --progress-track: var(--vectis-color-accent-surface);
  }

  .v-progress-circular[data-tone='success'] {
    --progress-fill: var(--vectis-color-success);
    --progress-track: var(--vectis-color-success-surface);
  }

  .v-progress-circular[data-tone='danger'] {
    --progress-fill: var(--vectis-color-danger);
    --progress-track: var(--vectis-color-danger-surface);
  }

  .v-progress-circular[data-tone='warning'] {
    --progress-fill: var(--vectis-color-warning);
    --progress-track: var(--vectis-color-warning-surface);
  }

  /* Neutral : inversion text/surface. */
  .v-progress-circular[data-tone='neutral'] {
    --progress-fill: var(--vectis-color-text);
    --progress-track: var(--vectis-color-surface-muted);
  }

  /* Après les tones : même spécificité, le dernier gagne. */
  .v-progress-circular[data-custom] {
    --progress-fill: var(--custom-color);
    --progress-track: color-mix(in oklab, var(--custom-color), var(--vectis-color-surface) 85%);
  }

  .v-progress-circular-label {
    display: flex;
    align-items: center;
    justify-content: center;
    /* Centrage de la BOÎTE dans la cellule de grille : le max-inline-size
       ci-dessous empêche l'étirement par défaut, et un `stretch` inapplicable
       retombe sur `start` — sans ce place-self, le label serait collé au bord. */
    place-self: center;
    max-inline-size: calc(var(--progress-diameter) - var(--progress-thickness) * 2);
    color: var(--vectis-color-text);
    font-family: var(--vectis-text-family);
    /* ratio proportionnel au diamètre (tolérance déjà admise pour l'épaisseur
       du Spinner), avec plancher au token le plus petit */
    font-size: max(var(--vectis-text-caption-size), calc(var(--progress-diameter) / 4));
    font-weight: var(--vectis-text-control-weight);
    line-height: var(--vectis-text-control-leading);
    text-align: center;
  }

  /* Indéterminé : rotation d'ensemble + arc dont la longueur varie. Périodes
     volontairement différentes (×4 et ×5) — un rapport entier donnerait un
     battement mécanique. */
  .v-progress-circular[data-indeterminate] .v-progress-circular-svg {
    animation: v-spin calc(var(--vectis-duration-slow) * 4) linear infinite;
  }

  .v-progress-circular[data-indeterminate] .v-progress-circular-bar {
    animation: v-progress-circular-dash calc(var(--vectis-duration-slow) * 5)
      var(--vectis-ease-default) infinite;
    transition: none;
  }

  /* `v-spin` est partagée (styles/utilities.css) ; seule la keyframe propre à
     l'arc reste ici. */

  /* Les deux extrémités de l'arc bougent : il se rallonge, se raccourcit et
     glisse le long du cercle. */
  @keyframes v-progress-circular-dash {
    0% {
      stroke-dasharray: 5 100;
      stroke-dashoffset: 0;
    }

    50% {
      stroke-dasharray: 70 100;
      stroke-dashoffset: -20;
    }

    100% {
      stroke-dasharray: 5 100;
      stroke-dashoffset: -100;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .v-progress-circular-bar {
      transition: none;
    }

    /* Un loader immobile perdrait sa fonction : ralentir, pas supprimer. */
    .v-progress-circular[data-indeterminate] .v-progress-circular-svg {
      animation-duration: calc(var(--vectis-duration-slow) * 12);
    }

    .v-progress-circular[data-indeterminate] .v-progress-circular-bar {
      animation-duration: calc(var(--vectis-duration-slow) * 15);
    }
  }
}
</style>
