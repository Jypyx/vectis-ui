<script setup lang="ts">
// @core
/**
 * A native modal `<dialog>` pinned to one edge of the viewport, its model bridged by
 * useModalDialog. It stays rendered through its exit, so it slides out as it slid in.
 */

import { computed, useId } from 'vue'

import type { DialogTriggerProps } from '../VDialog/VDialog.vue'
import VIcon from '../VIcon/VIcon.vue'
import { close as closeIcon } from '../VIcon/icons/close'
import VIconButton from '../VIconButton/VIconButton.vue'
import VTypography from '../VTypography/VTypography.vue'
import { useModalDialog } from '../../composables/useModalDialog'
import { useMessages } from '../../i18n/state'
import { cssSize } from '../../utils/css'

/** The edge the drawer comes from. `start` and `end` follow the writing direction. */
export type DrawerSide = 'start' | 'end' | 'top' | 'bottom'

/** The width of a drawer on a side, or the height of one at the top or bottom. */
export type DrawerSize = 'sm' | 'md' | 'lg'

interface DrawerProps {
  /**
   * The title of the drawer, which also names it for assistive technology. It is ignored when
   * the `#header` slot replaces the whole header.
   */
  title?: string
  /** A line under the title. */
  subtitle?: string
  /** The edge the drawer comes from. `start` and `end` follow the writing direction. */
  side?: DrawerSide
  /**
   * How far the drawer reaches into the page: its width on a side, its height at the top or
   * bottom. Each step reads a `--vectis-control-size-drawer-*` token.
   */
  size?: DrawerSize
  /**
   * A length replacing `size`: a number is read as pixels, a string as any CSS length. The
   * drawer always leaves a strip of the page uncovered, which a click closes it through.
   */
  extent?: number | string
  /**
   * Takes the close cross out of the header, leaving the reader with Escape, the backdrop and
   * whatever the footer offers.
   */
  hideClose?: boolean
  /** Stops a click outside the drawer from closing it. */
  persistentBackdrop?: boolean
  /**
   * Stops the Escape key from closing the drawer. Refusing Escape while the backdrop still
   * closes cannot be expressed natively, so both routes are then allowed.
   */
  persistentEscape?: boolean
  /** What the close cross does, in words. It falls back to the design system dictionary. */
  closeLabel?: string
}

const props = withDefaults(defineProps<DrawerProps>(), {
  title: undefined,
  subtitle: undefined,
  side: 'end',
  size: 'md',
  extent: undefined,
  hideClose: false,
  persistentBackdrop: false,
  persistentEscape: false,
  closeLabel: undefined,
})

const m = useMessages()
const resolvedCloseLabel = computed(() => props.closeLabel ?? m.value.common.close)

/** Whether the drawer is showing. */
const open = defineModel<boolean>('open', { default: false })

defineSlots<{
  /** The body of the drawer. This is the part that scrolls when there is too much of it. */
  default(): unknown
  /** Replaces the title and subtitle block with content of your own. */
  header?(): unknown
  /** Extra controls in the header, placed before the close cross. */
  'header-actions'?(): unknown
  /** The buttons at the foot of the drawer. */
  footer?(): unknown
  /**
   * The button that opens the drawer. Bind the `triggerProps` it receives onto it. It stays
   * rendered always, unlike the drawer itself.
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
  exitTransition: true,
})

const triggerProps = computed<DialogTriggerProps>(() => ({
  onClick: show,
  'aria-haspopup': 'dialog',
}))

defineExpose({
  /**
   * Opens the drawer, exactly as setting `open` does. The opening lands on the next tick: the
   * promise returned settles once the drawer is showing.
   */
  show,
  /**
   * Closes the drawer. It closes unconditionally, `persistentEscape` and `persistentBackdrop`
   * governing only the two routes the reader can take.
   */
  close,
  /**
   * The `<dialog>` element. It is null while closed, once its exit has played: each opening
   * from there builds a fresh one.
   */
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
    class="v-drawer"
    :data-side="side"
    :data-size="size"
    :style="{ '--drawer-extent': cssSize(extent) }"
    @close="onClose"
    @cancel="onCancel"
    @pointerdown="onPointerdown"
    @click="onBackdropClick"
  >
    <!--
      As in VDialog, only the body scrolls, and the lines under the header and above the footer
      are drawn by sentinels stuck inside the scrolling area, which a scroll-state query reaches.
    -->
    <header class="v-drawer-header">
      <slot name="header">
        <div class="v-drawer-titles">
          <VTypography
            v-if="title"
            :id="titleId"
            as="h2"
            variant="heading-3"
            class="v-drawer-title"
          >
            {{ title }}
          </VTypography>
          <VTypography
            v-if="subtitle"
            :id="subtitleId"
            variant="subtitle"
            tone="muted"
            class="v-drawer-subtitle"
          >
            {{ subtitle }}
          </VTypography>
        </div>
      </slot>
      <div v-if="!hideClose || $slots['header-actions']" class="v-drawer-header-actions">
        <slot name="header-actions" />
        <VIconButton
          v-if="!hideClose"
          class="v-drawer-close"
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
    <div class="v-drawer-scroll">
      <span class="v-drawer-edge v-drawer-edge--top" aria-hidden="true" />
      <div class="v-drawer-body">
        <slot />
      </div>
      <span class="v-drawer-edge v-drawer-edge--bottom" aria-hidden="true" />
    </div>
    <footer v-if="$slots.footer" class="v-drawer-footer">
      <slot name="footer" />
    </footer>
  </dialog>
</template>

<style>
@layer vectis.components {
  .v-drawer {
    /*
     * Declared on the element rather than as a `var()` fallback: a drawer opened from inside
     * another is its DOM descendant, and would otherwise inherit that drawer's inline extent.
     */
    --drawer-extent: var(--vectis-control-size-drawer-md);
    /* Where the drawer waits off screen, before it enters and after it leaves. */
    --drawer-offset: 100% 0;
    /*
     * Fixed explicitly rather than left to the modal's UA style: an engine without `overlay`
     * takes the drawer out of the top layer the moment it closes, and it must not fall back
     * into the page while it slides out.
     */
    position: fixed;
    inset: 0;
    margin: 0;
    inline-size: auto;
    block-size: auto;
    max-inline-size: none;
    max-block-size: none;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0;
    border: none;
    background: var(--vectis-color-surface-overlay);
    color: var(--vectis-color-text);
    box-shadow: var(--vectis-shadow-xl);
    font-family: var(--vectis-text-family);
    /*
     * `display` and `overlay` switch at the END of the exit, which keeps the closed drawer
     * painted, and in the top layer, while it slides out.
     */
    transition:
      translate var(--vectis-duration-slow) var(--vectis-ease-out),
      display var(--vectis-duration-slow) allow-discrete,
      overlay var(--vectis-duration-slow) allow-discrete;
  }

  .v-drawer[data-size='sm'] {
    --drawer-extent: var(--vectis-control-size-drawer-sm);
  }

  .v-drawer[data-size='lg'] {
    --drawer-extent: var(--vectis-control-size-drawer-lg);
  }

  /* The uncovered strip keeps the backdrop within reach, to see the page and to close. */
  .v-drawer[data-side='start'],
  .v-drawer[data-side='end'] {
    inline-size: var(--drawer-extent);
    max-inline-size: calc(100dvi - var(--vectis-space-12));
  }

  .v-drawer[data-side='top'],
  .v-drawer[data-side='bottom'] {
    block-size: var(--drawer-extent);
    max-block-size: calc(100dvb - var(--vectis-space-12));
  }

  /* The corners against the viewport stay square; the two facing the page are rounded. */
  .v-drawer[data-side='start'] {
    --drawer-offset: -100% 0;
    inset-inline-end: auto;
    border-start-end-radius: var(--vectis-radius-overlay);
    border-end-end-radius: var(--vectis-radius-overlay);
  }

  .v-drawer[data-side='end'] {
    inset-inline-start: auto;
    border-start-start-radius: var(--vectis-radius-overlay);
    border-end-start-radius: var(--vectis-radius-overlay);
  }

  /* A translation is physical: in a right-to-left page the inline sides swap directions. */
  .v-drawer[data-side='start']:dir(rtl) {
    --drawer-offset: 100% 0;
  }

  .v-drawer[data-side='end']:dir(rtl) {
    --drawer-offset: -100% 0;
  }

  .v-drawer[data-side='top'] {
    --drawer-offset: 0 -100%;
    bottom: auto;
    border-bottom-left-radius: var(--vectis-radius-overlay);
    border-bottom-right-radius: var(--vectis-radius-overlay);
  }

  .v-drawer[data-side='bottom'] {
    --drawer-offset: 0 100%;
    top: auto;
    border-top-left-radius: var(--vectis-radius-overlay);
    border-top-right-radius: var(--vectis-radius-overlay);
  }

  /*
   * An indispensable guard: the display declared above beats the browser's own rule hiding a
   * closed dialog. Through the exit, the transition holds `display` back, and a closed drawer
   * sliding away lets clicks through to the page it uncovers.
   */
  .v-drawer:not([open]) {
    display: none;
    translate: var(--drawer-offset);
    pointer-events: none;
    transition-timing-function: var(--vectis-ease-in);
  }

  @starting-style {
    .v-drawer[open] {
      translate: var(--drawer-offset);
    }
  }

  .v-drawer::backdrop {
    background: var(--vectis-color-backdrop);
    transition:
      opacity var(--vectis-duration-slow) var(--vectis-ease-default),
      display var(--vectis-duration-slow) allow-discrete,
      overlay var(--vectis-duration-slow) allow-discrete;
  }

  .v-drawer:not([open])::backdrop {
    opacity: 0;
  }

  @starting-style {
    .v-drawer[open]::backdrop {
      opacity: 0;
    }
  }

  /* No ring around the whole drawer when opening focuses it: the controls inside show theirs. */
  .v-drawer:focus-visible {
    outline: none;
  }

  .v-drawer-scroll {
    /* The zero minimum lets the flex item shrink below its content, so that it scrolls. */
    flex: 1 1 auto;
    min-block-size: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    display: flex;
    flex-direction: column;
    container-type: scroll-state;
  }

  /* Negative margins make the sentinels occupy no space at all. */
  .v-drawer-edge {
    flex: none;
    block-size: 1px;
    position: sticky;
    background: transparent;
  }

  .v-drawer-edge--top {
    inset-block-start: 0;
    margin-block-end: -1px;
  }

  .v-drawer-edge--bottom {
    inset-block-end: 0;
    margin-block-start: -1px;
  }

  .v-drawer-header {
    flex: none;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--vectis-space-4);
    padding: var(--vectis-space-6) var(--vectis-space-6) var(--vectis-space-3);
  }

  .v-drawer-titles {
    display: flex;
    flex-direction: column;
    min-inline-size: 0;
  }

  .v-drawer-header-actions {
    display: flex;
    align-items: center;
    gap: var(--vectis-space-1);
    /* Pulled back by the cross's own padding, so its glyph lines up with the header's edge. */
    margin-block-start: calc(-1 * var(--vectis-space-1));
    margin-inline-end: calc(-1 * var(--vectis-space-2));
  }

  .v-drawer-body {
    /* Stretched when short, so the footer stays at the bottom of the drawer. */
    flex: 1 0 auto;
    padding: var(--vectis-space-1) var(--vectis-space-6) var(--vectis-space-3);
    font-size: var(--vectis-text-body-md-size);
    line-height: var(--vectis-text-body-md-leading);
  }

  .v-drawer-footer {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: var(--vectis-space-3);
    padding: var(--vectis-space-3) var(--vectis-space-6) var(--vectis-space-6);
  }

  /* Where scroll-state queries are missing, the sentinels simply stay transparent. */
  @container scroll-state(scrollable: top) {
    .v-drawer-edge--top {
      background: var(--vectis-color-border);
    }
  }

  @container scroll-state(scrollable: bottom) {
    .v-drawer-edge--bottom {
      background: var(--vectis-color-border);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .v-drawer,
    .v-drawer::backdrop {
      transition: none;
    }
  }

  /* An outline draws one without moving the layout by a pixel. */
  @media (forced-colors: active) {
    .v-drawer {
      outline: 1px solid CanvasText;
    }
  }
}
</style>
