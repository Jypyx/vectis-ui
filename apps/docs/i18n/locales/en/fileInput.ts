export default {
  title: 'File input',
  lead: '<code>VFileInput</code> selects files through a native dialog or drag and drop. The model is always a <code>File[]</code>.',
  examples: {
    labelAndHint: {
      title: 'Label and hint',
      text: 'Name the field with <code>label</code>. Use <code>hint</code> to describe accepted files.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the field size; <code>compact</code> reduces its height.',
    },
    multiple: {
      title: 'Multiple files',
      text: '<code>multiple</code> allows several files. Without it, extra files are rejected.',
    },
    clearable: {
      title: 'Clearable',
      text: '<code>clearable</code> adds a button to empty the selection.',
    },
    display: {
      title: 'Display',
      text: 'With multiple files, <code>display</code> chooses comma-separated names or removable chips. A single file always appears as text.',
    },
    perFileLimits: {
      title: 'Per-file limits',
      text: '<code>accept</code> filters file types and <code>maxSize</code> limits each file in bytes. Each refused file emits <code>reject</code>. Include extensions when MIME types may be missing.',
    },
    selectionLimits: {
      title: 'Selection limits',
      text: '<code>maxFiles</code> and <code>maxTotalSize</code> limit the whole selection, including existing files.',
    },
    counter: {
      title: 'Counter',
      text: '<code>counter</code> shows the file count and total size. Its slot receives <code>text</code>, <code>count</code> and <code>bytes</code>.',
    },
    customIcon: {
      title: 'Custom icon',
      text: 'Replace the file dialog icon with <code>pickerIcon</code>.',
    },
    states: {
      title: 'States',
      text: '<code>readonly</code> prevents selection and removal. <code>noDrop</code> disables only drag and drop. <code>loading</code> shows a spinner without disabling selection.',
    },
  },
  api: {
    VFileInput: {
      props: {
        multiple: 'Allows multiple files. Otherwise, extra files are rejected.',
        accept:
          'Accepted file types, using native syntax such as <code>image/*,.pdf</code>. Filters dialog selections and dropped files.',
        display: 'Multiple-file display: text or removable chips. Single files always use text.',
        maxSize: 'Maximum size per file, in bytes.',
        maxTotalSize: 'Maximum total selection size, in bytes.',
        maxFiles: 'Maximum number of selected files.',
        counter: 'Shows the file count and total size below the field.',
        pickerIcon: 'Icon of the button opening the file dialog.',
        noDrop: 'Disables drag and drop; dialog selection remains available.',
        size: 'Component size.',
        compact: 'Reduces the control height without changing text or icons.',
        disabled: 'Disables interaction.',
        readonly:
          'Prevents opening the dialog, dropping files and removing them. Controls remain focusable.',
        invalid:
          'Marks the control as invalid and applies the error style. Validate your file selection separately.',
        label:
          'Visible label. Without a visible name, provide <code>aria-label</code> or <code>aria-labelledby</code>.',
        error:
          'Error message shown in place of the hint. Sets <code>aria-invalid</code>, is linked through <code>aria-describedby</code> and is announced when it appears.',
        hint: 'Help text linked through <code>aria-describedby</code>.',
        placeholder: 'Text shown when the selection is empty. Defaults to the library dictionary.',
        iconStart:
          'Start icon. A <code>@click:icon-start</code> listener makes it a button; provide <code>iconStartLabel</code>.',
        iconStartLabel: 'Accessible name of the start icon button.',
        pickerIconLabel:
          'Accessible name of the file dialog button. Defaults to the library dictionary.',
        loading: 'Shows a spinner without disabling selection or drag and drop.',
        loadingText:
          'Loading text and accessible spinner name. Defaults to the library dictionary.',
        clearable: 'Adds a button to empty the selection.',
        clearLabel: 'Accessible name of the clear button. Defaults to the library dictionary.',
        vModel: 'Selected files as a <code>File[]</code>, even for a single file.',
      },
      events: {
        change: 'The selection changed. Receives the complete <code>File[]</code>.',
        reject:
          'Emitted for each rejected file. Receives the file and a reason: <code>type</code>, <code>size</code>, <code>count</code> or <code>total-size</code>.',
        clear: 'The selection was cleared; the model is already empty.',
        remove:
          'A chip removed a file. Receives the file and index; followed by <code>change</code>.',
        clickIconStart: 'The start icon button was clicked.',
      },
      slots: {
        chip: 'File chip content. Receives the file, shortened label, <code>remove</code>, size and density.',
        counter:
          'Counter content. Receives localized <code>text</code>, <code>count</code> and total size in <code>bytes</code>.',
        valueEnd: 'Content before the clear and file dialog buttons.',
        start: 'Content after <code>iconStart</code>.',
      },
    },
  },
}
