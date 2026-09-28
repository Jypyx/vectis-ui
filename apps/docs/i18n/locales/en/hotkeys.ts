export default {
  title: 'Hotkeys',
  lead: '<code>VHotkeys</code> displays a keyboard shortcut using platform conventions. Enable <code>listen</code> to emit an event when it is pressed.',
  examples: {
    keys: {
      title: 'What you can write',
      written: 'You write',
      elsewhere: 'Windows and Linux',
      text: 'Write <code>keys</code> as a <code>+</code>-separated string, ignoring case and spaces. <code>mod</code> means Command on macOS and Ctrl elsewhere; <code>meta</code> is the literal system key. Write the plus key as <code>plus</code>. Unknown tokens display unchanged.',
    },
    variants: {
      title: 'Variants',
      text: '<code>variant</code> selects soft, outlined or raised keycaps. Colours inherit from the surrounding text.',
    },
    sizes: {
      title: 'Sizes',
      text: 'Choose <code>xs</code> or <code>sm</code>. <code>compact</code> reduces the height.',
    },
    attached: {
      title: 'Attached',
      text: '<code>attached</code> frames the whole shortcut as one key. It does not change its accessible name or behaviour.',
    },
    platform: {
      title: 'Platform',
      text: '<code>platform</code> overrides automatic platform detection.',
    },
    separator: {
      title: 'Separator',
      text: '<code>separator</code> sets the text between keys. Use an empty string for adjacent macOS symbols.',
    },
    inText: {
      title: 'In text and in components',
      text: 'Place shortcuts beside controls, in menus or in tooltips.',
    },
    listening: {
      title: 'Listening',
      text: '<code>listen</code> emits <code>trigger</code> for an exact modifier match. <code>allowDefault</code> preserves the browser action; <code>allowInInput</code> enables matching in editable fields. Escape is never cancelled. Matching uses the produced character: prefer letters and named keys over symbols, AZERTY digits or macOS Option-letter combinations.',
    },
  },
  api: {
    VHotkeys: {
      props: {
        keys: 'Shortcut string separated by <code>+</code>. Use <code>mod</code> for Command/Ctrl and <code>plus</code> for the plus key.',
        variant: 'Keycap style: soft, outlined or raised.',
        attached: 'Frames the whole combination as one key.',
        size: 'Component size.',
        compact: 'Reduces the control height without changing text or icons.',
        platform: 'Platform override for display and shortcut matching.',
        separator: 'Text between keys. An empty string keeps only spacing.',
        listen: 'Enables shortcut matching and the <code>trigger</code> event.',
        allowDefault: 'Preserves the browser action when listening. Escape is always preserved.',
        allowInInput: 'Allows matching in editable fields.',
        label: 'Accessible shortcut name. Defaults to a localized reading of the keys.',
      },
      events: {
        trigger:
          'Matching shortcut was pressed while <code>listen</code> is enabled. Receives the keyboard event.',
      },
    },
  },
}
