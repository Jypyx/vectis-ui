export default {
  title: 'Icon',
  lead: 'One icon, from whichever source you have. The library ships its own drawings, so nothing here needs an icon font, and a resolver lets you wire in a third-party set instead.',

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
