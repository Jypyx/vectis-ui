/**
 * The icons the design system draws by itself, as importable values — the public
 * face of `vectis-ui/icons`.
 *
 * Reach for it when you want to render one of the library's own icons somewhere it
 * does not already appear: `import { search } from 'vectis-ui/icons'`, then
 * `<VIcon :name="search" />`. A bare `<VIcon name="search" />` is a NAME and does
 * not reach it, which is the point — an icon is shipped to a consumer's bundle because
 * a module imported it, never because a string might one day ask for it.
 *
 * Each value carries its NAME as well as its drawing, so it still passes through a
 * resolver installed with `setIconResolver`: wiring your own icon library keeps
 * working on these exactly as it does on the icons the components draw.
 */
export * from './components/VIcon/icons/index'
export type { BuiltinIcon } from './components/VIcon/types'
