export default {
  title: 'Button',
  lead: 'The button that triggers an action, and the reference from which the tone and variant tables of every other coloured component are taken. It renders a native <code>&lt;button&gt;</code>, or an <code>&lt;a&gt;</code> as soon as it is given an <code>href</code>.',

  examples: {
    variantsAndTones: {
      title: 'Variants and tones',
      text: '<code>variant</code> offers four ways of painting the button, and <code>tone</code> three meanings: <code>accent</code>, <code>neutral</code> and <code>danger</code>.',
    },
    elevated: {
      title: 'Elevated',
      text: '<code>elevated</code> applies the shadow scale to whichever variant is in use. A ghost or outline button also gains a raised background.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the height: 24, 32, 40, 48 or 56 pixels. The type, the padding and the icons follow.',
    },
    compact: {
      title: 'Compact',
      text: '<code>compact</code> takes 4px off the height, nothing else moving.',
    },
    fullWidth: {
      title: 'Full width',
      text: '<code>fullWidth</code> stretches the button across the inline size of its parent and makes it block level.',
    },
    icons: {
      title: 'With icons',
      text: '<code>iconStart</code> and <code>iconEnd</code> put an icon on either side of the label, and <code>iconFilled</code> switches them to their filled form. The <code>#start</code> and <code>#end</code> slots take over when the content is more than an icon.',
    },
    customIcons: {
      title: 'Custom icons',
      text: 'Both icon props take an <code>IconSource</code>: one of the library icons, a name handed to the resolver your application installed, SVG path data, a component, or an image.',
    },
    link: {
      title: 'Link',
      text: '<code>href</code> renders the button as an <code>&lt;a&gt;</code>. A disabled or loading link is made inert, its address dropped.',
    },
    states: {
      title: 'States',
      text: '<code>disabled</code> greys the button out through the colour tokens. <code>loading</code> disables it, announces it as busy and puts a spinner where the start icon was.',
    },
  },

  api: {
    VButton: {
      props: {
        variant:
          'How much visual weight the action carries: <code>solid</code> is filled with the tone, <code>soft</code> uses a tinted background, <code>outline</code> keeps only a border, and <code>ghost</code> shows nothing until it is hovered. Inside a VButtonGroup the group decides it, as it does the size, the density and the elevation.',
        tone: "What the action means: <code>accent</code> for the ordinary one, <code>neutral</code> for a secondary one, <code>danger</code> for one that destroys something. On a button a tone is an intention, which is why states such as success or warning are not offered here. Left out inside a VButtonGroup it takes the group's tone; on its own the button is <code>accent</code>.",
        elevated:
          'Raises the button off the page with the shadow scale, whatever the variant. A ghost or outline button also gains a raised surface, because in the dark theme a shadow lying on the page background has nothing casting it.',
        size: 'The height of the button, taken from the size scale shared by every control: 24, 32, 40, 48 and 56 pixels.',
        compact:
          'Takes 4px off the height, leaving the padding, the text and the icons as they are.',
        fullWidth:
          'Stretches the button across the whole inline size of its parent instead of leaving it as wide as its label. It also becomes block-level, so it no longer sits on a line of text.',
        href: 'Turns the button into an <code>&lt;a&gt;</code> pointing at this address. A disabled or loading link becomes inert: the address is dropped, so it can be neither focused nor followed.',
        type: 'The native type of the button. It is ignored as soon as <code>href</code> makes it a link.',
        disabled:
          'Makes the button unusable: it stops responding, leaves the tab order and greys out through the colour tokens rather than through opacity.',
        loading:
          'Shows a spinner, disables the button and announces it as busy. The spinner takes the place of the start icon, so the two are never shown side by side.',
        iconStart: 'An icon before the label. The <code>#start</code> slot replaces it.',
        iconEnd: 'An icon after the label. The <code>#end</code> slot replaces it.',
        iconFilled:
          "Renders both icons in their filled form, the font's <code>FILL</code> axis. It has no effect on the <code>#start</code> and <code>#end</code> slots, whose icons you build yourself.",
      },
      slots: {
        default: 'The label of the button.',
        start:
          'Content placed before the label, usually an icon. Mark it <code>aria-hidden</code> when it only repeats what the label already says.',
        end: 'Content placed after the label.',
      },
    },
  },
}
