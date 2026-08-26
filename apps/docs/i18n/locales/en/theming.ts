export default {
  title: 'Theming',
  lead: 'Every customisation is a redefinition of custom properties. There is no rebuild, and no build step to configure.',

  architectureHeading: 'Token architecture',
  architectureIntro:
    'Two levels of custom properties, generated from a typed TypeScript source in a format inspired by the W3C DTCG.',
  levels: [
    '<strong>Primitives</strong> — five OKLCH palettes of eleven steps each (<code>--vectis-color-indigo-500</code>), plus the space scale, type, radii, shadows, durations and easings.',
    '<strong>Semantic roles</strong>, the only ones a component may name: <code>--vectis-color-surface</code>, <code>--vectis-color-text-muted</code>, <code>--vectis-color-accent</code>, <code>--vectis-radius-interactive</code>, <code>--vectis-focus-ring-color</code>.',
  ],
  architectureBody:
    'A component asks for the accent and never for a particular indigo, so an application can change what the accent IS without a single component knowing. A raw hex in component CSS is treated as a missing token.',
  palettes:
    'The library ships five palettes and no more, because five is what it paints with — gray for surfaces, text and borders, indigo for the accent, and red, green and amber for danger, success and warning. An unused palette is still eleven custom properties in every page that loads the stylesheet, which is why a sixth colour belongs to the application: declare its eleven steps under your own name, point the role at them, and you are done — no rebuild, no release. This site does exactly that for its violet accent.',

  darkHeading: 'Dark mode',
  darkBody:
    'Dark mode moves the ROLES, never the palette. <code>data-theme</code> works on any DOM subtree — a dark panel inside a light page, or the reverse — and also drives <code>color-scheme</code>, so scrollbars and native controls follow.',
  darkCaption: 'One subtree, one attribute.',
  darkNoQuery:
    'There is deliberately no <code>prefers-color-scheme</code> query in the generated tokens: following the system is a decision for the application, not the design system, and it is one line of JavaScript setting the attribute. Doing it in CSS would make the choice un-overridable by the reader.',

  overridesHeading: 'Runtime overrides',
  oklch:
    'Colour is written in OKLCH, always, and for two reasons the library states explicitly: one step of a palette is as light as the same step of any other, and mixing two of them passes through the shades one expects rather than through grey. Never convert a token to hex.',

  layersHeading: 'Layers',
  layers:
    'The CSS lives in layers — <code>vectis.reset</code> &lt; <code>vectis.tokens</code> &lt; <code>vectis.components</code> &lt; <code>vectis.utilities</code> — and any non-layered consumer style wins automatically. That is the intended override mechanism, not a loophole: overriding a component never calls for a specificity war.',
}
