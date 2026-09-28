<script setup lang="ts">
// @a11y
/**
 * Presentation-only notification card; VToaster owns queue state and polite/assertive
 * announcements to avoid duplicate status messages.
 */

import { computed } from 'vue'

import { cssSize } from '../../utils/css'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import { check_circle as checkCircleIcon } from '../VIcon/icons/check_circle'
import { close as closeIcon } from '../VIcon/icons/close'
import { error as errorIcon } from '../VIcon/icons/error'
import { info as infoIcon } from '../VIcon/icons/info'
import { notifications as notificationsIcon } from '../VIcon/icons/notifications'
import { warning as warningIcon } from '../VIcon/icons/warning'
import type { IconSource } from '../VIcon/types'
import VIconButton from '../VIconButton/VIconButton.vue'
import type { ToastItem, ToastTone } from './state'

const props = defineProps<{
  /** The notification to draw, with all its options already resolved. */
  item: ToastItem
  /** What the close cross does, in words. */
  closeLabel: string
}>()

const emit = defineEmits<{
  /**
   * The reader asked for this notification to go. The card removes nothing itself;
   * the queue belongs to the VToaster.
   */
  close: [id: number]
}>()

const DEFAULT_ICONS: Record<ToastTone, IconSource> = {
  neutral: notificationsIcon,
  accent: infoIcon,
  success: checkCircleIcon,
  danger: errorIcon,
  warning: warningIcon,
}

/**
 * The icon to draw: the one the notification asked for, or failing that the one its
 * tone brings. Asking for `false` means no icon at all.
 */
const icon = computed(() =>
  props.item.icon === false
    ? undefined
    : iconProps(props.item.icon ?? DEFAULT_ICONS[props.item.tone]),
)
</script>

<template>
  <div
    class="v-banner v-toast v-tone"
    :data-tone="item.tone"
    :data-variant="item.variant"
    :style="item.width !== undefined ? { '--toast-width': cssSize(item.width) } : undefined"
  >
    <VIcon v-if="icon" class="v-toast-icon" v-bind="icon" />
    <div class="v-banner-text v-toast-body">
      <p v-if="item.title" class="v-toast-title">{{ item.title }}</p>
      <p class="v-toast-message">{{ item.message }}</p>
    </div>
    <VIconButton
      v-if="!item.hideClose"
      class="v-banner-control v-toast-close"
      :label="closeLabel"
      size="sm"
      @click="emit('close', item.id)"
    >
      <VIcon :name="closeIcon" />
    </VIconButton>
  </div>
</template>

<style>
@layer vectis.components {
  /*
   * Shared banner chrome supplies decoration and motion; toast owns alignment, dimensions and
   * tone painting.
   */
  .v-toast {
    /*
     * The `--banner-line` margins are what make that identical to centring on a single line.
     * (VSnackbar centres instead; one short sentence, and a control that would sit in a corner
     * otherwise.)
     */
    align-items: flex-start;
    padding: var(--vectis-space-3) var(--vectis-space-4);
    inline-size: var(--toast-width, var(--vectis-control-size-toast-width));
    /* On a narrow screen the card is never wider than the viewport, the stack's own
       margins deducted. */
    max-inline-size: calc(100dvi - 2 * var(--vectis-space-4));
  }

  /*
   * The tone table itself lives in styles/tones.css, in a layer below the components, and is
   * shared with VButton and VChip. The rules below read that shared contract directly rather
   * than restating any of its colours.
   */
  .v-toast {
    --toast-accent: var(--tone-text-tinted);
  }

  /*
   * The neutral tone is overridden here, and for the soft variant only. A notification floats
   * above the page rather than sitting in it, so it takes the overlay background and the plain
   * border that goes with it, where the shared table assumes a surface within the page.
   */
  .v-toast[data-tone='neutral'] {
    --tone-bg-soft: var(--vectis-color-surface-overlay);
    --tone-border-soft: var(--vectis-color-border);
    --toast-accent: var(--vectis-color-text);
  }

  .v-toast[data-variant='soft'] {
    background: var(--tone-bg-soft);
    border: 1px solid var(--tone-border-soft);
    color: var(--vectis-color-text);
  }

  .v-toast[data-variant='soft'] .v-toast-icon,
  .v-toast[data-variant='soft'] .v-toast-title {
    color: var(--toast-accent);
  }

  .v-toast[data-variant='soft'] .v-toast-message {
    color: var(--vectis-color-text-muted);
  }

  .v-toast[data-variant='solid'] {
    background: var(--tone-bg-solid);
    color: var(--tone-text-solid);
  }

  /*
   * (0,4,0) is load-bearing: the shared rebind is (0,3,0) in the same layer and ships in
   * another sheet, so at equal specificity the winner would be whichever sheet the consumer's
   * bundler put last.
   */
  .v-toast[data-variant='soft'] .v-toast-close[data-tone] {
    --tone-text-tinted: var(--toast-accent);
    --tone-bg-soft: color-mix(in oklab, var(--toast-accent), transparent 88%);
  }

  .v-toast-icon {
    --vectis-icon-size: var(--vectis-icon-size-md);
    margin-block: calc((var(--banner-line) - var(--vectis-icon-size-md)) / 2);
  }

  .v-toast-title {
    margin-block-end: var(--vectis-space-1);
    /*
     * The heavier weight marks the title against its own message, which is emphasis rather than
     * a typographic role; hence a font token read directly.
     */
    font-weight: var(--vectis-font-weight-semibold);
  }

  /* An outline draws one without moving the layout. */
  @media (forced-colors: active) {
    .v-toast[data-variant='solid'] {
      outline: 1px solid CanvasText;
    }
  }
}
</style>
