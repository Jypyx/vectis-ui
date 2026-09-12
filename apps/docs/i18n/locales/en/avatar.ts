export default {
  title: 'Avatar',
  lead: 'A person or a thing, as a disc. A picture when there is one, an icon or the initials when there is not, on a colour derived from the name so the same person keeps the same one everywhere.',

  examples: {
    image: {
      title: 'With a picture',
      text: '<code>src</code> displays a picture. <code>name</code> provides its alternative text and the initials shown when the file cannot be loaded.',
    },
    icon: {
      title: 'With an icon',
      text: '<code>icon</code> displays an icon instead of the initials. <code>alt</code> names the avatar when no <code>name</code> is given.',
    },
    initials: {
      title: 'Initials and automatic colour',
      text: 'With no picture and no icon, the disc shows the initials of <code>name</code> on a colour derived from it.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the diameter: 24, 32, 40, 48 or 56 pixels. The content inside follows.',
    },
    compact: {
      title: 'Compact',
      text: '<code>compact</code> reduces the diameter by 4px.',
    },
    color: {
      title: 'Custom colour',
      text: '<code>color</code> replaces the colour derived from the name. Hex, a CSS colour name and <code>oklch()</code> are accepted.',
    },
    interactive: {
      title: 'Buttons and links',
      text: '<code>clickable</code> renders a <code>&lt;button&gt;</code> and <code>href</code> an <code>&lt;a&gt;</code>, the address winning when both are given. <code>disabled</code> makes the avatar inert.',
    },
    tooltip: {
      title: 'With a tooltip',
      text: 'A VTooltip needs a focusable trigger: make the avatar <code>clickable</code> or a link, then bind the tooltip <code>triggerProps</code> onto it.',
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
        size: "The diameter of the disc, from the size scale shared by every control. Left out inside a VAvatarGroup it takes the group's size; on its own it is <code>md</code>.",
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
