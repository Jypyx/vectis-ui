/**
 * Pointing at VTimePicker's clock face from a play function.
 *
 * It lives here rather than beside the stories that use it for a mechanical reason: every
 * named export of a `.stories.ts` file is read as a STORY, so a helper exported from one
 * shows up in the sidebar and is run as a test with no render of its own. `src/stories/**`
 * is excluded from the build, so nothing here ships.
 *
 * Two files need it — VTimePicker's own stories and VTimeInput's, which drives the same
 * face through its panel.
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

/**
 * A pointer click on the face. The PointerEvents are dispatched directly because
 * userEvent's coordinate hit-testing is too brittle for a circle.
 *
 * Note what releasing does: it SETTLES the step, so after a tap on the hour the face is
 * already showing the minutes. A play function checking which hour was chosen must read
 * the numeral at the top, not the slider's own value.
 */
export function tapDial(face: HTMLElement, turn: number, radiusFraction = 0.8) {
  const { clientX, clientY } = pointOnDial(face, turn, radiusFraction)
  face.dispatchEvent(new PointerEvent('pointerdown', { clientX, clientY, bubbles: true }))
  face.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
}
