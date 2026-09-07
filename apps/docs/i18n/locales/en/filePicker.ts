export default {
  title: 'File picker',
  lead: 'The drop zone sibling of VFileInput: a surface rather than a field, with the same screening rules and the same list of files as its value.',

  examples: {
    titleAndSubtitle: {
      title: 'Title and subtitle',
      text: 'The title is required, a drop zone with no instruction being a rectangle nobody knows what to do with. The subtitle is where the rules go in plain words, and writing them is your job: the component turns a file away, it never explains in advance what it will accept. Both have a slot, and both slots take text and inline elements only, since with the browse button hidden the zone itself is the button and nothing interactive may sit inside one.',
    },
    preview: {
      title: 'The list of files',
      text: 'Nothing is listed until <code>preview</code> says where the list goes. Under the zone is what a narrow form wants; beside it reads better when there is room, and it folds back underneath on its own as soon as the component is narrow, which it measures on itself rather than on the window. The value is the same list either way: what this prop changes is whether the reader can see it, never what is held.',
    },
    customIcons: {
      title: 'Custom icons',
      text: '<code>icon</code> is the large one at the top of the zone. <code>typeIcons</code> replaces the glyph a row shows for a kind of file, and it is a partial map: name only the kinds you want to change, and the eight defaults cover the rest, which is what leaves the archive below on its own. <code>removeIcon</code> does the same for the button that takes a row out.',
    },
    thumbnails: {
      title: 'Thumbnails',
      text: 'An image is listed as itself. The browser is handed a temporary address for the file, made in the page and released the moment the file leaves the list or the component goes away, so nothing is ever uploaded to draw it. <code>hideThumbnails</code> is the way out when a list holds many images or very large ones: every row then shows the icon for its kind, as the other files already do.',
    },
    multiple: {
      title: 'Multiple files',
      text: 'A zone takes one file unless <code>multiple</code> says otherwise, and the extra ones are turned away rather than quietly swapped in. The value is a list either way, so nothing downstream changes shape with the prop. What a refusal looks like is yours to write: the component emits <code>reject</code> once per file with the reason, and says nothing on screen by itself.',
    },
    accept: {
      title: 'Accepted kinds',
      text: "The browser's own syntax, extensions and wildcards alike. It is applied twice, and it has to be: once as the attribute, which is what narrows the system dialog, and once again in code when the files arrive, because the attribute has no say whatever over something dropped. A file that fails it never joins the list and comes back through <code>reject</code> with the reason <code>type</code>.",
    },
    maxSize: {
      title: 'Maximum size',
      text: 'The largest one file may be, in bytes. Each is weighed on its own, so an oversized file is turned away and the ones beside it in the same drop still get through. Sizes are written out in SI units, where a kilobyte is a thousand bytes: what the field shows and what you set are then the same number.',
    },
    totalSize: {
      title: 'Total size and count',
      text: 'The two limits that are about the selection rather than about one file: how heavy it may be all told, and how many files it may hold. Both count what is already in the list, so they still bite on a second drop. The screening runs in a fixed order, kind, then size, then count, then total size, which is what decides the reason a file comes back with when it breaks more than one rule at once.',
    },
    states: {
      title: 'States',
      text: 'A read-only zone shows what was taken and lets nothing change it: no dialog, no drop, and the remove buttons disabled along with the rest. A disabled one greys out through the colour tokens and stops accepting anything, mid-drag included, since the guard is read when the file lands rather than bound once at the start.',
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
