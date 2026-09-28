export default {
  title: 'Fonts',
  lead: 'Vectis UI uses system fonts by default and does not load web fonts. Override the font-family tokens to use your own fonts.',

  threeHeading: 'Default font families',
  families: [
    '<code>--vectis-font-family-sans</code>: System font stack for interface text.',
    '<code>--vectis-font-family-display</code>: Heading font. Defaults to <code>var(--vectis-font-family-sans)</code>.',
    '<code>--vectis-font-family-mono</code>: System monospace stack for code.',
  ],
  roles:
    'Components use three semantic tokens: <code>--vectis-text-family</code>, <code>--vectis-text-family-heading</code> and <code>--vectis-text-family-code</code>. Override these on a container to change fonts in one section; primitive aliases declared at the root do not resolve again in that container.',

  wiringHeading: 'Load a web font',
  wiringBody:
    'Load the font, then assign its CSS family name to the matching tokens. These examples set the body and heading fonts for the whole page.',
  wiringSelfHosted:
    'To serve the font from your own application, declare its file with <code>@font-face</code>:',

  splitHeading: 'Font roles',
  splitBody: '<code>VTypography</code> selects its font family from its <code>variant</code>:',
  splitList: [
    '<code>--vectis-text-family-heading</code>: <code>display</code> and <code>heading-1</code> through <code>heading-4</code>.',
    '<code>--vectis-text-family</code>: Body text, subtitles, labels, captions and overlines.',
    '<code>--vectis-text-family-code</code>: The <code>code</code> variant. Also used by <code>VInputOTP</code>.',
  ],

  iconHeading: 'Optional icon font',
  iconBefore:
    'Built-in SVG icons do not need a font. For ligature icons, load a font and set <code>--vectis-font-family-icon</code>, which defaults to Material Symbols Rounded. See',
  iconAfter: ' for icon imports and resolvers.',
}
