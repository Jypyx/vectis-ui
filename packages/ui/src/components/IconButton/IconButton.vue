<script setup lang="ts">
import type { ButtonHTMLAttributes } from 'vue'

import Button from '../Button/Button.vue'

/**
 * Bouton icône : même API visuelle que Button, mais carré et avec un libellé
 * accessible OBLIGATOIRE (l'icône seule ne suffit pas aux lecteurs d'écran).
 */
interface IconButtonProps {
  /** Libellé accessible, posé en aria-label. */
  label: string
  variant?: 'solid' | 'outline' | 'ghost' | 'elevated' | 'tonal'
  tone?: 'accent' | 'neutral' | 'danger' | 'success' | 'warning'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Hauteur (et largeur) réduites de 4px. */
  compact?: boolean
  type?: ButtonHTMLAttributes['type']
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<IconButtonProps>(), {
  variant: 'ghost',
  tone: 'neutral',
  size: 'md',
  compact: false,
  type: 'button',
  disabled: false,
  loading: false,
})

defineSlots<{
  /** L'icône (composant Icon ou SVG avec aria-hidden="true") */
  default(): unknown
}>()
</script>

<template>
  <Button
    class="ds-icon-button"
    :variant="variant"
    :tone="tone"
    :size="size"
    :compact="compact"
    :type="type"
    :disabled="disabled"
    :loading="loading"
    :aria-label="label"
  >
    <slot />
  </Button>
</template>

<style>
@layer ds.components {
  /*
   * Sélecteur avec [data-size] pour battre la règle de padding de Button
   * quel que soit l'ordre du CSS bundlé (ce fichier reste importé APRÈS
   * Button dans index.ts). La largeur lit --_control-height, posée par la
   * classe partagée ds-control sur ce même élément rendu (compact inclus) :
   * une seule règle couvre toutes les tailles.
   */
  .ds-icon-button[data-size] {
    width: var(--_control-height);
    padding-inline: 0;
  }
}
</style>
