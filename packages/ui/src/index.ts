/**
 * Entry point of `@vectis/ui`. Named exports only (tree-shaking).
 *
 * The CSS import below feeds the extraction into `dist/styles.css`, which carries
 * the CORE alone (reset, tokens, and the shared chrome of `styles/`); Vite strips
 * the import from the emitted JS, so the consumer imports `@vectis/ui/styles.css`
 * explicitly. Each component's own CSS ships as `dist/<path>/VX.css`, imported by
 * its own `VX.js` — see `shipComponentCss` in `vite.config.ts`.
 *
 * The export order therefore no longer fixes anything: it is editorial (dependency
 * → dependent, for reading). NOTHING may depend on it, because the order in which
 * the consumer's bundler concatenates the sheets is unknowable. A rule that would
 * collide with another component's at equal specificity is qualified instead —
 * `[data-size]` (`.v-tab`, `.v-pagination-page`), a compound class
 * (`.v-popover-panel.v-tooltip-panel`), a descendant (`.v-table-toolbar .v-input`)
 * — or routed through the custom property the target reads (`--typography-color`).
 * `scripts/check-css-split.ts` guards the mechanism at `postbuild`.
 *
 * Internal components (VComboboxOption, VMenuPanel…) and the composables are not
 * exported.
 */
import './styles/index.css'

// Internationalization — pure TS modules, so no effect on the bundled CSS order
// (same status as the `setIconResolver` block below). First because this is
// configuration for the whole DS, not for a component. `fr` is opt-in: not
// importing it is enough to prune it from the bundle.
export { setLocale, registerMessages } from './i18n/state'
export { en } from './i18n/en'
export { fr } from './i18n/fr'
export type { VectisMessages, VectisMessagesInput } from './i18n/types'

export { default as VIcon } from './components/VIcon/VIcon.vue'
// Hook for a third-party icon library — pure TS modules, so no effect on the
// bundled CSS order.
export {
  setIconResolver,
  ligatureIconResolver,
  classIconResolver,
  componentIconResolver,
} from './components/VIcon/resolver'
export type { IconResolver, IconAliases } from './components/VIcon/resolver'
export type { IconContext, IconRender, IconSource } from './components/VIcon/types'
export type { VectisIconName } from './components/VIcon/icons'
export { default as VTypography } from './components/VTypography/VTypography.vue'
export type { TypographyTone, TypographyVariant } from './components/VTypography/VTypography.vue'
export { default as VPopover } from './components/VPopover/VPopover.vue'
export type { PopoverPlacement, PopoverTriggerProps } from './components/VPopover/VPopover.vue'
export { default as VSeparator } from './components/VSeparator/VSeparator.vue'
export { default as VButton } from './components/VButton/VButton.vue'
export { default as VIconButton } from './components/VIconButton/VIconButton.vue'
export { default as VButtonGroup } from './components/VButton/VButtonGroup.vue'
export { default as VTooltip } from './components/VTooltip/VTooltip.vue'
export { default as VBadge } from './components/VBadge/VBadge.vue'
export type { BadgeTone } from './components/VBadge/VBadge.vue'
export { default as VAvatar } from './components/VAvatar/VAvatar.vue'
export type { AvatarSize } from './components/VAvatar/VAvatar.vue'
export { default as VAvatarGroup } from './components/VAvatar/VAvatarGroup.vue'
export { default as VSpinner } from './components/VSpinner/VSpinner.vue'
