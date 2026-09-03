export default {
  title: 'Dialog',
  lead: 'A native <code>&lt;dialog&gt;</code> opened modally, so the focus trap, the inert page behind it and the top layer all come from the browser. VDialogAlert is the same box narrowed to a question that must be answered.',

  api: {
    VDialog: {
      props: {
        title:
          'The title of the dialog, which also names it for assistive technology. It is ignored when the <code>#header</code> slot replaces the whole header.',
        subtitle: 'A line under the title, explaining what the dialog is asking.',
        width:
          'How wide the dialog is, in any CSS unit. It is never allowed to exceed the width of the viewport.',
        role: 'What kind of dialog this is. <code>alertdialog</code> is for one that must be answered explicitly, and it makes screen readers announce it more insistently.',
        hideClose:
          'Takes the close cross out of the header, leaving the reader with Escape, the backdrop and whatever the footer offers.',
        persistentBackdrop: 'Stops a click outside the dialog from closing it.',
        persistentEscape:
          'Stops the Escape key from closing the dialog. Refusing Escape while the backdrop still closes cannot be expressed natively, so both routes are then allowed.',
        closeLabel:
          'What the close cross does, in words. It falls back to the design system dictionary.',
        vModelOpen:
          'Whether the dialog is showing. It starts closed, and it is bidirectional: the browser writes back to it whenever the dialog closes on its own, through Escape or the backdrop, so you never have to reset it by hand.',
      },
      slots: {
        default:
          'The body of the dialog. This is the part that scrolls when there is too much of it.',
        header: 'Replaces the title and subtitle block with content of your own.',
        headerActions:
          'Extra controls in the header, placed before the close cross: a menu, a full-screen toggle.',
        footer: 'The buttons at the foot of the dialog.',
        trigger:
          'The button that opens the dialog. Bind the <code>triggerProps</code> it receives onto it. It stays rendered at all times, unlike the dialog itself.',
      },
    },
    VDialogAlert: {
      props: {
        title:
          'The question being asked, which also names the dialog for assistive technology. It is ignored when the <code>#header</code> slot replaces the whole header.',
        subtitle: 'A line under the title, spelling out the consequences of the answer.',
        width:
          'How wide the dialog is, in any CSS unit. It is never allowed to exceed the width of the viewport.',
        vModelOpen:
          'Whether the alert is showing. It starts closed, and closing writes back to it.',
      },
      slots: {
        default: 'What the alert says.',
        header: 'Replaces the title and subtitle block with content of your own.',
        footer:
          'The buttons that answer the alert. They are not optional: nothing else can close this dialog.',
        trigger:
          'The button that opens the alert. Bind the <code>triggerProps</code> it receives onto it.',
      },
    },
  },
}
