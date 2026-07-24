import { getCurrentInstance } from 'vue'

import { isDev } from '../utils/env'

// @core
/**
 * Tells a field whether the consumer wants its icons to be CLICKABLE.
 *
 * An icon inside a field is decoration until someone listens for a click on it, at which
 * point it becomes a real button — one that can be reached with the keyboard and has a
 * name of its own. This is what answers the question.
 *
 * Because those two events are declared by the component, Vue takes them out of the
 * attributes it hands down, so the only place left to look is the element description
 * Vue was given — and in BOTH spellings, since a template writes them with dashes and a
 * render function in camel case.
 *
 * The answer is read ONCE and never revised: a listener attached later is not picked up.
 * That case is marginal and the cost is accepted.
 *
 * The warning about a missing name belongs here rather than in each field. A button
 * nothing can announce is a flaw of the arrangement itself, not of the component that
 * happens to use it.
 */
export function useIconClickHandlers(options: {
  name: string
  iconStartLabel?: string
  iconEndLabel?: string
}): { hasIconStartHandler: boolean; hasIconEndHandler: boolean } {
  const vnodeProps = getCurrentInstance()?.vnode.props ?? {}
  const hasIconStartHandler =
    'onClick:iconStart' in vnodeProps || 'onClick:icon-start' in vnodeProps
  const hasIconEndHandler = 'onClick:iconEnd' in vnodeProps || 'onClick:icon-end' in vnodeProps

  // @a11y @devwarn
  if (isDev) {
    if (hasIconStartHandler && !options.iconStartLabel)
      console.warn(
        `[${options.name}] clickable start icon without iconStartLabel — provide an accessible label.`,
      )
    if (hasIconEndHandler && !options.iconEndLabel)
      console.warn(
        `[${options.name}] clickable end icon without iconEndLabel — provide an accessible label.`,
      )
  }

  return { hasIconStartHandler, hasIconEndHandler }
}
