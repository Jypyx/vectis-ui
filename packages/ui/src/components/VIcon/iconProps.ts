import type { IconSource } from './types'

/**
 * Resolves an icon source into `VIcon` props.
 *
 * NO heuristic: a string is ALWAYS an icon name; an image or a component is
 * declared explicitly (`{ src: '/logo.svg' }`). This is what keeps the common
 * naming conventions (`mdi:close`, `fa6-solid:xmark`) reaching the icon
 * resolver instead of being mistaken for URLs.
 */
export const iconProps = (icon: IconSource) =>
  typeof icon === 'string' ? { name: icon } : { render: icon }

/**
 * Readable name of a source, to serve as a fallback accessible label when the
 * consumer provides none. `undefined` as soon as the source is an explicit
 * render: an object has no name, and an `[object Object]` in the accessibility
 * tree would be worse than nothing (`useIconClickHandlers` warns in that case).
 */
export const iconName = (icon: IconSource | undefined) =>
  typeof icon === 'string' ? icon : undefined
