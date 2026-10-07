<script setup lang="ts">
// @core
/** A native modal `<dialog>`, its model bridged by useModalDialog. */

import { computed, useId } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { close as closeIcon } from '../VIcon/icons/close'
import VIconButton from '../VIconButton/VIconButton.vue'
import VTypography from '../VTypography/VTypography.vue'
import { useModalDialog } from '../../composables/useModalDialog'
import { useMessages } from '../../i18n/state'
import { cssSize } from '../../utils/css'

/** How assistive technology announces the dialog. */
export type DialogRole = 'dialog' | 'alertdialog'

interface DialogProps {
  /**
   * The title of the dialog, which also names it for assistive technology. It is
   * ignored when the `#header` slot replaces the whole header.
   */
  title?: string
  /** A line under the title, explaining what the dialog is asking. */
  subtitle?: string
  /**
   * How wide the dialog is: a number is read as pixels, a string as any CSS length. Left out,
   * it takes the `--vectis-control-size-dialog-width` token, 400px by default.
   */
  width?: number | string
  /**
   * What kind of dialog this is. `alertdialog` is for one that must be answered
   * explicitly, and it makes screen readers announce it more insistently. VDialogAlert is
   * exactly that.
   */
  role?: DialogRole
  /**
   * Takes the close cross out of the header, leaving the reader with Escape, the
   * backdrop and whatever the footer offers.
   */
  hideClose?: boolean
  /** Stops a click outside the dialog from closing it. */
  persistentBackdrop?: boolean
  /**
   * Stops the Escape key from closing the dialog. Note that refusing Escape while the
   * backdrop still closes cannot be expressed natively, so both routes are then
   * allowed.
   */
  persistentEscape?: boolean
  /** What the close cross does, in words. It falls back to the design system dictionary. */
  closeLabel?: string
}

const props = withDefaults(defineProps<DialogProps>(), {
  title: undefined,
  subtitle: undefined,
  width: undefined,
  role: 'dialog',
  hideClose: false,
  persistentBackdrop: false,
  persistentEscape: false,
  closeLabel: undefined,
})

const m = useMessages()
const resolvedCloseLabel = computed(() => props.closeLabel ?? m.value.common.close)

/** Whether the dialog is showing. */
const open = defineModel<boolean>('open', { default: false })

/** What the trigger has to carry: the click that opens the dialog, and the fact that it does. */
export type DialogTriggerProps = {
  onClick: () => void
  'aria-haspopup': 'dialog'
}

defineSlots<{
  /** The body of the dialog. This is the part that scrolls when there is too much of it. */
  default(): unknown
  /** Replaces the title and subtitle block with content of your own. */
  header?(): unknown
  /** Extra controls in the header, placed before the close cross: a menu, a full-screen toggle. */
  'header-actions'?(): unknown
  /** The buttons at the foot of the dialog. */
  footer?(): unknown
  /**
   * The button that opens the dialog. Bind the `triggerProps` it receives onto it. It stays
   * rendered always, unlike the dialog itself.
   */
  trigger?(props: { triggerProps: DialogTriggerProps }): unknown
}>()

defineOptions({ inheritAttrs: false })

const titleId = useId()
const subtitleId = useId()

const {
  dialogEl,
  rendered,
  rootAttrs,
  show,
  close,
  onClose,
  onCancel,
  onPointerdown,
  onBackdropClick,
} = useModalDialog(open, {
  persistentBackdrop: () => props.persistentBackdrop,
  persistentEscape: () => props.persistentEscape,
})

const triggerProps = computed<DialogTriggerProps>(() => ({
  onClick: show,
  'aria-haspopup': 'dialog',
}))

defineExpose({
  /**
   * Opens the dialog, exactly as setting `open` does. The opening lands on the next tick,
   * once the element has been rendered: `el` is still null right after the call, and the
   * promise returned settles once the dialog is showing.
   */
  show,
  /**
   * Closes the dialog. It closes unconditionally, `persistentEscape` and
   * `persistentBackdrop` governing only the two routes the reader can take.
   */
  close,
  /** The `<dialog>` element. It is null while closed: each opening builds a fresh one. */
  el: dialogEl,
})
</script>

<template>
  <slot name="trigger" :trigger-props="triggerProps" />
  <dialog
    v-if="rendered"
    ref="dialogEl"
    :aria-labelledby="title ? titleId : undefined"
    :aria-describedby="subtitle ? subtitleId : undefined"
    v-bind="rootAttrs"
    class="v-dialog"
    :style="{ '--dialog-width': cssSize(width) }"
    :role="role === 'alertdialog' ? 'alertdialog' : undefined"
    @close="onClose"
    @cancel="onCancel"
    @pointerdown="onPointerdown"
    @click="onBackdropClick"
  >
    <!--
      The header and the footer stay put while only the body scrolls, so the scrollbar
      is confined to the body and never runs along them.

      The lines that appear under the header and above the footer once the body is
      scrolled are drawn by two sentinels stuck INSIDE the scrolling area, and not by
      the header and footer themselves: a container query can only style what is inside
      the container it asks about, never a sibling of it.
    -->
    <header class="v-dialog-header">
      <slot name="header">
        <div class="v-dialog-titles">
          <VTypography
            v-if="title"
            :id="titleId"
            as="h2"
            variant="heading-3"
            class="v-dialog-title"
          >
            {{ title }}
          </VTypography>
          <VTypography
            v-if="subtitle"
            :id="subtitleId"
            variant="subtitle"
            tone="muted"
            class="v-dialog-subtitle"
          >
            {{ subtitle }}
          </VTypography>
        </div>
      </slot>
      <div v-if="!hideClose || $slots['header-actions']" class="v-dialog-header-actions">
        <slot name="header-actions" />
        <VIconButton
          v-if="!hideClose"
          class="v-dialog-close"
          :label="resolvedCloseLabel"
          variant="ghost"
          tone="neutral"
          size="sm"
          @click="close"
        >
          <VIcon :name="closeIcon" />
        </VIconButton>
      </div>
    </header>
    <div class="v-dialog-scroll">
      <span class="v-dialog-edge v-dialog-edge--top" aria-hidden="true" />
      <div class="v-dialog-body">
        <slot />
      </div>
      <span class="v-dialog-edge v-dialog-edge--bottom" aria-hidden="true" />
    </div>
    <footer v-if="$slots.footer" class="v-dialog-footer">
      <slot name="footer" />
    </footer>
  </dialog>
</template>

<style>
@layer vectis.components {
  .v-dialog {
    /*
     * The token is declared on the element rather than written as a `var()` fallback. A custom
     * property inherits, and a dialog opened from inside another one is its DOM descendant:
     * with a fallback, an alert confirming something in an 800px dialog would read that
     * dialog's inline width and open 800px wide itself, with no error anywhere.
     */
    --dialog-width: var(--vectis-control-size-dialog-width);
    inline-size: var(--dialog-width);
    max-inline-size: calc(100dvi - 2 * var(--vectis-space-4));
    max-block-size: calc(100dvb - 2 * var(--vectis-space-4));
    /*
     * Restore the modal's automatic margins in the component layer because the reset removes
     * native dialog centring.
     */
    margin: auto;
    /* The header and footer stay put while only the body scrolls, and hiding the
       overflow is what keeps the content inside the rounded corners. */
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0;
    border: none;
    border-radius: var(--vectis-radius-overlay);
    background: var(--vectis-color-surface-overlay);
    color: var(--vectis-color-text);
    box-shadow: var(--vectis-shadow-xl);
    font-family: var(--vectis-text-family);
  }

  /*
   * An indispensable guard. The browser hides a closed dialog with a rule of its own, but any
   * display we declare above beats it; so without this, a closed dialog would sit in the page
   * at the top left, swallowing clicks.
   */
  .v-dialog:not([open]) {
    display: none;
  }

  /* Opening a modal puts the focus on the dialog itself. No ring is drawn around the
     whole thing for that: the focus a reader needs to see is the one on the controls
     inside. */
  .v-dialog:focus-visible {
    outline: none;
  }

  .v-dialog-scroll {
    /*
     * The zero minimum is load-bearing: without it a flex item refuses to shrink below its
     * content, and nothing would ever scroll.
     */
    flex: 1 1 auto;
    min-block-size: 0;
    overflow-y: auto;
    /* A wheel reaching the end of the content stops there rather than scrolling the page
       behind the modal. */
    overscroll-behavior: contain;
    display: flex;
    flex-direction: column;
    /*
     * This makes the box something its descendants can ask questions about; namely whether
     * there is content hidden above or below. It adds no containment of size.
     */
    container-type: scroll-state;
  }

  /*
   * The two sentinels: hairlines stuck to the top and the bottom of the scrolling area, and
   * descendants of it, which allows them to ask about its scroll state. Their negative margins
   * mean they occupy no space at all.
   */
  .v-dialog-edge {
    flex: none;
    block-size: 1px;
    position: sticky;
    background: transparent;
  }

  .v-dialog-edge--top {
    inset-block-start: 0;
    margin-block-end: -1px;
  }

  .v-dialog-edge--bottom {
    inset-block-end: 0;
    margin-block-start: -1px;
  }

  .v-dialog-header {
    flex: none;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--vectis-space-4);
    padding: var(--vectis-space-6) var(--vectis-space-6) var(--vectis-space-3);
  }

  .v-dialog-titles {
    display: flex;
    flex-direction: column;
    min-inline-size: 0;
  }

  /* The title and the subtitle are rendered by VTypography, which carries their type.
     Their classes remain as hooks, for a consumer's overrides and for the tests. */

  .v-dialog-header-actions {
    display: flex;
    align-items: center;
    gap: var(--vectis-space-1);
    /* The cross is a button, so it carries invisible padding of its own; pulling the
       row back by that amount is what makes the glyph line up with the header's edge
       rather than floating inside it. */
    margin-block-start: calc(-1 * var(--vectis-space-1));
    margin-inline-end: calc(-1 * var(--vectis-space-2));
  }

  .v-dialog-body {
    /* Short content is stretched to fill the space, so the footer stays at the bottom
       of the dialog rather than floating halfway up; long content keeps its natural
       height, overflows, and is what scrolls. */
    flex: 1 0 auto;
    padding: var(--vectis-space-1) var(--vectis-space-6) var(--vectis-space-3);
    font-size: var(--vectis-text-body-md-size);
    line-height: var(--vectis-text-body-md-leading);
  }

  .v-dialog-footer {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: var(--vectis-space-3);
    padding: var(--vectis-space-3) var(--vectis-space-6) var(--vectis-space-6);
  }

  /* Where it is missing the sentinels simply stay transparent, which is the intended fallback. */
  @container scroll-state(scrollable: top) {
    .v-dialog-edge--top {
      background: var(--vectis-color-border);
    }
  }

  @container scroll-state(scrollable: bottom) {
    .v-dialog-edge--bottom {
      background: var(--vectis-color-border);
    }
  }

  /*
   * The dialog animates on the way in and not on the way out. Since it is removed from the page
   * the moment it closes, there is nothing left to animate out; that is the price of the clean
   * slate the lazy rendering buys, and it also spares the extra declarations an exit animation
   * would need.
   */
  .v-dialog {
    transition:
      opacity var(--vectis-duration-base) var(--vectis-ease-default),
      transform var(--vectis-duration-base) var(--vectis-ease-default);
  }

  @starting-style {
    .v-dialog[open] {
      opacity: 0;
      transform: scale(0.97);
    }
  }

  .v-dialog::backdrop {
    background: var(--vectis-color-backdrop);
    transition: opacity var(--vectis-duration-base) var(--vectis-ease-default);
  }

  @starting-style {
    .v-dialog[open]::backdrop {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .v-dialog,
    .v-dialog::backdrop {
      transition: none;
    }
  }

  /* An outline draws one without moving the layout by a pixel. */
  @media (forced-colors: active) {
    .v-dialog {
      outline: 1px solid CanvasText;
    }
  }
}
</style>
