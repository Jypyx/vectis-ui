export default {
  title: 'Badge',
  lead: '<code>VBadge</code> displays a count, icon or status dot, alone or attached to another element.',
  examples: {
    variants: {
      title: 'Variants',
      text: '<code>variant</code> selects <code>solid</code> or <code>soft</code>. Dots are always solid.',
    },
    tones: {
      title: 'Tones',
      text: '<code>tone</code> sets the semantic colour.',
    },
    colors: {
      title: 'Custom colours',
      text: '<code>color</code> overrides the tone with a CSS colour.',
    },
    counters: {
      title: 'Counters',
      text: 'Counts above 99 appear as <code>99+</code>.',
    },
    icon: {
      title: 'With an icon',
      text: '<code>icon</code> takes precedence over <code>count</code>.',
    },
    dot: {
      title: 'Dot',
      text: '<code>dot</code> shows a status dot and ignores count and icon content.',
    },
    inline: {
      title: 'Inline',
      text: 'The default slot provides the target. Include the badge information in that target’s accessible name.',
    },
    overlay: {
      title: 'Overlay',
      text: '<code>overlay</code> places the badge at the target’s corner.',
    },
    overlayPosition: {
      title: 'Overlay position',
      text: '<code>overlayPosition</code> chooses the top or bottom corner. The horizontal side follows the reading direction.',
    },
    bordered: {
      title: 'Bordered',
      text: '<code>bordered</code> adds a ring. Set <code>ringColor</code> to match the target’s surface.',
    },
  },
  api: {
    VBadge: {
      props: {
        variant: 'Visual style.',
        tone: 'Colour tone.',
        color:
          'Custom CSS colour. For solid badges, check foreground contrast in browsers without <code>contrast-color()</code> support.',
        count: 'Count to display. Values above 99 appear as <code>99+</code>.',
        icon: 'Icon replacing the count.',
        dot: 'Shows a status dot without content.',
        overlay: 'Places the badge at the target’s corner. Requires a target in the default slot.',
        overlayPosition: 'Top or bottom corner. The horizontal side follows the reading direction.',
        bordered: 'Adds a ring around the badge.',
        ringColor: 'Ring colour when bordered. Defaults to the page background.',
      },
      slots: {
        default:
          'Target element. Attached badges are hidden from assistive technology; include their information in the target’s accessible name.',
      },
    },
  },
}
