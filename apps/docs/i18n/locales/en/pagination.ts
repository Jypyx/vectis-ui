export default {
  title: 'Pagination',
  lead: '<code>VPagination</code> selects a page with buttons or links. It supports truncated ranges.',
  examples: {
    variantsAndTones: {
      title: 'Variants and tones',
      text: '<code>itemVariant</code> styles other pages and controls. <code>tone</code> colours only the current page.',
    },
    selectedVariants: {
      title: 'How the selection is drawn',
      text: '<code>selectedVariant</code> styles the current page as solid, soft or ghost.',
    },
    detached: {
      title: 'Detached',
      text: '<code>detached</code> separates the buttons. <code>bordered</code> adds dividers between joined buttons.',
    },
    elevated: {
      title: 'Elevated',
      text: '<code>elevated</code> adds a shadow to the row, or to each button when detached.',
    },
    sizes: {
      title: 'Sizes',
      text: '<code>size</code> sets the button size; <code>compact</code> reduces its height.',
    },
    length: {
      title: 'Length',
      text: '<code>length</code> is the total page count. Without <code>totalVisible</code>, all pages appear.',
    },
    totalVisible: {
      title: 'Total visible',
      text: '<code>totalVisible</code> caps page and ellipsis slots. From five slots, the first and last pages remain visible. Below five, consecutive pages surround the current one, down to the current page alone. At zero, only the controls remain.',
    },
    controls: {
      title: 'Previous and next',
      text: '<code>controls</code> selects icons, text, both or neither. Controls disable when no reachable page remains in their direction.',
    },
    edgeControls: {
      title: 'First and last',
      text: '<code>edgeControls</code> adds controls leading to the first and last reachable pages, displayed as <code>controls</code> specifies.',
    },
    unreachablePages: {
      title: 'Unreachable pages',
      text: '<code>disabledPages</code> accepts a page array or predicate. Controls skip those pages.',
    },
    links: {
      title: 'Links',
      text: 'Provide <code>href</code> to render links. Handle <code>navigate</code> and call <code>preventDefault()</code> for router navigation. Modified clicks preserve native link behaviour without updating the model.',
    },
    states: {
      title: 'States',
      text: '<code>disabled</code> disables the entire row.',
    },
    alignment: {
      title: 'Alignment',
      text: '<code>align</code> positions the row within the available width.',
    },
  },
  api: {
    VPagination: {
      props: {
        length: 'Total page count.',
        totalVisible:
          'Maximum page and ellipsis slots; 0 leaves the controls alone. Omitted shows every page.',
        detached: 'Separates page buttons.',
        bordered: 'Adds dividers between joined buttons. Ignored when detached.',
        itemVariant: 'Style of other pages and previous/next controls.',
        selectedVariant: 'Style of the current page.',
        tone: 'Colour of the current page.',
        size: 'Component size.',
        compact: 'Reduces the control height without changing text or icons.',
        elevated: 'Adds a shadow to the row or detached buttons.',
        align: 'Row alignment within the available width.',
        controls: 'Previous/next content: icons, text, both or <code>false</code>.',
        prevIcon: 'Previous control icon.',
        nextIcon: 'Next control icon.',
        prevText: 'Previous control text and accessible name. Defaults to the dictionary.',
        nextText: 'Next control text and accessible name. Defaults to the dictionary.',
        edgeControls:
          'Adds first and last page controls, displayed as <code>controls</code> specifies.',
        firstIcon: 'First page control icon.',
        lastIcon: 'Last page control icon.',
        firstText: 'First page control text and accessible name. Defaults to the dictionary.',
        lastText: 'Last page control text and accessible name. Defaults to the dictionary.',
        disabled: 'Disables interaction.',
        disabledPages: 'Unavailable pages as an array or predicate. Controls skip them.',
        label: 'Accessible navigation name. Defaults to the dictionary.',
        pageLabel:
          'Function providing an accessible name for each page number. Defaults to the dictionary.',
        href: 'Function mapping a page to its URL. Renders pages and controls as links.',
        vModel: 'Current page, starting at 1.',
      },
      events: {
        navigate:
          'Page activation, before the model update. Receives the page and click event; call <code>preventDefault()</code> for routing. Modified clicks do not emit it.',
      },
    },
  },
}
