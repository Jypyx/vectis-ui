/**
 * Entry point of `@vectis/ui`. Named exports only (tree-shaking).
 *
 * The CSS import below feeds the extraction into `dist/styles.css`; in library
 * mode Vite strips it from the emitted JS. The consumer therefore imports
 * `@vectis/ui/styles.css` explicitly.
 *
 * The export order fixes the bundled CSS order. Most components are arranged for
 * coherence (dependency → dependent) without their position being constraining:
 * their overrides are qualified (`.v-tab[data-size]`, `.v-table-toolbar .v-input`…)
 * and therefore order-independent. Five constraints are real, because they play
 * out at equal specificity:
 * - VIconButton after VButton (overrides padding and width);
 * - VPagination after VButtonGroup (its pills override the width and padding of
 *   `.v-button`);
 * - VSlider after VInput (overrides the width of `.v-slider-field`);
 * - VTypography FIRST, before any component that renders it internally (VInput,
 *   VTextarea, VDialog, VAccordion, VDataTable): their classes
 *   (`.v-input-label`…) override `.v-typography`;
 * - VPopover FIRST as well, before the panels that render it internally
 *   (VTooltip, VCombobox, VDatePicker, VTimePicker): their classes
 *   (`.v-tooltip-panel`…) sit on the SAME element as `.v-popover-panel`, at
 *   equal specificity (0,1,0).
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
export { default as VBadge } from './components/VBadge/VBadge.vue'
export type { BadgeTone } from './components/VBadge/VBadge.vue'
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
export { default as VCalendar } from './components/VCalendar/VCalendar.vue'
export type {
  CalendarSelection,
  CalendarValue,
  DateRange,
  CalendarEvent,
  DateMatcher,
} from './components/VCalendar/VCalendar.vue'
export { default as VDatePicker } from './components/VDatePicker/VDatePicker.vue'
export type { DatePickerMode } from './components/VDatePicker/VDatePicker.vue'
export { default as VTimePicker } from './components/VTimePicker/VTimePicker.vue'
export type { TimePickerFormat, TimePickerMode } from './components/VTimePicker/VTimePicker.vue'
export { default as VFilePicker } from './components/VFilePicker/VFilePicker.vue'
export type {
  FilePickerDisplay,
  FilePickerRejectReason,
  FilePickerRejection,
} from './components/VFilePicker/VFilePicker.vue'
export { default as VFileUpload } from './components/VFileUpload/VFileUpload.vue'
export type {
  FileUploadPreview,
  FileUploadRejectReason,
  FileUploadRejection,
  FileUploadRow,
} from './components/VFileUpload/VFileUpload.vue'
export type { FileKind } from './components/VFileUpload/fileKind'
