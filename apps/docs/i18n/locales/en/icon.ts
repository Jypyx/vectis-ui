export default {
  title: 'Icon',
  lead: 'One icon, from whichever source you have. The library ships its own drawings, so nothing here needs an icon font, and a resolver lets you wire in a third-party set instead.',

  examples: {
    size: {
      title: 'Size',
      text: 'A number of pixels, and the icon is square. Left out, it takes the size its context imposes: every control in the library sets one for whatever is drawn inside it, so an icon in a button follows the button without being told. With no context either it falls back to <code>1em</code>, which makes it the size of the text it sits in and keeps it on the line rather than pushing it apart. An explicit size wins over both.',
    },
    filled: {
      title: 'Filled',
      text: 'The same icon with its shape filled in, which is what marks a state: a notification that has arrived, a step that is done. The library ships a filled drawing only where filling really changes the geometry, 15 of its 34 icons, and asking for one that has none draws the icon it always had. So the prop can be bound to a condition without checking whether that particular icon has anything to say about it. It means nothing for an image or an inline SVG, whose shape is fixed, and a ligature font always honours it.',
    },
    rendering: {
      title: 'Where the drawing comes from',
      text: 'An icon can come from five places, asked in a fixed order, and the first that answers is the one drawn:',
      order: [
        "<code>render</code>, an explicit description of what to draw: SVG path data, a component, an image, or a font's own class.",
        '<code>src</code>, the address of an image.',
        '<code>name</code>, offered to your resolver first, then to the drawing a library icon carries, then to a ligature font.',
        'The default slot, an inline SVG, reached when neither <code>name</code> nor <code>src</code> was given.',
      ],
      moreBefore:
        "The order is the contract. Your resolver comes before the library's own drawings, so one call moves every icon the components draw onto your set, and a resolver answering nothing for a given name hands it back rather than leaving a gap, which is what makes a partial mapping usable. A plain string is only ever a name, never an address: that is what lets a namespaced identifier such as <code>mdi:close</code> reach your resolver intact. Wiring a set in, and the list of what the library ships, are both on",
      moreAfter: '.',
    },
  },

  api: {
    VIcon: {
      props: {
        name: "Which icon to draw. A plain string is a name: it is offered to your resolver, then left to an icon font as a ligature. One of the library's own icons, imported from <code>vectis-ui/icons</code>, carries its drawing with it; the resolver is still asked first, and the drawing answers when nothing else does.",
        render:
          'An explicit description of what to draw, an image, a component, a path or a class, which wins over everything else. This is the route every icon prop of the library takes when it is given something other than a plain name.',
        src: 'The address of an image to use as the icon. It wins over <code>name</code>.',
        size: 'A size in pixels. Left out, the icon takes the size its context imposes, a button setting one for the icons inside it, and failing that 1em, which makes it follow the surrounding text.',
        label:
          'What the icon means, for screen readers. Leaving it out marks the icon as decorative and hides it from them, which is right whenever the surrounding text already says what it says.',
        filled:
          'Draws the filled version of the icon. The built-in icons honour it wherever filling actually changes the drawing, and a ligature font always does. It means nothing for an image or an inline SVG, whose shape is fixed.',
      },
      slots: {
        default:
          'An inline SVG, used when neither <code>src</code> nor <code>name</code> was given.',
      },
    },
  },
}
