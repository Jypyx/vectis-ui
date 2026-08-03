/**
 * Entrée de `@vectis/ui`. Exports nommés uniquement (tree-shaking).
 *
 * L'import CSS ci-dessous alimente l'extraction vers `dist/styles.css` ; en
 * mode librairie, Vite le retire du JS émis. Le consommateur importe donc
 * explicitement `@vectis/ui/styles.css`.
 *
 * L'ordre des exports fixe l'ordre du CSS bundlé. La plupart des composants
 * sont rangés par cohérence (dépendance → dépendant) sans que leur position
 * soit contraignante : leurs surcharges sont qualifiées (`.v-tab[data-size]`,
 * `.v-table-toolbar .v-input`…), donc indépendantes de l'ordre. Cinq
 * contraintes sont réelles, parce qu'elles jouent à spécificité égale :
 * - IconButton après Button (surcharge padding et largeur) ;
 * - Pagination après ButtonGroup (ses pastilles surchargent largeur et padding
 *   de `.v-button`) ;
 * - Slider après Input (surcharge la largeur de `.v-slider-field`) ;
 * - Typography en TÊTE, avant tout composant qui le rend en interne (Input,
 *   Textarea, Dialog, Accordion, DataTable) : leurs classes
 *   (`.v-input-label`…) surchargent `.v-typography` ;
 * - Popover en TÊTE aussi, avant les panneaux qui le rendent en interne
 *   (Tooltip, Combobox, DatePicker, TimePicker) : leurs classes
 *   (`.v-tooltip-panel`…) sont posées sur le MÊME élément que
 *   `.v-popover-panel`, à spécificité égale (0,1,0).
 *
 * Les composants internes (ComboboxOption, MenuPanel…) et les composables ne
 * sont pas exportés.
 */
import './styles/index.css'

// Internationalisation — modules TS purs, donc sans effet sur l'ordre du CSS
// bundlé (même statut que le bloc `setIconResolver` ci-dessous). En tête parce
// que c'est de la configuration du DS entier, pas d'un composant. `en` est
// opt-in : ne pas l'importer suffit à l'élaguer du bundle.
export { setLocale, registerMessages } from './i18n/state'
export { fr } from './i18n/fr'
export { en } from './i18n/en'
export type { DsMessages, DsMessagesInput } from './i18n/types'

export { default as Icon } from './components/VIcon/VIcon.vue'
// Branchement d'une bibliothèque d'icônes tierce — modules TS purs, donc sans
// effet sur l'ordre du CSS bundlé.
export {
  setIconResolver,
  ligatureIconResolver,
  classIconResolver,
  componentIconResolver,
} from './components/VIcon/resolver'
export type { IconResolver, IconAliases } from './components/VIcon/resolver'
export type { IconContext, IconRender, IconSource } from './components/VIcon/types'
export type { DsIconName } from './components/VIcon/icons'
export { default as Typography } from './components/VTypography/VTypography.vue'
export type { TypographyTone, TypographyVariant } from './components/VTypography/VTypography.vue'
export { default as Popover } from './components/VPopover/VPopover.vue'
export type { PopoverPlacement, PopoverTriggerProps } from './components/VPopover/VPopover.vue'
export { default as Button } from './components/VButton/VButton.vue'
export { default as IconButton } from './components/VIconButton/VIconButton.vue'
export { default as ButtonGroup } from './components/VButton/VButtonGroup.vue'
export { default as Pagination } from './components/VPagination/VPagination.vue'
export { default as Tabs } from './components/VTabs/VTabs.vue'
export type {
  TabsActivation,
  TabsAlign,
  TabsOrientation,
  TabsSize,
  TabsTone,
  TabsVariant,
} from './components/VTabs/VTabs.vue'
export { default as Tab } from './components/VTabs/VTab.vue'
export { default as TabPanel } from './components/VTabs/VTabPanel.vue'
export { default as Toggle } from './components/VToggle/VToggle.vue'
export type {
  ToggleModelValue,
  ToggleOrientation,
  ToggleSize,
  ToggleTone,
  ToggleValue,
  ToggleVariant,
} from './components/VToggle/VToggle.vue'
export { default as ToggleItem } from './components/VToggle/VToggleItem.vue'
export { default as Input } from './components/VInput/VInput.vue'
export { default as Textarea } from './components/VTextarea/VTextarea.vue'
export { default as Checkbox } from './components/VCheckbox/VCheckbox.vue'
export { default as Radio } from './components/VRadio/VRadio.vue'
export { default as Switch } from './components/VSwitch/VSwitch.vue'
export { default as Tooltip } from './components/VTooltip/VTooltip.vue'
export { default as Menu } from './components/VMenu/VMenu.vue'
export { default as MenuItem } from './components/VMenu/VMenuItem.vue'
export { default as MenuGroup } from './components/VMenu/VMenuGroup.vue'
export { default as MenuSeparator } from './components/VMenu/VMenuSeparator.vue'
export { default as Accordion } from './components/VAccordion/VAccordion.vue'
export { default as AccordionItem } from './components/VAccordion/VAccordionItem.vue'
export { default as Toaster } from './components/VToast/VToaster.vue'
export { toast, dismissToast } from './components/VToast/state'
export type { ToastOptions, ToastTone, ToastPlacement } from './components/VToast/state'
export { default as Badge } from './components/VBadge/VBadge.vue'
export type { BadgeTone } from './components/VBadge/VBadge.vue'
export { default as Avatar } from './components/VAvatar/VAvatar.vue'
export type { AvatarSize } from './components/VAvatar/VAvatar.vue'
export { default as AvatarGroup } from './components/VAvatar/VAvatarGroup.vue'
export { default as Spinner } from './components/VSpinner/VSpinner.vue'
export { default as SkeletonLoader } from './components/VSkeletonLoader/VSkeletonLoader.vue'
export type {
  SkeletonShape,
  SkeletonAnimation,
  SkeletonSize,
} from './components/VSkeletonLoader/VSkeletonLoader.vue'
export { default as Combobox } from './components/VCombobox/VCombobox.vue'
export type {
  ComboboxOption,
  ComboboxGroup,
  ComboboxSeparator,
  ComboboxItem,
  ComboboxFilter,
} from './components/VCombobox/VCombobox.vue'
export { default as Breadcrumb } from './components/VBreadcrumb/VBreadcrumb.vue'
export type { BreadcrumbItem } from './components/VBreadcrumb/VBreadcrumb.vue'
export { default as SideNavigation } from './components/VSideNavigation/VSideNavigation.vue'
export { default as SideNavigationItem } from './components/VSideNavigation/VSideNavigationItem.vue'
export { default as SideNavigationGroup } from './components/VSideNavigation/VSideNavigationGroup.vue'
export { default as SideNavigationSeparator } from './components/VSideNavigation/VSideNavigationSeparator.vue'
export { default as Chip } from './components/VChip/VChip.vue'
export { default as DataTable } from './components/VDataTable/VDataTable.vue'
export type {
  DataTableColumn,
  DataTableSort,
  DataTableRowId,
  DataTableParams,
  DataTableProps,
} from './components/VDataTable/VDataTable.vue'
export { default as InputOTP } from './components/VInputOTP/VInputOTP.vue'
export { default as ProgressCircular } from './components/VProgressCircular/VProgressCircular.vue'
export { default as ProgressLinear } from './components/VProgressLinear/VProgressLinear.vue'
export { default as Slider } from './components/VSlider/VSlider.vue'
export type { SliderLabel } from './components/VSlider/VSlider.vue'
export { default as Dialog } from './components/VDialog/VDialog.vue'
export { default as DialogAlert } from './components/VDialog/VDialogAlert.vue'
export { default as Calendar } from './components/VCalendar/VCalendar.vue'
export type {
  CalendarSelection,
  CalendarValue,
  DateRange,
  CalendarEvent,
  DateMatcher,
} from './components/VCalendar/VCalendar.vue'
export { default as DatePicker } from './components/VDatePicker/VDatePicker.vue'
export type { DatePickerMode } from './components/VDatePicker/VDatePicker.vue'
export { default as TimePicker } from './components/VTimePicker/VTimePicker.vue'
export type { TimePickerFormat, TimePickerMode } from './components/VTimePicker/VTimePicker.vue'
