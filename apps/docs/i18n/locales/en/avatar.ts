export default {
  title: 'Avatar',
  lead: '<code>VAvatar</code> represents a person or entity with an image, icon or initials.',
  examples: {
    image: {
      title: 'With a picture',
      text: '<code>src</code> displays the image. If it fails to load, the avatar uses its icon or initials.',
    },
    icon: {
      title: 'With an icon',
      text: '<code>icon</code> replaces initials. Provide <code>name</code> or <code>alt</code> for an accessible name.',
    },
    initials: {
      title: 'Initials and automatic colour',
      text: 'Without an image or icon, <code>name</code> supplies initials and determines the background colour.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the avatar diameter.',
    },
    compact: {
      title: 'Compact',
      text: '<code>compact</code> reduces the diameter.',
    },
    color: {
      title: 'Custom colour',
      text: '<code>color</code> overrides the automatic background. Check its contrast with the white foreground.',
    },
    interactive: {
      title: 'Buttons and links',
      text: '<code>clickable</code> creates a button; <code>href</code> creates a link and takes precedence. <code>disabled</code> disables either control.',
    },
    tooltip: {
      title: 'With a tooltip',
      text: 'For <code>VTooltip</code>, make the avatar focusable with <code>clickable</code> or <code>href</code> and bind <code>triggerProps</code>.',
    },
  },
  api: {
    VAvatar: {
      props: {
        src: 'Image URL. Falls back to the icon or initials on loading failure.',
        icon: 'Icon shown without an image. Takes precedence over initials.',
        name: 'Full name used for the accessible name, initials and automatic colour.',
        alt: 'Accessible name overriding <code>name</code>. Consumer <code>aria-label</code> takes precedence.',
        color: 'Custom CSS background colour. The foreground stays white.',
        size: 'Avatar diameter. Inherits the group size; otherwise defaults to <code>md</code>.',
        compact: 'Reduces the diameter. Also applies when the group is compact.',
        href: 'Link destination. Takes precedence over <code>clickable</code>; removed when disabled.',
        clickable: 'Renders a button when <code>href</code> is absent.',
        disabled: 'Disables interactive avatars and removes them from the tab order.',
      },
      slots: {
        default: 'Content replacing initials.',
      },
    },
  },
}
