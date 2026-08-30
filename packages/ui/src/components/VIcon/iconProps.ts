import type { BuiltinIcon, IconRender, IconSource } from './types'

/**
 * Tells one of the library's own icons from something the consumer described by
 * hand. Only a `BuiltinIcon` carries `paths`, and the distinction matters: it is
 * what routes a built-in default to `name` — where the resolver still gets first
 * refusal — instead of to `render`, which wins outright and would silence it.
 */
const isBuiltinIcon = (icon: BuiltinIcon | IconRender): icon is BuiltinIcon => 'paths' in icon

/**
 * Turns what a consumer wrote in an icon prop into the props VIcon expects. It is
 * what every component of the design system calls before rendering an icon it was
 * given.
 *
 * There is NO guesswork in the conversion: a plain string is ALWAYS a name, and an
 * image or a component is declared explicitly as an object, `{ src: '/logo.svg' }`.
 * That is what keeps the usual naming conventions — `mdi:close`, `fa6-solid:xmark` —
 * reaching the resolver intact rather than being mistaken for addresses.
 */
export const iconProps = (icon: IconSource) =>
  typeof icon === 'string' || isBuiltinIcon(icon) ? { name: icon } : { render: icon }

/**
 * A readable name for an icon, used as a last-resort accessible label when the
 * consumer supplied none.
 *
 * It answers `undefined` as soon as the icon was DESCRIBED rather than named — an
 * image, a component, a class — because such a description has no name to give and
 * an `[object Object]` read out by a screen reader would be worse than silence.
 * `useIconClickHandlers` is what warns the integrator when that happens on a control
 * that needs a name. One of the library's own icons does carry its name, so it
 * answers here exactly as the bare string used to.
 */
export const iconName = (icon: IconSource | undefined) =>
  typeof icon === 'string' ? icon : icon && isBuiltinIcon(icon) ? icon.name : undefined
