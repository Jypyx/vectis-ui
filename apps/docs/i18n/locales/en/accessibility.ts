export default {
  title: 'Accessibility',
  lead: 'Keyboard navigation and ARIA semantics on every component. <code>prefers-reduced-motion</code> is respected everywhere, and axe audits every story in both themes on every commit.',

  guaranteedHeading: 'What is guaranteed',
  guarantees: [
    'Everything interactive is reachable and operable from the keyboard, in the order the page reads, with no dead end on the way out.',
    'Every component carries the ARIA pattern its behaviour implies: the role it plays, the state as it changes, and the relationships between its parts. What is announced is what the thing does, not what it looks like.',
    'Focus is always visible, and it goes back where it came from when a panel, a menu or a dialog closes.',
    'Anything that opens can be dismissed with Escape, and anything that appears or updates on its own is announced rather than left to be noticed.',
    'A control with nothing but an icon in it cannot be written without an accessible name: the prop is required, so the omission is a compile error rather than a silent one.',
    'Text contrast holds at the WCAG AA floor in the light theme and in the dark one, and disabled states are greyed through the colour tokens rather than through opacity, which keeps them legible on any surface.',
  ],
  guaranteedBody:
    'Half of the behavioural JavaScript in the library exists for this rather than to make anything work. The components are accessible first and interactive second, and the code is tagged so that the ratio can be counted instead of claimed.',

  focusHeading: 'Focus',
  focusBody:
    "Focus is a 2px outline at 2px offset, drawn outside the box, so it costs no layout. Wherever the container clips its content it is pulled inwards instead: a field's inner buttons, an accordion summary, a nav row inside an animatable branch. An outline drawn outside a clipping box is an outline nobody sees.",
  focusCaption:
    'Tab through them. A text field departs from the rule with a 1px accent border plus a shadow of the same colour, and the cross inside it takes the ring on itself.',

  validationHeading: 'Validation',
  validationBody:
    '<code>:user-invalid</code>, not <code>:invalid</code>: a field only turns red once the reader has left it, so a half-typed email is never called wrong. The <code>invalid</code> prop forces the state for a rule only the server can check.',

  motionHeading: 'Motion',
  motionBody:
    'Under <code>prefers-reduced-motion</code> transitions go to <code>none</code>, while looping animations slow down instead of stopping. A spinner goes from 1s to 3s, because a frozen spinner reads as a broken page.',

  forcedColorsHeading: 'Forced colours',
  forcedColorsBody:
    'Two decisions in the library exist for Windows forced-colors mode, and both are worth copying. Icons are drawn as <code>&lt;svg&gt;&lt;path fill="currentcolor"&gt;</code> and never as a masked background, which vanishes there. Rules are painted with a border rather than a background: a background is forced to <code>Canvas</code>, the colour of the page itself, while a border colour is forced to <code>CanvasText</code> and survives.',
}
