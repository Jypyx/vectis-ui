export default {
  title: 'Avatar',
  lead: 'A person or a thing, as a disc. A picture when there is one, an icon or the initials when there is not, on a colour derived from the name so the same person keeps the same one everywhere.',

  examples: {
    image: {
      title: 'With a picture',
      text: '<code>src</code> is what the avatar prefers above everything else. Give it <code>name</code> as well: it becomes the alternative text of the picture, and it is what the disc falls back to when the file cannot be loaded, so a broken address leaves initials rather than a hole.',
    },
    icon: {
      title: 'With an icon',
      text: 'An avatar standing for something other than a person takes an <code>icon</code>, which comes before the initials. Name it with <code>alt</code>, since there is no person whose name would do: <code>name</code> would also seed the colour and print its initials underneath.',
    },
    initials: {
      title: 'Initials and automatic colour',
      text: 'With no picture and no icon, the disc shows the first letter of each of the first two words of <code>name</code>, on a colour derived from that same name. The derivation is a plain hash, so it needs no storage and no network: the same person is given the same colour on every page, in both themes.',
    },
    sizes: {
      title: 'Sizes',
      text: 'The diameter comes from the size scale every control shares: 24, 32, 40, 48 and 56 pixels. Everything inside follows, the initials and an icon alike.',
    },
    compact: {
      title: 'Compact',
      text: 'Each pair below is one step of the scale, the second of the two <code>compact</code>: 4px come off the diameter, the same delta every other control takes, so an avatar sitting in a dense toolbar keeps the line. The icon inside is a share of the disc and shrinks with it; the initials keep the type size of their step.',
    },
    color: {
      title: 'Custom colour',
      text: 'A <code>color</code> replaces the hue derived from the name. Hex, a CSS colour name and <code>oklch()</code> are all accepted, and the text over it is always white, so checking that it can be read on your colour is yours to do.',
    },
    interactive: {
      title: 'Buttons and links',
      text: '<code>clickable</code> renders a <code>&lt;button&gt;</code> and <code>href</code> an <code>&lt;a&gt;</code>, the address winning when both are given. Either way the disc gains a hover state and a focus ring, and <code>disabled</code> makes it inert: the third avatar below is a link whose address has been dropped, so it can be neither focused nor followed.',
    },
    tooltip: {
      title: 'With a tooltip',
      text: 'A VTooltip needs a trigger that can take focus, or a keyboard user would never see it. An avatar that is <code>clickable</code> or a link is one; a plain disc is not, so give the tooltip the interactive form and bind its <code>triggerProps</code> onto the avatar, which passes them through to the underlying element.',
    },
  },

  api: {
    VAvatar: {
      props: {
        src: 'The picture to show. It is preferred above everything else, and an image that fails to load hands over to the icon or the initials rather than leaving a gap.',
        icon: 'The icon to show when there is no picture. It comes before the initials, so an avatar given both an icon and a name shows the icon.',
        name: 'The full name. It does three things at once: it names the avatar for assistive technology, its initials are what shows when there is no picture and no icon, and it is the seed the automatic colour is derived from.',
        alt: 'The accessible name, when it should not simply be the name: an avatar standing for a team rather than a person, say. It wins over <code>name</code>.',
        color:
          'A colour of your own, as hex, a CSS name or <code>oklch()</code>. It replaces the hue otherwise derived from <code>name</code>, and the text on it is always white, so a light colour is yours to check.',
        size: "The diameter of the disc, from the size scale shared by every control. Left out inside a VAvatarGroup it takes the group's size, which is the point of not defaulting it here; on its own it is <code>md</code>.",
        compact: 'Takes 4px off the diameter, as it does on every other control.',
        href: 'Turns the avatar into an <code>&lt;a&gt;</code> pointing at this address. A disabled link becomes inert: the address is dropped, so it can be neither focused nor followed.',
        clickable:
          'Turns the avatar into a <code>&lt;button&gt;</code>. It is ignored as soon as <code>href</code> makes it a link.',
        disabled:
          'Makes an interactive avatar unusable: it stops responding, leaves the tab order and greys out. It says nothing on a plain avatar, which was never interactive.',
      },
      slots: {
        default: 'Content replacing the initials.',
      },
    },
  },
}
