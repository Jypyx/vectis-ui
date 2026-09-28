export default {
  title: 'Icon',
  lead: '<code>VIcon</code> renders built-in icons, custom SVGs, images or icons supplied by a resolver.',
  examples: {
    size: {
      title: 'Size',
      text: '<code>size</code> sets the square icon size in pixels. Without it, the icon uses its context size or <code>1em</code>.',
    },
    filled: {
      title: 'Filled',
      text: '<code>filled</code> selects a filled drawing when available.',
    },
    mirrored: {
      title: 'Mirrored',
      text: '<code>mirrored</code> flips directional icons in right-to-left layouts. The direction follows the nearest <code>dir</code> context.',
    },
    rendering: {
      title: 'Where the drawing comes from',
      text: 'The first available source is used in this order:',
      order: [
        '<code>render</code>: SVG paths, a component, an image or a font class.',
        '<code>src</code>: image URL.',
        '<code>name</code>: resolver, built-in drawing, then ligature font.',
        'Default slot: inline SVG when no source prop is set.',
      ],
      moreBefore:
        'A resolver can return nothing to fall back to the built-in icon. A plain string is an icon name. For setup and available icons, see',
      moreAfter: '.',
    },
  },
  api: {
    VIcon: {
      props: {
        name: 'Icon name or built-in icon imported from <code>vectis-ui/icons</code>. The resolver takes precedence over the built-in drawing; unresolved strings use a ligature font.',
        render: 'Explicit icon source. Takes precedence over other sources.',
        src: 'Image URL. Takes precedence over <code>name</code>.',
        size: 'Size in pixels, as a number or numeric string. Defaults to the context size or <code>1em</code>.',
        label: 'Accessible name. Omit it for decorative icons.',
        filled: 'Uses a filled variant when supported by the icon source.',
        mirrored: 'Flips the icon horizontally in a right-to-left context.',
      },
      slots: {
        default: 'Inline SVG used when no source prop is set.',
      },
    },
  },
}
