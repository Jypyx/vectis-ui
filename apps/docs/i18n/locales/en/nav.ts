/**
 * The words of the table of contents, whose STRUCTURE lives in `content/nav.ts`.
 *
 * The type is what binds the two: a `Record` over `DocsSlug` means a slug added to the
 * inventory without a title here fails `nuxt typecheck`, and a title left behind after a slug
 * is removed fails too. Neither can drift silently into the sidebar.
 */
import type { DocsSlug, NavGroupId } from '~/content/nav'

export type NavMessages = Record<DocsSlug, string> & { group: Record<NavGroupId, string> }

const nav: NavMessages = {
  group: {
    intro: 'Introduction',
    components: 'Components',
    utils: 'Utilities',
  },

  installation: 'Installation',
  theming: 'Theming',
  iconography: 'Iconography',
  'font-family': 'Font family',
  i18n: 'Localisation (i18n)',
  accessibility: 'Accessibility',

  accordion: 'Accordion',
  avatar: 'Avatar',
  'avatar-group': 'Avatar group',
  badge: 'Badge',
  breadcrumb: 'Breadcrumb',
  button: 'Button',
  'button-group': 'Button group',
  calendar: 'Calendar',
  carousel: 'Carousel',
  checkbox: 'Checkbox',
  chip: 'Chip',
  combobox: 'Combobox',
  'data-table': 'Data table',
  'date-picker': 'Date picker',
  dialog: 'Dialog',
  'file-picker': 'File picker',
  'file-upload': 'File upload',
  hotkeys: 'Hotkeys',
  icon: 'Icon',
  'icon-button': 'Icon button',
  input: 'Input',
  'input-otp': 'Input OTP',
  menu: 'Menu',
  pagination: 'Pagination',
  popover: 'Popover',
  'progress-circular': 'Progress circular',
  'progress-linear': 'Progress linear',
  radio: 'Radio',
  separator: 'Separator',
  'side-navigation': 'Side navigation',
  'skeleton-loader': 'Skeleton loader',
  slider: 'Slider',
  spinner: 'Spinner',
  switch: 'Switch',
  tabs: 'Tabs',
  textarea: 'Textarea',
  'time-picker': 'Time picker',
  toast: 'Toast',
  toggle: 'Toggle',
  tooltip: 'Tooltip',
  typography: 'Typography',

  'js-helpers': 'JavaScript helpers',
  'css-classes': 'CSS helper classes',
}

export default nav
