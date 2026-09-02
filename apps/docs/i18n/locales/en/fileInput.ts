export default {
  title: 'File input',
  lead: 'File selection as a form field: a read-only text field over a hidden file input, which also accepts a drop. The value is always a list of files, whether or not several are allowed.',

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
        droppable:
          'Accepts files dropped onto the component, as well as chosen through the dialog.',
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
        clearable: 'Offers a cross that empties the selection.',
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
