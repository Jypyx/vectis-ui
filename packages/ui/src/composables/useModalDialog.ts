import { computed, nextTick, onBeforeUnmount, ref, useAttrs, watch } from 'vue'
import type { Ref } from 'vue'

// @core
/**
 * The bridge between a `v-model:open` and a native modal `<dialog>`, shared by VDialog and
 * VDrawer. Native showModal supplies top-layer placement and modal focus; this bridges the model
 * to the imperative open and close, and provides guarded dismissal where closedBy is absent.
 *
 * The element is rendered only while it is needed. With `exitTransition`, it outlives its
 * closing until the transitions it runs on the way out have finished.
 */
export function useModalDialog(
  open: Ref<boolean>,
  options: {
    persistentBackdrop: () => boolean
    persistentEscape: () => boolean
    exitTransition?: boolean
  },
) {
  const attrs = useAttrs()
  const dialogEl = ref<HTMLDialogElement | null>(null)

  /** Whether the `<dialog>` is in the page: while open, and through its exit if it has one. */
  const leaving = ref(false)
  const rendered = computed(() => open.value || leaving.value)

  /**
   * Which dismissals the browser itself accepts, declared as an attribute rather than handled in
   * code: everything, Escape alone, or nothing. One combination cannot be expressed that way; a
   * click outside allowed while Escape is not; and it falls back to allowing both.
   */
  const closedby = computed(() =>
    options.persistentBackdrop() ? (options.persistentEscape() ? 'none' : 'closerequest') : 'any',
  )

  // @fallback
  // The `closedby` attribute is newer than the type definitions shipped with TypeScript, so
  // writing it directly in the template would be reported as an unknown attribute. Passing it
  // inside a bound object goes through the same path as any forwarded attribute, which is not
  // checked element by element.
  const rootAttrs = computed(() => ({ ...attrs, closedby: closedby.value }))

  function show(): Promise<void> {
    open.value = true
    return nextTick()
  }

  function close() {
    // Closing the element is enough: the browser then fires its own close event, which puts the
    // model back in step below.
    dialogEl.value?.close()
  }

  // Close before v-if removes the element so the browser restores the invoker's focus.
  watch(open, (value) => {
    if (!value) dialogEl.value?.close()
    // Reopened during its exit, the same element is shown again and its transitions reverse.
    else if (dialogEl.value && !dialogEl.value.open) dialogEl.value.showModal()
  })

  // @ssr
  // Template refs become available after mounting, including when hydrating an open dialog.
  watch(dialogEl, (dialog) => dialog?.showModal(), { flush: 'post' })

  /*
   * Each closing is counted, so that the end of an exit interrupted by a reopening, then
   * followed by a second closing, does not remove the element in the middle of the second exit.
   */
  let closings = 0
  async function leave(dialog: HTMLDialogElement) {
    const closing = ++closings
    leaving.value = true
    // Reading the animations flushes the style change the closing made, so the exit
    // transitions have already started. A reversed or cancelled one rejects: either way it is
    // over.
    await Promise.allSettled(dialog.getAnimations().map((animation) => animation.finished))
    if (closing === closings && !open.value) leaving.value = false
  }

  // Ignore close events from replaced elements: the queued event from a quick close-and-reopen
  // must not close the new dialog.
  function onClose(event: Event) {
    const dialog = dialogEl.value
    if (!dialog || event.target !== dialog) return
    open.value = false
    if (options.exitTransition) void leave(dialog)
  }

  // @core
  // An open dialog removed with its parent (a `v-if`, a route change) runs no close steps,
  // so no close event would come: the model is handed back closed here, or it stayed `true`
  // and the dialog reopened by itself the next time its parent was shown.
  onBeforeUnmount(() => {
    if (open.value) open.value = false
  })

  // @fallback
  /*
   * `closedby` is what applies `persistentBackdrop` and `persistentEscape`, and Safari does not
   * implement it: there Escape always closes and the backdrop never does. The two halves are
   * rebuilt below, and only where the attribute is unknown, so a browser that has it is never
   * second-guessed.
   */
  const closedbyUnsupported = () => !('closedBy' in HTMLDialogElement.prototype)

  function onCancel(event: Event) {
    if (closedbyUnsupported() && closedby.value === 'none') event.preventDefault()
  }

  /**
   * Whether a point lies outside the dialog's box, which is where the backdrop is: a click on
   * the `::backdrop` is dispatched to the dialog element itself.
   */
  function outsideBox(event: MouseEvent) {
    const box = dialogEl.value?.getBoundingClientRect()
    if (!box) return false
    return (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    )
  }

  // A press that STARTED inside and ended on the backdrop (a text selection dragged past the
  // edge) is not a click on the backdrop, so the press is remembered, not only the release.
  let pressedOnBackdrop = false
  function onPointerdown(event: PointerEvent) {
    pressedOnBackdrop =
      closedbyUnsupported() && event.target === dialogEl.value && outsideBox(event)
  }
  function onBackdropClick(event: MouseEvent) {
    const onBackdrop = pressedOnBackdrop && event.target === dialogEl.value && outsideBox(event)
    pressedOnBackdrop = false
    if (onBackdrop && closedbyUnsupported() && closedby.value === 'any') close()
  }

  return {
    dialogEl,
    rendered,
    rootAttrs,
    show,
    close,
    onClose,
    onCancel,
    onPointerdown,
    onBackdropClick,
  }
}
