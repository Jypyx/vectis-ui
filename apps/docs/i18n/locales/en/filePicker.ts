export default {
  title: 'File picker',
  lead: 'The drop zone sibling of VFileInput: a surface rather than a field, with the same screening rules and the same list of files as its value.',

  examples: {
    titleAndSubtitle: {
      title: 'Title and subtitle',
      text: '<code>title</code> is required and <code>subtitle</code> is where the rules go in plain words. Both have a slot, taking text and inline elements only.',
    },
    preview: {
      title: 'The list of files',
      text: '<code>preview</code> says where the list of chosen files goes, under the zone or beside it, or removes it. Beside, it folds back underneath as soon as the component is narrow.',
    },
    customIcons: {
      title: 'Custom icons',
      text: '<code>icon</code> is the large glyph at the top of the zone. <code>typeIcons</code> replaces the glyph a row shows for a kind of file, naming only the kinds you want to change, and <code>removeIcon</code> the button that takes a row out.',
    },
    thumbnails: {
      title: 'Thumbnails',
      text: 'An image is listed as itself, through a temporary address made in the page. <code>hideThumbnails</code> shows the icon for its kind instead.',
    },
    multiple: {
      title: 'Multiple files',
      text: '<code>multiple</code> lets the zone take several files, the extra ones being turned away otherwise. The value is a list either way, and <code>reject</code> fires once per refused file.',
    },
    accept: {
      title: 'Accepted kinds',
      text: '<code>accept</code> takes the browser syntax and filters the system dialog as well as a dropped file. A file that fails it comes back through <code>reject</code> with the reason <code>type</code>.',
    },
    maxSize: {
      title: 'Maximum size',
      text: '<code>maxSize</code> is the largest one file may be, in bytes. Each file is weighed on its own.',
    },
    totalSize: {
      title: 'Total size and count',
      text: '<code>maxTotalSize</code> and <code>maxFiles</code> bound the selection as a whole, counting what is already in the list. Screening runs in a fixed order: kind, then size, then count, then total size.',
    },
    states: {
      title: 'States',
      text: '<code>readonly</code> shows what was taken and lets nothing change it, the remove buttons included. <code>disabled</code> greys the zone out and stops it accepting anything, mid-drag included.',
    },
  },

  api: {
    VFilePicker: {
      props: {
        title:
          'What the reader is being asked to drop, in one line. It is required: a drop zone with no instruction is just a rectangle. It shadows the HTML attribute of the same name, an accepted trade-off.',
        subtitle:
          'A second line under it, for the constraints in plain words: kinds, sizes, how many.',
        icon: 'The large icon at the top of the zone.',
        hideBrowse:
          'Hides the separator and the browse button under the instruction. That changes the nature of the zone: it then becomes the control itself, a real button, so Enter, Space and the focus come from the platform rather than from a container that merely reacts to clicks.',
        browseLabel:
          'The wording of the browse button. It falls back to the design system dictionary.',
        preview:
          'Where the files taken are listed: under the zone, or beside it, which folds back underneath when the component is narrow, following the width it was given rather than the width of the window. By default nothing is listed at all.',
        hideThumbnails:
          'Shows the kind icon for every file in that list, images included, the way out when a list holds many images or very large ones. Left out, an image is shown as a thumbnail: it is given a temporary address, created in the browser only and released as soon as the file leaves the list or the component goes away.',
        typeIcons: 'Replaces the icon of one or more kinds of file.',
        removeIcon: 'The icon of the button removing a file from the list.',
        multiple:
          'Allows several files to be taken. With one only, every extra file is turned away.',
        accept:
          "Which kinds of file are accepted, in the browser's own syntax. It is applied twice: as an attribute, which filters the system's file dialog, and again in code, which is the only thing that can filter a dropped file.",
        maxSize: 'The largest one file may be, in bytes.',
        maxTotalSize: 'The largest the whole selection may be, in bytes.',
        maxFiles: 'How many files may be taken at most.',
        disabled: 'Makes the zone unusable, greyed out through the colour tokens.',
        readonly:
          'Shows what was taken without allowing it to change: no dialog, no drop, no removal.',
        invalid:
          'Marks the zone as invalid, which colours its outline. It is for a rule of your own: nothing here is checked by the browser, the real input being hidden.',
        loading:
          'Shows a spinner in place of the zone icon, while an upload is under way typically. It says that something is happening and changes nothing else: files can still be dropped and the dialog still opens.',
        loadingLabel:
          'What screen readers announce while the spinner turns. It falls back to the design system dictionary.',
        vModel:
          'Always a list of files, whether or not several are allowed, never a file on its own. The shape does not depend on a prop, so you never have to narrow a union TypeScript cannot discriminate.',
      },
      events: {
        change: 'The selection changed, with the whole list as it now stands.',
        reject: 'A file was turned away, with which one and why.',
        remove: 'A file was removed from the list, with which one and where it was.',
      },
      slots: {
        icon: 'The large icon, for an illustration the icon prop cannot express. It must stay non-interactive, and so must the two below: with the browse button hidden the zone is a button, and nothing interactive may sit inside one.',
        title: 'The instruction. Text and inline elements only, for the same reason.',
        subtitle: 'The second line. Same contract as the instruction.',
        browse:
          'The browse button. Call the <code>open</code> it receives: without it a button of your own could no longer open the file dialog at all.',
        item: 'A whole row of the list, the way out for a row showing its own upload progress. It receives everything the standard row was given.',
        thumbnail:
          "The square at the start of a row alone: for a thumbnail produced by your server, a video's poster frame, or a format the browser cannot decode.",
        remove:
          "The control that removes a row. <code>remove</code> is the only thing that can take the file out, and <code>label</code> is the ready-made name, including the file's own, without which the button would be announced as nothing at all.",
      },
    },
  },
}
