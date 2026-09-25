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

/**
 * Whether the component being set up was handed a `@click:icon-start` / `@click:icon-end`
 * listener, in either spelling.
 */
export function iconClickHandlers(): { start: boolean; end: boolean } {
  const vnodeProps = getCurrentInstance()?.vnode.props ?? {}
  return {
    start: 'onClick:iconStart' in vnodeProps || 'onClick:icon-start' in vnodeProps,
    end: 'onClick:iconEnd' in vnodeProps || 'onClick:icon-end' in vnodeProps,
  }
}

/**
 * The start-icon listener a field COMPOSED on top of VInput: VCombobox, VDateInput,
 * VTimeInput, VFileInput, binds onto that inner VInput, ready to spread beside the
 * consumer's attributes. Call it during setup: it reads the component's own vnode.
 *
 * Each of those fields declares `click:icon-start` as its own event, which puts it in the API
 * tables and takes it out of `$attrs`, hence out of what is forwarded: the listener has to be
 * bound by hand. It has to follow what the consumer actually wrote: bound unconditionally,
 * VInput would read a handler on every instance and turn a decorative icon into a focusable
 * button nobody asked for. So it is `undefined` when there is nothing to relay.
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
