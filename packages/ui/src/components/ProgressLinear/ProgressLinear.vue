<script setup lang="ts">
/**
 * Barre de progression. La racine EST la piste ; toute la géométrie dérive
 * d'une fraction unitless `--fill-fraction` inline, en propriétés logiques — l'orientation
 * verticale ne demande alors qu'un `writing-mode`. Aucun JS de comportement.
 *
 * Nom accessible : passer `aria-label` (fallthrough). Le rôle progressbar est
 * « children presentational » : le texte visible dans la barre n'est PAS
 * annoncé, il ne remplace pas un aria-label.
 */
import { useProgressValue } from '../../composables/useProgressValue'
import { useMessages } from '../../i18n/state'
import { px } from '../../utils/css'

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
    :style="{
      '--fill-fraction': String(fraction),
      '--custom-color': color,
      '--progress-thickness': px(thickness),
    }"
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
          {{ m.progress.percent(Math.round(fraction * 100)) }}
        </slot>
      </span>
      <span class="ds-progress-linear-text" data-on-fill aria-hidden="true">
        <slot :value="clamped" :max="max" :percent="fraction * 100">
          {{ m.progress.percent(Math.round(fraction * 100)) }}
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
    --progress-thickness: var(--vectis-control-size-progress-linear-thickness);
    position: relative;
    display: block;
    inline-size: 100%;
    block-size: var(--progress-thickness);
    border-radius: var(--vectis-radius-pill);
    background: var(--progress-track);
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-caption-size);
    font-weight: var(--vectis-text-control-weight);
    line-height: var(--vectis-text-control-leading);
  }

  .ds-progress-linear[data-shape='square'] {
    border-radius: 0;
  }

  .ds-progress-linear-fill {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    inline-size: calc(100% * var(--fill-fraction));
    border-radius: inherit;
    background: var(--progress-fill);
    /*
     * L'animation porte sur inline-size (propriété de layout, non composited :
     * compromis assumé — `scale` est physique et casserait le vertical et le
     * RTL). La même durée et le même easing sont repris par le clip du texte
     * contrasté, sinon la frontière de couleur décrocherait du bord du
     * remplissage pendant la transition.
     */
    transition: inline-size var(--vectis-duration-base) var(--vectis-ease-default);
  }

  /* --- Tones : variables locales uniquement --- */
  .ds-progress-linear[data-tone='accent'] {
    --progress-fill: var(--vectis-color-accent);
    --progress-track: var(--vectis-color-accent-surface);
    --tone-text-fallback: var(--vectis-color-text-on-accent);
  }

  .ds-progress-linear[data-tone='success'] {
    --progress-fill: var(--vectis-color-success);
    --progress-track: var(--vectis-color-success-surface);
    --tone-text-fallback: var(--vectis-color-text-on-accent);
  }

  .ds-progress-linear[data-tone='danger'] {
    --progress-fill: var(--vectis-color-danger);
    --progress-track: var(--vectis-color-danger-surface);
    --tone-text-fallback: var(--vectis-color-text-on-accent);
  }

  .ds-progress-linear[data-tone='warning'] {
    --progress-fill: var(--vectis-color-warning);
    --progress-track: var(--vectis-color-warning-surface);
    /* le blanc échoue AA sur amber : token dédié */
    --tone-text-fallback: var(--vectis-color-text-on-warning);
  }

  /* Neutral : inversion text/surface — un gris moyen serait illisible dans
     l'un des deux thèmes. */
  .ds-progress-linear[data-tone='neutral'] {
    --progress-fill: var(--vectis-color-text);
    --progress-track: var(--vectis-color-surface-muted);
    --tone-text-fallback: var(--vectis-color-surface);
  }

  /* --- Couleur custom : après les tones (même spécificité, dernier gagne) --- */
  .ds-progress-linear[data-custom] {
    --progress-fill: var(--custom-color);
    --progress-track: color-mix(in oklab, var(--custom-color), var(--vectis-color-surface) 85%);
    --tone-text-fallback: var(--vectis-color-text-on-accent);
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
    padding-inline: var(--vectis-space-2);
    color: var(--vectis-color-text);
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
    /* Fallback par tone. contrast-color() ne peut PAS être une simple seconde
       déclaration : contenant un var(), elle n'est jamais rejetée au parsing
       par les navigateurs sans support — elle gagnerait la cascade puis
       deviendrait invalide au calcul (IACVT → color: unset → héritage, le
       fallback ne s'applique jamais). D'où le @supports ci-dessous, évalué,
       lui, sans substitution de var(). */
    color: var(--tone-text-fallback);
    /* inset() est physique : un jeu de valeurs par orientation et direction.
       Le débord négatif sur les trois autres côtés évite de rogner un texte
       plus haut (ou plus large) que la barre. */
    clip-path: inset(-100vmax calc(100% * (1 - var(--fill-fraction))) -100vmax -100vmax);
    transition: clip-path var(--vectis-duration-base) var(--vectis-ease-default);
  }

  /* Texte adaptatif noir/blanc là où contrast-color() existe (Safari 26+,
     Edge 150+). */
  @supports (color: contrast-color(red)) {
    .ds-progress-linear-text[data-on-fill] {
      color: contrast-color(var(--progress-fill));
    }
  }

  .ds-progress-linear:dir(rtl) .ds-progress-linear-text[data-on-fill] {
    clip-path: inset(-100vmax -100vmax -100vmax calc(100% * (1 - var(--fill-fraction))));
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
    inline-size: var(--vectis-control-size-progress-linear-length);
  }

  .ds-progress-linear[data-orientation='vertical'] .ds-progress-linear-fill {
    inset-inline-start: auto;
    inset-inline-end: 0;
  }

  /* Le texte s'empile sur l'axe vertical, start = côté 0 (donc en bas). */
  .ds-progress-linear[data-orientation='vertical'] .ds-progress-linear-text {
    flex-direction: column-reverse;
    padding-inline: 0;
    padding-block: var(--vectis-space-2);
  }

  /* Le clip passe sur l'axe vertical (le remplissage monte depuis le bas) —
     donc identique en LTR et en RTL, d'où la neutralisation de la règle
     :dir(rtl) horizontale ci-dessus. */
  .ds-progress-linear[data-orientation='vertical'] .ds-progress-linear-text[data-on-fill],
  .ds-progress-linear[data-orientation='vertical']:dir(rtl) .ds-progress-linear-text[data-on-fill] {
    clip-path: inset(calc(100% * (1 - var(--fill-fraction))) -100vmax -100vmax -100vmax);
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
    overflow: hidden;
  }

  .ds-progress-linear[data-indeterminate] .ds-progress-linear-fill {
    /* La position de départ dérive de cette taille (les deux doivent rester
       égales pour que la barre parte pile hors piste). */
    --progress-bar: 40%;
    /* on reprend l'ancrage au début de l'axe inline, y compris en vertical où
       le mode déterminé ancre à la fin (voir plus haut) */
    inset-inline-start: 0;
    inset-inline-end: auto;
    inline-size: var(--progress-bar);
    /* la transition de progression n'a pas lieu d'être ici, et ferait grandir
       la barre au passage en indéterminé */
    transition: none;
    animation: ds-progress-linear-indeterminate calc(var(--vectis-duration-slow) * 5)
      var(--vectis-ease-in-out) infinite;
  }

  @keyframes ds-progress-linear-indeterminate {
    from {
      inset-inline-start: calc(-1 * var(--progress-bar));
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

    /* Un loader immobile perdrait sa fonction : ralentir, pas supprimer. */
    .ds-progress-linear[data-indeterminate] .ds-progress-linear-fill {
      animation-duration: calc(var(--vectis-duration-slow) * 15);
    }
  }
}
</style>
