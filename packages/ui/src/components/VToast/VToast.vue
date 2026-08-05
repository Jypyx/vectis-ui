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
    class="v-toast v-tone"
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
    /* Height of ONE line of message text, the alignment unit of the whole card:
       every satellite (icon, close cross) is given symmetric block margins so its
       OUTER box measures exactly that. Flex-start then hooks each of them to the
       first line whatever the number of lines AND, on a single line, coincides with
       centring — CSS cannot count lines, so the two cases must fall out of one rule.
       Asymmetric margins are what break it: they shift the item's centre by half the
       difference and make it drive a flex line taller than the text. */
    --toast-line: calc(var(--vectis-text-body-md-size) * var(--vectis-text-body-md-leading));
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

  /* The tone table lives in styles/tones.css (class `v-tone`, layer vectis.tokens),
     shared with VButton and VChip: the four chromatic tones were its values under
     three other names (--tone-bg-soft, --tone-border-soft, --toast-accent), so the
     usages below now read the shared contract directly.

     --toast-accent survives as its OWN name because the close cross re-binds
     --tone-text-tinted inside this subtree (below): aliasing them would make that a
     self-reference. The value is resolved here, on the toast, so the cross inherits
     the tone's accent already computed. */
  .v-toast {
    --toast-accent: var(--tone-text-tinted);
  }

  /* The one tone VToast disagrees on: an overlay surface in tonal, an inverted
     contrast (tooltip style) in solid — neutral has no -surface/-border/-text
     variants. One layer above the shared table, so it wins whatever the sheet
     order. */
  .v-toast[data-tone='neutral'] {
    --tone-bg-soft: var(--vectis-color-surface-overlay);
    --tone-border-soft: var(--vectis-color-border);
    --toast-accent: var(--vectis-color-text);
    --tone-bg-solid: var(--vectis-color-surface-inverse);
    --tone-text-solid: var(--vectis-color-text-on-inverse);
  }

  .v-toast[data-variant='tonal'] {
    background: var(--tone-bg-soft);
    border: 1px solid var(--tone-border-soft);
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
   * Close cross: a ghost/neutral VIconButton, recoloured through the shared tone
   * variables (--tone-text-tinted / --tone-bg-soft). It wins TWICE over the table the
   * cross gets from `v-tone` — higher specificity (0,3,0) and a layer above — so no
   * sheet order is involved. In tonal: a cross in the tone's accent colour; in solid:
   * currentcolor (readable on the full background).
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
    margin-block: calc((var(--toast-line) - var(--vectis-icon-size-md)) / 2);
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
    /* MIRRORS the size="sm" compact of the VIconButton in the template: the CSS
       cannot read the button's own --control-height (it lives inside its subtree),
       and the two must be changed together. */
    --toast-close-height: calc(var(--vectis-control-height-sm) - var(--vectis-space-1));
    /* Negative here (the cross is taller than a line), which is also what reduces its
       visual footprint inside the card's padding — see --toast-line. */
    margin-block: calc((var(--toast-line) - var(--toast-close-height)) / 2);
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
