export default {
  title: 'Card',
  lead: '<code>VCard</code> groups content about one subject: media, title, body and actions. With <code>href</code>, the whole card becomes a link.',
  examples: {
    variants: {
      title: 'Variants',
      text: '<code>variant</code> selects <code>flat</code>, <code>outline</code>, <code>elevated</code> or <code>filled</code>.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the padding and the gaps between parts.',
    },
    media: {
      title: 'Media',
      text: 'The <code>media</code> slot is drawn edge to edge above the content. Give images an <code>alt</code> text, or <code>alt=""</code> when they are decorative.',
    },
    horizontal: {
      title: 'Horizontal',
      text: '<code>orientation="horizontal"</code> places the media at the start. In a narrow card, the media moves back above the content.',
    },
    linked: {
      title: 'Linked cards',
      text: 'With <code>href</code>, the title is a link whose clickable area covers the card. Buttons inside the card stay separate targets. Attributes other than <code>class</code> and <code>style</code> go to the link. <code>headingLevel</code> renders the title as a heading.',
    },
    disabled: {
      title: 'Disabled',
      text: '<code>disabled</code> removes the link’s destination and dims the title and media. Controls in the slots are not affected.',
    },
    loading: {
      title: 'Loading',
      text: '<code>loading</code> shows placeholders and hides the footer. Set <code>loadingText</code> to announce the loading to screen readers.',
    },
  },
  api: {
    VCard: {
      props: {
        variant: 'Visual style.',
        orientation: 'Places the media above the content or at its start.',
        size: 'Padding and gap size.',
        title: 'Title. With <code>href</code>, the text of the card’s link.',
        subtitle: 'Text below the title.',
        headingLevel:
          'Renders the title as a heading of this level. Otherwise, the title is a paragraph.',
        href: 'Makes the card a link. Requires <code>title</code>.',
        disabled: 'Disables the card’s link and dims the title and media.',
        loading: 'Shows placeholders instead of the content and hides the footer.',
        loadingText: 'Text announced while loading. Without it, the loading state is silent.',
        as: 'Root element, such as <code>article</code> or <code>li</code>.',
      },
      slots: {
        default: 'Card body.',
        media: 'Image, video or illustration, drawn edge to edge.',
        header: 'Replaces the title and subtitle. A linked card loses its link.',
        footer: 'Actions, aligned at the bottom of the card.',
      },
    },
  },
}
