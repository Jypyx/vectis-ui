export default {
  title: 'File picker',
  lead: '<code>VFilePicker</code> is a drop zone with a native file dialog and an optional preview list. The model is always a <code>File[]</code>.',
  examples: {
    titleAndSubtitle: {
      title: 'Title and subtitle',
      text: 'Use <code>title</code> for the instruction and <code>subtitle</code> for file constraints.',
    },
    preview: {
      title: 'The list of files',
      text: '<code>preview="bottom"</code> lists files below the zone. <code>preview="end"</code> places them beside it, moving below when the component is narrow.',
    },
    customIcons: {
      title: 'Custom icons',
      text: 'Customize the zone icon with <code>icon</code> and file-type icons with <code>typeIcons</code>.',
    },
    thumbnails: {
      title: 'Thumbnails',
      text: 'Image files show thumbnails. <code>hideThumbnails</code> replaces them with file-type icons.',
    },
    multiple: {
      title: 'Multiple files',
      text: '<code>multiple</code> allows several files; <code>maxFiles</code> caps the selection.',
    },
    accept: {
      title: 'Accepted kinds',
      text: '<code>accept</code> filters both dialog selections and drops. Include file extensions when MIME types may be missing.',
    },
    maxSize: {
      title: 'Maximum size',
      text: '<code>maxSize</code> limits each file in bytes. Listen to <code>reject</code> to explain refusals.',
    },
    totalSize: {
      title: 'Total size and count',
      text: '<code>maxTotalSize</code> limits the whole selection, including existing files.',
    },
    states: {
      title: 'States',
      text: '<code>readonly</code> prevents additions and removals while preserving focus. <code>loading</code> replaces the zone icon with a spinner without disabling selection.',
    },
  },
  api: {
    VFilePicker: {
      props: {
        title: 'Required drop instruction.',
        subtitle: 'Optional file constraints below the title.',
        icon: 'Large icon in the drop zone.',
        hideBrowse:
          'Hides the browse button and makes the zone itself a button, activated with Enter or Space.',
        browseText:
          'Visible text and accessible name of the browse button. Defaults to the library dictionary.',
        preview:
          'Preview position: <code>false</code>, <code>bottom</code> or <code>end</code>. The side list moves below in narrow containers.',
        hideThumbnails: 'Uses file-type icons instead of image thumbnails.',
        typeIcons: 'Icon overrides by file kind.',
        removeIcon: 'Icon of the file removal button.',
        multiple: 'Allows multiple files. Otherwise, extra files are rejected.',
        accept:
          'Accepted file types, using native syntax such as <code>image/*,.pdf</code>. Filters dialog selections and dropped files.',
        maxSize: 'Maximum size per file, in bytes.',
        maxTotalSize: 'Maximum total selection size, in bytes.',
        maxFiles: 'Maximum number of selected files.',
        disabled: 'Disables interaction.',
        readonly:
          'Prevents opening the dialog, dropping files and removing them. Controls remain focusable.',
        invalid:
          'Marks the control as invalid and applies the error style. Validate your file selection separately.',
        loading: 'Shows a spinner instead of the zone icon without disabling selection.',
        loadingText:
          'Loading text and accessible spinner name. Defaults to the library dictionary.',
        vModel: 'Selected files as a <code>File[]</code>, even for a single file.',
      },
      events: {
        change: 'The selection changed. Receives the complete <code>File[]</code>.',
        reject:
          'Emitted for each rejected file. Receives the file and a reason: <code>type</code>, <code>size</code>, <code>count</code> or <code>total-size</code>.',
        remove: 'A file was removed. Receives the file and its index.',
      },
      slots: {
        icon: 'Zone illustration. Keep it non-interactive.',
        title: 'Instruction content. Use text and non-interactive inline elements.',
        subtitle: 'Constraint content. Use text and non-interactive inline elements.',
        browse:
          'Custom browse control. Receives <code>open</code> and <code>disabled</code>; call <code>open</code> to show the dialog.',
        item: 'Entire preview row. Receives the file, index, kind, thumbnail, icon, formatted size and <code>remove</code>.',
        thumbnail: 'Preview visual. Receives the same data as <code>item</code>.',
        remove:
          'Removal control. Call <code>remove</code> and use <code>removeLabel</code> as its accessible name.',
      },
    },
  },
}
