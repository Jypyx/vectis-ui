export default {
  title: 'CSS helper classes',
  lead: 'Use <code>v-visually-hidden</code> for text intended for screen readers. Customise component styles with CSS variables and unlayered overrides.',

  hiddenHeading: 'v-visually-hidden',
  hiddenBody:
    'Hides text visually while keeping it available to assistive technology. The class is included in <code>vectis-ui/styles.css</code>.',

  layersHeading: 'CSS layers',
  layersIntro: 'The library declares its layers in this order:',
  layersBody:
    'Write overrides outside layers to take precedence over the library’s normal declarations. If your application uses layers, declare its override layer after the library’s layers.',

  internalHeading: 'Internal classes',
  internalBody:
    'Classes such as <code>.v-control</code>, <code>.v-panel</code> and <code>.v-tone</code> support component styles and may change. Prefer public CSS variables for customisation.',

  propertiesHeading: 'CSS variables',
  propertiesBody:
    'Override the token for the style you want to change, such as <code>--vectis-color-accent</code>, <code>--vectis-radius-interactive</code> or <code>--vectis-text-family-heading</code>. Use <code>--vectis-icon-size</code> for icon dimensions and <code>--vectis-focus-ring-color</code> for focus outlines.',
}
