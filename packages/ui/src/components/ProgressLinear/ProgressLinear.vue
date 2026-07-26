<script setup lang="ts">
/**
 * Barre de progression.
 *
 * `<progress>` natif a été abandonné (décision utilisateur 2026-07) : ses
 * pseudo-éléments (::-webkit-progress-value, ::-moz-progress-bar) ne sont
 * stylables qu'en fond plat, n'acceptent aucun enfant — donc pas de texte dans
 * la barre — et ne basculent pas en writing-mode vertical. Le contrat ARIA
 * progressbar est donc porté explicitement ici. Aucun JS de comportement pour
 * autant : deux computed de normalisation, tout le reste est CSS.
 *
 * La racine EST la piste (fond, rayon, dimensions) : le remplissage y est
 * posé en absolu, les copies de texte par-dessus. Toute la géométrie dérive
 * d'une fraction unitless `--_f` en custom property inline (modèle Slider),
 * exprimée en propriétés logiques — l'orientation verticale ne demande alors
 * qu'un `writing-mode`.
 *
 * Nom accessible : passer `aria-label` (fallthrough). Attention, le rôle
 * progressbar est « children presentational » : le texte visible dans la barre
 * n'est PAS annoncé, il ne remplace pas un aria-label.
 */
import { computed } from 'vue'

interface ProgressLinearProps {
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
   * Épaisseur de la barre, **en pixels** : `12` comme `'12'` donnent 12px.
   * Défaut : 4px (token).
   */
  thickness?: number | string
  /** Extrémités arrondies (défaut) ou angles droits. */
  shape?: 'rounded' | 'square'
  /** Affiche la progression en pourcentage dans la barre (ignoré en indéterminé). */
  showValue?: boolean
  /** Position du texte dans la barre (en vertical : start = côté 0, donc en bas). */
  valuePosition?: 'start' | 'center' | 'end'
  /** Barre verticale : 0 en bas, max en haut. */
  orientation?: 'horizontal' | 'vertical'
}

const props = withDefaults(defineProps<ProgressLinearProps>(), {
  value: 0,
  max: 100,
  indeterminate: false,
  tone: 'accent',
  color: undefined,
  thickness: undefined,
  shape: 'rounded',
  showValue: false,
  valuePosition: 'center',
  orientation: 'horizontal',
})

defineSlots<{
  /**
   * Contenu affiché dans la barre ; prime sur `showValue`. Rendu DEUX fois
   * (copie de base + copie contrastée clippée au remplissage) : le contenu
   * doit être pur, sans effet de bord.
   */
  default?(props: { value: number; max: number; percent: number }): unknown
}>()

/** Valeur bornée à [0, max]. */
const clamped = computed(() => Math.min(Math.max(props.value, 0), Math.max(props.max, 0)))

/** Fraction [0, 1] pilotant tout le rendu. `props.max || 1` neutralise max: 0. */
const fraction = computed(() => clamped.value / (props.max || 1))

/**
 * Dimensions toujours en pixels : `12` comme `'12'` donnent `12px`. Une valeur
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
  <div
    class="ds-progress-linear"
    role="progressbar"
    :data-tone="tone"
    :data-custom="color !== undefined ? '' : undefined"
    :data-shape="shape"
    :data-orientation="orientation === 'vertical' ? 'vertical' : undefined"
    :data-value-position="valuePosition"
    :data-indeterminate="indeterminate ? '' : undefined"
    :aria-valuenow="indeterminate ? undefined : clamped"
    aria-valuemin="0"
    :aria-valuemax="max"
    :style="{ '--_f': String(fraction), '--_custom': color, '--_thickness': px(thickness) }"
  >
    <span class="ds-progress-linear-fill" />
    <!--
      Deux copies superposées du même contenu : la première en couleur de texte
      par-dessus la piste, la seconde clippée à la portion remplie et colorée
      par contraste sur le remplissage. La copie clippée duplique du texte
      visible → aria-hidden.
    -->
    <template v-if="!indeterminate && (showValue || $slots.default)">
      <span class="ds-progress-linear-text">
        <slot :value="clamped" :max="max" :percent="fraction * 100">
          {{ Math.round(fraction * 100) }}&nbsp;%
        </slot>
      </span>
      <span class="ds-progress-linear-text" data-on-fill aria-hidden="true">
        <slot :value="clamped" :max="max" :percent="fraction * 100">
          {{ Math.round(fraction * 100) }}&nbsp;%
        </slot>
      </span>
    </template>
  </div>
</template>

<style>
@layer ds.components {
  /*
   * La racine EST la piste. Elle occupe toute la longueur disponible : c'est
   * au consommateur de la dimensionner via son parent (ou un `width`/`height`
   * direct, qui bat ce layer).
   */
  .ds-progress-linear {
    --_thickness: var(--ds-control-size-progress-linear-thickness);
    position: relative;
    display: block;
    inline-size: 100%;
    block-size: var(--_thickness);
    border-radius: var(--ds-radius-pill);
    background: var(--_track);
    font-family: var(--ds-font-family-sans);
    font-size: var(--ds-font-size-xs);
    font-weight: var(--ds-font-weight-medium);
    line-height: var(--ds-font-leading-none);
  }

  .ds-progress-linear[data-shape='square'] {
    border-radius: 0;
  }

  .ds-progress-linear-fill {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    inline-size: calc(100% * var(--_f));
    border-radius: inherit;
    background: var(--_fill);
    /*
     * L'animation de progression porte sur inline-size (propriété de layout,
     * non composited : compromis assumé — `scale` est physique et casserait le
     * vertical et le RTL). La même durée et le même easing sont repris par le
     * clip du texte contrasté, sinon la frontière de couleur décrocherait du
     * bord du remplissage pendant la transition.
     *
     * Alternative écartée : enregistrer --_f via @property pour n'avoir qu'une
     * seule transition — l'enregistrement est global et --_f porte déjà une
     * autre sémantique dans Slider.
     */
    transition: inline-size var(--ds-duration-base) var(--ds-ease-default);
  }

  /* --- Tones : variables locales uniquement (modèle Button/Chip) --- */
  .ds-progress-linear[data-tone='accent'] {
    --_fill: var(--ds-color-accent);
    --_track: var(--ds-color-accent-surface);
    --_text-fallback: var(--ds-color-text-on-accent);
  }

  .ds-progress-linear[data-tone='success'] {
    --_fill: var(--ds-color-success);
    --_track: var(--ds-color-success-surface);
    --_text-fallback: var(--ds-color-text-on-accent);
  }

  .ds-progress-linear[data-tone='danger'] {
    --_fill: var(--ds-color-danger);
    --_track: var(--ds-color-danger-surface);
    --_text-fallback: var(--ds-color-text-on-accent);
  }

  .ds-progress-linear[data-tone='warning'] {
    --_fill: var(--ds-color-warning);
    --_track: var(--ds-color-warning-surface);
    /* le blanc échoue AA sur amber : token dédié */
    --_text-fallback: var(--ds-color-text-on-warning);
  }

  /* Neutral : inversion text/surface (modèle Chip/Badge) — un gris moyen
     serait illisible dans l'un des deux thèmes. */
  .ds-progress-linear[data-tone='neutral'] {
    --_fill: var(--ds-color-text);
    --_track: var(--ds-color-surface-muted);
    --_text-fallback: var(--ds-color-surface);
  }

  /* --- Couleur custom : après les tones (même spécificité, dernier gagne) --- */
  .ds-progress-linear[data-custom] {
    --_fill: var(--_custom);
    --_track: color-mix(in oklab, var(--_custom), var(--ds-color-surface) 85%);
    --_text-fallback: var(--ds-color-text-on-accent);
  }

  /* --- Texte dans la barre : deux copies superposées, toutes deux calées sur
     la boîte de la racine — qui est aussi celle de la piste, d'où un clip qui
     tombe pile sur le bord du remplissage. L'épaisseur par défaut (4px) ne
     peut pas accueillir de texte : en afficher suppose une `thickness`. --- */
  .ds-progress-linear-text {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-inline: var(--ds-space-2);
    color: var(--ds-color-text);
    /* la racine bascule en écriture verticale ; le texte, lui, reste horizontal */
    writing-mode: horizontal-tb;
    white-space: nowrap;
    pointer-events: none;
  }

  .ds-progress-linear[data-value-position='start'] .ds-progress-linear-text {
    justify-content: start;
  }

  .ds-progress-linear[data-value-position='end'] .ds-progress-linear-text {
    justify-content: end;
  }

  .ds-progress-linear-text[data-on-fill] {
    /* Texte adaptatif noir/blanc : contrast-color() (Safari 26+) ; la
       déclaration est ignorée là où la fonction est inconnue (Chrome/Edge
       actuels) et le fallback par tone s'applique — pattern Badge. */
    color: var(--_text-fallback);
    color: contrast-color(var(--_fill));
    /* inset() est physique : un jeu de valeurs par orientation et direction.
       Le débord négatif sur les trois autres côtés évite de rogner un texte
       plus haut (ou plus large) que la barre. */
    clip-path: inset(-100vmax calc(100% * (1 - var(--_f))) -100vmax -100vmax);
    transition: clip-path var(--ds-duration-base) var(--ds-ease-default);
  }

  .ds-progress-linear:dir(rtl) .ds-progress-linear-text[data-on-fill] {
    clip-path: inset(-100vmax -100vmax -100vmax calc(100% * (1 - var(--_f))));
  }

  /* --- Vertical : 0 en bas, max en haut ---
     `writing-mode` sur la racine suffit : l'axe inline devient vertical, donc
     inline-size = longueur, block-size = épaisseur, et remplissage comme
     animation basculent d'axe sans une règle dupliquée.

     PAS de `direction: rtl` pour mettre le 0 en bas — elle s'appliquerait au
     texte des copies et le bidi réordonnerait « 50 % » en « % 50 ». On ancre
     le remplissage à la FIN de l'axe inline à la place.

     La longueur vient d'un token faute de pouvoir hériter d'un parent de
     hauteur auto (elle s'effondrerait à zéro) ; un `height` consommateur, non
     layerisé, la surcharge. */
  .ds-progress-linear[data-orientation='vertical'] {
    writing-mode: vertical-lr;
    inline-size: var(--ds-control-size-progress-linear-length);
  }

  .ds-progress-linear[data-orientation='vertical'] .ds-progress-linear-fill {
    inset-inline-start: auto;
    inset-inline-end: 0;
  }

  /* Le texte s'empile sur l'axe vertical, start = côté 0 (donc en bas). */
  .ds-progress-linear[data-orientation='vertical'] .ds-progress-linear-text {
    flex-direction: column-reverse;
    padding-inline: 0;
    padding-block: var(--ds-space-2);
  }

  /* Le clip passe sur l'axe vertical (le remplissage monte depuis le bas) —
     donc identique en LTR et en RTL, d'où la neutralisation de la règle
     :dir(rtl) horizontale ci-dessus. */
  .ds-progress-linear[data-orientation='vertical'] .ds-progress-linear-text[data-on-fill],
  .ds-progress-linear[data-orientation='vertical']:dir(rtl) .ds-progress-linear-text[data-on-fill] {
    clip-path: inset(calc(100% * (1 - var(--_f))) -100vmax -100vmax -100vmax);
  }

  /* --- Indéterminé : une barre de taille fixe traverse la piste, du bord
     extérieur de départ au bord extérieur d'arrivée. Aux deux extrémités elle
     affleure exactement le bord sans jamais s'en éloigner : le rebouclage est
     invisible ET la piste n'est jamais vide — aucune seconde barre nécessaire.

     `ease-in-out` porte tout le rendu : entrée progressive, traversée rapide,
     sortie amortie. Une courbe asymétrique (ou `linear`) rend la boucle
     mécanique.

     La course est décrite en propriétés LOGIQUES (position et taille en % de
     la piste) plutôt qu'en `translate` : une seule définition sert
     l'horizontal, le vertical et le RTL, là où un transform — physique —
     imposerait un jeu de keyframes par axe et une inversion de sens en RTL. */
  .ds-progress-linear[data-indeterminate] {
    /* seul cas où le remplissage sort de la piste */
    overflow: hidden;
  }

  .ds-progress-linear[data-indeterminate] .ds-progress-linear-fill {
    /* La position de départ dérive de cette taille (les deux doivent rester
       égales pour que la barre parte pile hors piste). */
    --_bar: 40%;
    /* on reprend l'ancrage au début de l'axe inline, y compris en vertical où
       le mode déterminé ancre à la fin (voir plus haut) */
    inset-inline-start: 0;
    inset-inline-end: auto;
    inline-size: var(--_bar);
    /* la transition de progression n'a pas lieu d'être ici, et ferait grandir
       la barre au passage en indéterminé */
    transition: none;
    animation: ds-progress-linear-indeterminate calc(var(--ds-duration-slow) * 5)
      var(--ds-ease-in-out) infinite;
  }

  @keyframes ds-progress-linear-indeterminate {
    from {
      inset-inline-start: calc(-1 * var(--_bar));
    }

    to {
      inset-inline-start: 100%;
    }
  }

  /* En écriture verticale l'axe inline descend : la barre irait du haut vers
     le bas, à rebours du remplissage déterminé qui part du bas. On relit les
     mêmes keyframes à l'envers — possible sans altérer le rendu parce que la
     courbe est symétrique (avec un easing asymétrique il faudrait un second
     jeu de keyframes). En RTL horizontal, rien à faire : `inset-inline-start`
     suit déjà le sens de lecture. */
  .ds-progress-linear[data-orientation='vertical'][data-indeterminate] .ds-progress-linear-fill {
    animation-direction: reverse;
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-progress-linear-fill,
    .ds-progress-linear-text[data-on-fill] {
      transition: none;
    }

    /* Un loader immobile perdrait sa fonction : ralentir, pas supprimer
       (convention du DS, cf. Spinner et ProgressCircular). */
    .ds-progress-linear[data-indeterminate] .ds-progress-linear-fill {
      animation-duration: calc(var(--ds-duration-slow) * 15);
    }
  }
}
</style>
