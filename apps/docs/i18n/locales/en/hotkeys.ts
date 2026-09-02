export default {
  title: 'Hotkeys',
  lead: 'A keyboard shortcut, displayed. It renders as nested <code>&lt;kbd&gt;</code> elements, spells its glyphs per platform, and can listen for the combination it shows if you ask it to.',

  api: {
    VHotkeys: {
      props: {
        keys: 'The combination, separated by <code>+</code>: <code>mod+k</code>, <code>ctrl+shift+p</code>, <code>alt+enter</code>. Case and spaces do not matter. <code>mod</code> is the cross-platform modifier, Command on macOS and Ctrl everywhere else, while <code>meta</code> is the literal Command or Windows key. An unknown token is displayed as it was declared, and the <code>+</code> key itself is written <code>plus</code>.',
        variant: 'How a key cap is drawn: tinted, outlined, or raised off the page.',
        attached:
          'Draws the whole combination as a single key rather than as several, which puts the separator inside the key instead of between two of them. It is purely visual: the markup and the announced name are identical either way.',
        size: 'The size of the caps. A shortcut is chrome beside other text, so it starts at the smallest.',
        compact: 'Takes 4px off the height, leaving the padding and the text as they are.',
        platform:
          "Forces the keyboard's operating system instead of detecting it, for a deterministic rendering or a host that already knows.",
        separator:
          'What is written between two caps. An empty string gives the macOS convention, where the symbols simply follow one another.',
        listen:
          "Actually listens for the combination and reports it. It is off by default: a component whose job is to display a shortcut must not capture the page's keyboard without being asked.",
        preventDefault:
          'While listening, stops the browser from doing whatever the combination normally does, which is the entire point of taking one over.',
        allowInInput:
          'While listening, fires even when the reader is typing in a field. It is off by default, so a shortcut cannot fire in the middle of a sentence.',
        label:
          'What screen readers announce. It falls back to the design system dictionary, which spells the modifiers as words: the glyph wins on screen, the word wins in the accessible name.',
      },
      events: {
        trigger:
          'The combination was pressed, with the original keyboard event. It only fires while <code>listen</code> is set.',
      },
    },
  },
}
