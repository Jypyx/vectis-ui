export default {
  title: 'Alert',
  lead: '<code>VAlert</code> displays a message in the flow of the page, with an optional title, actions and close button. For temporary notifications, use <code>toast()</code>.',
  examples: {
    variants: {
      title: 'Variants',
      text: '<code>variant</code> selects <code>soft</code>, a tinted surface, or <code>outline</code>, the page surface inside a tinted border.',
    },
    tones: {
      title: 'Tones',
      text: '<code>tone</code> sets the semantic colour and the default icon.',
    },
    icon: {
      title: 'Icon',
      text: '<code>icon</code> replaces the tone’s icon. <code>hideIcon</code> removes it. The icon is decorative: the text must carry the meaning.',
    },
    actions: {
      title: 'Actions',
      text: 'The <code>actions</code> slot places buttons or links under the message.',
    },
    closable: {
      title: 'Closable',
      text: '<code>closable</code> adds a close button that sets <code>open</code> to <code>false</code> and emits <code>close</code>. Bind <code>v-model:open</code> to show the alert again.',
    },
    live: {
      title: 'Live',
      text: 'By default, the alert is read with the rest of the page. <code>live</code> announces it: <code>role="status"</code>, or <code>role="alert"</code> for the <code>danger</code> tone. Use it for alerts that appear after an action.',
    },
  },
  api: {
    VAlert: {
      props: {
        variant: 'Visual style.',
        tone: 'Colour tone. Also selects the default icon.',
        title: 'Text above the message. Replaced by the <code>title</code> slot.',
        icon: 'Icon replacing the tone’s icon.',
        hideIcon: 'Hides the icon.',
        closable: 'Shows a close button.',
        closeLabel: 'Accessible close button name. Defaults to the dictionary.',
        live: 'Announces the alert with <code>role="status"</code>, or <code>role="alert"</code> for the <code>danger</code> tone.',
        vModelOpen: 'Whether the alert is shown. The close button sets it to <code>false</code>.',
      },
      events: {
        close: 'The close button was activated. <code>open</code> is already <code>false</code>.',
      },
      slots: {
        default: 'Message.',
        title: 'Custom title content.',
        actions: 'Buttons or links under the message.',
      },
    },
  },
}
