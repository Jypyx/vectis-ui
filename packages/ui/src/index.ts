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
export type { BuiltinIcon, IconContext, IconRender, IconSource } from './components/VIcon/types'
// The icons THEMSELVES are not re-exported here: they live behind '@vectis/ui/icons'
// so that importing the barrel never drags all 34 drawings into a consumer's bundle.
export type { VectisIconName } from './components/VIcon/icons/names'
export { default as VTypography } from './components/VTypography/VTypography.vue'
export type { TypographyTone, TypographyVariant } from './components/VTypography/VTypography.vue'
export { default as VPopover } from './components/VPopover/VPopover.vue'
export type { PopoverPlacement, PopoverTriggerProps } from './components/VPopover/VPopover.vue'
export { default as VSeparator } from './components/VSeparator/VSeparator.vue'
export { default as VButton } from './components/VButton/VButton.vue'
export { default as VIconButton } from './components/VIconButton/VIconButton.vue'
export { default as VButtonGroup } from './components/VButton/VButtonGroup.vue'
export { default as VPagination } from './components/VPagination/VPagination.vue'
export { default as VTabs } from './components/VTabs/VTabs.vue'
export type {
  TabsActivation,
  TabsAlign,
  TabsOrientation,
  TabsSize,
  TabsTone,
  TabsVariant,
} from './components/VTabs/VTabs.vue'
export { default as VTab } from './components/VTabs/VTab.vue'
export { default as VTabPanel } from './components/VTabs/VTabPanel.vue'
export { default as VToggle } from './components/VToggle/VToggle.vue'
export type {
  ToggleModelValue,
  ToggleOrientation,
  ToggleSize,
  ToggleTone,
  ToggleValue,
  ToggleVariant,
} from './components/VToggle/VToggle.vue'
export { default as VToggleItem } from './components/VToggle/VToggleItem.vue'
export { default as VInput } from './components/VInput/VInput.vue'
export { default as VTextarea } from './components/VTextarea/VTextarea.vue'
export { default as VCheckbox } from './components/VCheckbox/VCheckbox.vue'
export { default as VRadio } from './components/VRadio/VRadio.vue'
export { default as VSwitch } from './components/VSwitch/VSwitch.vue'
export { default as VTooltip } from './components/VTooltip/VTooltip.vue'
export { default as VMenu } from './components/VMenu/VMenu.vue'
export { default as VMenuItem } from './components/VMenu/VMenuItem.vue'
export { default as VMenuGroup } from './components/VMenu/VMenuGroup.vue'
export { default as VMenuSeparator } from './components/VMenu/VMenuSeparator.vue'
export { default as VAccordion } from './components/VAccordion/VAccordion.vue'
export { default as VAccordionItem } from './components/VAccordion/VAccordionItem.vue'
export { default as VToaster } from './components/VToast/VToaster.vue'
export { toast, dismissToast } from './components/VToast/state'
export type { ToastOptions, ToastTone, ToastPlacement } from './components/VToast/state'
export { default as VSnackbar } from './components/VSnackbar/VSnackbar.vue'
export { snackbar, dismissSnackbar } from './components/VSnackbar/state'
export type { SnackbarOptions, SnackbarTone, SnackbarPlacement } from './components/VSnackbar/state'
export { default as VBadge } from './components/VBadge/VBadge.vue'
export type { BadgeTone, BadgeOverlayPosition } from './components/VBadge/VBadge.vue'
export { default as VAvatar } from './components/VAvatar/VAvatar.vue'
export type { AvatarSize } from './components/VAvatar/VAvatar.vue'
export { default as VAvatarGroup } from './components/VAvatar/VAvatarGroup.vue'
export { default as VSpinner } from './components/VSpinner/VSpinner.vue'
export { default as VSkeletonLoader } from './components/VSkeletonLoader/VSkeletonLoader.vue'
export type {
  SkeletonShape,
  SkeletonAnimation,
  SkeletonSize,
} from './components/VSkeletonLoader/VSkeletonLoader.vue'
export { default as VCombobox } from './components/VCombobox/VCombobox.vue'
export type {
  ComboboxOption,
  ComboboxGroup,
  ComboboxSeparator,
  ComboboxItem,
  ComboboxFilter,
} from './components/VCombobox/VCombobox.vue'
export { default as VBreadcrumb } from './components/VBreadcrumb/VBreadcrumb.vue'
export type { BreadcrumbItem } from './components/VBreadcrumb/VBreadcrumb.vue'
export { default as VSideNavigation } from './components/VSideNavigation/VSideNavigation.vue'
export { default as VSideNavigationItem } from './components/VSideNavigation/VSideNavigationItem.vue'
export { default as VSideNavigationGroup } from './components/VSideNavigation/VSideNavigationGroup.vue'
export { default as VSideNavigationSeparator } from './components/VSideNavigation/VSideNavigationSeparator.vue'
export { default as VChip } from './components/VChip/VChip.vue'
export { default as VHotkeys } from './components/VHotkeys/VHotkeys.vue'
export type { HotkeysVariant, HotkeysSize } from './components/VHotkeys/VHotkeys.vue'
export type { HotkeysPlatform } from './components/VHotkeys/platform'
export { default as VDataTable } from './components/VDataTable/VDataTable.vue'
export type {
  DataTableColumn,
  DataTableSort,
  DataTableRowId,
  DataTableParams,
  DataTableProps,
} from './components/VDataTable/VDataTable.vue'
export { default as VInputOTP } from './components/VInputOTP/VInputOTP.vue'
export { default as VProgressCircular } from './components/VProgressCircular/VProgressCircular.vue'
export { default as VProgressLinear } from './components/VProgressLinear/VProgressLinear.vue'
export { default as VSlider } from './components/VSlider/VSlider.vue'
export type { SliderLabel } from './components/VSlider/VSlider.vue'
export { default as VDialog } from './components/VDialog/VDialog.vue'
export { default as VDialogAlert } from './components/VDialog/VDialogAlert.vue'
export { default as VDatePicker } from './components/VDatePicker/VDatePicker.vue'
export type {
  DatePickerSelection,
  DatePickerValue,
  DateRange,
  DatePickerEvent,
  DateMatcher,
} from './components/VDatePicker/VDatePicker.vue'
export { default as VDateInput } from './components/VDateInput/VDateInput.vue'
export type { DateInputMode } from './components/VDateInput/VDateInput.vue'
export { default as VTimePicker } from './components/VTimePicker/VTimePicker.vue'
export type { TimePickerFormat, TimePickerStep } from './components/VTimePicker/VTimePicker.vue'
export { default as VTimeInput } from './components/VTimeInput/VTimeInput.vue'
export type { TimeInputMode } from './components/VTimeInput/VTimeInput.vue'
export { default as VCalendar } from './components/VCalendar/VCalendar.vue'
export type {
  CalendarEvent,
  CalendarEventId,
  CalendarEventTimes,
  CalendarView,
} from './components/VCalendar/types'
export { default as VFileInput } from './components/VFileInput/VFileInput.vue'
export type {
  FileInputDisplay,
  FileInputRejectReason,
  FileInputRejection,
} from './components/VFileInput/VFileInput.vue'
export { default as VFilePicker } from './components/VFilePicker/VFilePicker.vue'
export type {
  FilePickerPreview,
  FilePickerRejectReason,
  FilePickerRejection,
  FilePickerRow,
} from './components/VFilePicker/VFilePicker.vue'
export type { FileKind } from './components/VFilePicker/fileKind'
export { default as VCarousel } from './components/VCarousel/VCarousel.vue'
export type {
  CarouselControls,
  CarouselControlsVisibility,
  CarouselEffect,
  CarouselIndicators,
  CarouselOrientation,
} from './components/VCarousel/VCarousel.vue'
export { default as VCarouselItem } from './components/VCarousel/VCarouselItem.vue'
