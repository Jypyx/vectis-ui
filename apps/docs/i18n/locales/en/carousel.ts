export default {
  title: 'Carousel',
  lead: '<code>VCarousel</code> displays slides in a scrollable track with optional controls, indicators and autoplay.',
  examples: {
    itemsPerView: {
      title: 'Items per view',
      text: '<code>itemsPerView</code> sets the maximum visible slides. <code>itemMinSize</code> reduces that number when the container narrows.',
    },
    peek: {
      title: 'Peek',
      text: '<code>peek</code> leaves part of the next slide visible, including the gap.',
    },
    effects: {
      title: 'Effects',
      text: 'Choose slide, fade or scale. Fade requires one slide per view and no peek; otherwise it falls back to slide.',
    },
    orientation: {
      title: 'Orientation',
      text: 'Vertical carousels require an explicit <code>height</code>.',
    },
    customIcons: {
      title: 'Custom icons',
      text: 'Customize controls with <code>prevIcon</code>, <code>nextIcon</code> and their accessible labels.',
    },
    placements: {
      title: 'Placements',
      text: '<code>controls</code> and <code>indicators</code> independently accept <code>inside</code>, <code>outside</code> or <code>false</code>.',
    },
    jumps: {
      title: 'Jumps',
      text: 'Multi-page moves jump directly by default. <code>noJump</code> scrolls through the intervening slides.',
    },
    loop: {
      title: 'Loop',
      text: '<code>loop</code> wraps navigation from the last position to the first and back.',
    },
    autoplay: {
      title: 'Autoplay',
      text: '<code>autoplay</code> sets an interval in milliseconds. Hover and focus pause it; reduced motion disables it. Add a pause button by setting the interval to 0.',
    },
  },
  api: {
    VCarousel: {
      props: {
        itemsPerView:
          'Maximum slides per view. The container width and <code>itemMinSize</code> determine how many fit.',
        itemMinSize: 'Minimum slide size. Numbers use pixels; strings use CSS lengths.',
        peek: 'Visible portion of the next slide, including the gap. Incompatible with fade.',
        gap: 'Spacing between slides.',
        orientation: 'Horizontal or vertical scrolling.',
        effect:
          'Slide, fade or scale. Fade falls back to slide unless one slide is visible with no peek.',
        height: 'Viewport height. Required for vertical scrolling.',
        loop: 'Wraps between the first and last positions. Controls remain disabled when there is only one position.',
        noJump:
          'Scrolls through intervening slides for multi-page moves. Reduced motion still uses instant movement.',
        autoplay:
          'Advance interval in milliseconds; 0 disables it. Pauses on hover/focus and respects reduced motion. Provide a pause control, especially when looping.',
        controls: 'Previous/next control placement: inside, outside or hidden.',
        indicators: 'Indicator placement: inside, outside or hidden.',
        controlsVisibility:
          'Always visible or visible on hover/focus. Touch users always see them.',
        prevIcon: 'Previous control icon. Defaults to the orientation’s arrow.',
        nextIcon: 'Next control icon. Defaults to the orientation’s arrow.',
        prevLabel: 'Accessible previous control name. Defaults to the dictionary.',
        nextLabel: 'Accessible next control name. Defaults to the dictionary.',
        label: 'Accessible carousel name. Use distinct names for multiple carousels.',
        vModel:
          'Current position, starting at 0. Refers to the first fully visible slide and is clamped to reachable positions.',
      },
      slots: {
        default: 'Slides. Keep their count consistent between server and client rendering.',
        controls:
          'Replaces and positions controls. Receives <code>previous</code>, <code>next</code>, <code>atStart</code>, <code>atEnd</code>, <code>index</code>, <code>count</code>, <code>pageCount</code> and <code>orientation</code>.',
        indicators:
          'Replaces the indicator bar. Receives <code>index</code>, <code>count</code>, <code>pageCount</code>, <code>goTo</code> and <code>orientation</code>. Render one control per page, not per slide.',
        indicator:
          'Content inside an indicator button. Receives <code>index</code> and <code>active</code>.',
      },
    },
    VCarouselItem: {
      props: {
        index: 'Slide index assigned by the carousel. Do not set manually.',
      },
      slots: {
        default: 'Slide content.',
      },
    },
  },
}
