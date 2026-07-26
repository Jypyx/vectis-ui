<script setup lang="ts">
/**
 * Barre de progression.
 *
 * `<progress>` natif a été abandonné (décision utilisateur 2026-07) : ses
 * pseudo-éléments (::-webkit-progress-value, ::-moz-progress-bar) ne sont
 * stylables qu'en fond plat, n'acceptent aucun enfant — donc pas de texte dans
 * la barre — et ne basculent pas en writing-mode vertical. Le contrat ARIA
 * progressbar est donc porté explicitement ici. Aucun JS de comportement pour
 * autant : seuls des computed de normalisation, tout le rendu est CSS.
 *
 * La géométrie passe par UNE fraction unitless `--_f` en custom property
 * inline (modèle Slider) : le remplissage et le clip du texte contrasté en
 * dérivent, et les propriétés logiques font basculer l'axe en vertical sans
 * dupliquer une seule règle.
 *
 * Nom accessible : passer `aria-label` (fallthrough). Attention, le rôle
 * progressbar est « children presentational » : le texte visible dans la barre
 * n'est PAS annoncé, il ne remplace pas un aria-label.
 */
import { computed, useSlots } from 'vue'

interface ProgressLinearProps {
  /** Valeur courante ; absente = indéterminé (animation continue). */
  value?: number
  /** Borne haute (la borne basse est toujours 0). */
  max?: number
  /** Couleur sémantique. */
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'neutral'
  /**
   * Couleur custom (hex, nom CSS ou oklch()) — remplace le tone. Les nuances
   * (piste) sont dérivées par color-mix avec les tokens de thème.
   */
  color?: string
  /**
   * Épaisseur de la barre : number = px, string = valeur CSS telle quelle
   * ('0.75rem', 'var(--x)'). Défaut : token, majoré quand un texte est
   * affiché (un texte de 12px ne tient pas dans 8px).
   */
  thickness?: number | string
  /**
   * Longueur de la barre : number = px, string = valeur CSS. Défaut : 100 % du
   * conteneur en horizontal, token en vertical.
   */
  length?: number | string
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
  value: undefined,
  max: 100,
  tone: 'accent',
  color: undefined,
  thickness: undefined,
  length: undefined,
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

const slots = useSlots()

/** Valeur bornée à [0, max] ; undefined = indéterminé. */
const clamped = computed(() =>
  props.value === undefined
    ? undefined
    : Math.min(Math.max(props.value, 0), Math.max(props.max, 0)),
)

/* `props.max || 1` neutralise max: 0 (division par zéro → NaN dans le style). */
const percent = computed(() =>
  clamped.value === undefined ? undefined : (clamped.value / (props.max || 1)) * 100,
)

/*
 * --_f est TOUJOURS posée, même en indéterminé : sans elle,
 * `calc(100% * var(--_f))` serait invalide au computed-value time et
 * retomberait sur `auto`.
 */
const f = computed(() => (percent.value ?? 0) / 100)

const hasText = computed(
  () => clamped.value !== undefined && (props.showValue || slots.default !== undefined),
)

/** number → px, string → telle quelle (permet rem, %, var()…). */
const cssSize = (v: number | string | undefined) =>
  v === undefined ? undefined : typeof v === 'number' ? `${v}px` : v
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
    :data-indeterminate="clamped === undefined ? '' : undefined"
    :data-has-text="hasText ? '' : undefined"
    :aria-valuenow="clamped"
    aria-valuemin="0"
    :aria-valuemax="max"
    :style="{
      '--_f': String(f),
      '--_custom': color,
      '--_thickness': cssSize(thickness),
      '--_length': cssSize(length),
    }"
  >
    <span class="ds-progress-linear-track">
      <span class="ds-progress-linear-fill" />
    </span>
    <!--
      Deux copies superposées du même contenu : la première en couleur de texte
      par-dessus la piste, la seconde clippée à la portion remplie et colorée
      par contraste sur le remplissage. Sœurs de la piste (son overflow ne les
      tronque pas) et posées après elle dans le DOM (donc au-dessus, sans
      z-index). La copie clippée duplique du texte visible → aria-hidden.
    -->
    <template v-if="hasText">
      <span class="ds-progress-linear-text">
        <slot :value="clamped!" :max="max" :percent="percent!">
          {{ Math.round(percent!) }}&nbsp;%
        </slot>
      </span>
      <span class="ds-progress-linear-text" data-on-fill aria-hidden="true">
        <slot :value="clamped!" :max="max" :percent="percent!">
          {{ Math.round(percent!) }}&nbsp;%
        </slot>
      </span>
    </template>
  </div>
</template>

<style>
@layer ds.components {
  /*
   * Les custom properties de dimension sont TOUTES déclarées sur la racine
   * (jamais sur un descendant) : le style inline posé par les props gagne
   * ainsi systématiquement, y compris sur le défaut majoré de [data-has-text].
   */
  .ds-progress-linear {
    --_thickness: var(--ds-control-size-progress-linear-thickness);
    --_length: 100%;
    position: relative;
    display: flex;
    align-items: center;
    /* La racine suit la longueur de la piste (et non 100 % en dur) : les copies
       de texte sont positionnées sur la racine, leur clip doit tomber sur le
       bord du remplissage même quand `length` rétrécit la barre. */
    inline-size: var(--_length);
    font-family: var(--ds-font-family-sans);
    font-size: var(--ds-font-size-xs);
    font-weight: var(--ds-font-weight-medium);
    line-height: var(--ds-font-leading-none);
  }

  /* Un texte de 12px ne tient pas dans une barre de 8px : second défaut. */
  .ds-progress-linear[data-has-text] {
    --_thickness: var(--ds-control-size-progress-linear-thickness-text);
  }

  .ds-progress-linear[data-orientation='vertical'] {
    --_length: var(--ds-control-size-progress-linear-length);
    inline-size: fit-content;
  }

  .ds-progress-linear-track {
    position: relative;
    inline-size: var(--_length);
    block-size: var(--_thickness);
    border-radius: var(--ds-radius-pill);
    background: var(--_track);
    overflow: hidden;
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

  .ds-progress-linear[data-shape='square'] .ds-progress-linear-track {
    border-radius: 0;
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

  /* --- Texte dans la barre : deux copies superposées ---
     Invariant : la racine et la piste ont exactement la même boîte (aucun
     padding ni bordure sur la racine) — le clip à 100% * --_f tombe donc pile
     sur le bord du remplissage. */
  .ds-progress-linear-text {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-inline: var(--ds-space-2);
    color: var(--ds-color-text);
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

  /* --- Indéterminé : une barre de largeur fixe traverse la piste, du bord
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
  .ds-progress-linear[data-indeterminate] .ds-progress-linear-fill {
    /* La position de départ dérive de cette taille (les deux doivent rester
       égales pour que la barre parte pile hors piste). */
    --_bar: 40%;
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

  /* --- Vertical : 0 en bas, max en haut ---
     Le writing-mode vit sur la PISTE (le bloc conteneur du remplissage) :
     inline-size/block-size, inset-inline-start et les keyframes basculent
     d'axe sans une règle dupliquée. vertical-lr + rtl ⇒ inline-start = bas.
     Les copies de texte sont hors de ce contexte (sœurs de la piste) et
     restent donc écrites horizontalement. */
  .ds-progress-linear[data-orientation='vertical'] .ds-progress-linear-track {
    writing-mode: vertical-lr;
    direction: rtl;
  }

  /* Le texte s'empile sur l'axe block, start = côté 0 (donc en bas). Une
     épaisseur suffisante pour accueillir le texte est à la charge du
     consommateur. */
  .ds-progress-linear[data-orientation='vertical'] .ds-progress-linear-text {
    flex-direction: column-reverse;
    padding-inline: 0;
    padding-block: var(--ds-space-2);
  }

  /* Le clip passe sur l'axe block (le remplissage monte depuis le bas) — donc
     identique en LTR et en RTL, d'où la neutralisation de la règle :dir(rtl)
     horizontale ci-dessus. */
  .ds-progress-linear[data-orientation='vertical'] .ds-progress-linear-text[data-on-fill],
  .ds-progress-linear[data-orientation='vertical']:dir(rtl) .ds-progress-linear-text[data-on-fill] {
    clip-path: inset(calc(100% * (1 - var(--_f))) -100vmax -100vmax -100vmax);
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
