export default {
  title: 'Accessibility',
  lead: 'Keyboard navigation and ARIA semantics on every component. <code>prefers-reduced-motion</code> is respected everywhere, and axe audits every story in both themes on every commit. A violation fails the build instead of filing a warning nobody reads.',

  guaranteedHeading: 'What is guaranteed',
  guarantees: [
    'The ARIA menu pattern: roving focus, and focus returned to the trigger on close.',
    '<code>role="switch"</code> on VSwitch, so it is announced as on or off rather than ticked.',
    'Tooltips linked by <code>aria-describedby</code> and dismissible with Escape (WCAG 1.4.13).',
    '<code>role="status"</code> or <code>role="alert"</code> according to criticality.',
    'An accessible label REQUIRED on VIconButton. The prop is not optional, so an unlabelled icon button cannot be written by accident.',
  ],
  guaranteedBody:
    'Half of the behavioural JavaScript in the library exists for this rather than to make anything work. The components are accessible first and interactive second, and the code is tagged so that the ratio can be counted instead of claimed.',

  focusHeading: 'Focus',
  focusBody:
    "Focus is a 2px outline at 2px offset, drawn outside the box, so it costs no layout. Wherever the container clips its content it is pulled inwards instead: a field's inner buttons, an accordion summary, a nav row inside an animatable branch. An outline drawn outside a clipping box is an outline nobody sees.",
  focusCaption:
    'A text field departs from that: a 1px accent border plus a shadow of the same colour, because Windows forced colours drop box-shadows and the outline is the safety net.',

  validationHeading: 'Validation',
  validationBody:
    '<code>:user-invalid</code>, not <code>:invalid</code>: a field only turns red once the reader has left it, so a half-typed email is never called wrong. The <code>invalid</code> prop forces the state for a rule only the server can check.',

  motionHeading: 'Motion',
  motionBody:
    'Under <code>prefers-reduced-motion</code> transitions go to <code>none</code>, while looping animations slow down instead of stopping. A spinner goes from 1s to 3s, because a frozen spinner reads as a broken page.',

  forcedColorsHeading: 'Forced colours',
  forcedColorsBody:
    'Two decisions in the library exist for Windows forced-colors mode, and both are worth copying. Icons are drawn as <code>&lt;svg&gt;&lt;path fill="currentcolor"&gt;</code> and never as a masked background, which vanishes there. Rules are painted with a border rather than a background: a background is forced to <code>Canvas</code>, the colour of the page itself, while a border colour is forced to <code>CanvasText</code> and survives.',

  toolHeading: 'What a tool cannot tell you',
  toolBody:
    "axe reads computed colours, so contrast has to be checked twice, once per theme, and the library's CI does exactly that. It also cannot judge text painted over a sibling it only partly covers: it derives a background from the boxes containing an element's rect, so a clipped label is measured against whatever lies underneath. The two cases in the library are excluded by name, each with its reasoning. An exclusion covers a limitation of the tool, never a real violation.",
  toolQuote:
    'A tool that runs on every commit and blocks the build is worth more than an audit that happens once. Neither replaces using the thing with a keyboard.',
}
