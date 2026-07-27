<script setup lang="ts">
import { computed } from 'vue'

import Icon from '../Icon/Icon.vue'
import { iconProps } from '../Icon/iconProps'
import IconButton from '../IconButton/IconButton.vue'
import type { ToastItem, ToastTone } from './state'

/**
 * Carte de notification — présentationnel pur, interne (rendue par
 * <Toaster>, non exportée). role="alert" (interruptif) pour danger/warning,
 * role="status" (poli) sinon — même règle que l'ancien Alert. Compromis
 * assumé : l'annonce du premier toast « poli » d'une pile peut être manquée
 * par certains lecteurs d'écran (la live region naît avec son contenu) ;
 * les role="alert" sont, eux, annoncés à l'insertion.
 */
const props = defineProps<{
  item: ToastItem
  /** Libellé accessible de la croix de fermeture. */
  closeLabel: string
}>()

const emit = defineEmits<{
  /** Demande de fermeture (croix) — la file est gérée par le Toaster. */
  close: [id: number]
}>()

const role = computed(() =>
  props.item.tone === 'danger' || props.item.tone === 'warning' ? 'alert' : 'status',
)

const DEFAULT_ICONS: Record<ToastTone, string> = {
  neutral: 'notifications',
  accent: 'info',
  success: 'check_circle',
  danger: 'error',
  warning: 'warning',
}

/** `false` = pas d'icône ; nom Material ou URL détectés par iconProps. */
const icon = computed(() =>
  props.item.icon === false
    ? undefined
    : iconProps(props.item.icon ?? DEFAULT_ICONS[props.item.tone]),
)
</script>

<template>
  <div
    class="ds-toast"
    :data-tone="item.tone"
    :data-variant="item.variant"
    :role="role"
    :style="item.width ? { '--_width': item.width } : undefined"
  >
    <Icon v-if="icon" class="ds-toast-icon" v-bind="icon" />
    <div class="ds-toast-body">
      <p v-if="item.title" class="ds-toast-title">{{ item.title }}</p>
      <p class="ds-toast-message">{{ item.message }}</p>
    </div>
    <IconButton
      v-if="item.closable"
      class="ds-toast-close"
      :label="closeLabel"
      size="sm"
      compact
      @click="emit('close', item.id)"
    >
      <Icon name="close" />
    </IconButton>
  </div>
</template>

<style src="./Toast.tokens.css"></style>
<style>
@layer ds.components {
  .ds-toast {
    display: flex;
    align-items: flex-start;
    gap: var(--ds-space-3);
    padding: var(--ds-space-3) var(--ds-space-4);
    width: var(--_width, var(--ds-control-size-toast-width));
    /* responsive : jamais plus large que le viewport moins les marges de la pile */
    max-width: calc(100vw - 2 * var(--ds-space-4));
    border-radius: var(--ds-radius-overlay);
    box-shadow: var(--ds-shadow-4);
    font-family: var(--ds-text-family);
    font-size: var(--ds-text-body-md-size);
    line-height: var(--ds-text-body-md-leading);
  }

  /* --- Variantes : consomment les variables du tone (Toast.tokens.css) --- */
  .ds-toast[data-variant='tonal'] {
    background: var(--_bg-tonal);
    border: 1px solid var(--_border-tonal);
    color: var(--ds-color-text);
  }

  .ds-toast[data-variant='tonal'] .ds-toast-icon,
  .ds-toast[data-variant='tonal'] .ds-toast-title {
    color: var(--_accent);
  }

  .ds-toast[data-variant='tonal'] .ds-toast-message {
    color: var(--ds-color-text-muted);
  }

  .ds-toast[data-variant='solid'] {
    background: var(--_bg-solid);
    color: var(--_text-solid);
  }

  /*
   * Croix de fermeture : IconButton ghost/neutral, recoloré via les
   * variables locales de Button (--_text-tinted / --_bg-soft) — spécificité
   * supérieure aux règles de tone de Button, et Toast est bundlé après lui.
   * En tonal : croix à la couleur d'accent du tone (design de l'ex-Alert) ;
   * en solid : currentcolor (lisible sur le fond plein).
   */
  .ds-toast[data-variant='tonal'] .ds-toast-close[data-tone] {
    --_text-tinted: var(--_accent);
    --_bg-soft: color-mix(in oklab, var(--_accent), transparent 88%);
  }

  .ds-toast[data-variant='solid'] .ds-toast-close[data-tone] {
    --_text-tinted: currentcolor;
    --_bg-soft: color-mix(in oklab, currentcolor, transparent 85%);
  }

  .ds-toast-icon {
    --ds-icon-size: var(--ds-icon-size-md);
    /* aligne l'icône (20px) sur le centre de la première ligne de texte */
    margin-block-start: calc(var(--ds-space-1) / 2);
  }

  .ds-toast-body {
    flex: 1;
    min-width: 0;
    /* les messages peuvent contenir des chaînes insécables (URLs, ids) */
    overflow-wrap: anywhere;
  }

  .ds-toast-title {
    margin-block-end: var(--ds-space-1);
    /* semibold : emphase d'état (titre détaché du message), pas un rôle typo */
    font-weight: var(--ds-font-weight-semibold);
  }

  .ds-toast-close {
    /* réduit l'emprise visuelle du bouton dans le padding de la carte */
    margin-block-start: calc(-1 * var(--ds-space-1));
    margin-inline-end: calc(-1 * var(--ds-space-1));
  }

  /*
   * Entrée d'un toast inséré dans une pile déjà ouverte : glisse depuis le
   * bord (--_enter-y posée par .ds-toast-stack selon le placement).
   * @starting-style s'applique à toute insertion DOM — progressive
   * enhancement, apparition sans animation à défaut. La sortie n'est pas
   * animée : il faudrait retenir l'item dans la file pendant la transition
   * (choix de simplicité) ; la pile qui se vide fait, elle, un fondu via
   * hidePopover() + allow-discrete (voir Toaster).
   */
  .ds-toast {
    transition:
      opacity var(--ds-duration-base) var(--ds-ease-default),
      translate var(--ds-duration-base) var(--ds-ease-default);
  }

  @starting-style {
    .ds-toast {
      opacity: 0;
      translate: 0 var(--_enter-y, 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-toast {
      transition: none;
    }
  }
}
</style>
