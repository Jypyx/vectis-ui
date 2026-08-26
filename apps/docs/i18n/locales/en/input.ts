export default {
  title: 'Input',
  lead: 'A complete text field: label above, hint below, icons inside, a character counter, a clear button and a loading state, all around a real <code>&lt;input&gt;</code>.',
  validation:
    "Validation stays the browser's. The field turns red through <code>:user-invalid</code>, which only reacts once the reader has left it, so a half-typed email is never called wrong.",

  anatomyHeading: 'Anatomy',
  anatomyBody:
    'The label is tied to the field, so clicking it focuses the field, and the hint is read out along with the label. The cross hands focus back to the input the instant it empties the field — otherwise a keyboard reader loses their place in the form.',
  anatomyModel:
    'The model is typed <code>string | number</code> rather than <code>string</code>, and that is not laxity: on <code>type="number"</code> Vue casts the value to a number itself, so a string-only model would hand a number back to whoever passed a string in.',

  sizesHeading: 'Sizes and density',
  sizesBody:
    'Three sizes only — 32, 40 and 48px — because every component that embeds a text input restricts itself to sm, md and lg. The 24px step is too short for editable text, and the 56px one is outside the form template.',

  statesHeading: 'States',
  statesBody:
    '<code>readonly</code> shows the value without allowing changes, and the field can still be focused and copied — which is the difference from <code>disabled</code>, whose value is not even submitted. <code>invalid</code> forces the error state for a rule only the server can check; everything the browser can check, it checks itself.',

  limitsHeading: 'Counters and limits',
  limitsBody:
    '<code>counter</code> shows the length, and with <code>maxlength</code> shows it as a fraction. <code>softLimit</code> turns the limit soft: the reader may type past it, and the field goes into error instead of swallowing the keystroke — which is what you want whenever the text being written is worth more than the rule.',

  apiHeading: 'API',
  apiIcons:
    '<code>IconSource</code> — becomes a button with a <code>@click:icon-start</code> / <code>@click:icon-end</code> listener',
  apiIconLabels: '<code>string</code> — required once the icon is clickable',
  apiClearVisible: '<code>boolean</code> — your own answer to "is there anything to clear?"',
  apiBody:
    'Emits <code>clear</code>, <code>click:icon-start</code> and <code>click:icon-end</code>; slots <code>#start</code> and <code>#end</code>; and it exposes <code>focus()</code>, <code>select()</code> and <code>el</code>. Every other attribute — <code>name</code>, <code>required</code>, <code>autocomplete</code>, <code>pattern</code> — falls through onto the real <code>&lt;input&gt;</code>, so forms and validation work exactly as they already do.',
  apiQuote:
    'VTextarea is the same component with the field swapped: it grows with its content through <code>field-sizing: content</code>, with no JavaScript measuring anything.',
}
