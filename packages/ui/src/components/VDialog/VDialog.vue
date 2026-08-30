<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useAttrs, useId, watch } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import { close as closeIcon } from '../VIcon/icons/close'
import VIconButton from '../VIconButton/VIconButton.vue'
import VTypography from '../VTypography/VTypography.vue'
import { useMessages } from '../../i18n/state'

// @core
/**
 * A modal dialog: it takes over the page until the reader answers it.
 *
 * Almost everything that makes a modal correct comes free with the native `<dialog>`
 * element opened as a modal — it is drawn above the whole page, the background is
 * dimmed and made unusable, the focus is trapped inside it and handed back to the
 * trigger on closing, and whether a click outside or Escape dismisses it is declared
 * with an attribute rather than coded.
 *
 * The ONLY behavioural JavaScript is the bridge between `v-model:open` and the two
 * methods the platform offers no declarative equivalent for: opening as a modal, and
 * closing.
 */
interface DialogProps {
  /**
   * The title of the dialog, which also names it for assistive technology. It is
   * ignored when the `#header` slot replaces the whole header.
   */
  title?: string
  /** A line under the title, explaining what the dialog is asking. */
  subtitle?: string
  /**
   * How wide the dialog is, in any CSS unit. It is never allowed to exceed the width
   * of the viewport.
   */
  width?: string
  /**
   * What kind of dialog this is. `alertdialog` is for one that must be answered
   * explicitly, and it makes screen readers announce it more insistently — see
   * VDialogAlert, which is exactly that.
   */
  role?: 'dialog' | 'alertdialog'
  /** Shows the close cross in the header. */
  closable?: boolean
  /** Lets a click outside the dialog close it. */
  closeOnBackdrop?: boolean
  /** Lets the Escape key close the dialog. */
  closeOnEscape?: boolean
  /** What the close cross does, in words. It falls back to the design system dictionary. */
  closeLabel?: string
}

const props = withDefaults(defineProps<DialogProps>(), {
  title: undefined,
  subtitle: undefined,
  width: '400px',
  role: 'dialog',
  closable: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
  closeLabel: undefined,
})

const m = useMessages()
const resolvedCloseLabel = computed(() => props.closeLabel ?? m.value.common.close)

const open = defineModel<boolean>('open', { default: false })

/** What the trigger has to carry: the click that opens the dialog, and the fact that it does. */
type TriggerProps = {
  onClick: () => void
  'aria-haspopup': 'dialog'
}

defineSlots<{
  /** The body of the dialog. This is the part that scrolls when there is too much of it. */
  default(): unknown
  /** Replaces the title and subtitle block with content of your own. */
  header?(): unknown
  /** Extra controls in the header, placed before the close cross — a menu, a full-screen toggle. */
  headerActions?(): unknown
  /** The buttons at the foot of the dialog. */
  footer?(): unknown
  /**
   * The button that opens the dialog. Bind the `triggerProps` it receives onto it. It
   * stays rendered at all times, unlike the dialog itself.
   */
  trigger?(props: { triggerProps: TriggerProps }): unknown
}>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const dialogEl = ref<HTMLDialogElement | null>(null)
const titleId = useId()
const subtitleId = useId()

/**
 * Which dismissals the browser itself accepts, declared as an attribute rather than
 * handled in code: everything, Escape alone, or nothing.
 *
 * One combination cannot be expressed that way — a click outside allowed while Escape
 * is not — and it falls back to allowing both. Nothing in the design system asks for
 * it, and it would be a strange thing to want.
 */
const closedby = computed(() =>
  props.closeOnBackdrop ? 'any' : props.closeOnEscape ? 'closerequest' : 'none',
)

// @fallback
// The `closedby` attribute is newer than the type definitions shipped with
// TypeScript, so writing it directly in the template would be reported as an unknown
// attribute. Passing it inside a bound object goes through the same path as any
// forwarded attribute, which is not checked element by element. Vue still merges the
// `class` and `style` it may contain with the static ones below.
const rootAttrs = computed(() => ({ ...attrs, closedby: closedby.value }))

// The dialog and its content only exist while it is open, which also spares the page
// whatever heavy thing it contains. Every opening therefore builds a BRAND NEW
// element, so it is always opened as a modal from a clean slate, and closing removes
// it entirely — nothing is left behind to swallow clicks, and reopening cannot race
// with a closing that is still finishing. The trigger, by contrast, stays rendered at
// all times.
const rendered = ref(open.value)

function show() {
  open.value = true
}

function requestClose() {
  // Closing the element is enough: the browser then fires its own close event, which
  // is what puts the model back in step below.
  dialogEl.value?.close()
}

const triggerProps = computed<TriggerProps>(() => ({
  onClick: show,
  'aria-haspopup': 'dialog',
}))

// The `<dialog>` element is asymmetric in a way that shapes this whole bridge: it
// announces every closing with an event, but announces nothing at all when it opens —
// where a popover reports both. So the two directions are not written the same way:
//
//  - opening: render the element, then, once Vue has actually put it in the document,
//    open it as a modal;
//  - closing: whatever closed it — the cross, our own call, Escape, a click outside —
//    the browser's close event is what puts the model back in step, and only then is
//    the element removed.
watch(open, async (value) => {
  if (value) {
    rendered.value = true
    await nextTick() // the brand new <dialog> has to exist before it can be opened
    dialogEl.value?.showModal()
  } else {
    dialogEl.value?.close()
    rendered.value = false
  }
})

// @ssr
onMounted(() => {
  // A watcher does not run during the server render, so a dialog asked to be open from
  // the start would never be opened. The element is already there — the flag above was
  // initialized from the model — it just has to be told to show itself.
  if (open.value) dialogEl.value?.showModal()
})

// The browser's own close event, whatever caused it, is what brings the model back in
// step with reality.
function onClose() {
  open.value = false
}

defineExpose({ show, close: requestClose, el: dialogEl })
</script>

<template>
  <slot name="trigger" :trigger-props="triggerProps" />
  <dialog
    v-if="rendered"
    ref="dialogEl"
    v-bind="rootAttrs"
    class="v-dialog"
    :style="{ '--dialog-width': width }"
    :role="role === 'alertdialog' ? 'alertdialog' : undefined"
    :aria-labelledby="title ? titleId : undefined"
    :aria-describedby="subtitle ? subtitleId : undefined"
    @close="onClose"
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
      <div v-if="closable || $slots.headerActions" class="v-dialog-header-actions">
        <slot name="headerActions" />
        <VIconButton
          v-if="closable"
          class="v-dialog-close"
          :label="resolvedCloseLabel"
          variant="ghost"
          tone="neutral"
          size="sm"
          @click="requestClose"
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
    /* The width comes from the prop, set inline. Whatever it asks for, the dialog is
       never allowed past the viewport, margins included. */
    inline-size: var(--dialog-width);
    max-inline-size: calc(100dvi - 2 * var(--vectis-space-4));
    max-block-size: calc(100dvb - 2 * var(--vectis-space-4));
    /* This puts the dialog back in the middle of the screen. The browser centres a
       modal with an automatic margin, which the design system's own reset — where
       every element loses its margins — had removed; restoring it here works because
       the component layer is stronger than the reset one. */
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
   * An indispensable guard. The browser hides a closed dialog with a rule of its own,
   * but any display we declare above beats it — so without this, a closed dialog would
   * sit in the page at the top left, swallowing clicks.
   *
   * It also covers the two moments where the element exists without being open yet: the
   * frame between rendering it and opening it, and the server-rendered markup. The
   * popovers have the very same guard.
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
    /* The ONLY part that scrolls. It takes whatever room is left between the header
       and the footer, which is what keeps the scrollbar confined to it. The zero
       minimum is load-bearing: without it a flex item refuses to shrink below its
       content, and nothing would ever scroll. */
    flex: 1 1 auto;
    min-block-size: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    /* This makes the box something its descendants can ask questions about — namely
       whether there is content hidden above or below. It adds no containment of size. */
    container-type: scroll-state;
  }

  /*
   * The two sentinels: hairlines stuck to the top and the bottom of the scrolling
   * area, and descendants of it, which is what allows them to ask about its scroll
   * state. Their negative margins mean they occupy no space at all. They are
   * transparent until the rules further down reveal them.
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
    flex: none; /* stays at the top, outside whatever scrolls */
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
    color: var(--vectis-color-text);
    font-size: var(--vectis-text-body-md-size);
    line-height: var(--vectis-text-body-md-leading);
  }

  .v-dialog-footer {
    flex: none; /* stays at the bottom, outside whatever scrolls */
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: var(--vectis-space-3);
    padding: var(--vectis-space-3) var(--vectis-space-6) var(--vectis-space-6);
  }

  /*
   * The lines only appear when they mean something. Asking the scrolling area whether
   * it can still be scrolled upwards tells us content is hidden ABOVE, so the line
   * under the header is shown; the same question downwards reveals the one above the
   * footer. In other words each line is drawn exactly when content is passing behind
   * the edge it marks.
   *
   * This kind of query is Chrome 133 and later for now. Where it is missing the
   * sentinels simply stay transparent, which is the intended fallback.
   */
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
   * The dialog animates on the way IN and not on the way out. Since it is removed from
   * the page the moment it closes, there is nothing left to animate out — that is the
   * price of the clean slate the lazy rendering buys, and it also spares the extra
   * declarations an exit animation would need.
   *
   * The starting values below are where a freshly rendered dialog begins, before
   * settling into its open state.
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
}
</style>
