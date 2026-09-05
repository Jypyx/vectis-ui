import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { storyText } from '../../stories/storyText'
import VBadge from '../VBadge/VBadge.vue'
import VIcon from '../VIcon/VIcon.vue'
import VMenu from '../VMenu/VMenu.vue'
import VMenuItem from '../VMenu/VMenuItem.vue'
import VMenuSeparator from '../VMenu/VMenuSeparator.vue'
import VTooltip from '../VTooltip/VTooltip.vue'
import VIconButton from './VIconButton.vue'

const ICON = `
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path d="M8 2v12M2 8h12" stroke="currentcolor" stroke-width="1.5" stroke-linecap="round" />
  </svg>
`

const t = storyText({
  en: {
    settings: 'Settings',
    add: 'Add',
    profile: 'Profile',
    iconPropHint: '(icon prop: outline / filled)',
    notifications: 'Notifications, 3 unread',
    recentActivity: 'Recent activity',
    markAllRead: 'Mark all as read',
    notificationSettings: 'Notification settings',
  },
  fr: {
    settings: 'Paramètres',
    add: 'Ajouter',
    profile: 'Profil',
    iconPropHint: '(prop icon : contour / plein)',
    notifications: 'Notifications, 3 non lues',
    recentActivity: 'Activité récente',
    markAllRead: 'Tout marquer comme lu',
    notificationSettings: 'Paramètres de notification',
  },
})

const meta = {
  title: 'Components/IconButton',
  component: VIconButton,
  argTypes: {
    variant: { control: 'select', options: ['solid', 'outline', 'ghost', 'soft'] },
    tone: { control: 'select', options: ['accent', 'neutral', 'danger'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'select', options: ['square', 'circular'] },
    elevated: { control: 'boolean' },
    compact: { control: 'boolean' },
    icon: { control: 'text' },
    iconFilled: { control: 'boolean' },
  },
  args: {
    label: 'Add an item',
    variant: 'ghost',
    tone: 'neutral',
    size: 'md',
    shape: 'square',
    elevated: false,
    compact: false,
    disabled: false,
    loading: false,
  },
  render: (args) => ({
    components: { VIconButton, VIcon },
    setup: () => ({ args }),
    template: '<VIconButton v-bind="args"><VIcon name="add" /></VIconButton>',
  }),
} satisfies Meta<typeof VIconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    // The accessible label is mandatory: check that it is actually exposed.
    const button = within(canvasElement).getByRole('button', { name: 'Add an item' })
    await expect(button).toBeVisible()
  },
}

export const Variants: Story = {
  render: (args) => ({
    components: { VIconButton, VIcon },
    setup: () => ({ args }),
    template: `
      <div style="display: grid; gap: 12px">
        <div v-for="tone in ['accent', 'neutral', 'danger']" :key="tone" style="display: flex; gap: 8px; flex-wrap: wrap">
          <VIconButton
            v-for="variant in ['solid', 'outline', 'ghost', 'soft']"
            :key="variant"
            :label="args.label"
            :tone="tone"
            :variant="variant"
          >
            <VIcon name="favorite" />
          </VIconButton>
        </div>
      </div>
    `,
  }),
}

/* Same reading as VButton/Elevated: one group per tone, the plain row above the
   raised one. */
export const Elevated: Story = {
  render: (args) => ({
    components: { VIconButton, VIcon },
    setup: () => ({ args }),
    template: `
      <div style="display: grid; gap: 20px">
        <div v-for="tone in ['accent', 'neutral', 'danger']" :key="tone" style="display: grid; gap: 8px">
          <div v-for="raised in [false, true]" :key="String(raised)" style="display: flex; gap: 8px; flex-wrap: wrap">
            <VIconButton
              v-for="variant in ['solid', 'outline', 'ghost', 'soft']"
              :key="variant"
              :label="args.label"
              :tone="tone"
              :variant="variant"
              :elevated="raised"
            >
              <VIcon name="favorite" />
            </VIconButton>
          </div>
        </div>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: (args) => ({
    components: { VIconButton, VIcon },
    setup: () => ({ args }),
    template: `
      <div style="display: grid; gap: 12px">
        <div style="display: flex; gap: 8px; align-items: center">
          <VIconButton v-bind="args" size="xs"><VIcon name="add" /></VIconButton>
          <VIconButton v-bind="args" size="sm"><VIcon name="add" /></VIconButton>
          <VIconButton v-bind="args" size="md"><VIcon name="add" /></VIconButton>
          <VIconButton v-bind="args" size="lg"><VIcon name="add" /></VIconButton>
          <VIconButton v-bind="args" size="xl"><VIcon name="add" /></VIconButton>
        </div>
        <div style="display: flex; gap: 8px; align-items: center">
          <VIconButton v-bind="args" size="xs" compact><VIcon name="add" /></VIconButton>
          <VIconButton v-bind="args" size="sm" compact><VIcon name="add" /></VIconButton>
          <VIconButton v-bind="args" size="md" compact><VIcon name="add" /></VIconButton>
          <VIconButton v-bind="args" size="lg" compact><VIcon name="add" /></VIconButton>
          <VIconButton v-bind="args" size="xl" compact><VIcon name="add" /></VIconButton>
        </div>
      </div>
    `,
  }),
}

/** One row per shape, the four variants across: `square` (the default) above,
    `circular` below. */
export const Shapes: Story = {
  render: (args) => ({
    components: { VIconButton, VIcon },
    setup: () => ({ args }),
    template: `
      <div style="display: grid; gap: 12px">
        <div v-for="shape in ['square', 'circular']" :key="shape" style="display: flex; gap: 8px; flex-wrap: wrap">
          <VIconButton
            v-for="variant in ['solid', 'outline', 'ghost', 'soft']"
            :key="variant"
            :label="args.label"
            :shape="shape"
            :variant="variant"
            elevated
          >
            <VIcon name="add" />
          </VIconButton>
        </div>
      </div>
    `,
  }),
}

export const IconsTypes: Story = {
  render: (args) => ({
    components: { VIconButton, VIcon },
    setup: () => ({ args, t }),
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <VIconButton :label="t.settings"><VIcon name="settings" /></VIconButton>

        <VIconButton :label="t.add">${ICON}</VIconButton>

        <VIconButton :label="t.profile" variant="outline">
          <VIcon src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%236366f1'/%3E%3C/svg%3E" />
        </VIconButton>
      </div>
    `,
  }),
}

export const IconProp: Story = {
  render: (args) => ({
    components: { VIconButton },
    setup: () => ({ args, t }),
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <VIconButton :label="args.label" icon="favorite" />
        <VIconButton :label="args.label" icon="favorite" icon-filled />
        <span>{{ t.iconPropHint }}</span>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const icons = canvasElement.querySelectorAll('.v-icon')
    await expect(icons[0]).not.toHaveAttribute('data-filled')
    await expect(icons[1]).toHaveAttribute('data-filled')
  },
}

/** One icon button described by a tooltip, marked by an overlay badge and opening a
    menu. The three attach to the SAME button, and the nesting order is the whole of the
    recipe. */
export const Companions: Story = {
  render: () => ({
    components: { VIconButton, VBadge, VMenu, VMenuItem, VMenuSeparator, VTooltip },
    setup: () => ({ t }),
    /*
     * VMenu is outermost because it renders its panel as a SIBLING of its trigger: a badge
     * wrapped around the menu would take the panel into its host, and a tooltip around it
     * would put pointer and focus handlers on the panel as well. Inside the trigger slot
     * the order of the two wrappers is free — VTooltip carries the anchor of its own panel,
     * VBadge the `position: relative` its overlay needs, and neither reads the other.
     *
     * The button stays at the centre because it is what all three attach to: the tooltip
     * DESCRIBES it, the menu is opened BY it (a `popovertarget` invoker is the panel's
     * implicit anchor, so the two wrappers change nothing about where the menu lands), and
     * the badge is pinned to its corner. Both slots hand out a prop called `triggerProps`,
     * hence the rename on the inner one.
     *
     * The count lives in the LABEL and not only in the badge: the badge is a span sibling
     * of the button, so it is no part of the accessible name a screen reader reads out on
     * focus.
     */
    template: `
      <div style="padding: 64px">
        <VMenu placement="bottom-end">
          <template #trigger="{ triggerProps }">
            <VTooltip :text="t.recentActivity">
              <template #default="{ triggerProps: tooltipProps }">
                <VBadge :count="3" overlay bordered>
                  <VIconButton
                    v-bind="{ ...triggerProps, ...tooltipProps }"
                    icon="notifications"
                    variant="outline"
                    :label="t.notifications"
                  />
                </VBadge>
              </template>
            </VTooltip>
          </template>

          <VMenuItem :label="t.markAllRead" icon-start="check" />
          <VMenuSeparator />
          <VMenuItem :label="t.notificationSettings" icon-start="settings" />
        </VMenu>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Notifications, 3 unread' })
    const tooltip = canvasElement.querySelector('[role="tooltip"]') as HTMLElement

    /*
     * Closing the menu is where the composition used to come apart, and the failure landed
     * on `window` rather than on any call in here: the browser hands the focus back to the
     * trigger from INSIDE its own hide, the tooltip answers that focus, and opening a
     * popover during another popover's operation throws. Nothing below would fail without
     * usePopover's retry — the page would simply carry an uncaught InvalidStateError.
     */
    const errors: string[] = []
    const onError = (event: ErrorEvent) => errors.push(event.message)
    window.addEventListener('error', onError)

    // The badge wraps the BUTTON and not the menu: its host is the button's own parent,
    // which is what puts the pill in the corner of the control rather than of the row.
    await expect(button.parentElement).toHaveClass('v-badge-host')

    // Both sets of trigger props landed on the one element, neither overwriting the other.
    await expect(button).toHaveAttribute('aria-haspopup', 'menu')
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await expect(button).toHaveAttribute('aria-describedby', tooltip.id)

    // Keyboard focus opens the tooltip at once (no delay).
    await userEvent.tab()
    await expect(button).toHaveFocus()
    await waitFor(() => expect(tooltip.matches(':popover-open')).toBe(true))

    /*
     * Opening the menu must take the tooltip away, or it stands over the panel it just
     * asked for. Here the focus moving into the panel is what dismisses it — the wrapper's
     * `focusout`; a pointer opening goes through VTooltip's `pointerdown` instead, which is
     * the branch Safari needs and which no synthetic event proves.
     */
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvas.getByRole('menu')).toBeVisible())
    await expect(tooltip.matches(':popover-open')).toBe(false)
    await expect(button).toHaveAttribute('aria-expanded', 'true')

    /*
     * Escape closes the menu from inside the panel, so it is the browser that hands the
     * focus back — the throwing path. The tooltip coming back is the proof the retry landed:
     * the reader is on the button again, at the keyboard, which is exactly when a tooltip
     * belongs on screen.
     */
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(button).toHaveFocus())
    await waitFor(() => expect(tooltip.matches(':popover-open')).toBe(true))
    await expect(errors).toEqual([])

    // The story ends with the panel open: axe only audits what is left on screen.
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvas.getByRole('menu')).toBeVisible())
    window.removeEventListener('error', onError)
  },
}

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button')
    await expect(button).toBeDisabled()
    await expect(button).toHaveAttribute('aria-busy', 'true')
  },
}

export const Disabled: Story = {
  render: (args) => ({
    components: { VIconButton, VIcon },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <VIconButton
          v-for="variant in ['solid', 'outline', 'ghost', 'soft']"
          :key="variant"
          :label="args.label"
          :variant="variant"
          disabled
        >
          <VIcon name="favorite" />
        </VIconButton>
      </div>
    `,
  }),
}
