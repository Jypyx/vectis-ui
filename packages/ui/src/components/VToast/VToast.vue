<script setup lang="ts">
import { computed } from 'vue'

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

// @a11y
/**
 * The card one notification is drawn on. It holds no state and decides nothing: the
 * VToaster renders it, and it is internal to the component — never exported.
 *
 * How insistently it is announced follows its tone. A failure or a warning interrupts
 * whatever a screen reader is saying; anything else waits for a pause. There is a
 * known trade-off in the polite case: some screen readers miss the FIRST notification
 * of a stack, because the region that announces it comes into existence already
 * holding its text. The interruptive ones are always announced.
 */
const props = defineProps<{
  /** The notification to draw, with all its options already resolved. */
  item: ToastItem
  /** What the close cross does, in words. */
  closeLabel: string
}>()

const emit = defineEmits<{
  /**
   * The reader asked for this notification to go. The card removes nothing itself —
   * the queue belongs to the VToaster.
   */
  close: [id: number]
}>()

const role = computed(() =>
  props.item.tone === 'danger' || props.item.tone === 'warning' ? 'alert' : 'status',
)

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
      @click="emit('close', item.id)"
    >
      <VIcon :name="closeIcon" />
    </VIconButton>
  </div>
</template>

<style>
@layer vectis.components {
  /* The box, the decoration, the typography and the entry motion come from the shared
     `.v-banner` class set on this same element — the chassis this card has in common
     with the snackbar, in `styles/banner.css`. What stays here is what the two
     genuinely differ on: the alignment, the padding, the width, and the whole of the tone
     painting.
     `--banner-line`, the one-line alignment unit both use, is defined there. */
  .v-toast {
    /* A notification hooks its icon and its cross to the FIRST line of the message: it
       may carry a title and several lines, and the eye reads the icon against the text it
       introduces, not against the middle of a paragraph. The `--banner-line` margins are
       what make that identical to centring on a single line. (VSnackbar centres instead —
       one short sentence, and a control that would sit in a corner otherwise.) */
    align-items: flex-start;
    padding: var(--vectis-space-3) var(--vectis-space-4);
    width: var(--toast-width, var(--vectis-control-size-toast-width));
    /* On a narrow screen the card is never wider than the viewport, the stack's own
       margins deducted. */
    max-width: calc(100vw - 2 * var(--vectis-space-4));
  }

  /* The tone table itself lives in styles/tones.css, in a layer below the components,
     and is shared with VButton and VChip. The rules below read that shared contract
     directly rather than restating any of its colours.

     One local name survives, and for a precise reason: the close cross rebinds the
     tone's text colour inside its own subtree further down, so pointing this variable
     at that one would turn into a self-reference. It is resolved here, on the card, so
     that the cross inherits a value already computed rather than recomputing it in a
     context where it no longer means the same thing. */
  .v-toast {
    --toast-accent: var(--tone-text-tinted);
  }

  /* The neutral tone is overridden here, and for the soft variant only. A notification
     floats above the page rather than sitting in it, so it takes the overlay
     background and the plain border that goes with it, where the shared table assumes
     a surface within the page.

     The solid pair is deliberately left alone: its text and surface inversion is
     canonical across the design system. This block sits one layer above the table, so
     it wins whatever order the two sheets end up in. */
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
   * The close cross is an ordinary neutral button, recoloured by rebinding the very
   * variables its own tone table reads. These rules win over that table TWICE — they
   * are more specific AND they sit in a layer above it — so no sheet order can change
   * the outcome.
   *
   * On a tinted card the cross takes the tone's own accent; on a fully coloured one it
   * takes the surrounding text colour, which is the only thing guaranteed to be
   * readable against that background.
   */
  .v-toast[data-variant='soft'] .v-toast-close[data-tone] {
    --tone-text-tinted: var(--toast-accent);
    --tone-bg-soft: color-mix(in oklab, var(--toast-accent), transparent 88%);
  }

  .v-toast[data-variant='solid'] .v-toast-close[data-tone] {
    --tone-text-tinted: currentcolor;
    --tone-bg-soft: color-mix(in oklab, currentcolor, transparent 85%);
  }

  .v-toast-icon {
    --vectis-icon-size: var(--vectis-icon-size-md);
    margin-block: calc((var(--banner-line) - var(--vectis-icon-size-md)) / 2);
  }

  .v-toast-body {
    flex: 1;
    min-width: 0;
    /* A message may hold something with nowhere to break — a URL, an identifier — and
       it has to wrap anyway rather than widen the card. */
    overflow-wrap: anywhere;
  }

  .v-toast-title {
    margin-block-end: var(--vectis-space-1);
    /* The heavier weight marks the title against its own message, which is emphasis
       rather than a typographic role — hence a font token read directly. */
    font-weight: var(--vectis-font-weight-semibold);
  }

  .v-toast-close {
    /* TRAP — this restates the size the template gives that button, small. The height the
       button computes for itself lives inside its own subtree, out of reach from here, so
       the two are written in two places and must be changed together — dropping `compact`
       from the template without dropping the subtraction here is the exact bug this
       comment exists for. */
    --toast-close-height: var(--vectis-control-height-sm);
    /* The cross is taller than a line of text, so this margin comes out negative —
       which is also what stops it from pushing the card's padding open. The unit it is
       measured against is the one-line height `.v-banner` defines. */
    margin-block: calc((var(--banner-line) - var(--toast-close-height)) / 2);
    /* The same inline pull-back as VSnackbar's action: both are a `sm` ghost control sitting
       at the end of a `--vectis-space-4` gutter, and a reader seeing a toast and a snackbar
       on one page would read two different gutters as a misalignment rather than as two
       components. Keep the two in step. */
    margin-inline-end: calc(-1 * var(--vectis-space-2));
  }
}
</style>
