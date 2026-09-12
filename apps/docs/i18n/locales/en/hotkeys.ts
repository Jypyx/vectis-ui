export default {
  title: 'Hotkeys',
  lead: 'A keyboard shortcut, displayed. It renders as nested <code>&lt;kbd&gt;</code> elements, spells its glyphs per platform, and can listen for the combination it shows if you ask it to.',

  examples: {
    keys: {
      title: 'What you can write',
      written: 'You write',
      elsewhere: 'Windows and Linux',
      text: '<code>keys</code> is a plain string, <code>+</code>-separated, where neither case nor spaces matter. <code>mod</code> is the modifier that belongs to the system, Command on a Mac and Ctrl everywhere else, where <code>meta</code> names that physical key literally. A token the design system does not know is drawn exactly as it was written, and the <code>+</code> key is written <code>plus</code>.',
    },
    variants: {
      title: 'Variants',
      text: '<code>variant</code> draws the caps tinted, outlined or raised. There is no tone and no colour prop: every paint derives from the colour the component inherits.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> takes <code>xs</code> or <code>sm</code>, and <code>compact</code> takes 4px off either of them. A cap holding a single character is square.',
    },
    attached: {
      title: 'Attached',
      text: '<code>attached</code> moves the decoration from each cap to the shortcut as a whole, so the combination reads as one key. It is purely visual: the markup, the caps and the announced name are identical either way.',
    },
    platform: {
      title: 'Platform',
      text: '<code>platform</code> forces the system instead of reading it once the component is in the page, which is what a table showing every system needs.',
    },
    separator: {
      title: 'Separator',
      text: '<code>separator</code> is what is written between two caps, <code>+</code> by default. An empty string leaves the gap in place and gives the macOS convention.',
    },
    inText: {
      title: 'In text and in components',
      text: 'A cap takes its size from the text around it. Its usual homes are the end of a menu row, a tooltip, and the control the shortcut is a second route to.',
    },
    listening: {
      title: 'Listening',
      text: '<code>listen</code> makes the component watch for the combination it shows and emit <code>trigger</code>. Modifiers are matched exactly, so <code>mod+k</code> and <code>mod+shift+k</code> can both exist. <code>allowDefault</code> keeps the browser binding, and <code>allowInInput</code> lets the shortcut fire while the reader is typing in a field.',
    },
  },

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
        allowDefault:
          'While listening, lets the browser go on doing whatever the combination normally does. Left out, the browser is stopped, which is the entire point of taking a combination over.',
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
