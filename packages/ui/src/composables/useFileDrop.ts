import { computed, ref, type ComputedRef } from 'vue'

/**
 * The four handlers of a drop target, and the one piece of state they share.
 *
 * `dragover` MUST preventDefault, or the browser refuses the drop and then
 * NAVIGATES to the file, replacing the page.
 *
 * The depth counter is not decoration: `dragleave` fires every time the pointer
 * crosses into a child (a field, a chip, an icon button), so a boolean would
 * flicker off under the cursor. `drop` forces it back to 0 — a drag that leaves
 * the window never sends the matching `dragleave`, and the state would stick.
 * `currentTarget.contains(relatedTarget)` is the other classic fix, rejected
 * here because `relatedTarget` is null precisely in that sticky case.
 *
 * `enabled` is a getter, not a boolean: it is read at event time, so a component
 * that becomes disabled mid-drag stops accepting without re-binding anything.
 * Adopters: VFilePicker, VFileUpload.
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
