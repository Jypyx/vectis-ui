import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VSwitch from './VSwitch.vue'

const t = storyText({
  en: {
    notifications: 'Notifications',
    labelAfter: 'Label after (default)',
    labelBefore: 'Label before',
    switchRight: 'VSwitch on the right',
    switchLeft: 'VSwitch on the left',
    disabled: 'Disabled',
    disabledOn: 'Disabled and on',
    invalid: 'Accept the terms',
    enableNotifications: 'Enable notifications',
    wifi: 'Wi-Fi',
    wifiHint: 'Joins known networks automatically.',
    managed: 'Managed by your administrator',
    managedOff: 'Guest access, managed by your administrator',
  },
  fr: {
    notifications: 'Notifications',
    labelAfter: 'Libellé après (défaut)',
    labelBefore: 'Libellé avant',
    switchRight: 'VSwitch à droite',
    switchLeft: 'VSwitch à gauche',
    disabled: 'Désactivé',
    disabledOn: 'Désactivé actif',
    invalid: 'Accepter les conditions',
    enableNotifications: 'Activer les notifications',
    wifi: 'Wi-Fi',
    wifiHint: 'Rejoint automatiquement les réseaux connus.',
    managed: 'Géré par votre administrateur',
    managedOff: 'Accès invité, géré par votre administrateur',
  },
})

const meta = {
  title: 'Components/Switch',
  component: VSwitch,
  argTypes: {
    labelPosition: { control: 'select', options: ['start', 'end'] },
  },
  args: {
    readonly: false,
    labelPosition: 'end',
    spread: false,
    disabled: false,
  },
  render: (args) => ({
    components: { VSwitch },
    setup: () => ({ args, on: ref(false), t }),
    template: '<VSwitch v-bind="args" v-model="on">{{ t.notifications }}</VSwitch>',
  }),
} satisfies Meta<typeof VSwitch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    // role="switch": correct semantics for screen readers
    const sw = within(canvasElement).getByRole('switch', { name: 'Notifications' })
    await expect(sw).not.toBeChecked()
    // the hidden input is pointer-events: none, so the wrapping <label> is clicked
    await userEvent.click(sw.closest('label')!)
    await waitFor(() => expect(sw).toBeChecked())
  },
}

export const LabelPosition: Story = {
  render: () => ({
    components: { VSwitch },
    setup: () => ({ a: ref(false), b: ref(true), t }),
    template: `
      <div style="display: grid; gap: 8px; justify-items: start">
        <VSwitch v-model="a" label-position="end">{{ t.labelAfter }}</VSwitch>
        <VSwitch v-model="b" label-position="start">{{ t.labelBefore }}</VSwitch>
      </div>
    `,
  }),
}

/**
 * `spread`: the root takes the full width, and label and switch are pushed to
 * the container's opposite ends.
 */
export const Spread: Story = {
  render: () => ({
    components: { VSwitch },
    setup: () => ({ a: ref(true), b: ref(false), t }),
    template: `
      <div style="display: grid; gap: 8px; max-width: 320px">
        <VSwitch v-model="a" spread>{{ t.switchLeft }}</VSwitch>
        <VSwitch v-model="b" spread label-position="start">{{ t.switchRight }}</VSwitch>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { VSwitch },
    setup: () => ({ on: ref(true), off: ref(false), t }),
    template: `
      <div style="display: grid; gap: 8px">
        <VSwitch v-model="off" disabled>{{ t.disabled }}</VSwitch>
        <VSwitch v-model="on" disabled>{{ t.disabledOn }}</VSwitch>
      </div>
    `,
  }),
}

export const WithoutLabel: Story = {
  render: () => ({
    components: { VSwitch },
    setup: () => ({ on: ref(false), t }),
    template: '<VSwitch v-model="on" :aria-label="t.enableNotifications" />',
  }),
}

/**
 * `invalid` rings the track in the danger colour and sets `aria-invalid` on the input,
 * the same pair VCheckbox and VRadio use. It is for a rule the browser cannot check on
 * its own; native validity already colours the switch without it.
 */
export const Invalid: Story = {
  render: () => ({
    components: { VSwitch },
    setup: () => ({ accepted: ref(false), t }),
    template: '<VSwitch v-model="accepted" invalid>{{ t.invalid }}</VSwitch>',
  }),
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('.v-switch-input')!
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    // The ring is a shadow, so it changes no geometry and leaves the focus outline alone.
    const track = canvasElement.querySelector('.v-switch-track')!
    await expect(getComputedStyle(track).boxShadow).not.toBe('none')
  },
}

/** `label` stands in for the default slot, and `hint` draws a caption under it. */
export const WithHint: Story = {
  render: () => ({
    components: { VSwitch },
    setup: () => ({ on: ref(true), t }),
    template: `
      <div style="max-width: 360px">
        <VSwitch v-model="on" :label="t.wifi" :hint="t.wifiHint" spread label-position="start" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const sw = within(canvasElement).getByRole('switch', { name: 'Wi-Fi' })
    await expect(sw).toHaveAccessibleDescription('Joins known networks automatically.')
  },
}

/**
 * `readonly` keeps the switch focusable and announced, and refuses the change. Both
 * positions say so on screen: an off switch sinks the way a read-only checkbox does, an
 * on switch trades the accent for the muted colour.
 */
export const ReadOnly: Story = {
  render: () => ({
    components: { VSwitch },
    setup: () => ({ on: ref(true), off: ref(false), t }),
    template: `
      <div style="display: grid; gap: 8px">
        <VSwitch v-model="on" readonly :label="t.managed" />
        <VSwitch v-model="off" readonly :label="t.managedOff" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const sw = within(canvasElement).getByRole('switch', { name: 'Managed by your administrator' })
    await expect(sw).toHaveAttribute('aria-readonly', 'true')
    await userEvent.click(sw.closest('label')!)
    await expect(sw).toBeChecked()
    sw.focus()
    await userEvent.keyboard(' ')
    await expect(sw).toBeChecked()
  },
}
