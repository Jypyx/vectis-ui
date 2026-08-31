export default {
  title: 'Chip',
  lead: 'A small piece of information: a status, a tag, a filter that stays chosen. It shares its variant and tone table verbatim with VButton, and adds the two states a button does not have.',

  tonesHeading: 'Tones and variants',
  tonesBody:
    'A chip carries five tones, not three: here a tone is a STATUS rather than an intention, so success and warning belong.',
  sizesCaption: 'Only the two smallest control sizes: a chip larger than that is a button.',

  statesHeading: 'Chosen, and dismissed',
  statesBody:
    '<code>selectable</code> makes the chip something that STAYS chosen, and wins over <code>href</code> and <code>clickable</code>. <code>check</code> shows a tick before the label while selected, replacing the start icon. <code>dismissible</code> adds a button that ASKS for removal: taking the chip away stays your decision, so the component emits <code>dismiss</code> and removes nothing itself.',

  colourHeading: 'A colour of your own',
  colourBody:
    '<code>color</code> replaces the tone, and every shade is derived from it with <code>color-mix()</code>. That is what a tag list coming from a database needs, since its colours are data rather than design decisions. Light and dark are handled for you.',

  apiHeading: 'API',
  apiColor: '<code>string</code>: any CSS colour, and it replaces the tone',
  apiCheck: '<code>boolean</code>: replaces <code>iconStart</code> while selected',
  apiDismissible: '<code>boolean</code>: emits <code>dismiss</code>',
  apiElement:
    'Which element is rendered follows the same priority: <code>selectable</code> and <code>clickable</code> give a <code>&lt;button&gt;</code>, <code>href</code> an <code>&lt;a&gt;</code>, and a chip with none of them is a plain <code>&lt;span&gt;</code>. Never a focusable thing that does nothing.',
}
