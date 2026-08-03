<script setup lang="ts">
/**
 * Pastille d'information non interactive : compteur ou icône. HTML + CSS
 * uniquement — le seul JS est du calcul de rendu (détection du slot cible,
 * plafonnement « 99+ », pont couleur custom → --custom-color).
 */
import { computed, useSlots } from 'vue'

import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'
import type { IconSource } from '../Icon/types'

export type BadgeTone = 'neutral' | 'accent' | 'danger' | 'success' | 'warning'

interface BadgeProps {
  /** Couleur sémantique (rendu plein-couleur unique). */
  tone?: BadgeTone
  /**
   * Couleur custom (hex, nom CSS ou oklch()) — remplace le tone. Le texte
   * s'adapte noir/blanc via contrast-color() sur les navigateurs qui le
   * supportent ; ailleurs il retombe sur du blanc (contraste d'une couleur
   * claire à la charge du consommateur, comme le solid custom du Chip).
   */
  color?: string
  /** Compteur numérique. Au-delà de 99, l'affichage devient « 99+ ». */
  count?: number
  /**
   * Icône seule (nom Material Symbols ou URL d'image) — prime sur `count`,
   * ignorée en mode `dot`. Nom d'icône, ou rendu explicite (contrat Icon).
   */
  icon?: IconSource
  /** Rond de 10px sans contenu visible. */
  dot?: boolean
  /** Avec une cible : coin haut-droit au lieu d'inline. Ignoré sans cible. */
  overlay?: boolean
  /**
   * Liseré de 2px couleur du fond derrière (`--vectis-color-surface`,
   * surchargeable par sous-arbre) pour détacher le badge de sa cible.
   */
  bordered?: boolean
}

const props = withDefaults(defineProps<BadgeProps>(), {
  tone: 'accent',
  color: undefined,
  count: undefined,
  icon: undefined,
})

defineSlots<{
  /** Élément cible. Absent → standalone ; présent → inline ou overlay. */
  default?(): unknown
}>()

const slots = useSlots()
const hasTarget = computed(() => slots.default !== undefined)

/** Compteur plafonné : au-delà de 99, l'affichage devient « 99+ ». */
const displayCount = computed(() =>
  props.count !== undefined && props.count > 99 ? '99+' : props.count,
)

/* Attributs du badge lui-même, partagés entre les deux racines du template. */
const badgeAttrs = computed(() => ({
  'data-tone': props.tone,
  'data-custom': props.color !== undefined ? '' : undefined,
  'data-dot': props.dot ? '' : undefined,
  'data-icon-only': !props.dot && props.icon ? '' : undefined,
  'data-bordered': props.bordered ? '' : undefined,
  style: props.color !== undefined ? { '--custom-color': props.color } : undefined,
}))
</script>

<template>
  <span v-if="hasTarget" class="v-badge-host" :data-overlay="overlay ? '' : undefined">
    <slot />
    <span class="v-badge" v-bind="badgeAttrs">
      <template v-if="!dot">
        <Icon v-if="icon" v-bind="iconProps(icon)" />
        <template v-else>{{ displayCount }}</template>
      </template>
    </span>
  </span>
  <span v-else class="v-badge" v-bind="badgeAttrs">
    <template v-if="!dot">
      <Icon v-if="icon" v-bind="iconProps(icon)" />
      <template v-else>{{ displayCount }}</template>
    </template>
  </span>
</template>

<style>
@layer vectis.components {
  .v-badge-host {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--vectis-space-2); /* écart cible ↔ badge en mode inline */
  }

  .v-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: var(--vectis-control-size-badge-h);
    /* min-width = height + padding réduit → compteur à 1 ou 2 chiffres rond */
    min-width: var(--vectis-control-size-badge-h);
    padding-inline: var(--vectis-space-1);
    border-radius: var(--vectis-radius-pill);
    background: var(--badge-bg);
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-caption-size);
    font-weight: var(--vectis-text-control-weight);
    line-height: var(--vectis-text-control-leading);

    /* Contexte icône : mapping xs de l'échelle de tailles (16px, opsz 20 —
       littéral, contrat de la police Material Symbols). */
    --vectis-icon-size: var(--vectis-icon-size-sm);
    --vectis-icon-opsz: 20;

    /* Fallback par tone (tones ci-dessous). contrast-color() ne peut
       PAS être une simple seconde déclaration : contenant un var(), elle
       n'est jamais rejetée au parsing par les navigateurs sans support —
       elle gagnerait la cascade puis deviendrait invalide au calcul (IACVT →
       color: unset → héritage, le fallback ne s'applique jamais). D'où le
       @supports ci-dessous, évalué, lui, sans substitution de var(). */
    color: var(--tone-text-fallback);
  }

  /* Texte adaptatif noir/blanc là où contrast-color() existe (Safari 26+,
     Edge 150+). */
  @supports (color: contrast-color(red)) {
    .v-badge {
      color: contrast-color(var(--badge-bg));
    }
  }

  .v-badge[data-tone='accent'] {
    --badge-bg: var(--vectis-color-accent);
    --tone-text-fallback: var(--vectis-color-text-on-accent);
  }

  .v-badge[data-tone='danger'] {
    --badge-bg: var(--vectis-color-danger);
    --tone-text-fallback: var(--vectis-color-text-on-accent);
  }

  .v-badge[data-tone='success'] {
    --badge-bg: var(--vectis-color-success);
    --tone-text-fallback: var(--vectis-color-text-on-accent);
  }

  .v-badge[data-tone='warning'] {
    --badge-bg: var(--vectis-color-warning);
    --tone-text-fallback: var(--vectis-color-text-on-warning);
  }

  /* Neutral : inversion text/surface — un gris type text-muted vaudrait
     neutral-400 en dark, où le fallback blanc échouerait ; ici fallback et
     contrast-color() concordent dans les deux thèmes. */
  .v-badge[data-tone='neutral'] {
    --badge-bg: var(--vectis-color-text);
    --tone-text-fallback: var(--vectis-color-surface);
  }

  /* Après les tones : même spécificité, le dernier gagne. */
  .v-badge[data-custom] {
    --badge-bg: var(--custom-color);
    --tone-text-fallback: var(--vectis-color-text-on-accent);
  }

  /* Icône seule : le min-width fait le cercle, padding retiré. */
  .v-badge[data-icon-only] {
    padding: 0;
  }

  /* min-width neutralisé : il battrait le width du dot. */
  .v-badge[data-dot] {
    width: var(--vectis-control-size-badge-dot);
    height: var(--vectis-control-size-badge-dot);
    min-width: 0;
    padding: 0;
  }

  /* Anneau extérieur en box-shadow : ne modifie pas les dimensions (le dot
     reste 10px pleins) et suit le border-radius. */
  .v-badge[data-bordered] {
    box-shadow: 0 0 0 2px var(--vectis-color-surface);
  }

  /* Les % de translate sont des ratios de la taille du badge lui-même
     (50% = centré sur le coin) — pas des espacements, pas de token. */
  .v-badge-host[data-overlay] > .v-badge {
    position: absolute;
    inset-block-start: 0;
    inset-inline-end: 0;
    translate: 25% -25%;
  }

  /* RTL : le coin logique passe à gauche, la translation X s'inverse */
  .v-badge-host[data-overlay]:dir(rtl) > .v-badge {
    translate: -25% -25%;
  }
}
</style>
