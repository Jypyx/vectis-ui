// @core
/**
 * The drop-target plumbing of VFileInput and VFilePicker. It exists once rather than twice
 * because of the two traps it carries.
 *
 * `dragover` MUST `preventDefault`, or the browser refuses the drop and then NAVIGATES to
 * the file, replacing the page.
 *
 * And the state is a depth COUNTER, never a boolean: `dragleave` fires every time the
 * pointer crosses into a child, so a flag would flicker off under the cursor. `drop` forces
 * the depth back to 0 — a drag leaving the window never sends the matching `dragleave`, and
 * `currentTarget.contains(relatedTarget)`, the other classic fix, is useless there since
 * `relatedTarget` is null in exactly that case.
 *
 * `enabled` is a getter, read at event time, so a component disabled mid-drag stops
 * accepting with nothing re-bound.
 */

import { computed, ref, type ComputedRef } from 'vue'

export function useFileDrop(
  enabled: () => boolean,
  onFiles: (files: File[]) => void,
): {
  dragging: ComputedRef<boolean>
  onDragEnter: (event: DragEvent) => void
  onDragOver: (event: DragEvent) => void
  onDragLeave: () => void
  onDrop: (event: DragEvent) => void
} {
  const depth = ref(0)

  function onDragEnter(event: DragEvent) {
    if (!enabled()) return
    event.preventDefault()
    depth.value += 1
  }

  function onDragOver(event: DragEvent) {
    if (!enabled()) return
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
  }

  // TRAP — the depth comes back down whether or not files are accepted: a component
  // disabled mid-drag that ignored the leave would keep counting one enter too many, and
  // show the highlight again, for good, the day it was switched back on.
  function onDragLeave() {
    depth.value = Math.max(0, depth.value - 1)
  }

  function onDrop(event: DragEvent) {
    depth.value = 0
    if (!enabled()) return
    event.preventDefault()
    onFiles([...(event.dataTransfer?.files ?? [])])
  }

  return {
    // Read against `enabled` too, so switching the component off drops the highlight at once.
    dragging: computed(() => depth.value > 0 && enabled()),
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
  }
}
