export default {
  title: 'File input',
  lead: 'File selection as a form field: a read-only text field over a hidden file input, which also accepts a drop. The value is always a list of files, whether or not several are allowed.',

  examples: {
    labelAndHint: {
      title: 'Label and hint',
      text: '<code>label</code>, <code>hint</code> and <code>placeholder</code> behave as on any other field. <code>iconStart</code> puts an icon at the start of the field, rendered before the chips rather than in their place.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the field height to 32, 40 or 48 pixels, and <code>compact</code> takes 4px off it. The chips of a chosen file sit one step below the field.',
    },
    multiple: {
      title: 'Multiple files',
      text: '<code>multiple</code> lets the field take several files. The model is a <code>File</code> array either way.',
    },
    clearable: {
      title: 'Clearable',
      text: '<code>clearable</code> adds a cross that empties the whole selection at once.',
    },
    display: {
      title: 'Display',
      text: '<code>display</code> lists the files as names joined by commas, or as one dismissible chip each. The <code>#chip</code> slot replaces a chip and receives its shortened label, <code>remove</code>, and the size and density the field worked out.',
    },
    perFileLimits: {
      title: 'Per-file limits',
      text: '<code>accept</code> takes the browser syntax and filters the system dialog as well as a file dropped on the field. <code>maxSize</code> bounds one file. A refused file never enters the model, and <code>reject</code> fires once per file.',
    },
    selectionLimits: {
      title: 'Selection limits',
      text: '<code>maxFiles</code> and <code>maxTotalSize</code> bound the selection as a whole. Screening runs in a fixed order: type, then size, then count, then total size.',
    },
    counter: {
      title: 'Counter',
      text: '<code>counter</code> adds a line under the field saying how much has been chosen. The <code>#counter</code> slot replaces it and receives the count, the total in bytes and the sentence already built.',
    },
    customIcon: {
      title: 'Custom icon',
      text: '<code>attachIcon</code> is the glyph at the end of the field that opens the system dialog, and it takes any icon value.',
    },
    states: {
      title: 'States',
      text: '<code>invalid</code> marks the field as having an error. <code>readonly</code> keeps the selection on show and refuses every way of changing it. <code>disabled</code> greys the field out and takes it out of the tab order. <code>noDrop</code> turns dropping away alone, and <code>loading</code> is purely visual, a spinner replacing the attach icon. <code>attachIconLabel</code>, <code>clearLabel</code> and <code>loadingLabel</code> rename what each of them announces.',
    },
  },

  api: {
    VFileInput: {
      props: {
        multiple:
          'Allows several files to be chosen. With one only, every extra file is turned away.',
        accept:
          "Which kinds of file are accepted, in the browser's own syntax. It is applied twice, and it has to be: as an attribute, which filters the system's file dialog, and again in code, which is the only thing that can filter a dropped file.",
        display:
          'How the chosen files are shown: their names joined by commas, or one dismissible chip each. It only means something when several files are allowed; a single name is always text.',
        maxSize: 'The largest one file may be, in bytes.',
        maxTotalSize: 'The largest the whole selection may be, in bytes.',
        maxFiles: 'How many files may be chosen at most.',
        counter: 'Shows how much has been chosen under the field, "3 files (1.2 MB)".',
        attachIcon: 'The icon at the end of the field, which opens the file dialog.',
        noDrop: 'Refuses files dropped onto the component: only the dialog then adds any.',
        size: 'The height of the field: 32, 40 or 48 pixels.',
        compact:
          'Takes 4px off the height, leaving the padding, the text and the icons as they are.',
        disabled: 'Makes the field unusable, greyed out through the colour tokens.',
        readonly:
          'Shows what was chosen without allowing it to change: no dialog, no drop, no removal.',
        invalid:
          'Marks the field as invalid, for a rule of your own, since nothing here is checked by the browser.',
        label: 'The label above the field, tied to it so that clicking it focuses the field.',
        hint: 'A line of help under the field, to the left of the counter. It is tied to the field for assistive technology.',
        placeholder:
          'What the field says while nothing is chosen. It falls back to the design system dictionary.',
        iconStart:
          'An icon inside the field, at the start. It is rendered before the chips rather than in their place. Decorative until a <code>@click:icon-start</code> listener turns it into a button.',
        iconStartLabel: 'What the start icon does, in words, once it is clickable.',
        attachIconLabel:
          'What the end icon does, in words. It names the button that opens the file dialog, and falls back to the design system dictionary.',
        loading:
          'Shows a spinner in place of the attach icon, while an upload is under way. It changes nothing else: files can still be dropped and the dialog still opens.',
        loadingLabel:
          'What screen readers announce while the spinner turns. It falls back to the design system dictionary.',
        clearable:
          'Offers a cross that empties the selection. Worth turning on here more than on an ordinary field: what a picker holds cannot be erased by typing, so the cross is the only way back out of a wrong choice.',
        clearLabel:
          'What that cross does, in words. It falls back to the design system dictionary.',
        vModel:
          'Always a list of files, whether or not several are allowed, never a file on its own. The shape does not depend on a prop, so you never have to narrow a union TypeScript cannot discriminate.',
      },
      events: {
        change: 'The selection changed, with the whole list as it now stands.',
        reject:
          'A file was turned away, with which one and why: its kind, its size, or how many there already were.',
        clear: 'The clear cross was pressed. The selection is already empty.',
        remove:
          'One file was taken out through its chip, with the file and the position it held. <code>change</code> follows it with the whole list.',
        clickIconStart:
          'The start icon was clicked. Attaching this listener is what turns that icon into a real button, which then needs <code>iconStartLabel</code>.',
      },
      slots: {
        chip: 'Replaces the chip standing for one file. It receives the name already shortened in the middle so that its extension survives, <code>remove</code>, without which the file could no longer be taken out, and the size and density worked out to sit inside the field.',
        counter:
          'Replaces the counter under the field. <code>text</code> is the sentence already built and translated; the count and the total size are there for a wording of your own.',
        valueEnd:
          'Controls of your own inside the field, placed before the ones the field owns: the clear cross and the icon that opens the panel. Those two are the component own affordance, which is why there is no <code>end</code> slot here.',
        start:
          'Content at the start of the field, rendered after <code>iconStart</code> rather than in its place.',
      },
    },
  },
}
