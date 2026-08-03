import { getCurrentInstance } from 'vue'

import { isDev } from '../utils/env'

/**
 * A field's internal icons become `<button>`s as soon as a `@click:icon-start` /
 * `@click:icon-end` listener is attached. Since those emits are declared, Vue
 * removes them from `$attrs`: their presence can only be read in `vnode.props`,
 * and in BOTH spellings (kebab from a template, camel from a render function).
 *
 * The list is treated as STATIC: a listener added dynamically after mount is not
 * re-detected (a marginal, accepted case).
 *
 * The a11y guard lives here rather than in the caller: a button with no
 * accessible name is a flaw of the pattern, not of the component using it.
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
