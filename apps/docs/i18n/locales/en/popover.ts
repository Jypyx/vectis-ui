export default {
  title: 'Popover',
  lead: '<code>VPopover</code> anchors a native popover panel to a trigger. Add the role and keyboard behaviour required by your content.',
  examples: {
    placements: {
      title: 'Placements',
      text: '<code>placement</code> sets the preferred position. The panel flips when the requested side lacks space.',
    },
    interactiveContent: {
      title: 'Interactive content',
      text: 'Panels can contain controls. Focus is not trapped; provide keyboard behaviour appropriate to the content.',
    },
    modes: {
      title: 'Modes',
      text: '<code>auto</code> closes on outside click or Escape. In <code>manual</code> mode, provide dismissal yourself. Control visibility with <code>v-model:open</code> or the exposed <code>show</code> and <code>close</code> methods.',
    },
    matchTrigger: {
      title: 'Match trigger',
      text: '<code>matchTrigger</code> makes the trigger width the panel’s minimum width.',
    },
    anchor: {
      title: 'Anchoring to your own element',
      text: 'Use <code>anchor</code> for an existing CSS anchor, including text input triggers. Set the anchor on the field’s control box and scope it from a parent.',
    },
  },
  api: {
    VPopover: {
      props: {
        id: 'Panel identifier. Generated when omitted.',
        placement: 'Preferred panel position; flips when space is insufficient.',
        mode: '<code>auto</code> uses native outside-click and Escape dismissal. <code>manual</code> requires your own dismissal controls.',
        anchor:
          'Existing CSS anchor name, such as <code>--tooltip-anchor</code>. Omits the trigger wrapper; required for text input triggers.',
        bare: 'Removes the panel background, border, shadow and radius.',
        matchTrigger: 'Sets the trigger width as the panel’s minimum width.',
        vModelOpen:
          'Open state synchronized with native dismissal. Use exposed <code>show</code> / <code>close</code> for synchronous changes.',
      },
      slots: {
        trigger: 'Trigger control. Bind the supplied <code>triggerProps</code> to a button.',
        default: 'Panel content.',
      },
    },
  },
}
