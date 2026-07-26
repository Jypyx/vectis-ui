<script setup lang="ts">
/**
 * Progression en donut. Aucune primitive native : SVG piloté par CSS.
 *
 * Toute la géométrie est CSS, sans un octet de JS de calcul : le <svg> n'a
 * PAS de viewBox (donc 1 unité utilisateur = 1 px, aucun facteur d'échelle à
 * compenser) et les cercles sont positionnés par les propriétés de géométrie
 * SVG2 `cx`/`cy`/`r` dérivées des mêmes custom properties que la boîte. Un
 * viewBox fixe imposerait au contraire de convertir l'épaisseur en unités de
 * viewBox — donc de connaître le ratio diamètre/viewBox en JS, à recalculer à
 * chaque changement de taille.
 *
 * `pathLength=100` normalise la longueur du chemin : stroke-dashoffset
 * s'exprime alors directement en pourcentage de progression.
 *
 * Nom accessible : passer `aria-label` (fallthrough). Attention, le rôle
 * progressbar est « children presentational » : le label affiché au centre
 * n'est PAS annoncé, il ne remplace pas un aria-label.
 *
 * Pour un simple « chargement » sans sémantique de progression, préférer
 * Spinner (role="status") : ce composant garde role="progressbar" et la
 * continuité visuelle avec son mode déterminé.
 */
import { computed } from 'vue'

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

/** Valeur bornée à [0, max]. */
const clamped = computed(() => Math.min(Math.max(props.value, 0), Math.max(props.max, 0)))

/** Fraction [0, 1] pilotant tout le rendu. `props.max || 1` neutralise max: 0. */
const fraction = computed(() => clamped.value / (props.max || 1))

/**
 * Dimensions toujours en pixels : `96` comme `'96'` donnent `96px`. Une valeur
 * non numérique retourne undefined plutôt qu'une custom property invalide, qui
 * casserait la géométrie au lieu de retomber sur le token.
 */
const px = (v: number | string | undefined) => {
  if (v === undefined) return undefined
  const n = typeof v === 'number' ? v : Number.parseFloat(v)
  return Number.isFinite(n) ? `${n}px` : undefined
}
</script>

<template>
  <span
    class="ds-progress-circular"
    role="progressbar"
    :data-tone="tone"
    :data-custom="color !== undefined ? '' : undefined"
    :data-shape="shape"
    :data-indeterminate="indeterminate ? '' : undefined"
    :aria-valuenow="indeterminate ? undefined : clamped"
    aria-valuemin="0"
    :aria-valuemax="max"
    :style="{
      '--_f': String(fraction),
      '--_custom': color,
      '--_diameter': px(size),
      '--_thickness': px(thickness),
    }"
  >
    <svg class="ds-progress-circular-svg" aria-hidden="true">
      <circle class="ds-progress-circular-track" pathLength="100" />
      <circle class="ds-progress-circular-bar" pathLength="100" />
    </svg>
    <span v-if="!indeterminate && (showValue || $slots.default)" class="ds-progress-circular-label">
      <slot :value="clamped" :max="max" :percent="fraction * 100">
        {{ Math.round(fraction * 100) }}&nbsp;%
      </slot>
    </span>
  </span>
</template>

<style>
@layer ds.components {
  /* Les custom properties de dimension sont déclarées sur la racine : le style
     inline posé par les props gagne ainsi systématiquement. */
  .ds-progress-circular {
    --_diameter: var(--ds-control-size-progress-circular-diameter);
    --_thickness: var(--ds-control-size-progress-circular-thickness);
    display: inline-grid;
    inline-size: var(--_diameter);
    block-size: var(--_diameter);
    vertical-align: middle;
  }

  /* Superposition SVG / label sans position absolue. */
  .ds-progress-circular-svg,
  .ds-progress-circular-label {
    grid-area: 1 / 1;
  }

  .ds-progress-circular-svg {
    inline-size: 100%;
    block-size: 100%;
    /* Départ à midi. Propriété individuelle : elle se COMPOSE avec l'animation
       de `transform` du mode indéterminé au lieu d'être écrasée par elle. */
    rotate: -90deg;
  }

  /* RTL : la progression suit le sens de lecture (anti-horaire). Les
     propriétés individuelles se composent dans l'ordre translate → rotate →
     scale, donc le miroir s'applique avant la rotation de midi. */
  .ds-progress-circular:dir(rtl) .ds-progress-circular-svg {
    scale: 1 -1;
  }

  /* Géométrie 100 % CSS, en longueurs pures (aucun pourcentage : la résolution
     de `r` en pourcentage dépend de la « diagonale normalisée », inutile de
     s'y exposer puisque le diamètre est toujours une longueur). */
  .ds-progress-circular-track,
  .ds-progress-circular-bar {
    cx: calc(var(--_diameter) / 2);
    cy: calc(var(--_diameter) / 2);
    /* max(0px, …) : une épaisseur ≥ diamètre donnerait un rayon négatif, qui
       est une erreur SVG (élément non rendu) — on dégrade sur un rayon nul. */
    r: max(0px, calc((var(--_diameter) - var(--_thickness)) / 2));
    fill: none;
    stroke-width: var(--_thickness);
  }

  .ds-progress-circular-track {
    stroke: var(--_track);
  }

  .ds-progress-circular-bar {
    stroke: var(--_fill);
    stroke-linecap: round;
    /* pathLength=100 : le chemin fait 100 unités, dashoffset = reste à parcourir */
    stroke-dasharray: 100;
    stroke-dashoffset: calc(100 - 100 * var(--_f));
    transition: stroke-dashoffset var(--ds-duration-base) var(--ds-ease-default);
  }

  .ds-progress-circular[data-shape='square'] .ds-progress-circular-bar {
    stroke-linecap: butt;
  }

  /* --- Tones : variables locales uniquement (mêmes valeurs que ProgressLinear,
     sans couleur de repli du texte : le label est dans le trou du donut, sur le
     fond de page, donc en couleur de texte courante) --- */
  .ds-progress-circular[data-tone='accent'] {
    --_fill: var(--ds-color-accent);
    --_track: var(--ds-color-accent-surface);
  }

  .ds-progress-circular[data-tone='success'] {
    --_fill: var(--ds-color-success);
    --_track: var(--ds-color-success-surface);
  }

  .ds-progress-circular[data-tone='danger'] {
    --_fill: var(--ds-color-danger);
    --_track: var(--ds-color-danger-surface);
  }

  .ds-progress-circular[data-tone='warning'] {
    --_fill: var(--ds-color-warning);
    --_track: var(--ds-color-warning-surface);
  }

  /* Neutral : inversion text/surface (modèle Chip/Badge). */
  .ds-progress-circular[data-tone='neutral'] {
    --_fill: var(--ds-color-text);
    --_track: var(--ds-color-surface-muted);
  }

  /* --- Couleur custom : après les tones (même spécificité, dernier gagne) --- */
  .ds-progress-circular[data-custom] {
    --_fill: var(--_custom);
    --_track: color-mix(in oklab, var(--_custom), var(--ds-color-surface) 85%);
  }

  .ds-progress-circular-label {
    display: flex;
    align-items: center;
    justify-content: center;
    /* Centrage de la BOÎTE dans la cellule de grille : le max-inline-size
       ci-dessous empêche l'étirement par défaut, et un `stretch` inapplicable
       retombe sur `start` — sans ce place-self, le label serait collé au bord. */
    place-self: center;
    /* rester dans le trou du donut */
    max-inline-size: calc(var(--_diameter) - var(--_thickness) * 2);
    color: var(--ds-color-text);
    font-family: var(--ds-font-family-sans);
    /* ratio proportionnel au diamètre (tolérance déjà admise pour l'épaisseur
       du Spinner), avec plancher au token le plus petit */
    font-size: max(var(--ds-font-size-xs), calc(var(--_diameter) / 4));
    font-weight: var(--ds-font-weight-medium);
    line-height: var(--ds-font-leading-none);
    text-align: center;
  }

  /* --- Indéterminé : rotation d'ensemble + arc dont la longueur varie.
     Périodes volontairement différentes (×4 et ×5) : un rapport entier
     donnerait un battement mécanique. --- */
  .ds-progress-circular[data-indeterminate] .ds-progress-circular-svg {
    animation: ds-spin calc(var(--ds-duration-slow) * 4) linear infinite;
  }

  .ds-progress-circular[data-indeterminate] .ds-progress-circular-bar {
    animation: ds-progress-circular-dash calc(var(--ds-duration-slow) * 5) var(--ds-ease-default)
      infinite;
    transition: none;
  }

  /* Même définition que dans Spinner.vue : les keyframes CSS sont globales, la
     double déclaration (identique) rend chaque fichier autonome. */
  @keyframes ds-spin {
    to {
      transform: rotate(1turn);
    }
  }

  /* Les deux extrémités de l'arc bougent : il se rallonge, se raccourcit et
     glisse le long du cercle. */
  @keyframes ds-progress-circular-dash {
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
    .ds-progress-circular-bar {
      transition: none;
    }

    /* Un loader immobile perdrait sa fonction : ralentir, pas supprimer. */
    .ds-progress-circular[data-indeterminate] .ds-progress-circular-svg {
      animation-duration: calc(var(--ds-duration-slow) * 12);
    }

    .ds-progress-circular[data-indeterminate] .ds-progress-circular-bar {
      animation-duration: calc(var(--ds-duration-slow) * 15);
    }
  }
}
</style>
