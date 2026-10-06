export default {
  title: 'Context menu',
  lead: '<code>VContextMenu</code> opens a menu at the pointer on a right click, a long press on Android, the Menu key or Shift+F10. Its <code>menu</code> slot receives <code>target</code>, the element the menu was opened on, so one menu serves a whole list.',
  examples: {
    submenus: {
      title: 'Submenus',
      text: 'The commands are <code>VMenu</code> items, so groups, separators, submenus, <code>size</code> and <code>compact</code> work the same. Near an edge of the viewport the menu flips to stay on screen.',
    },
    nativeMenu: {
      title: "The browser's menu",
      text: "Shift with a right click shows the browser's menu. <code>disabled</code> gives the whole zone back to it.",
    },
    open: {
      title: 'Knowing whether it is open',
      text: '<code>v-model:open</code> follows every opening and closing. Opened from code, the menu appears under the focused element of the zone, or under the zone itself. Keep every command reachable another way too, a visible button for instance: iOS Safari has no long press menu, and nothing tells a reader the menu exists.',
    },
  },
  api: {
    VContextMenu: {
      props: {
        as: 'Element wrapping the zone.',
        size: 'Row size inherited by submenus.',
        compact: 'Reduces row height, including submenus.',
        width: 'Panel width. Numbers use pixels; strings use CSS lengths or keywords.',
        disabled: "Leaves the zone to the browser's own menu.",
        vModelOpen: 'Open state synchronized with outside clicks, Escape and command selection.',
      },
      slots: {
        default: 'Content of the zone.',
        menu: '<code>VMenuItem</code>, <code>VMenuGroup</code> and <code>VMenuSeparator</code> children. Receives <code>target</code>.',
      },
    },
  },
}
