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
  variant?: 'solid' | 'outline' | 'ghost'
  tone?: 'accent' | 'neutral' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  type?: ButtonHTMLAttributes['type']
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<IconButtonProps>(), {
  variant: 'ghost',
  tone: 'neutral',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
})

defineSlots<{
  /** L'icône (SVG conseillé, avec aria-hidden="true") */
  default(): unknown
}>()
</script>

<template>
  <Button
    class="ds-icon-button"
    :variant="variant"
    :tone="tone"
    :size="size"
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
   * Sélecteurs avec [data-size] pour égaler la spécificité des règles de
   * padding de Button ; ce fichier doit être importé APRÈS Button dans
   * index.ts (l'ordre du CSS bundlé départage à spécificité égale).
   */
  .ds-icon-button[data-size] {
    width: var(--ds-control-height-md);
    padding-inline: 0;
  }

  .ds-icon-button[data-size='sm'] {
    width: var(--ds-control-height-sm);
  }

  .ds-icon-button[data-size='lg'] {
    width: var(--ds-control-height-lg);
  }
}
</style>
