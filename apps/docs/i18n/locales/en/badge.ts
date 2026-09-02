export default {
  title: 'Badge',
  lead: 'A small count or marker, on its own or pinned to the corner of something else. It is never interactive: what it reports belongs to the element it sits on.',

  api: {
    VBadge: {
      props: {
        tone: 'The meaning the badge carries, expressed as a colour. The pill is filled with it and the text adapts to stay readable, so there is a single rendering and no variant to choose alongside it.',
        color:
          'A colour of your own, as hex, a CSS name or <code>oklch()</code>, which replaces the tone. Where <code>contrast-color()</code> is supported the text turns black or white by itself; everywhere else it falls back to white, so with a light colour the contrast is yours to check.',
        count:
          'The number to display. Anything above 99 is shown as 99+, so a busy counter cannot stretch the pill indefinitely.',
        icon: 'A single icon shown instead of a number. It takes precedence over <code>count</code>, and is ignored when the badge is a dot.',
        dot: 'Reduces the badge to a 10px dot with no content, the discreet way to signal that something is new without saying how much.',
        overlay:
          'Pins the badge to a corner of the target element instead of placing it beside it. It does nothing when the badge has no target.',
        overlayPosition:
          'Which corner an overlaid badge is pinned to: the top one by default, the bottom one for a marker that belongs at the foot of its target, such as a presence dot under an avatar. The horizontal side follows the reading direction and is not configurable.',
        bordered:
          'Draws a 2px ring in the colour of the surface behind the badge, which detaches it from a busy target such as a picture.',
      },
      slots: {
        default:
          'The element the badge belongs to. Without it the badge stands on its own; with it, the badge is placed beside the element, or in its corner under <code>overlay</code>.',
      },
    },
  },
}
