export default {
  title: 'Button',
  lead: 'The button that triggers an action, and the reference from which the tone and variant tables of every other coloured component are taken. It renders a native <code>&lt;button&gt;</code>, or an <code>&lt;a&gt;</code> as soon as it is given an <code>href</code>.',

  examples: {
    variantsAndTones: {
      title: 'Variants and tones',
      text: 'Four variants across each row, three tones down the column: <code>accent</code>, then <code>neutral</code>, then <code>danger</code>. The tones stop there because on a button a tone is an intention, where success and warning are states: those belong on the components that report one, a chip or a toast. Every other coloured component in the library takes its own table from this one.',
    },
    elevated: {
      title: 'Elevated',
      text: '<code>elevated</code> is a boolean rather than a fifth variant: it applies the shadow scale to whichever variant is in use, as the second row below shows. A ghost or an outline button also gains a raised background, which is not decoration but necessity: in the dark theme a shadow lying straight on the page has nothing casting it.',
    },
    sizes: {
      title: 'Sizes',
      text: 'Five heights, from the scale every control in the library shares: 24, 32, 40, 48 and 56 pixels. The type, the padding and the icons all follow the step, so a size is one prop and not a set of measurements to keep in agreement.',
    },
    compact: {
      title: 'Compact',
      text: 'Each pair below is one step of the scale, the second of the two <code>compact</code>: 4px come off the height and nothing else moves. It is for a dense toolbar, where a button has to line up with a row rather than stand on its own.',
    },
    icons: {
      title: 'With icons',
      text: '<code>iconStart</code> and <code>iconEnd</code> put an icon on either side of the label, and both can be given at once. <code>iconFilled</code> switches them to their filled form, the FILL axis of the icon: the last two buttons are the same bell, hollow then filled, which is how a state is shown without changing the glyph. The <code>#start</code> and <code>#end</code> slots take over when the content is more than an icon, and <code>iconFilled</code> then has nothing to act on.',
    },
    customIcons: {
      title: 'Custom icons',
      text: 'Both icon props take an <code>IconSource</code>, which is what every icon prop in the library takes: one of the library icons, a plain name handed to the resolver the application installed, raw SVG path data, a component whose root is a single <code>&lt;svg&gt;</code>, or an image. A string is always a NAME and never an address, which is what lets <code>mdi:close</code> reach a resolver intact. The Iconography page covers the two remaining forms, a ligature font and a class-driven font, each of which needs a font loaded before it shows anything.',
    },
    link: {
      title: 'Link',
      text: 'Given an <code>href</code>, the button renders an <code>&lt;a&gt;</code>: middle-click, open in a new tab and the browser status bar all come back, none of which a click handler on a <code>&lt;button&gt;</code> can imitate. A disabled or loading link is made inert rather than merely greyed, HTML having no <code>disabled</code> for a link: the address is dropped, so it can be neither focused nor followed.',
    },
    states: {
      title: 'States',
      text: 'A disabled button greys out through the colour tokens rather than through opacity, which is what keeps its label legible on every surface. <code>loading</code> is the one exception to that rule, and it does three things at once: it disables the button, announces it as busy, and puts a spinner where the start icon was, so the two are never shown side by side.',
    },
  },

  api: {
    VButton: {
      props: {
        variant:
          'How much visual weight the action carries: <code>solid</code> is filled with the tone, <code>soft</code> uses a tinted background, <code>outline</code> keeps only a border, and <code>ghost</code> shows nothing until it is hovered.',
        tone: 'What the action means: <code>accent</code> for the ordinary one, <code>neutral</code> for a secondary one, <code>danger</code> for one that destroys something. On a button a tone is an intention, which is why states such as success or warning are not offered here.',
        elevated:
          'Raises the button off the page with the shadow scale, whatever the variant. A ghost or outline button also gains a raised surface, because in the dark theme a shadow lying on the page background has nothing casting it.',
        size: 'The height of the button, taken from the size scale shared by every control: 24, 32, 40, 48 and 56 pixels.',
        compact:
          'Takes 4px off the height, leaving the padding, the text and the icons as they are.',
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
