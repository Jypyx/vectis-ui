// @core
/**
 * Detect declared icon-click listeners from vnode props because emits removes them from attrs.
 * Require accessible names before turning decorative icons into buttons.
 */

import { getCurrentInstance } from 'vue'

import { isDev } from '../utils/env'

/**
 * Whether the component being set up was handed a `@click:icon-start` / `@click:icon-end`
 * listener, in either spelling.
 */
function iconClickHandlers(): { start: boolean; end: boolean } {
  const vnodeProps = getCurrentInstance()?.vnode.props ?? {}
  return {
    start: 'onClick:iconStart' in vnodeProps || 'onClick:icon-start' in vnodeProps,
    end: 'onClick:iconEnd' in vnodeProps || 'onClick:icon-end' in vnodeProps,
  }
}

/**
 * The start-icon listener a field composed on top of VInput binds onto that inner VInput, ready
 * to spread beside the consumer's attributes. Absent when the consumer attached none.
 */
export function iconStartListener(
  relay: (event: MouseEvent) => void,
): { 'onClick:icon-start': (event: MouseEvent) => void } | undefined {
  return iconClickHandlers().start ? { 'onClick:icon-start': relay } : undefined
}

export function useIconClickHandlers(options: {
  name: string
  iconStartLabel?: string
  iconEndLabel?: string
}): { hasIconStartHandler: boolean; hasIconEndHandler: boolean } {
  const { start: hasIconStartHandler, end: hasIconEndHandler } = iconClickHandlers()

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
