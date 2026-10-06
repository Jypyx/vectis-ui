export default {
  title: 'Resizable',
  lead: '<code>VResizable</code> divides a space between two or more <code>VResizablePanel</code>s and places a handle between each pair. A handle is dragged with the pointer, or focused and moved with the arrow keys.',
  examples: {
    vertical: {
      title: 'Vertical',
      text: '<code>orientation="vertical"</code> stacks the panels. The group then needs a height. <code>grip</code> draws a grip on every handle.',
    },
    limits: {
      title: 'Limits',
      text: '<code>minSize</code> and <code>maxSize</code> take a number in percent or a CSS length such as <code>10rem</code>. When a panel reaches its minimum, the handle takes the rest from the next panel along.',
    },
    collapsible: {
      title: 'Collapsible panels',
      text: 'A <code>collapsible</code> panel collapses when dragged past the middle of its minimum, or with Enter on its handle, and reopens at the size it had. <code>v-model:collapsed</code> follows it. <code>collapsedSize</code> keeps a strip such as an icon rail; at 0, the content is removed from the layout and the tab order.',
    },
    nested: {
      title: 'Nested groups',
      text: 'A panel can hold a group of its own. Give the inner group <code>height: 100%</code>.',
    },
    persisted: {
      title: 'Saving the sizes',
      text: 'The v-model holds the sizes in percent and changes during a drag. <code>change</code> fires once they settle, which is the moment to save them. For a server-rendered page, a cookie lets the server render the saved sizes at once.',
    },
  },
  api: {
    VResizable: {
      props: {
        orientation: 'Panels side by side, following the text direction, or stacked.',
        disabled: 'Fixes the sizes. The handles can neither be dragged nor focused.',
        grip: 'Draws a grip in the middle of every handle.',
        step: 'How far an arrow key moves a handle, in percent.',
        vModel:
          'Size of each panel in percent of the shared space, adding up to 100. Unbound, panels start from their <code>defaultSize</code>.',
      },
      events: {
        change: 'Emits the sizes once they settle: after a drag, a key or a collapse.',
      },
      slots: {
        default: 'The <code>VResizablePanel</code>s, two or more.',
      },
    },
    VResizablePanel: {
      props: {
        index: 'Panel index assigned by the group. Do not set manually.',
        defaultSize:
          'Starting size in percent when the v-model gives none. Panels without one share the rest.',
        minSize: 'Smallest size: a number in percent or a CSS length.',
        maxSize: 'Largest size: a number in percent or a CSS length.',
        collapsible: 'Lets the panel collapse by dragging or with Enter on its handle.',
        collapsedSize:
          'Size of the collapsed panel, in percent or as a CSS length. At 0, the content is hidden.',
        label: 'Accessible name of the handle that resizes the panel.',
        vModelCollapsed: 'Collapsed state. Changing it collapses or reopens the panel.',
      },
      slots: {
        default: 'Panel content.',
      },
    },
  },
}
