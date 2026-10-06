import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VResizable from './VResizable.vue'
import VResizablePanel from './VResizablePanel.vue'

const t = storyText({
  en: {
    one: 'One',
    two: 'Two',
    three: 'Three',
    files: 'Files',
    editor: 'Editor',
    outline: 'Outline',
    terminal: 'Terminal',
    sidebar: 'Sidebar',
    main: 'Main content',
    details: 'Details',
    drag: 'Drag the line, or focus it and use the arrow keys.',
    collapse: 'Collapse the sidebar',
    expand: 'Expand the sidebar',
    collapsedHint: 'Press Enter on the line, or drag it to the edge.',
    limits: 'At least 12rem, at most half of the group.',
    sizes: 'Sizes',
    saved: 'Saved',
  },
  fr: {
    one: 'Un',
    two: 'Deux',
    three: 'Trois',
    files: 'Fichiers',
    editor: 'Éditeur',
    outline: 'Plan',
    terminal: 'Terminal',
    sidebar: 'Barre latérale',
    main: 'Contenu principal',
    details: 'Détails',
    drag: 'Faites glisser la ligne, ou donnez-lui le focus et utilisez les flèches.',
    collapse: 'Replier la barre latérale',
    expand: 'Déplier la barre latérale',
    collapsedHint: 'Appuyez sur Entrée sur la ligne, ou tirez-la jusqu’au bord.',
    limits: 'Au moins 12rem, au plus la moitié du groupe.',
    sizes: 'Tailles',
    saved: 'Enregistré',
  },
})

const frame = 'height: 240px; border: 1px solid var(--vectis-color-border); border-radius: 8px'
const pane =
  'padding: 16px; font-family: var(--vectis-text-family); color: var(--vectis-color-text)'

const meta = {
  title: 'Components/Resizable',
  component: VResizable,
  subcomponents: { VResizablePanel },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    disabled: { control: 'boolean' },
    grip: { control: 'boolean' },
    step: { control: { type: 'number', min: 1, max: 50 } },
  },
  args: {
    orientation: 'horizontal',
    disabled: false,
    grip: false,
    step: 5,
  },
  render: (args) => ({
    components: { VResizable, VResizablePanel },
    setup: () => ({ args, t, frame, pane }),
    template: `
      <VResizable v-bind="args" :style="frame">
        <VResizablePanel :style="pane">{{ t.one }}</VResizablePanel>
        <VResizablePanel :style="pane">{{ t.two }}</VResizablePanel>
      </VResizable>
    `,
  }),
} satisfies Meta<typeof VResizable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const handle = within(canvasElement).getByRole('separator', { name: 'Panel 1' })
    expect(handle).toHaveAttribute('aria-orientation', 'vertical')
    expect(handle).toHaveAttribute('aria-valuenow', '50')
    await userEvent.click(handle)
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    await waitFor(() => expect(handle).toHaveAttribute('aria-valuenow', '60'))
    const [first] = canvasElement.querySelectorAll<HTMLElement>('.v-resizable-panel')
    const group = canvasElement.querySelector<HTMLElement>('.v-resizable')!
    // The panel takes its share of the space left by the 1px line.
    expect(first!.getBoundingClientRect().width / (group.clientWidth - 1)).toBeCloseTo(0.6, 2)
  },
}

/** A pointer drag moves the handle, and the drag continues outside it. */
export const Drag: Story = {
  args: { grip: true },
  play: async ({ canvasElement }) => {
    const handle = within(canvasElement).getByRole('separator')
    const box = handle.getBoundingClientRect()
    const x = box.left + box.width / 2
    const y = box.top + box.height / 2
    const fire = (type: string, clientX: number) =>
      handle.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          pointerId: 1,
          clientX,
          clientY: y,
        }),
      )
    const group = canvasElement.querySelector<HTMLElement>('.v-resizable')!
    const tenth = (group.clientWidth - 1) / 10
    fire('pointerdown', x)
    fire('pointermove', x - 2 * tenth)
    fire('pointerup', x - 2 * tenth)
    await waitFor(() => expect(handle).toHaveAttribute('aria-valuenow', '30'))
  },
}

/** `orientation="vertical"` stacks the panels; the group then needs a height. */
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  play: async ({ canvasElement }) => {
    const handle = within(canvasElement).getByRole('separator')
    expect(handle).not.toHaveAttribute('aria-orientation')
    handle.focus()
    await userEvent.keyboard('{ArrowUp}')
    await waitFor(() => expect(handle).toHaveAttribute('aria-valuenow', '45'))
  },
}

/**
 * Three panels and two handles. A panel stops at its minimum, and the handle then takes the space
 * from the next panel along.
 */
export const ThreePanels: Story = {
  render: (args) => ({
    components: { VResizable, VResizablePanel },
    setup: () => ({ args, t, frame, pane }),
    template: `
      <VResizable v-bind="args" :style="frame">
        <VResizablePanel :label="t.files" :default-size="25" :min-size="15" :style="pane">{{ t.files }}</VResizablePanel>
        <VResizablePanel :label="t.editor" :min-size="20" :style="pane">{{ t.editor }}</VResizablePanel>
        <VResizablePanel :label="t.outline" :default-size="25" :min-size="15" :style="pane">{{ t.outline }}</VResizablePanel>
      </VResizable>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const files = canvas.getByRole('separator', { name: 'Files' })
    const editor = canvas.getByRole('separator', { name: 'Editor' })
    expect(editor).toHaveAttribute('aria-valuenow', '50')
    files.focus()
    await userEvent.keyboard('{End}')
    // The editor stops at 20 and the outline gives the rest, down to 15.
    await waitFor(() => expect(files).toHaveAttribute('aria-valuenow', '65'))
    expect(editor).toHaveAttribute('aria-valuenow', '20')
  },
}

/**
 * `minSize` and `maxSize` take a number in percent or a CSS length. Lengths are also written in
 * CSS, so they hold when the window is resized.
 */
export const Limits: Story = {
  render: (args) => ({
    components: { VResizable, VResizablePanel },
    setup: () => ({ args, t, frame, pane }),
    template: `
      <VResizable v-bind="args" :style="frame">
        <VResizablePanel :label="t.sidebar" :default-size="30" min-size="12rem" max-size="50%" :style="pane">
          {{ t.limits }}
        </VResizablePanel>
        <VResizablePanel :style="pane">{{ t.main }}</VResizablePanel>
      </VResizable>
    `,
  }),
  play: async ({ canvasElement }) => {
    const handle = within(canvasElement).getByRole('separator')
    const panel = canvasElement.querySelector<HTMLElement>('.v-resizable-panel')!
    handle.focus()
    await userEvent.keyboard('{Home}')
    await waitFor(() => expect(panel.getBoundingClientRect().width).toBeCloseTo(192, 0))
    await userEvent.keyboard('{End}')
    await waitFor(() => expect(handle).toHaveAttribute('aria-valuenow', '50'))
  },
}

/**
 * A `collapsible` panel collapses when dragged past the middle of its minimum, or with Enter on
 * its handle, and reopens at its previous size. `v-model:collapsed` follows it, and
 * `collapsedSize` keeps a strip such as an icon rail.
 */
export const Collapsible: Story = {
  render: (args) => ({
    components: { VResizable, VResizablePanel, VButton },
    setup: () => ({ args, t, frame, pane, collapsed: ref(false) }),
    template: `
      <VResizable v-bind="args" :style="frame">
        <VResizablePanel
          v-model:collapsed="collapsed"
          :label="t.sidebar"
          :default-size="30"
          :min-size="20"
          collapsible
          collapsed-size="3.5rem"
          :style="collapsed ? 'padding: 8px' : pane"
        >
          <VButton
            size="sm"
            variant="ghost"
            :aria-label="collapsed ? t.expand : t.collapse"
            @click="collapsed = !collapsed"
          >{{ collapsed ? '»' : '«' }}</VButton>
          <p v-if="!collapsed">{{ t.collapsedHint }}</p>
        </VResizablePanel>
        <VResizablePanel :style="pane">{{ t.main }}</VResizablePanel>
      </VResizable>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const handle = canvas.getByRole('separator', { name: 'Sidebar' })
    const panel = canvasElement.querySelector<HTMLElement>('.v-resizable-panel')!
    handle.focus()
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(panel).toHaveAttribute('data-collapsed'))
    await waitFor(() => expect(panel.getBoundingClientRect().width).toBeCloseTo(56, 0))
    await userEvent.click(canvas.getByRole('button', { name: 'Expand the sidebar' }))
    await waitFor(() => expect(panel).not.toHaveAttribute('data-collapsed'))
    await waitFor(() => expect(handle).toHaveAttribute('aria-valuenow', '30'))
  },
}

/** A panel after the handle can collapse too: the handle then reports on it. */
export const CollapsibleEnd: Story = {
  render: (args) => ({
    components: { VResizable, VResizablePanel },
    setup: () => ({ args, t, frame, pane }),
    template: `
      <VResizable v-bind="args" :style="frame">
        <VResizablePanel :style="pane">{{ t.main }}</VResizablePanel>
        <VResizablePanel :label="t.details" :default-size="35" :min-size="25" collapsible :style="pane">
          {{ t.details }}
        </VResizablePanel>
      </VResizable>
    `,
  }),
  play: async ({ canvasElement }) => {
    const handle = await within(canvasElement).findByRole('separator', { name: 'Details' })
    await waitFor(() => expect(handle).toHaveAttribute('aria-valuenow', '35'))
    handle.focus()
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(handle).toHaveAttribute('aria-valuenow', '0'))
    await userEvent.keyboard('{ArrowLeft}')
    await waitFor(() => expect(handle).toHaveAttribute('aria-valuenow', '25'))
  },
}

/** Groups nest: a panel holds a vertical group of its own. */
export const Nested: Story = {
  args: { grip: true },
  render: (args) => ({
    components: { VResizable, VResizablePanel },
    setup: () => ({ args, t, frame, pane }),
    template: `
      <VResizable v-bind="args" :style="frame">
        <VResizablePanel :label="t.files" :default-size="30" :style="pane">{{ t.files }}</VResizablePanel>
        <VResizablePanel>
          <VResizable orientation="vertical" :grip="args.grip" style="height: 100%">
            <VResizablePanel :label="t.editor" :style="pane">{{ t.editor }}</VResizablePanel>
            <VResizablePanel :label="t.terminal" :default-size="35" :style="pane">{{ t.terminal }}</VResizablePanel>
          </VResizable>
        </VResizablePanel>
      </VResizable>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getAllByRole('separator')).toHaveLength(2)
    const inner = canvas.getByRole('separator', { name: 'Editor' })
    expect(inner).toHaveAttribute('aria-valuenow', '65')
    expect(inner).not.toHaveAttribute('aria-orientation')
  },
}

/**
 * The v-model holds the sizes in percent. `change` fires once they settle, which is the moment to
 * save them, in a cookie for a server-rendered page.
 */
export const Persisted: Story = {
  render: (args) => ({
    components: { VResizable, VResizablePanel },
    setup: () => {
      const sizes = ref<number[]>([40, 60])
      const saved = ref<number[]>([40, 60])
      return { args, t, frame, pane, sizes, saved }
    },
    template: `
      <div style="display: grid; gap: 12px; font-family: var(--vectis-text-family); color: var(--vectis-color-text)">
        <VResizable v-bind="args" v-model="sizes" :style="frame" @change="saved = $event">
          <VResizablePanel :style="pane">{{ t.drag }}</VResizablePanel>
          <VResizablePanel :style="pane">{{ t.two }}</VResizablePanel>
        </VResizable>
        <p style="margin: 0">{{ t.sizes }}: <output data-testid="sizes">{{ sizes.join(' / ') }}</output></p>
        <p style="margin: 0">{{ t.saved }}: <output data-testid="saved">{{ saved.join(' / ') }}</output></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    canvas.getByRole('separator').focus()
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(canvas.getByTestId('saved')).toHaveTextContent('45 / 55'))
    expect(canvas.getByTestId('sizes')).toHaveTextContent('45 / 55')
  },
}

/** `disabled` fixes the sizes: the handles are neither draggable nor focusable. */
export const Disabled: Story = {
  args: { disabled: true, grip: true },
  play: async ({ canvasElement }) => {
    const handle = within(canvasElement).getByRole('separator')
    expect(handle).toHaveAttribute('aria-disabled', 'true')
    expect(handle).not.toHaveAttribute('tabindex')
  },
}
