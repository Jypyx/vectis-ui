export default {
  title: 'Toast',
  lead: 'Notifications raised from anywhere in the code by calling <code>toast()</code>, and shown by a single VToaster mounted once. Several may stack, each with its own countdown.',

  api: {
    VToaster: {
      props: {
        placement: 'Which corner notifications appear in, unless one of them asks for another.',
        duration:
          'How long a notification stays, in milliseconds, unless it asks for something else. A notification given 0 stays until it is dismissed.',
        closeLabel:
          'What the close cross does, in words. It falls back to the design system dictionary.',
        label:
          'What screen readers announce for the notification areas themselves, which are landmarks of the page. It falls back to the design system dictionary.',
      },
    },
  },
}
