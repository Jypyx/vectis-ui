export default {
  title: 'Badge',
  lead: 'A small count or marker, on its own or pinned to the corner of something else. It is never interactive: what it reports belongs to the element it sits on.',

  examples: {
    tones: {
      title: 'Tones',
      text: 'Five meanings, five colours: <code>accent</code> for the ordinary count, <code>neutral</code> for one that carries no urgency, then <code>success</code>, <code>warning</code> and <code>danger</code> for a state. The pill is always filled, and there is no variant to choose beside the tone: at this size an outline would leave nothing to read.',
    },
    colors: {
      title: 'Custom colours',
      text: 'A <code>color</code> replaces the tone, given as hex, a CSS colour name or <code>oklch()</code>. Where <code>contrast-color()</code> is supported the text turns black or white by itself, which is what keeps the yellow badge below readable; everywhere else it falls back to white, so a light colour is yours to check.',
    },
    counters: {
      title: 'Counters',
      text: 'The pill is at least as wide as it is tall, so a single digit comes out round and two stay a pill rather than an oval. Past 99 the number becomes <code>99+</code>: a count nobody reads precisely must not be allowed to stretch the badge across its target.',
    },
    icon: {
      title: 'With an icon',
      text: 'An <code>icon</code> takes the place of the number, and wins over <code>count</code> when both are given. One icon and nothing else: the pill is 20px of surface, so let the tone carry the rest of the meaning instead of adding a second mark.',
    },
    dot: {
      title: 'Dot',
      text: 'A <code>dot</code> is 10px of colour with nothing in it, for saying that something has changed without saying how much. It ignores <code>count</code> and <code>icon</code>, neither of which would fit, and it is the form a presence marker or an unread mark usually wants.',
    },
    inline: {
      title: 'Inline',
      text: 'Given a target through the default slot, the badge sits beside it with a gap, on the side the reading direction ends. The target can be anything: a label, as below, a control, a picture. Both the pill and the dot read well there.',
    },
    overlay: {
      title: 'Overlay',
      text: '<code>overlay</code> pins the badge to a corner of the target instead of placing it beside it, tucked a quarter of its own size outside the box so the target keeps the space it had. It does nothing on a badge with no target, there being no corner to pin it to.',
    },
    overlayPosition: {
      title: 'Overlay position',
      text: 'The corner is the top one by default, and <code>overlayPosition</code> moves it to the bottom, where a presence marker belongs. The horizontal side is not configurable: it follows the reading direction, so the badge lands on the right in English and on the left in Arabic, with nothing to set.',
    },
    bordered: {
      title: 'Bordered',
      text: '<code>bordered</code> draws a 2px ring in the colour of the surface behind the badge, which cuts it out of a busy target. CSS cannot read what a parent paints, so that colour is the page background by default and <code>ringColor</code> is how you name any other: the two tiles below pass the card colour and the accent they sit on.',
    },
  },

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
          'Draws a 2px ring in the colour of the surface behind the badge, which detaches it from a busy target such as a picture. That colour is the page background by default, and <code>ringColor</code> is how you change it.',
        ringColor:
          "The colour of the ring <code>bordered</code> draws. It defaults to the page background, so a badge sitting on a card or a coloured banner should be given that surface's colour instead. Without <code>bordered</code> it does nothing.",
      },
      slots: {
        default:
          'The element the badge belongs to. Without it the badge stands on its own; with it, the badge is placed beside the element, or in its corner under <code>overlay</code>.',
      },
    },
  },
}
