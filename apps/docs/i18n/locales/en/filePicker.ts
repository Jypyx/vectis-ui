export default {
  title: 'File picker',
  lead: 'The drop zone sibling of VFileInput: a surface rather than a field, with the same screening rules and the same list of files as its value.',

  api: {
    VFilePicker: {
      props: {
        title:
          'What the reader is being asked to drop, in one line. It is required: a drop zone with no instruction is just a rectangle. It shadows the HTML attribute of the same name, an accepted trade-off.',
        subtitle:
          'A second line under it, for the constraints in plain words: kinds, sizes, how many.',
        icon: 'The large icon at the top of the zone.',
        showBrowse:
          'Shows the separator and the browse button under the instruction. Hiding them changes the nature of the zone: it then becomes the control itself, a real button, so Enter, Space and the focus come from the platform rather than from a container that merely reacts to clicks.',
        browseLabel:
          'The wording of the browse button. It falls back to the design system dictionary.',
        preview:
          'Where the files taken are listed: under the zone, or beside it, which folds back underneath when the component is narrow, following the width it was given rather than the width of the window. By default nothing is listed at all.',
        thumbnails:
          'Shows a thumbnail for each image in that list. Every image is given a temporary address, created in the browser only and released as soon as the file leaves the list or the component goes away. Turning it off shows the kind icon instead, the way out when a list holds many images or very large ones.',
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
