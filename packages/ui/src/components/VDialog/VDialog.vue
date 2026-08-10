<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useAttrs, useId, watch } from 'vue'

import VIcon from '../VIcon/VIcon.vue'
import VIconButton from '../VIconButton/VIconButton.vue'
import VTypography from '../VTypography/VTypography.vue'
import { useMessages } from '../../i18n/state'

// @core
/**
 * A blocking modal built on the native `<dialog>` primitive + `showModal()`: the top
 * layer, `::backdrop`, the focus trap, the inert background and the focus return to the
 * trigger are all native, and the light dismiss is declarative through `closedby`. The
 * ONLY behavioural JS is the `v-model:open` ↔ imperative API bridge (`showModal()`
 * and `close()` have no declarative equivalent), kept SSR-safe.
 */
interface DialogProps {
  /** Title of the header (ignored when the #header slot is supplied). */
  title?: string
  /** Subtitle of the header, under the title. */
  subtitle?: string
  /** Width of the modal (any CSS unit); bounded to 100% of the viewport. */
  width?: string
  /** `alertdialog` for a modal requiring an explicit action (see VDialogAlert). */
  role?: 'dialog' | 'alertdialog'
  /** Displays the close cross in the header. */
  closable?: boolean
  /** Clicking the backdrop closes the modal. */
  closeOnBackdrop?: boolean
  /** The Escape key closes the modal. */
  closeOnEscape?: boolean
  /** Accessible name of the close cross. Default: the DS dictionary. */
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

/** Props to set on a trigger (the #trigger slot) through `v-bind="triggerProps"`. */
type TriggerProps = {
  onClick: () => void
  'aria-haspopup': 'dialog'
}

defineSlots<{
  /** Content of the modal (the scrollable zone). */
  default(): unknown
  /** Replaces the header's title/subtitle block. */
  header?(): unknown
  /** Actions placed to the left of the cross (a menu, full screen…). */
  headerActions?(): unknown
  /** Footer actions (buttons). */
  footer?(): unknown
  /** Trigger: `v-bind="triggerProps"` on a <VButton>/<button>. */
  trigger?(props: { triggerProps: TriggerProps }): unknown
}>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const dialogEl = ref<HTMLDialogElement | null>(null)
const titleId = useId()
const subtitleId = useId()

/**
 * `closedby` (declarative, native): 'any' = backdrop + Escape, 'closerequest' = Escape
 * alone, 'none' = no light dismiss. The "backdrop without Escape" combination is not
 * expressible and falls back to 'any' (no component here requires it).
 */
const closedby = computed(() =>
  props.closeOnBackdrop ? 'any' : props.closeOnEscape ? 'closerequest' : 'none',
)

// @fallback
// `closedby` is not yet typed on <dialog> in lib.dom: it is set through a v-bind
// object (fallthrough + a native attribute), which sidesteps vue-tsc's per-element
// attribute check. Vue merges the fallthrough's `class`/`style` with the static class.
const rootAttrs = computed(() => ({ ...attrs, closedby: closedby.value }))

// Lazy mounting: the <dialog> (and its potentially heavy content) only exists in the
// DOM while it is open. Each opening creates a BRAND NEW element → showModal() on a
// clean DOM (always modal, hence centred), and closing removes it entirely (no leftover
// capturing clicks, no race on reopening). The #trigger slot, on the other hand, stays
// rendered at all times.
const rendered = ref(open.value)

function show() {
  open.value = true
}

function requestClose() {
  // closes the native element → fires 'close' → onClose sets open.value to false
  dialogEl.value?.close()
}

const triggerProps = computed<TriggerProps>(() => ({
  onClick: show,
  'aria-haspopup': 'dialog',
}))

// A native asymmetry of <dialog>: it emits 'close' on every close, but NO event on
// opening (unlike the popover's 'toggle'). Hence two paths for the v-model ↔ imperative
// API bridge (client only):
//  - OPENING: mount the <dialog>, then call showModal() once the DOM is in place.
//  - CLOSING: a native close (the cross, close(), Escape/backdrop) → 'close'
//    resynchronizes the v-model (onClose), then it is unmounted.
watch(open, async (value) => {
  if (value) {
    rendered.value = true
    await nextTick() // lets Vue mount the brand new <dialog> before showModal()
    dialogEl.value?.showModal()
  } else {
    dialogEl.value?.close()
    rendered.value = false
  }
})

// @ssr
onMounted(() => {
  // Watchers do not run in SSR: the initial state is replayed on mount (rendered
  // already equals open.value, so the <dialog> is present when open).
  if (open.value) dialogEl.value?.showModal()
})

// The native 'close' (the cross, close(), Escape/backdrop through closedby) → v-model resync.
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
      The header and the footer are FIXED siblings (flex: none): only the central content
      scrolls → the scrollbar stays confined to the content zone, without encroaching on
      the header or the footer. The scroll container carries
      `container-type: scroll-state`; the separators are two sticky sentinels INSIDE it
      (hence queryable descendants — container queries style descendants, never siblings).
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
          <VIcon name="close" />
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
    /* Width set inline (the width prop); never wider or taller than the viewport minus
       the margins */
    inline-size: var(--dialog-width);
    max-inline-size: calc(100dvi - 2 * var(--vectis-space-4));
    max-block-size: calc(100dvb - 2 * var(--vectis-space-4));
    /* Re-centres the modal: the UA centres modal <dialog>s through `margin: auto`, but
       our reset (`* { margin: 0 }`, the vectis.reset layer) overwrites it — it is restored
       here (the vectis.components layer, stronger than vectis.reset) */
    margin: auto;
    /* A fixed header/footer, only .v-dialog-scroll scrolls; overflow:hidden clips the
       rounded corners */
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0;
    border: none;
    border-radius: var(--vectis-radius-overlay);
    background: var(--vectis-color-surface-overlay);
    color: var(--vectis-color-text);
    box-shadow: var(--vectis-shadow-5);
    font-family: var(--vectis-text-family);
  }

  /*
   * An indispensable guard: `.v-dialog { display: flex }` (an author style) would beat
   * the UA's `dialog:not([open]) { display: none }` — a closed modal would stay in the
   * flow, at the top left, capturing clicks. The closed display:none is restored here
   * (the same role as `.v-overlay:not(:popover-open)`). It also covers the frame between
   * mounting and showModal(), and SSR.
   */
  .v-dialog:not([open]) {
    display: none;
  }

  /* The container receives the focus on opening (showModal): no ring around the whole
     modal, since the useful focus is on the internal controls */
  .v-dialog:focus-visible {
    outline: none;
  }

  .v-dialog-scroll {
    /* The ONLY zone that scrolls: it takes the room between the header and the footer,
       so the scrollbar stays confined to it */
    flex: 1 1 auto;
    min-block-size: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    /* Establishes the scroll-state query container (no size containment): its
       descendants — the sentinels — can query `scroll-state(...)` */
    container-type: scroll-state;
  }

  /*
   * Separator sentinels: thin sticky lines at the top and the bottom of the scroll zone
   * (descendants of the scroll-state container). The negative margins keep them from
   * taking up space. Transparent by default, revealed on overflow further down.
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
    flex: none; /* fixed at the top, outside the scroll area */
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

  /* Title and subtitle: rendered by VTypography (heading-3 / a muted subtitle) — the
     .v-dialog-title/.v-dialog-subtitle classes stay in place as hooks (consumer
     overrides, tests). */

  .v-dialog-header-actions {
    display: flex;
    align-items: center;
    gap: var(--vectis-space-1);
    /* Reduces the cross's footprint inside the header's padding */
    margin-block-start: calc(-1 * var(--vectis-space-1));
    margin-inline-end: calc(-1 * var(--vectis-space-2));
  }

  .v-dialog-body {
    /* It grows to fill the zone when the content is short; it keeps its natural height
       (hence overflows and scrolls) when the content is long */
    flex: 1 0 auto;
    padding: var(--vectis-space-1) var(--vectis-space-6) var(--vectis-space-3);
    color: var(--vectis-color-text);
    font-size: var(--vectis-text-body-md-size);
    line-height: var(--vectis-text-body-md-leading);
  }

  .v-dialog-footer {
    flex: none; /* fixed at the bottom, outside the scroll area */
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: var(--vectis-space-3);
    padding: var(--vectis-space-3) var(--vectis-space-6) var(--vectis-space-6);
  }

  /*
   * Conditional separators — scroll-state container queries on the sentinels.
   * `scrollable: top` = content is hidden ABOVE (we have scrolled) → the rule under the
   * header is revealed; `scrollable: bottom` = content remains BELOW → the rule above the
   * footer is revealed. Exactly "visible only when the content passes under the
   * header/footer". Support: Chrome 133+ (not yet Safari/Firefox). Graceful degradation:
   * where unsupported, the rules stay transparent.
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
   * ENTRY animation only (progressive enhancement, `@starting-style`). Lazy mounting
   * removes the <dialog> from the DOM on closing: there is no exit animation (the price
   * of a clean DOM with no reopening race), so no `overlay`/`display allow-discrete` is
   * needed. The freshly mounted element starts from the @starting-style values then
   * reaches the open state.
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
