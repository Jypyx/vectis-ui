export default {
  title: 'CSS helper classes',
  lead: 'One utility class ships, and that is deliberate: a design system that ships utilities competes with the framework the consumer already chose.',

  hiddenHeading: 'v-visually-hidden',
  hiddenBody:
    'Takes an element out of sight while leaving it in the accessibility tree — the label a screen reader needs and a sighted reader does not. It lives in <code>vectis.utilities</code>, the strongest layer, so it wins over any component rule.',
  hiddenNot:
    'Note what it is NOT: <code>display: none</code> and <code>visibility: hidden</code> both remove the element from the accessibility tree as well as from the page, and <code>width: 0</code> is announced by some screen readers and skipped by others. The clip is what keeps it readable and unseen at once.',

  layersHeading: 'The layers',
  layersIntro: 'Four, declared in this order, and the order is the whole override model:',
  layersBody:
    'Any non-layered consumer style wins automatically. Write an unlayered rule, or write into <code>vectis.utilities</code> — never a specificity war, and never <code>!important</code>. Every line of CSS on this site takes that path: its layout, its fonts and its accent are all unlayered rules sitting on top of the library.',
  layersQuote:
    "One trap comes with it. A layer name is GLOBAL and not namespaced, so writing <code>@layer vectis.components { … }</code> in your own stylesheet puts your rule INSIDE the library's layer, where it is arbitrated by the order above rather than winning over it. Leaving your CSS unlayered is both simpler and stronger.",

  internalHeading: 'The internal classes you will see in the DOM',
  internalBody:
    'These are not an API — they are named here because you will read them in devtools, and because a targeted override needs the right hook. They can change; a custom property cannot.',
  columnClass: 'Class',
  columnCarries: 'What carries it',
  control:
    'Every control. Reads the size table and publishes <code>--control-height</code>, <code>--control-padding-inline</code>, <code>--control-font-size</code> and <code>--control-gap</code> for its children.',
  panel:
    'The shared floating-panel chrome: overlay surface, 1px border, <code>radius-overlay</code>, <code>shadow-lg</code>.',
  overlay:
    'Top-layer placement and the anchor-positioned entry animation (fade plus <code>scale(0.97)</code>).',
  tone: 'The tone table, on the element carrying <code>data-tone</code>. It publishes <code>--tone-bg-solid</code>, <code>--tone-text-tinted</code> and their kin, which the variants consume.',
  ligature: 'An icon rendered as a font ligature rather than an embedded path.',
  theme:
    'Not a class: the one signal in the document. It moves the roles and drives <code>color-scheme</code>.',

  propertiesHeading: 'The custom properties to aim at',
  propertiesBody:
    'Prefer repointing a property to rewriting a rule: <code>--vectis-color-accent</code>, <code>--vectis-radius-interactive</code>, <code>--vectis-icon-size</code>, <code>--vectis-focus-ring-color</code>, <code>--vectis-text-family-heading</code>. A component reads them every render, so the change follows every state — hover, focus, disabled — without a single one of them being restated.',
}
