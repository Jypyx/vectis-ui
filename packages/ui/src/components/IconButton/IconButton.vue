<script setup lang="ts">
import type { ButtonHTMLAttributes } from 'vue'

import Button from '../Button/Button.vue'
import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'
import type { IconSource } from '../Icon/types'

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
  /** Icône rendue : nom, ou rendu explicite (le slot par défaut prime en fallback). */
  icon?: IconSource
  /** Remplit l'icône `icon` (axe `FILL` de la police). */
  iconFilled?: boolean
}

withDefaults(defineProps<IconButtonProps>(), {
  variant: 'ghost',
  tone: 'neutral',
  size: 'md',
  compact: false,
  type: 'button',
  disabled: false,
  loading: false,
  icon: undefined,
  iconFilled: false,
})

defineSlots<{
  /** L'icône (composant Icon ou SVG avec aria-hidden="true"), si `icon` n'est pas fourni */
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
    <Icon v-if="icon" v-bind="iconProps(icon)" :filled="iconFilled" />
    <slot v-else />
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
