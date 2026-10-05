export default {
  title: 'Tree view',
  lead: '<code>VTreeView</code> shows a hierarchy the reader folds and unfolds, such as files or a site map. It follows the ARIA tree pattern: one tab stop, arrow keys to move, open and close, and typeahead.',
  examples: {
    selection: {
      title: 'Selection',
      text: '<code>selectionMode="single"</code> selects one node by click, Enter or Space, and <code>v-model</code> holds its value. The chevron folds a branch without selecting it. A disabled node stays reachable by the keyboard.',
    },
    checkboxes: {
      title: 'Checkboxes',
      text: '<code>selectionMode="multiple"</code> gives each row a checkbox. Checking a branch checks its subtree, and a branch partly checked shows a dash. The model lists checked nodes in tree order, a branch included once everything under it is checked. Disabled nodes keep their state.',
    },
    links: {
      title: 'Links',
      text: 'A node with <code>href</code> is a link, and <code>current</code> marks the page being viewed. To hand navigation to a router, call <code>preventDefault()</code> on the event that <code>activate</code> receives.',
    },
    lazyLoading: {
      title: 'Lazy loading',
      text: '<code>loadChildren</code> fetches the children of a <code>lazy</code> node on its first expansion, and the tree keeps them. A failure closes the node and announces it; the next expansion retries.',
    },
    endContent: {
      title: 'End content',
      text: 'The <code>#end</code> slot adds content at the end of each row, such as a count. Keep it free of focusable elements: a row is a single control.',
    },
  },
  api: {
    VTreeView: {
      props: {
        items:
          'First level of the tree. Each node has a unique <code>value</code> and a <code>label</code>, and optional <code>icon</code>, <code>children</code>, <code>lazy</code>, <code>href</code>, <code>current</code> and <code>disabled</code>.',
        selectionMode:
          'Whether nodes can be selected: not at all, one at a time, or several with checkboxes.',
        loadChildren:
          'Fetches the children of a <code>lazy</code> node on its first expansion. A failure collapses the node; the next expansion retries.',
        size: 'Row height.',
        label: 'Accessible name of the tree. Defaults to the library dictionary.',
        vModel:
          'Selection: a value or <code>null</code> in <code>single</code> mode, an array in <code>multiple</code> mode. A value given for a branch checks its subtree.',
        vModelExpanded: 'Values of the expanded nodes. Unbound, the tree keeps this state itself.',
      },
      events: {
        activate:
          'A node was clicked or Enter was pressed on it. Receives the node and the event; <code>preventDefault()</code> cancels a link.',
      },
      slots: {
        icon: 'Content replacing the icon. Receives <code>item</code>, <code>level</code> and <code>expanded</code>.',
        label: 'Content replacing the label. Receives the same props.',
        end: 'Content at the end of the row. Must not be focusable.',
      },
    },
  },
}
