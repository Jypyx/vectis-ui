// @core
/**
 * Cancel dragover to permit drops and avoid browser navigation. Track nested drag depth so
 * entering a child does not clear the active drop state.
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

  // The depth comes back down whether or not files are accepted: a component disabled mid-drag
  // that ignored the leave would keep counting one enter too many, and show the highlight
  // again, for good, the day it was switched back on.
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
    dragging: computed(() => depth.value > 0 && enabled()),
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
  }
}
