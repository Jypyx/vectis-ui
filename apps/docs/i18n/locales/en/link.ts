export default {
  title: 'Link',
  lead: '<code>VLink</code> is a native link painted in a tone. It takes the size and weight of the text around it, in a sentence, a heading or a caption.',
  examples: {
    tones: {
      title: 'Tones',
      text: '<code>tone</code> paints the link. <code>neutral</code> takes the colour of the text.',
    },
    inheritedColour: {
      title: 'Inherited colour',
      text: '<code>tone="inherit"</code> takes the colour of the text around the link, such as a muted footer line, and turns to the accent on hover. Keep the underline on: it is then what tells the link apart.',
    },
    underline: {
      title: 'Underline',
      text: 'Links are always underlined by default, so that colour alone does not tell them apart in running text. <code>hover</code> and <code>none</code> suit menus, footers and lists of links.',
    },
    external: {
      title: 'External links',
      text: '<code>external</code> opens a new tab with <code>rel="noopener noreferrer"</code>, adds an icon and tells screen readers. The icon is the built-in <code>open_in_new</code>, which an icon resolver can replace everywhere. <code>externalIcon</code> replaces it for one link and <code>hideExternalIcon</code> removes it.',
    },
    disabled: {
      title: 'Disabled',
      text: 'A disabled link loses its address and its click listeners, and is marked <code>aria-disabled</code>.',
    },
    router: {
      title: 'Router',
      text: 'VLink always renders a real <code>&lt;a&gt;</code>. With Nuxt or Vue Router, render it inside the router link in <code>custom</code> mode and pass on <code>href</code> and <code>navigate</code>. A click with a modifier key still opens a new tab.',
    },
  },
  api: {
    VLink: {
      props: {
        href: 'Link destination.',
        tone: 'Link colour. <code>inherit</code> takes the parent colour and turns to the accent on hover.',
        underline: 'When the link is underlined. Keep <code>always</code> inside running text.',
        external:
          'Opens a new tab with <code>rel="noopener noreferrer"</code>, adds an icon and tells screen readers.',
        externalIcon: 'Icon of an external link.',
        hideExternalIcon:
          'Removes the icon of an external link. Screen readers still hear that it opens a new tab.',
        disabled: 'Removes the address and marks the link <code>aria-disabled</code>.',
      },
      slots: {
        default: 'Link text.',
      },
    },
  },
}
