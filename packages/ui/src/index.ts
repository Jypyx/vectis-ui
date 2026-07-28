/**
 * Entrée de `@socle/ui`. Exports nommés uniquement (tree-shaking).
 *
 * L'import CSS ci-dessous alimente l'extraction vers `dist/styles.css` ; en
 * mode librairie, Vite le retire du JS émis. Le consommateur importe donc
 * explicitement `@socle/ui/styles.css`.
 *
 * L'ordre des exports fixe l'ordre du CSS bundlé. La plupart des composants
 * sont rangés par cohérence (dépendance → dépendant) sans que leur position
 * soit contraignante : leurs surcharges sont qualifiées (`.ds-tab[data-size]`,
 * `.ds-table-toolbar .ds-input`…), donc indépendantes de l'ordre. Cinq
 * contraintes sont réelles, parce qu'elles jouent à spécificité égale :
 * - IconButton après Button (surcharge padding et largeur) ;
 * - Pagination après ButtonGroup (ses pastilles surchargent largeur et padding
 *   de `.ds-button`) ;
 * - Slider après Input (surcharge la largeur de `.ds-slider-field`) ;
 * - Typography en TÊTE, avant tout composant qui le rend en interne (Input,
 *   Textarea, Dialog, Accordion, DataTable) : leurs classes
 *   (`.ds-input-label`…) surchargent `.ds-typography` ;
 * - Popover en TÊTE aussi, avant les panneaux qui le rendent en interne
 *   (Tooltip, Combobox via Listbox, DatePicker, TimePicker) : leurs classes
 *   (`.ds-tooltip-panel`…) sont posées sur le MÊME élément que
 *   `.ds-popover-panel`, à spécificité égale (0,1,0).
 *
 * Listbox (brique interne du Combobox) et les composables ne sont pas exportés.
 */
import './styles/index.css'

export { default as Icon } from './components/Icon/Icon.vue'
export { default as Typography } from './components/Typography/Typography.vue'
export type { TypographyTone, TypographyVariant } from './components/Typography/Typography.vue'
export { default as Popover } from './components/Popover/Popover.vue'
export type { PopoverPlacement, PopoverTriggerProps } from './components/Popover/Popover.vue'
export { default as Button } from './components/Button/Button.vue'
export { default as IconButton } from './components/IconButton/IconButton.vue'
export { default as ButtonGroup } from './components/Button/ButtonGroup.vue'
export { default as Pagination } from './components/Pagination/Pagination.vue'
export { default as Tabs } from './components/Tabs/Tabs.vue'
export type {
  TabsActivation,
  TabsAlign,
  TabsOrientation,
  TabsSize,
  TabsTone,
  TabsVariant,
} from './components/Tabs/Tabs.vue'
export { default as Tab } from './components/Tabs/Tab.vue'
export { default as TabPanel } from './components/Tabs/TabPanel.vue'
export { default as Toggle } from './components/Toggle/Toggle.vue'
export type {
  ToggleModelValue,
  ToggleOrientation,
  ToggleSize,
  ToggleTone,
  ToggleValue,
  ToggleVariant,
} from './components/Toggle/Toggle.vue'
export { default as ToggleItem } from './components/Toggle/ToggleItem.vue'
export { default as Input } from './components/Input/Input.vue'
export { default as Textarea } from './components/Textarea/Textarea.vue'
export { default as Checkbox } from './components/Checkbox/Checkbox.vue'
export { default as Radio } from './components/Radio/Radio.vue'
export { default as Switch } from './components/Switch/Switch.vue'
export { default as Tooltip } from './components/Tooltip/Tooltip.vue'
export { default as Menu } from './components/Menu/Menu.vue'
export { default as MenuItem } from './components/Menu/MenuItem.vue'
export { default as MenuGroup } from './components/Menu/MenuGroup.vue'
export { default as MenuSeparator } from './components/Menu/MenuSeparator.vue'
export { default as Accordion } from './components/Accordion/Accordion.vue'
export { default as AccordionItem } from './components/Accordion/AccordionItem.vue'
export { default as Toaster } from './components/Toast/Toaster.vue'
export { toast, dismissToast } from './components/Toast/state'
export type { ToastOptions, ToastTone, ToastPlacement } from './components/Toast/state'
export { default as Badge } from './components/Badge/Badge.vue'
export type { BadgeTone } from './components/Badge/Badge.vue'
export { default as Avatar } from './components/Avatar/Avatar.vue'
export type { AvatarSize } from './components/Avatar/Avatar.vue'
export { default as AvatarGroup } from './components/Avatar/AvatarGroup.vue'
export { default as Spinner } from './components/Spinner/Spinner.vue'
export { default as Combobox } from './components/Combobox/Combobox.vue'
export type { ComboboxOption, ComboboxFilter } from './components/Combobox/Combobox.vue'
export { default as Breadcrumb } from './components/Breadcrumb/Breadcrumb.vue'
export type { BreadcrumbItem } from './components/Breadcrumb/Breadcrumb.vue'
export { default as Chip } from './components/Chip/Chip.vue'
export { default as DataTable } from './components/DataTable/DataTable.vue'
export type {
  DataTableColumn,
  DataTableSort,
  DataTableRowId,
  DataTableParams,
  DataTableProps,
} from './components/DataTable/DataTable.vue'
export { default as InputOTP } from './components/InputOTP/InputOTP.vue'
export { default as ProgressCircular } from './components/ProgressCircular/ProgressCircular.vue'
export { default as ProgressLinear } from './components/ProgressLinear/ProgressLinear.vue'
export { default as Slider } from './components/Slider/Slider.vue'
export type { SliderLabel } from './components/Slider/Slider.vue'
export { default as Dialog } from './components/Dialog/Dialog.vue'
export { default as DialogAlert } from './components/Dialog/DialogAlert.vue'
export { default as Calendar } from './components/Calendar/Calendar.vue'
export type {
  CalendarMode,
  CalendarValue,
  DateRange,
  CalendarEvent,
  DateMatcher,
} from './components/Calendar/Calendar.vue'
export { default as DatePicker } from './components/DatePicker/DatePicker.vue'
export { default as TimePicker } from './components/TimePicker/TimePicker.vue'
export type { TimePickerFormat, TimePickerMode } from './components/TimePicker/TimePicker.vue'
