<script setup lang="ts">
// @a11y
/**
 * A message that stays in the flow of the page. It carries no live role unless asked: a page
 * that renders alerts on load would otherwise have them all read out at once.
 */

import { computed } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { iconProps } from '../VIcon/iconProps'
import { check_circle as checkCircleIcon } from '../VIcon/icons/check_circle'
import { close as closeIcon } from '../VIcon/icons/close'
import { error as errorIcon } from '../VIcon/icons/error'
import { info as infoIcon } from '../VIcon/icons/info'
import { warning as warningIcon } from '../VIcon/icons/warning'
import type { IconSource } from '../VIcon/types'
import VIconButton from '../VIconButton/VIconButton.vue'
import { useMessages } from '../../i18n/state'

/** How the alert is painted: a tinted surface, or the page surface inside a tinted border. */
export type AlertVariant = 'soft' | 'outline'
/** What the alert means, in colour. */
export type AlertTone = 'neutral' | 'accent' | 'danger' | 'success' | 'warning'

interface AlertProps {
  /**
   * How the alert is painted: a surface tinted with the tone (`soft`, the default), or the page
   * surface inside a border of the tone (`outline`), for an alert that should weigh less.
   */
  variant?: AlertVariant
  /** What the alert means, expressed as a colour. It also picks the default icon. */
  tone?: AlertTone
  /** A short line above the message, in bold. The `#title` slot replaces it. */
  title?: string
  /**
   * The icon before the text: an icon name, or an explicit render (the VIcon contract). Left
   * out, the tone brings its own.
   */
  icon?: IconSource
  /** Draws no icon at all, neither the one given nor the tone's. */
  hideIcon?: boolean
  /** Adds a close cross, which sets `open` to false and emits `close`. */
  closable?: boolean
  /** What the close cross does, in words. It falls back to the design system dictionary. */
  closeLabel?: string
  /**
   * Makes the alert a live region, for a message that appears in answer to what the reader
   * did: `role="alert"` for the `danger` tone, which interrupts, `role="status"` otherwise.
   */
  live?: boolean
}

const props = withDefaults(defineProps<AlertProps>(), {
  variant: 'soft',
  tone: 'accent',
  title: undefined,
  icon: undefined,
  hideIcon: false,
  closable: false,
  closeLabel: undefined,
  live: false,
})

/**
 * Whether the alert is shown. It is true by default, unlike other boolean props: an alert is
 * there until something takes it away, and binding the model is only needed to bring it back.
 */
const open = defineModel<boolean>('open', { default: true })

const emit = defineEmits<{
  /** The reader closed the alert with its cross. `open` has already turned false. */
  close: []
}>()

defineSlots<{
  /** The message. */
  default?(): unknown
  /** Replaces the `title` prop with content of your own. */
  title?(): unknown
  /** Buttons or links under the message. */
  actions?(): unknown
}>()

const m = useMessages()
const resolvedCloseLabel = computed(() => props.closeLabel ?? m.value.common.close)

const DEFAULT_ICONS: Record<AlertTone, IconSource> = {
  neutral: infoIcon,
  accent: infoIcon,
  success: checkCircleIcon,
  danger: errorIcon,
  warning: warningIcon,
}

const resolvedIcon = computed(() =>
  props.hideIcon ? undefined : iconProps(props.icon ?? DEFAULT_ICONS[props.tone]),
)

const role = computed(() =>
  props.live ? (props.tone === 'danger' ? 'alert' : 'status') : undefined,
)

function close() {
  open.value = false
  emit('close')
}
</script>

<template>
  <div v-if="open" :role="role" class="v-alert v-tone" :data-variant="variant" :data-tone="tone">
    <VIcon v-if="resolvedIcon" class="v-alert-icon" v-bind="resolvedIcon" />
    <div class="v-alert-body">
      <p v-if="$slots.title || title" class="v-alert-title">
        <slot name="title">{{ title }}</slot>
      </p>
      <div v-if="$slots.default" class="v-alert-message">
        <slot />
      </div>
      <div v-if="$slots.actions" class="v-alert-actions">
        <slot name="actions" />
      </div>
    </div>
    <VIconButton
      v-if="closable"
      class="v-alert-close"
      :label="resolvedCloseLabel"
      size="sm"
      @click="close"
    >
      <VIcon :name="closeIcon" />
    </VIconButton>
  </div>
</template>

<style>
@layer vectis.components {
  /*
   * The colours come from the shared tone table (styles/tones.css, `.v-tone`), read here rather
   * than through `.v-variant`: the alert paints its own border and keeps the message in the body
   * text colour, which no shared variant does.
   */
  .v-alert {
    /* The height of one line of text, which the icon and the cross are centred against. */
    --alert-line: calc(var(--vectis-text-body-md-size) * var(--vectis-text-body-md-leading));

    display: flex;
    align-items: flex-start;
    gap: var(--vectis-space-3);
    padding: var(--vectis-space-3) var(--vectis-space-4);
    border: 1px solid var(--tone-border-soft);
    border-radius: var(--vectis-radius-surface);
    color: var(--vectis-color-text);
    font-family: var(--vectis-text-family);
    font-size: var(--vectis-text-body-md-size);
    font-weight: var(--vectis-text-body-md-weight);
    line-height: var(--vectis-text-body-md-leading);
  }

  .v-alert[data-variant='soft'] {
    background: var(--tone-bg-soft);
  }

  .v-alert[data-variant='outline'] {
    background: var(--vectis-color-surface);
  }

  .v-alert-icon {
    --vectis-icon-size: var(--vectis-icon-size-md);
    flex: none;
    margin-block: calc((var(--alert-line) - var(--vectis-icon-size-md)) / 2);
    color: var(--tone-text-tinted);
  }

  /* Long unbroken text, a URL in an error message, wraps instead of widening the alert. */
  .v-alert-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--vectis-space-1);
    min-inline-size: 0;
    overflow-wrap: anywhere;
  }

  .v-alert-title {
    color: var(--tone-text-tinted);
    /*
     * The heavier weight marks the title against its own message, which is emphasis rather than
     * a typographic role; hence a font token read directly.
     */
    font-weight: var(--vectis-font-weight-semibold);
  }

  .v-alert-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--vectis-space-2);
    margin-block-start: var(--vectis-space-2);
  }

  /*
   * The cross keeps the height of a small control but is centred on the first line, and gives
   * back its own padding so it does not double the alert's gutter.
   */
  .v-alert-close {
    flex: none;
    margin-block: calc((var(--alert-line) - var(--vectis-control-height-sm)) / 2);
    margin-inline-end: calc(-1 * var(--vectis-space-2));
  }

  /*
   * A neutral ghost hovers in grey, which turns muddy on a tinted surface: the cross hovers in a
   * tint of the alert's own tone instead. The tone table sits in a lower layer, so this rebind
   * wins whatever the specificity of the button's `[data-tone]` row.
   */
  .v-alert .v-alert-close[data-tone] {
    --tone-text-tinted: var(--vectis-color-text-muted);
    --tone-bg-soft: color-mix(in oklab, currentcolor, transparent 88%);
  }
}
</style>
