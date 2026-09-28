export default {
  title: 'Dialog',
  lead: '<code>VDialog</code> opens a native modal dialog with focus containment. <code>VDialogAlert</code> requires an explicit response to close.',
  examples: {
    width: {
      title: 'Width',
      text: '<code>width</code> sets the dialog width within the viewport.',
    },
    longContent: {
      title: 'Long content',
      text: 'The body scrolls while the header and footer stay visible.',
    },
    customHeader: {
      title: 'Custom header',
      text: '<code>header</code> replaces the title and subtitle. Provide an accessible name with <code>aria-label</code> or <code>aria-labelledby</code>.',
    },
    headerActions: {
      title: 'Header actions',
      text: '<code>header-actions</code> places controls before the close button.',
    },
    dismissal: {
      title: 'Dismissal',
      text: '<code>hideClose</code> hides the close button. <code>persistentBackdrop</code> disables outside-click dismissal; <code>persistentEscape</code> disables Escape only when both are enabled. Provide a closing action if all dismissal routes are disabled.',
    },
    alert: {
      title: 'Alert dialog',
      text: '<code>VDialogAlert</code> has no close button and ignores Escape and outside clicks. Provide response buttons in its footer.',
    },
  },
  api: {
    VDialog: {
      props: {
        title:
          'Dialog title and accessible name. Ignored when the <code>header</code> slot is provided.',
        subtitle: 'Supporting text below the title.',
        width: 'Width in pixels for numbers, otherwise a CSS length. Limited to the viewport.',
        role: 'Dialog role. Use <code>alertdialog</code> for a response requiring immediate attention.',
        hideClose: 'Hides the close button.',
        persistentBackdrop: 'Prevents outside clicks from closing the dialog.',
        persistentEscape:
          'Prevents Escape dismissal only with <code>persistentBackdrop</code>. Otherwise both dismissal routes stay enabled.',
        closeLabel: 'Accessible close button name. Defaults to the dictionary.',
        vModelOpen: 'Dialog open state. Native dismissal updates the model.',
      },
      slots: {
        default: 'Scrollable dialog body.',
        header:
          'Custom header. Provide <code>aria-label</code> or <code>aria-labelledby</code> to name the dialog.',
        headerActions: 'Header controls before the close button.',
        footer: 'Dialog actions.',
        trigger: 'Opening control. Bind the supplied <code>triggerProps</code>.',
      },
    },
    VDialogAlert: {
      props: {
        title:
          'Dialog title and accessible name. Ignored when the <code>header</code> slot is provided.',
        subtitle: 'Supporting text explaining the response.',
        width: 'Width in pixels for numbers, otherwise a CSS length. Limited to the viewport.',
        vModelOpen: 'Dialog open state. Native dismissal updates the model.',
      },
      slots: {
        default: 'Alert content.',
        header:
          'Custom header. Provide <code>aria-label</code> or <code>aria-labelledby</code> to name the dialog.',
        headerActions: 'Controls at the end of the header.',
        footer: 'Required response actions. Include a way to close the alert.',
        trigger: 'Opening control. Bind the supplied <code>triggerProps</code>.',
      },
    },
  },
}
