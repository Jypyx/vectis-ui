export default {
  title: 'Carousel',
  lead: 'Slides scrolled through by touch, trackpad, scrollbar or keyboard. It is one native scroll-snap container: nothing is cloned, and how many slides fit is decided by CSS without a single breakpoint.',

  api: {
    VCarousel: {
      props: {
        itemsPerView:
          'How many slides may be visible at once. It is a maximum and not a target: the floor below decides how many actually fit, which is what makes the whole thing responsive without a breakpoint.',
        itemMinSize:
          "How small a slide is allowed to get. Once an equal share would fall below this, fewer slides fit and the carousel scrolls further instead. A number is read as pixels; anything else is used as given, so <code>'20vw'</code> works.",
        peek: 'How much of the next slide is left showing, as a hint that there is more. It includes the gap before it. It cannot be combined with the fade effect, which assumes a slide exactly fills the view.',
        gap: 'The space between two slides.',
        orientation: 'Whether the carousel scrolls across the page or down it.',
        effect:
          'How one slide gives way to the next, driven by the scroll itself. Sliding means no animation at all. Fading requires one slide at a time and no peek, since it works by holding each slide in place while the scroll moves under it; asked for otherwise, it falls back to sliding rather than degrading.',
        height:
          'The height of the visible area. Give one when the carousel scrolls downwards: a slide sized as a share of the height needs a height to take a share of, and without it every slide collapses onto its own content. Scrolling across the page, the height comes from the slides themselves.',
        loop: 'Whether the carousel comes back round: past the last position it returns to the first, and before the first it goes to the last. Nothing is cloned to achieve it, so the reader sees the real track rewind. It has no effect where there is only one position to rest on, and the buttons stay disabled there rather than becoming two controls that do nothing.',
        autoplay:
          'How long each slide is shown before the next, in milliseconds; zero means it does not advance by itself. It stops at the last page unless the carousel loops, pauses while the pointer rests on it or the keyboard focus is inside it, and never runs at all for a reader who has asked for less motion. No pause button is rendered: this prop is reactive, so binding it to zero is a one-line stop control on your side, and it is worth adding, since hover and focus leave a touch user with none. Looping makes that binding necessary rather than advisable, the movement no longer ending on its own.',
        controls:
          "Where the previous and next buttons go: over the slides, beside them, or nowhere. Placed beside, their room is reserved as padding, so the component's footprint is unchanged and the slides narrow instead. Either way they are centred on the slides and never on the slides plus the dots.",
        indicators:
          'Where the position dots go: over the slides, after them, or nowhere. After them means below when the carousel scrolls across the page, and beside it when it scrolls down.',
        controlsVisibility:
          'Whether those buttons are always visible, or appear when the pointer is over the carousel or the keyboard focus is inside it. Where there is no pointer to hover with, they stay visible whatever this says. The dots are never hidden.',
        prevIcon: 'The icon of the previous button. It follows the orientation by default.',
        nextIcon: 'The icon of the next button. It follows the orientation by default.',
        prevLabel: 'What the previous button does, in words. It falls back to the dictionary.',
        nextLabel: 'What the next button does, in words. It falls back to the dictionary.',
        label:
          'What screen readers announce for the carousel as a whole. Give a distinct one to every carousel on a page: this is a landmark, and two landmarks bearing the same name cannot be told apart by someone navigating between them.',
        vModel:
          'Which slide is current: the first one fully visible when several fit at once, which is also the position the carousel has come to rest on.',
      },
      slots: {
        default:
          'The slides. How many there are is read from what this slot renders, so a <code>v-for</code> is perfectly fine, but the slot must not depend on something only true in a browser, or the server and the client would count differently.',
        controls:
          'Replaces the previous and next buttons entirely, their placement included, so custom content positions itself and the visibility setting no longer applies to it.',
        indicators:
          'Replaces the whole bar of dots. Render one control per position and not per slide: a position past the last one cannot be reached, so a bar built on the number of slides offers dots that scroll nowhere. The slide count is passed as well, for wording such as "3 of 8".',
        indicator:
          "Replaces what is drawn inside one dot. The button itself, and everything that makes it announce and behave correctly, stays the design system's.",
      },
    },
    VCarouselItem: {
      props: {
        index:
          'Which slide this is among its siblings. The carousel injects it as it renders them. Never pass it by hand: it is what makes the "3 of 8" a screen reader announces identical on the server and in the browser.',
      },
      slots: {
        default: "The slide's content: an image, a card, free text.",
      },
    },
  },
}
