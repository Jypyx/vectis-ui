/**
 * Keep play-function helpers outside story modules because Storybook interprets every named
 * story-module export as a story.
 */

/** A point on the face at a given turn fraction (0 = twelve o'clock, clockwise) and radius. */
export function pointOnDial(face: HTMLElement, turn: number, radiusFraction: number) {
  const rect = face.getBoundingClientRect()
  const r = (rect.width / 2) * radiusFraction
  const angle = turn * 2 * Math.PI
  return {
    clientX: rect.left + rect.width / 2 + r * Math.sin(angle),
    clientY: rect.top + rect.height / 2 - r * Math.cos(angle),
  }
}

/** A pointer click on the face. */
export function tapDial(face: HTMLElement, turn: number, radiusFraction = 0.8) {
  const { clientX, clientY } = pointOnDial(face, turn, radiusFraction)
  face.dispatchEvent(new PointerEvent('pointerdown', { clientX, clientY, bubbles: true }))
  face.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
}
