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
 * - VIconButton après VButton (surcharge padding et largeur) ;
 * - VPagination après VButtonGroup (ses pastilles surchargent largeur et padding
 *   de `.v-button`) ;
 * - VSlider après VInput (surcharge la largeur de `.v-slider-field`) ;
 * - VTypography en TÊTE, avant tout composant qui le rend en interne (VInput,
 *   VTextarea, VDialog, VAccordion, VDataTable) : leurs classes
 *   (`.v-input-label`…) surchargent `.v-typography` ;
 * - VPopover en TÊTE aussi, avant les panneaux qui le rendent en interne
 *   (VTooltip, VCombobox, VDatePicker, VTimePicker) : leurs classes
 *   (`.v-tooltip-panel`…) sont posées sur le MÊME élément que
 *   `.v-popover-panel`, à spécificité égale (0,1,0).
 *
 * Les composants internes (VComboboxOption, VMenuPanel…) et les composables ne
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
export type { VectisMessages, VectisMessagesInput } from './i18n/types'

export { default as VIcon } from './components/VIcon/VIcon.vue'
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
  VComboboxOption,
  VComboboxGroup,
  VComboboxSeparator,
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
