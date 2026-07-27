<script setup lang="ts">
/**
 * Pastille d'information non interactive : compteur ou icône.
 * HTML + CSS uniquement — le seul JS est du calcul de rendu (détection du
 * slot cible, plafonnement « 99+ », pont couleur custom → --_custom).
 *
 * Trois modes de placement :
 * - standalone (pas de slot par défaut) : le badge seul ;
 * - inline (slot par défaut) : le badge à droite de l'élément cible ;
 * - overlay (slot par défaut + `overlay`) : posé sur le coin haut-droit de
 *   la cible, décalé vers l'intérieur.
 */
import { computed, useSlots } from 'vue'

import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'

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
   * ignorée en mode `dot`. Police Material chargée par le consommateur
   * (contrat Icon).
   */
  icon?: string
  /** Rond de 10px sans contenu visible. */
  dot?: boolean
  /** Avec une cible : coin haut-droit au lieu d'inline. Ignoré sans cible. */
  overlay?: boolean
  /**
   * Liseré de 2px couleur du fond derrière (`--ds-color-surface`,
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
  style: props.color !== undefined ? { '--_custom': props.color } : undefined,
}))
</script>

<template>
  <span v-if="hasTarget" class="ds-badge-host" :data-overlay="overlay ? '' : undefined">
    <slot />
    <span class="ds-badge" v-bind="badgeAttrs">
      <template v-if="!dot">
        <Icon v-if="icon" v-bind="iconProps(icon)" />
        <template v-else>{{ displayCount }}</template>
      </template>
    </span>
  </span>
  <span v-else class="ds-badge" v-bind="badgeAttrs">
    <template v-if="!dot">
      <Icon v-if="icon" v-bind="iconProps(icon)" />
      <template v-else>{{ displayCount }}</template>
    </template>
  </span>
</template>

<style src="./Badge.tokens.css"></style>
<style>
@layer ds.components {
  /* --- Hôte des modes inline / overlay --- */
  .ds-badge-host {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-2); /* écart cible ↔ badge en mode inline */
  }

  /* --- Badge : rendu plein-couleur unique --- */
  .ds-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: var(--ds-control-size-badge-h);
    /* min-width = height + padding réduit → compteur à 1 ou 2 chiffres rond */
    min-width: var(--ds-control-size-badge-h);
    padding-inline: var(--ds-space-1);
    border-radius: var(--ds-radius-pill);
    background: var(--_bg);
    font-family: var(--ds-font-family-sans);
    font-size: var(--ds-font-size-xs);
    font-weight: var(--ds-font-weight-medium);
    line-height: var(--ds-font-leading-none);

    /* Contexte icône : mapping xs de l'échelle de tailles (16px, opsz 20 —
       littéral, contrat de la police Material Symbols). */
    --ds-icon-size: var(--ds-icon-size-sm);
    --ds-icon-opsz: 20;

    /* Texte adaptatif noir/blanc : contrast-color() (Safari 26+) ; la
       déclaration est ignorée là où la fonction est inconnue (Chrome/Edge
       actuels) et le fallback par tone posé ci-dessous s'applique. */
    color: var(--_text-fallback);
    color: contrast-color(var(--_bg));
  }

  /* --- Icône seule : le min-width fait le cercle de 20px, padding retiré ---
     (tones : Badge.tokens.css) */
  .ds-badge[data-icon-only] {
    padding: 0;
  }

  /* --- Dot : min-width neutralisé (il battrait le width de 10px) --- */
  .ds-badge[data-dot] {
    width: var(--ds-control-size-badge-dot);
    height: var(--ds-control-size-badge-dot);
    min-width: 0;
    padding: 0;
  }

  /* --- Bordered : anneau extérieur en box-shadow — ne modifie pas les
     dimensions (le dot reste 10px pleins) et suit le border-radius --- */
  .ds-badge[data-bordered] {
    box-shadow: 0 0 0 2px var(--ds-color-surface);
  }

  /* --- Overlay : coin haut-droit de l'hôte, décalé vers l'intérieur.
     Les % de translate sont des ratios de la taille du badge lui-même
     (50% = centré sur le coin) — pas des espacements, pas de token. --- */
  .ds-badge-host[data-overlay] > .ds-badge {
    position: absolute;
    inset-block-start: 0;
    inset-inline-end: 0;
    translate: 25% -25%;
  }

  /* RTL : le coin logique passe à gauche, la translation X s'inverse */
  .ds-badge-host[data-overlay]:dir(rtl) > .ds-badge {
    translate: -25% -25%;
  }
}
</style>
