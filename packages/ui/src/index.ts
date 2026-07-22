/**
 * Entrée de `@socle/ui`. Exports nommés uniquement (tree-shaking).
 *
 * L'import CSS ci-dessous alimente l'extraction vers `dist/styles.css` ; en
 * mode librairie, Vite le retire du JS émis. Le consommateur importe donc
 * explicitement `@socle/ui/styles.css`.
 *
 * L'ordre des exports fixe l'ordre du CSS bundlé : IconButton doit suivre
 * Button (il surcharge ses règles à spécificité égale). Icon est placé avant
 * Button par cohérence (dépendance → dépendant) mais son ordre n'est pas
 * contraignant : Button le pilote via des custom properties héritées, pas par
 * surcharge de sélecteurs. Slider doit rester après Input : il surcharge la
 * largeur de ses champs numériques (`.ds-slider-field`) à spécificité égale.
 */
import './styles/index.css'

export { default as Icon } from './components/Icon/Icon.vue'
export { default as Button } from './components/Button/Button.vue'
export { default as IconButton } from './components/IconButton/IconButton.vue'
export { default as Input } from './components/Input/Input.vue'
export { default as Textarea } from './components/Textarea/Textarea.vue'
export { default as Select } from './components/Select/Select.vue'
export { default as Checkbox } from './components/Checkbox/Checkbox.vue'
export { default as Radio } from './components/Radio/Radio.vue'
export { default as Switch } from './components/Switch/Switch.vue'
export { default as Dialog } from './components/Dialog/Dialog.vue'
export { default as Popover } from './components/Popover/Popover.vue'
export { default as Tooltip } from './components/Tooltip/Tooltip.vue'
export { default as DropdownMenu } from './components/DropdownMenu/DropdownMenu.vue'
export { default as DropdownMenuItem } from './components/DropdownMenu/DropdownMenuItem.vue'
export { default as Tabs } from './components/Tabs/Tabs.vue'
export { default as TabList } from './components/Tabs/TabList.vue'
export { default as Tab } from './components/Tabs/Tab.vue'
export { default as TabPanel } from './components/Tabs/TabPanel.vue'
export { default as Accordion } from './components/Accordion/Accordion.vue'
export { default as AccordionItem } from './components/Accordion/AccordionItem.vue'
export { default as Alert } from './components/Alert/Alert.vue'
export { default as Badge } from './components/Badge/Badge.vue'
export { default as Card } from './components/Card/Card.vue'
export { default as Avatar } from './components/Avatar/Avatar.vue'
export { default as Spinner } from './components/Spinner/Spinner.vue'
export { default as DatePicker } from './components/DatePicker/DatePicker.vue'
export { default as Combobox } from './components/Combobox/Combobox.vue'
export type { ComboboxOption } from './components/Combobox/Combobox.vue'
export { default as Breadcrumb } from './components/Breadcrumb/Breadcrumb.vue'
export type { BreadcrumbItem } from './components/Breadcrumb/Breadcrumb.vue'
export { default as Chip } from './components/Chip/Chip.vue'
export { default as DataTable } from './components/DataTable/DataTable.vue'
export type { DataTableColumn } from './components/DataTable/DataTable.vue'
export { default as InputOTP } from './components/InputOTP/InputOTP.vue'
export { default as Pagination } from './components/Pagination/Pagination.vue'
export { default as ProgressCircular } from './components/ProgressCircular/ProgressCircular.vue'
export { default as ProgressLinear } from './components/ProgressLinear/ProgressLinear.vue'
export { default as Slider } from './components/Slider/Slider.vue'
export type { SliderLabel } from './components/Slider/Slider.vue'
