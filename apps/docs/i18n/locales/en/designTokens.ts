import type { TextRole } from '~/content/designTokens'

import { tokenDescriptions } from '~/content/designTokens'

// English token descriptions come from the library; French descriptions use the same keys.

export default {
  title: 'Design tokens',
  lead: 'Semantic CSS variables for customising Vectis UI, with their purpose and default values.',
  readingBody:
    'For token references, the tables show both the resolved value and the CSS expression, such as <code>var(--vectis-color-gray-900)</code>. Override a semantic token to change its role; changing a primitive affects all roles that reference it.',
  readingOverrideBefore:
    'Primitives appear in the references rather than in a separate table. For override examples, see',
  readingOverrideAfter: '.',
  readingSiteAccent:
    'This site uses a violet accent. The tables show the library’s default indigo values.',
  columnToken: 'Token',
  columnDescription: 'Description',
  columnDefault: 'Default value',
  columnLight: 'Light',
  columnDark: 'Dark',
  columnRole: 'Role',
  columnSize: 'Size',
  columnWeight: 'Weight',
  columnLeading: 'Line height',
  columnTracking: 'Letter spacing',
  sameAsLight: 'Same as light',
  noToken: 'none',
  colorsHeading: 'Colours',
  colorsBody:
    'Colours for surfaces, text, borders, tones and calendar events. Each tone defines a solid colour, hover and pressed states, a tinted surface, a border and text.',
  focusHeading: 'Focus ring',
  focusBody:
    'Colour, width and offset of the keyboard focus outline. Its colour is independent of the accent so you can adjust its contrast against the background.',
  typographyHeading: 'Typography',
  typographyBody:
    'Font families and text roles. Each role groups font size, weight, line height and, where defined, letter spacing.',
  typographyFontBefore: 'For font loading and configuration, see',
  typographyFontAfter: '.',
  familiesCaption: 'Font families',
  rolesCaption: 'Text roles',
  roles: {
    display: 'Large hero title',
    'heading-1': 'Page title',
    'heading-2': 'Section heading',
    'heading-3': 'Subsection heading',
    'heading-4': 'Group or card heading',
    subtitle: 'Subtitle in a dialog or accordion item',
    'body-xl': 'Page or section introduction',
    'body-lg': 'Large body text for extended reading',
    'body-md': 'Default body text, menu items, notifications and fields',
    'body-sm': 'Secondary details and notes',
    label: 'Label above a form field',
    choice: 'Label beside a checkbox, radio button or switch',
    caption: 'Field hint or counter',
    overline: 'Group heading in a menu, combobox or side navigation, with wider letter spacing',
    code: 'Inline code and code blocks',
    control: 'Button, chip or tab label. Font size follows the control’s size.',
  } satisfies Record<TextRole, string>,
  radiusHeading: 'Corner radii',
  radiusBody:
    '<code>--vectis-radius-chip</code> references <code>--vectis-radius-interactive</code> at the root. When overriding the interactive radius on a container, also set the chip radius if you want both to change.',
  motionHeading: 'Motion',
  motionBody:
    'Transition durations, shared by both themes. Looping animations such as the spinner use primitive duration tokens instead.',
  sizesHeading: 'Sizes',
  sizesBody:
    'Control heights and icon sizes. <code>compact</code> reduces a control’s height by 4px.',
  componentsHeading: 'Component dimensions',
  componentsBody:
    'Dimensions specific to each component, such as track thickness or panel width. Group headings link to the component documentation.',
  groups: {
    surfaces: 'Surfaces',
    text: 'Text',
    borders: 'Borders',
    accent: 'Accent',
    danger: 'Danger',
    success: 'Success',
    warning: 'Warning',
    backdrop: 'Backdrop',
    events: 'Calendar events',
    controlHeights: 'Control heights',
    iconSizes: 'Icon sizes',
  },
  descriptions: tokenDescriptions,
}
