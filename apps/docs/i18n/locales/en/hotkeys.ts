export default {
  title: 'Hotkeys',
  lead: 'A keyboard shortcut, displayed. It renders as nested <code>&lt;kbd&gt;</code> elements, spells its glyphs per platform, and can listen for the combination it shows if you ask it to.',

  examples: {
    keys: {
      title: 'What you can write',
      written: 'You write',
      elsewhere: 'Windows and Linux',
      text: 'The combination is a plain string, <code>+</code>-separated, and neither case nor spaces matter. Two tokens name a modifier and are worth keeping apart: <code>mod</code> is the one that belongs to the system, Command on a Mac and Ctrl everywhere else, and it is what an application shortcut almost always wants; <code>meta</code> names that physical key literally, so it stays Command on a Mac and becomes the Windows key, or Super on Linux. A token the design system does not know is drawn exactly as it was written, which is what makes <code>k</code>, <code>f5</code> and <code>,</code> valid without a list to add them to. The <code>+</code> key is the one exception, written <code>plus</code>, since <code>+</code> is already the separator.',
    },
    variants: {
      title: 'Variants',
      text: 'Three ways to draw a cap: tinted, outlined, or raised off the page. They are three values of one prop rather than a variant plus an elevation flag, because a key cap is not interactive: there is no hover, no active and no focus state for an elevation to combine with. Nothing here is a tone, either. A shortcut is chrome, never data, so the component offers no colour of its own.',
    },
    sizes: {
      title: 'Sizes',
      text: 'Two sizes, <code>xs</code> by default because a shortcut sits beside other text rather than competing with it, and <code>compact</code> takes 4px off either of them while leaving the padding and the type alone. A cap holding a single character is square, which is what keeps a row of them even.',
    },
    attached: {
      title: 'Attached',
      text: "The decoration moves from each cap to the shortcut as a whole, so the combination reads as one key and the separator ends up inside it rather than between two of them. The padding follows: attached, the shortcut takes the rhythm of a cap's insides at its own ends, since the padding sized to wrap one short label reads as slack around three runs of text. It is purely visual. The markup, the caps and the announced name are identical either way.",
    },
    platform: {
      title: 'Platform',
      text: 'Left alone, the component reads the system once it is in the page and never before: a server has nothing to read it from, so the first client render has to match what it sent, and a Mac visitor pays one frame of Ctrl before it becomes Command. The prop forces the answer instead, which is what a table showing every system needs, and what a host that already knows can supply: Electron, Tauri, or a server reading the request.',
    },
    separator: {
      title: 'Separator',
      text: 'What is written between two caps, <code>+</code> by default. The caps are laid out with a gap of their own, so this is the character and never the space around it: an empty string leaves the gap and gives the macOS convention, where the symbols simply follow one another.',
    },
    inText: {
      title: 'In text and in components',
      text: "A cap takes its size from the text around it, so a shortcut written into a sentence stays on its line rather than pushing it apart. Its usual homes are the end of a command row, where the menu item's own end slot takes it, a tooltip, whose content slot exists for exactly this, and the control the shortcut is a second route to.",
    },
    listening: {
      title: 'Listening',
      text: "The component can also watch for the combination it shows and report it, which is off until you ask: a thing whose job is to display a shortcut must not capture the page's keyboard on its own. Modifiers are matched exactly rather than as a minimum, so <code>mod+k</code> and <code>mod+shift+k</code> can both exist without one swallowing the other. The browser's own binding is cancelled unless <code>allowDefault</code> says otherwise, and a shortcut goes quiet while the reader is typing in a field unless <code>allowInInput</code> says otherwise.",
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
