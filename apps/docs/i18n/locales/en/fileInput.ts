export default {
  title: 'File input',
  lead: 'File selection as a form field: a read-only text field over a hidden file input, which also accepts a drop. The value is always a list of files, whether or not several are allowed.',

  examples: {
    labelAndHint: {
      title: 'Label and hint',
      text: 'The visible field is a read-only <code>VInput</code>, so <code>label</code> and <code>hint</code> behave as they do on any other field, and the label focuses it when clicked. <code>placeholder</code> is what it says while nothing has been chosen; left out, it falls back to the dictionary. The paperclip at the end opens the system dialog, and the field also accepts a file dropped anywhere on it.',
    },
    sizes: {
      title: 'Sizes',
      text: 'Three heights, 32, 40 and 48 pixels, each with its <code>compact</code> pair 4px shorter. The chips of a chosen file sit one step below the field, and the field forces its text to their height so the row does not grow the moment something is added.',
    },
    multiple: {
      title: 'Multiple files',
      text: 'Off, a second file is turned away rather than replacing the first. On, the field takes as many as the limits allow. The model is a <code>File</code> array in both cases: the shape does not follow the prop, so nothing downstream has to work out which one it is holding.',
    },
    clearable: {
      title: 'Clearable',
      text: 'The cross empties the whole selection at once. It is worth turning on here more than on an ordinary field: what a file input holds cannot be erased by typing, so without it a wrong choice has to come out one chip at a time, and in text display it cannot come out at all.',
    },
    display: {
      title: 'Display',
      text: 'Names joined by commas on one line, or one dismissible chip each. A chip label is shortened in the MIDDLE rather than at the end, so the extension survives and two files from the same folder stay tellable apart; the whole name stays on the title and in the removal button. The <code>#chip</code> slot replaces the chip and receives that shortened label, <code>remove</code>, and the size and density the field worked out, none of which can be guessed from outside.',
    },
    perFileLimits: {
      title: 'Per-file limits',
      text: '<code>accept</code> takes the browser syntax and is applied twice, which it has to be: as an attribute, which filters the system dialog, and again in code, which is the only thing that can filter a file DROPPED on the field. Spell the extensions alongside the MIME families, since a file whose type the system failed to guess arrives with an empty one. <code>maxSize</code> bounds one file. Both are limits and not warnings: a refused file never enters the model, and <code>reject</code> fires once per file so a batch drop is reported precisely.',
    },
    selectionLimits: {
      title: 'Selection limits',
      text: '<code>maxFiles</code> and <code>maxTotalSize</code> bound the selection as a whole rather than each file. Screening runs in a fixed order, type then size then count then total size, so a file refused for its kind is never also reported as one too many. The message is yours to write: the component turns files away and says which and why, and never renders a word about it.',
    },
    counter: {
      title: 'Counter',
      text: 'A line under the field saying how much has been chosen, to the right of the hint. The sentence is translated and pluralised, and the size is written in the units <code>Intl</code> actually means, base 1000. The <code>#counter</code> slot replaces it and receives the count and the total in bytes, along with the sentence already built, so a wording of your own does not have to rebuild what it is only rephrasing.',
    },
    customIcon: {
      title: 'Custom icon',
      text: '<code>attachIcon</code> is the glyph at the end of the field that opens the dialog, and it takes the same values as every icon prop in the library. Naming it after what the field accepts says more than a paperclip does, which is worth doing wherever the label alone leaves the kind of file in doubt.',
    },
    states: {
      title: 'States',
      text: 'Invalid is for a rule of your own, nothing here being checked by the browser. Read-only keeps the selection on show and refuses every way of changing it, the dialog, the drop and the removal alike. Disabled greys the field through the colour tokens and takes it out of the tab order. <code>noDrop</code> is narrower than either: the dialog still opens, and only dropping is turned away.',
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
        clearable:
          'Offers a cross that empties the selection. Worth turning on here more than on an ordinary field: what a picker holds cannot be erased by typing, so the cross is the only way back out of a wrong choice.',
        vModel:
          'Always a list of files, whether or not several are allowed, never a file on its own. The shape does not depend on a prop, so you never have to narrow a union TypeScript cannot discriminate.',
      },
      events: {
        change: 'The selection changed, with the whole list as it now stands.',
        reject:
          'A file was turned away, with which one and why: its kind, its size, or how many there already were.',
        clear: 'The clear cross was pressed. The selection is already empty.',
      },
      slots: {
        chip: 'Replaces the chip standing for one file. It receives the name already shortened in the middle so that its extension survives, <code>remove</code>, without which the file could no longer be taken out, and the size and density worked out to sit inside the field.',
        counter:
          'Replaces the counter under the field. <code>text</code> is the sentence already built and translated; the count and the total size are there for a wording of your own.',
      },
    },
  },
}
