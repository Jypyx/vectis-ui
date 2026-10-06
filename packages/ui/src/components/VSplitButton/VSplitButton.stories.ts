import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { storyText } from '../../stories/storyText'
import VMenuItem from '../VMenu/VMenuItem.vue'
import VMenuSeparator from '../VMenu/VMenuSeparator.vue'
import VSplitButton from './VSplitButton.vue'

const t = storyText({
  en: {
    save: 'Save',
    draft: 'Save as draft',
    close: 'Save and close',
    template: 'Save as template',
    discard: 'Discard changes',
    publish: 'Publish',
    schedule: 'Schedule',
    preview: 'Preview',
    open: 'Open report',
    loading: 'Saving',
    disabled: 'Disabled',
    exportCsv: 'Export as CSV',
    exportPdf: 'Export as PDF',
    export: 'Export',
  },
  fr: {
    save: 'Enregistrer',
    draft: 'Enregistrer comme brouillon',
    close: 'Enregistrer et fermer',
    template: 'Enregistrer comme modèle',
    discard: 'Annuler les modifications',
    publish: 'Publier',
    schedule: 'Programmer',
    preview: 'Aperçu',
    open: 'Ouvrir le rapport',
    loading: 'Enregistrement',
    disabled: 'Désactivé',
    exportCsv: 'Exporter en CSV',
    exportPdf: 'Exporter en PDF',
    export: 'Exporter',
  },
})

const meta = {
  title: 'Components/SplitButton',
  component: VSplitButton,
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    tone: { control: 'inline-radio', options: ['accent', 'neutral', 'danger'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    placement: {
      control: 'select',
      options: ['bottom-start', 'bottom', 'bottom-end', 'top-start', 'top', 'top-end'],
    },
    menuSize: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    compact: { control: 'boolean' },
    elevated: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    matchWidth: { control: 'boolean' },
  },
  args: {
    label: 'Save',
    variant: 'solid',
    tone: 'accent',
    size: 'md',
    placement: 'bottom-end',
    menuSize: 'sm',
    compact: false,
    elevated: false,
    fullWidth: false,
    disabled: false,
    loading: false,
    matchWidth: false,
    onClick: fn(),
  },
  render: (args) => ({
    components: { VSplitButton, VMenuItem, VMenuSeparator },
    setup: () => ({ args, t }),
    template: `
      <VSplitButton v-bind="args" :label="args.label === 'Save' ? t.save : args.label">
        <VMenuItem :label="t.draft" />
        <VMenuItem :label="t.close" />
        <VMenuItem :label="t.template" />
        <VMenuSeparator />
        <VMenuItem :label="t.discard" tone="danger" />
      </VSplitButton>
    `,
  }),
} satisfies Meta<typeof VSplitButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const main = canvas.getByRole('button', { name: 'Save' })
    const trigger = canvas.getByRole('button', { name: 'More options' })
    const menu = canvasElement.querySelector<HTMLElement>('[role="menu"]')!

    await userEvent.click(main)
    await expect(args.onClick).toHaveBeenCalledOnce()
    await expect(menu.matches(':popover-open')).toBe(false)

    // The two halves share one edge: the menu button starts where the main action ends.
    const mainBox = main.getBoundingClientRect()
    const triggerBox = trigger.getBoundingClientRect()
    await expect(Math.abs(triggerBox.left - mainBox.right)).toBeLessThanOrEqual(1)
    await expect(triggerBox.height).toBe(mainBox.height)
    // The menu button is a square.
    await expect(Math.round(triggerBox.width)).toBe(Math.round(triggerBox.height))

    await userEvent.click(trigger)
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(true))
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('{Home}')
    await expect(canvas.getByRole('menuitem', { name: 'Save as draft' })).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('menuitem', { name: 'Save and close' })).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(false))
    await waitFor(() => expect(trigger).toHaveFocus())
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

/** Both halves take the variant, from `solid` to `ghost`. */
export const Variants: Story = {
  render: () => ({
    components: { VSplitButton, VMenuItem },
    setup: () => ({ t, variants: ['solid', 'soft', 'outline', 'ghost'] as const }),
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px">
        <VSplitButton v-for="variant in variants" :key="variant" :variant="variant" :label="t.publish">
          <VMenuItem :label="t.schedule" />
          <VMenuItem :label="t.preview" />
        </VSplitButton>
      </div>
    `,
  }),
}

/** `tone` gives both halves the meaning of the action. */
export const Tones: Story = {
  render: () => ({
    components: { VSplitButton, VMenuItem },
    setup: () => ({ t, tones: ['accent', 'neutral', 'danger'] as const }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <div v-for="tone in tones" :key="tone" style="display: flex; flex-wrap: wrap; gap: 16px">
          <VSplitButton :tone="tone" :label="t.save">
            <VMenuItem :label="t.draft" />
          </VSplitButton>
          <VSplitButton :tone="tone" variant="soft" :label="t.save">
            <VMenuItem :label="t.draft" />
          </VSplitButton>
          <VSplitButton :tone="tone" variant="outline" :label="t.save">
            <VMenuItem :label="t.draft" />
          </VSplitButton>
        </div>
      </div>
    `,
  }),
}

/** The size scale shared by every control. The menu button stays square. */
export const Sizes: Story = {
  render: () => ({
    components: { VSplitButton, VMenuItem },
    setup: () => ({ t, sizes: ['xs', 'sm', 'md', 'lg', 'xl'] as const }),
    template: `
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px">
        <VSplitButton v-for="size in sizes" :key="size" :size="size" :label="t.save">
          <VMenuItem :label="t.draft" />
        </VSplitButton>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    for (const trigger of within(canvasElement).getAllByRole('button', { name: 'More options' })) {
      const box = trigger.getBoundingClientRect()
      await expect(Math.round(box.width)).toBe(Math.round(box.height))
    }
  },
}

/**
 * `disabled` turns off both halves. `loading` puts the spinner in the main action and disables
 * the menu button too: an action is already under way.
 */
export const States: Story = {
  render: () => ({
    components: { VSplitButton, VMenuItem },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px">
        <VSplitButton disabled :label="t.disabled">
          <VMenuItem :label="t.draft" />
        </VSplitButton>
        <VSplitButton loading :label="t.loading">
          <VMenuItem :label="t.draft" />
        </VSplitButton>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Disabled' })).toBeDisabled()
    const loading = canvas.getByRole('button', { name: 'Saving' })
    await expect(loading).toBeDisabled()
    await expect(loading).toHaveAttribute('aria-busy', 'true')
    const triggers = canvas.getAllByRole('button', { name: 'More options' })
    for (const trigger of triggers) {
      await expect(trigger).toBeDisabled()
    }
    // While loading, the menu button keeps the main action's paint instead of turning grey.
    const loadingTrigger = triggers[1]
    await expect(getComputedStyle(loadingTrigger!).backgroundColor).toBe(
      getComputedStyle(loading).backgroundColor,
    )
    await expect(getComputedStyle(loadingTrigger!).opacity).toBe('0.5')
  },
}

/** `iconStart` and `href` belong to the main action, which becomes a link. */
export const LinkWithIcon: Story = {
  render: () => ({
    components: { VSplitButton, VMenuItem },
    setup: () => ({ t }),
    template: `
      <VSplitButton href="#report" variant="outline" tone="neutral" icon-start="description" :label="t.open">
        <VMenuItem :label="t.exportCsv" />
        <VMenuItem :label="t.exportPdf" />
      </VSplitButton>
    `,
  }),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Open report' })
    await expect(link).toHaveAttribute('href', '#report')
  },
}

/**
 * `fullWidth` stretches the control: the main action takes the room, the menu button stays
 * square. `matchWidth` keeps the menu at least as wide as the whole control.
 */
export const FullWidth: Story = {
  render: () => ({
    components: { VSplitButton, VMenuItem },
    setup: () => ({ t }),
    template: `
      <div style="inline-size: 360px">
        <VSplitButton full-width match-width placement="bottom-start" :label="t.export">
          <VMenuItem :label="t.exportCsv" />
          <VMenuItem :label="t.exportPdf" />
        </VSplitButton>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const group = canvas.getByRole('group')
    const trigger = canvas.getByRole('button', { name: 'More options' })
    const menu = canvasElement.querySelector<HTMLElement>('[role="menu"]')!
    await expect(Math.round(group.getBoundingClientRect().width)).toBe(360)
    const triggerBox = trigger.getBoundingClientRect()
    await expect(Math.round(triggerBox.width)).toBe(Math.round(triggerBox.height))

    await userEvent.click(trigger)
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(true))
    // Measured once the entry animation, which scales the panel, has settled.
    const groupBox = group.getBoundingClientRect()
    await waitFor(() => {
      const menuBox = menu.getBoundingClientRect()
      expect(menuBox.width).toBeGreaterThanOrEqual(groupBox.width - 1)
      expect(Math.abs(menuBox.left - groupBox.left)).toBeLessThanOrEqual(1)
    })
    await userEvent.keyboard('{Escape}')
  },
}

/**
 * The menu is anchored to the whole control rather than to the menu button. At the default
 * `bottom-end`, it lines up with the end of the control, as at the end of a form.
 */
export const Placement: Story = {
  render: () => ({
    components: { VSplitButton, VMenuItem, VMenuSeparator },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; justify-content: flex-end; inline-size: 420px">
        <VSplitButton :label="t.save">
          <VMenuItem :label="t.draft" />
          <VMenuItem :label="t.close" />
          <VMenuSeparator />
          <VMenuItem :label="t.discard" tone="danger" />
        </VSplitButton>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const group = canvas.getByRole('group')
    const menu = canvasElement.querySelector<HTMLElement>('[role="menu"]')!
    await userEvent.click(canvas.getByRole('button', { name: 'More options' }))
    await waitFor(() => expect(menu.matches(':popover-open')).toBe(true))
    const groupBox = group.getBoundingClientRect()
    await waitFor(() => {
      const menuBox = menu.getBoundingClientRect()
      expect(Math.abs(menuBox.right - groupBox.right)).toBeLessThanOrEqual(1)
      expect(menuBox.top).toBeGreaterThanOrEqual(groupBox.bottom)
    })
    // Left open for the accessibility check.
  },
}
