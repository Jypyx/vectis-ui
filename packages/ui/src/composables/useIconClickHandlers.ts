// @core
/**
 * Whether VInput/VTextarea's icons should render as real buttons: an icon is decoration
 * until someone listens for `@click:icon-*`, at which point it needs a tab stop and a name.
 *
 * Declared emits are removed from `$attrs`, so the only place left to look is
 * `vnode.props` — in BOTH spellings, a template writing them with dashes and a render
 * function in camel case. Read ONCE and never revised: a listener attached later is not
 * picked up, which is marginal enough to accept.
 *
 * The missing-name warning lives here rather than in each field: a button nothing can
 * announce is a flaw of the arrangement, not of the component using it.
 */

import { getCurrentInstance } from 'vue'

import { isDev } from '../utils/env'

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
