export default {
  title: 'Dialog',
  lead: 'A native <code>&lt;dialog&gt;</code> opened modally, so the focus trap, the inert page behind it and the top layer all come from the browser. VDialogAlert is the same box narrowed to a question that must be answered.',

  examples: {
    width: {
      title: 'Width',
      text: 'A CSS length in any unit, 400px unless you say otherwise. Whatever is asked for, the dialog never exceeds the viewport and keeps a margin on either side, so a width set in pixels needs no defending against a narrow screen. The height follows the same rule, which is what turns a tall dialog into a scrolling one rather than one running off the screen.',
    },
    longContent: {
      title: 'Long content',
      text: 'Only the body scrolls. The header and the footer stay where they are, which keeps the scrollbar off them and the buttons reachable without scrolling to the end. Hairlines appear under the header and above the footer exactly while content is passing behind them, drawn by two sentinels inside the scrolling area that ask it whether anything is still hidden. That question is a recent one, so where it cannot be asked the lines simply stay invisible and nothing else changes.',
    },
    customHeader: {
      title: 'Custom header',
      text: 'The <code>#header</code> slot replaces the whole title and subtitle block, controls of your own included. The <code>title</code> prop is then ignored, and with it the accessible name it was providing, so name the dialog with an <code>aria-label</code> instead. The close cross is untouched: it belongs to the header actions beside the slot, not to what the slot replaces.',
    },
    headerActions: {
      title: 'Header actions',
      text: 'The <code>#header-actions</code> slot adds controls to the header, rendered before the close cross so that the cross stays at the edge where the reader looks for it. It is the place for what acts on the dialog itself rather than on the answer it is asking for: a menu, a details toggle, a full-screen switch. The footer is where the answer belongs.',
    },
    dismissal: {
      title: 'Dismissal',
      text: 'A dialog can be left three ways, and each can be closed off. <code>hideClose</code> takes the cross away, <code>persistentBackdrop</code> ignores a click outside, and <code>persistentEscape</code> ignores the key. The last two are declared to the browser rather than handled in code, which has one consequence worth knowing: refusing Escape while a click outside still closes cannot be expressed natively, so asking for it allows both again. Close every route off and the footer is the only way out, which makes supplying one mandatory.',
    },
    alert: {
      title: 'Alert dialog',
      text: "VDialogAlert is this dialog with its options fixed, and the fixed options are what change its nature: it is announced as an alert rather than an ordinary dialog, and there is no cross, no Escape and no click outside. The footer is the reader's only way out, so it is not optional. Reserve it for what must be answered explicitly, a deletion or a failure, and leave everything else to VDialog.",
    },
  },

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
