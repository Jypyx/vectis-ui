<script setup lang="ts">
import { computed } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import VIconButton from '../VIconButton/VIconButton.vue'
import type { ToastItem, ToastTone } from './state'

/**
 * A notification card — purely presentational, internal (rendered by <VToaster>,
 * not exported). role="alert" (interruptive) for danger/warning, role="status"
 * (polite) otherwise. A deliberate trade-off: the announcement of a stack's first
 * "polite" toast may be missed by some screen readers (the live region is born with
 * its content); role="alert" ones are announced on insertion.
 */
const props = defineProps<{
  item: ToastItem
  /** Accessible label of the close cross. */
  closeLabel: string
}>()

const emit = defineEmits<{
  /** Dismiss request (the cross) — the queue is managed by the VToaster. */
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

/** `false` = no icon; a Material name or a URL, detected by iconProps. */
const icon = computed(() =>
  props.item.icon === false
    ? undefined
    : iconProps(props.item.icon ?? DEFAULT_ICONS[props.item.tone]),
)
</script>

<template>
  <div
    class="v-toast"
    :data-tone="item.tone"
    :data-variant="item.variant"
    :role="role"
    :style="item.width ? { '--toast-width': item.width } : undefined"
  >
    <VIcon v-if="icon" class="v-toast-icon" v-bind="icon" />
    <div class="v-toast-body">
      <p v-if="item.title" class="v-toast-title">{{ item.title }}</p>
      <p class="v-toast-message">{{ item.message }}</p>
    </div>
    <VIconButton
      v-if="item.closable"
      class="v-toast-close"
      :label="closeLabel"
      size="sm"
      compact
      @click="emit('close', item.id)"
    >
      <VIcon name="close" />
    </VIconButton>
  </div>
</template>

<style>
@layer vectis.components {
  .v-toast {
    display: flex;
    align-items: flex-start;
    gap: var(--vectis-space-3);
    padding: var(--vectis-space-3) var(--vectis-space-4);
    width: var(--toast-width, var(--vectis-control-size-toast-width));
    /* Responsive: never wider than the viewport minus the stack's margins */
    max-width: calc(100vw - 2 * var(--vectis-space-4));
    border-radius: var(--vectis-radius-overlay);
    box-shadow: var(--vectis-shadow-4);
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-body-md-size);
    line-height: var(--vectis-text-body-md-leading);
  }

  .v-toast[data-tone='neutral'] {
    /* No -surface/-border/-text variants for neutral: an overlay surface in tonal,
       an inverted contrast (tooltip style) in solid */
    --tone-bg-tonal: var(--vectis-color-surface-overlay);
    --tone-border-tonal: var(--vectis-color-border);
    --toast-accent: var(--vectis-color-text);
    --tone-bg-solid: var(--vectis-color-surface-inverse);
    --tone-text-solid: var(--vectis-color-text-on-inverse);
  }

  .v-toast[data-tone='accent'] {
    --tone-bg-tonal: var(--vectis-color-accent-surface);
    --tone-border-tonal: var(--vectis-color-accent-border);
    --toast-accent: var(--vectis-color-accent-text);
    --tone-bg-solid: var(--vectis-color-accent);
    --tone-text-solid: var(--vectis-color-text-on-accent);
  }

  .v-toast[data-tone='success'] {
    --tone-bg-tonal: var(--vectis-color-success-surface);
    --tone-border-tonal: var(--vectis-color-success-border);
    --toast-accent: var(--vectis-color-success-text);
    --tone-bg-solid: var(--vectis-color-success);
    --tone-text-solid: var(--vectis-color-text-on-accent);
  }

  .v-toast[data-tone='danger'] {
    --tone-bg-tonal: var(--vectis-color-danger-surface);
    --tone-border-tonal: var(--vectis-color-danger-border);
    --toast-accent: var(--vectis-color-danger-text);
    --tone-bg-solid: var(--vectis-color-danger);
    --tone-text-solid: var(--vectis-color-text-on-accent);
  }

  .v-toast[data-tone='warning'] {
    --tone-bg-tonal: var(--vectis-color-warning-surface);
    --tone-border-tonal: var(--vectis-color-warning-border);
    --toast-accent: var(--vectis-color-warning-text);
    --tone-bg-solid: var(--vectis-color-warning);
    /* Amber is too light for white: a dedicated token (dark text) */
    --tone-text-solid: var(--vectis-color-text-on-warning);
  }

  .v-toast[data-variant='tonal'] {
    background: var(--tone-bg-tonal);
    border: 1px solid var(--tone-border-tonal);
    color: var(--vectis-color-text);
  }

  .v-toast[data-variant='tonal'] .v-toast-icon,
  .v-toast[data-variant='tonal'] .v-toast-title {
    color: var(--toast-accent);
  }

  .v-toast[data-variant='tonal'] .v-toast-message {
    color: var(--vectis-color-text-muted);
  }

  .v-toast[data-variant='solid'] {
    background: var(--tone-bg-solid);
    color: var(--tone-text-solid);
  }

  /*
   * Close cross: a ghost/neutral VIconButton, recoloured through VButton's local
   * variables (--tone-text-tinted / --tone-bg-soft) — a higher specificity than
   * VButton's tone rules, and VToast is bundled after it. In tonal: a cross in the
   * tone's accent colour; in solid: currentcolor (readable on the full background).
   */
  .v-toast[data-variant='tonal'] .v-toast-close[data-tone] {
    --tone-text-tinted: var(--toast-accent);
    --tone-bg-soft: color-mix(in oklab, var(--toast-accent), transparent 88%);
  }

  .v-toast[data-variant='solid'] .v-toast-close[data-tone] {
    --tone-text-tinted: currentcolor;
    --tone-bg-soft: color-mix(in oklab, currentcolor, transparent 85%);
  }

  .v-toast-icon {
    --vectis-icon-size: var(--vectis-icon-size-md);
    /* Aligns the icon (20px) on the centre of the first line of text */
    margin-block-start: calc(var(--vectis-space-1) / 2);
  }

  .v-toast-body {
    flex: 1;
    min-width: 0;
    /* Messages may contain unbreakable strings (URLs, ids) */
    overflow-wrap: anywhere;
  }

  .v-toast-title {
    margin-block-end: var(--vectis-space-1);
    /* semibold: state emphasis, not a type role */
    font-weight: var(--vectis-font-weight-semibold);
  }

  .v-toast-close {
    /* Reduces the button's visual footprint inside the card's padding. The block
       inset is SYMMETRIC: the cross (28px) stays aligned at the head of the card like
       the icon (align-items: flex-start, hence hooked to the first line whatever the
       number of lines), but its overhang no longer pulls the content upwards — on a
       single line, it ends up vertically centred. */
    margin-block: calc(-1 * var(--vectis-space-1));
    margin-inline-end: calc(-1 * var(--vectis-space-1));
  }

  /*
   * Entry of a toast inserted into an already-open stack: it slides in from the edge
   * (--toast-enter-y set by .v-toast-stack according to the placement).
   * @starting-style applies to any DOM insertion — progressive enhancement, an
   * appearance with no animation otherwise. The exit is not animated: that would mean
   * holding the item in the queue for the duration of the transition (a simplicity
   * choice); the stack emptying does fade out, through hidePopover() + allow-discrete
   * (see VToaster).
   */
  .v-toast {
    transition:
      opacity var(--vectis-duration-base) var(--vectis-ease-default),
      translate var(--vectis-duration-base) var(--vectis-ease-default);
  }

  @starting-style {
    .v-toast {
      opacity: 0;
      translate: 0 var(--toast-enter-y, 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .v-toast {
      transition: none;
    }
  }
}
</style>
