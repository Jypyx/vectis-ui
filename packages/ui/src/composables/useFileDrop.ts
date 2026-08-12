import { computed, ref, type ComputedRef } from 'vue'

// @core
/**
 * Everything an area needs in order to accept files dropped onto it, and to show that it
 * is ready to receive them. Both the file field and the drop zone are built on it.
 *
 * Two traps live here, which is the whole reason this exists once rather than twice.
 *
 * The browser must be told explicitly, while the file is being dragged over the area,
 * that a drop is welcome. Left unsaid, it refuses the drop and then NAVIGATES to the
 * file, replacing the page the reader was on.
 *
 * And what is counted is a DEPTH, not a yes-or-no. The browser reports the pointer
 * LEAVING every time it crosses into a child element — a field, a chip, a button inside
 * the area — so a simple flag would switch off under the cursor and the highlight would
 * flicker. A drop forces the count back to zero, because a drag that leaves the window
 * altogether never reports the departure that would have balanced it; asking instead
 * whether the pointer went to a descendant, the other well-known fix, is no use since
 * there is precisely nothing to ask about in that case.
 *
 * Whether the area accepts anything is read at the moment of the event rather than
 * captured once, so a component turned off in the middle of a drag stops accepting
 * without anything being re-attached.
 */
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

  function onDragLeave() {
    if (!enabled()) return
    depth.value = Math.max(0, depth.value - 1)
  }

  function onDrop(event: DragEvent) {
    if (!enabled()) return
    event.preventDefault()
    depth.value = 0
    onFiles([...(event.dataTransfer?.files ?? [])])
  }

  return {
    dragging: computed(() => depth.value > 0),
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
  }
}
