import type { TextRole } from '~/content/designTokens'

import { tokenDescriptions } from '~/content/designTokens'

/*
 * `descriptions` is not written here: the English sentences are the `$description` of each token
 * in the library's source, published as they stand. The French catalogue translates the same
 * record, typed against the same keys.
 */
export default {
  title: 'Design tokens',
  lead: 'The semantic tokens Vectis UI exposes as CSS custom properties, with what each one controls and its default value. These are the names to override when you adapt the library to your own design or brand.',

  readingBody:
    'When a value points at another token, the table shows it twice: the value it resolves to, then the reference as the stylesheet writes it, such as <code>var(--vectis-color-gray-900)</code>. Overriding the role keeps every component that reads it consistent, whereas changing the primitive behind it also changes every other role pointing at that primitive.',
  readingOverrideBefore:
    'The primitives (the five palettes and the spacing, type, radius, shadow and duration scales) are not listed on their own: they appear in those references. How to override a token for the whole page or for one part of it is covered on the',
  readingOverrideAfter: ' page.',
  readingSiteAccent:
    'This site repoints its own accent to violet, so the buttons and links around these tables do not match the indigo defaults listed in them.',

  columnToken: 'Token',
  columnDescription: 'Description',
  columnDefault: 'Default value',
  columnLight: 'Light',
  columnDark: 'Dark',
  columnRole: 'Role',
  columnSize: 'Size',
  columnWeight: 'Weight',
  columnLeading: 'Leading',
  columnTracking: 'Tracking',
  sameAsLight: 'Same as light',
  noToken: 'none',

  colorsHeading: 'Colors',
  colorsBody:
    'Surfaces, text, borders and the four tones. Each tone is a family of six roles: the solid color, its hover and pressed steps, a tinted surface, the border that goes with that surface, and a text color that stays readable on it. The three calendar event colors carry a hue variable the calendar sets on each event, which is why their value includes one.',

  focusHeading: 'Focus ring',
  focusBody:
    'The ring drawn around a control focused from the keyboard. Its color is a role of its own rather than the accent: the accent has to carry white text, the ring has to stand out against the page.',

  typographyHeading: 'Typography',
  typographyBody:
    'Three font families, then the text roles. A role is a complete recipe: its size, weight and leading, plus a tracking where it matters. Components ask for a role, so overriding one of its values changes every place that role is used.',
  typographyFontBefore: 'Loading a web font and assigning it to the families is covered on the',
  typographyFontAfter: ' page.',
  familiesCaption: 'Font families',
  rolesCaption: 'Text roles',
  roles: {
    display: 'The largest text, for a hero title',
    'heading-1': 'The title of a page',
    'heading-2': 'A section heading',
    'heading-3': 'A subsection heading',
    'heading-4': 'The smallest heading: a group inside a section, a card title',
    subtitle: 'The line under a title, in a dialog or an accordion item',
    'body-xl': 'The lead paragraph that opens a page or a section',
    'body-lg': 'Running text given more room, for longer reading',
    'body-md': 'The default running text, also used by menu rows, notifications and fields',
    'body-sm': 'Small running text: secondary details, notes',
    label: 'The label above a form field',
    caption: 'Short supporting text: a field hint, a counter',
    overline:
      'The heading of a group of rows in a menu, a combobox list or a side navigation, with wider letter spacing',
    code: 'Inline code and code content',
    control:
      'The label of a control such as a button, a chip or a tab. It has no size of its own: the text follows the size the control was given',
  } satisfies Record<TextRole, string>,

  radiusHeading: 'Radius',
  radiusBody:
    'Corner radii by role. <code>--vectis-radius-chip</code> points at <code>--vectis-radius-interactive</code>, so chips follow the other controls until you give them a radius of their own. The reference is resolved where the tokens are declared, on the root: an override of the interactive radius on a narrower selector has to set the chip radius as well.',

  motionHeading: 'Motion',
  motionBody:
    'The three durations a transition uses. They are the same in both themes. Looping animations such as the spinner use the duration scale directly and do not follow these roles.',

  sizesHeading: 'Sizes',
  sizesBody:
    'The height of each step of the control size scale, and the three icon sizes. A control set to <code>compact</code> is 4px shorter than its step.',

  componentsHeading: 'Component dimensions',
  componentsBody:
    'Dimensions that belong to a single component: a track, a thumb, the width of a panel. Each group links to the page of its component.',

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
