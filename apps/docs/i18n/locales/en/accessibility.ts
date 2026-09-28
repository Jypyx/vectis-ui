export default {
  title: 'Accessibility',
  lead: 'Keyboard interaction, accessible names, focus styles and motion preferences in Vectis UI.',
  guaranteedHeading: 'Component behaviour',
  guarantees: [
    '<strong>Keyboard and focus</strong>: Interactive components support keyboard use. Modal dialogs keep focus inside while open and return it to the trigger when closed. Each component’s documentation describes its keyboard controls.',
    '<strong>ARIA</strong>: Components expose their roles, states and relationships to assistive technology. Status messages use live regions where needed.',
    '<strong>Accessible names</strong>: Provide a name for each control. <code>VIconButton</code> requires a <code>label</code> prop that describes the action, such as “Search”.',
    '<strong>Contrast</strong>: The default themes provide text and focus colours for light and dark backgrounds. Recheck contrast when overriding them.',
  ],
  guaranteedBody:
    'Test your application’s keyboard flows, accessible names and screen reader output. Component checks do not cover every combination of content and custom styles.',
  focusHeading: 'Focus',
  focusBody:
    'Keep focus indicators visible when customising styles. Check that surrounding containers do not clip them. Field action buttons use an inset outline.',
  focusCaption:
    'Use Tab to move through the controls. Text fields highlight their border; the clear button has its own focus outline.',
  validationHeading: 'Validation',
  validationBody:
    'Form fields use <code>:user-invalid</code> for native validation feedback after user interaction. Use the <code>invalid</code> prop for application errors, such as a server response, and provide an error message.',
  motionHeading: 'Motion',
  motionBody:
    'With <code>prefers-reduced-motion</code>, components remove or reduce animations. <code>VSpinner</code> keeps rotating at a slower speed to indicate ongoing activity.',
  forcedColorsHeading: 'Forced colours',
  forcedColorsBody: 'In forced-colours mode:',
  forcedColorsRules: [
    '<strong>Icons</strong>: Built-in SVG icons use <code>currentColor</code> to follow the text colour. Check any custom icons or images you provide.',
    '<strong>Separators</strong>: CSS borders keep separators visible when the browser replaces background colours.',
  ],
}
