export default {
  title: 'Avatar',
  lead: 'A person or a thing, as a disc. A picture when there is one, an icon or the initials when there is not, on a colour derived from the name so the same person keeps the same one everywhere.',

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
