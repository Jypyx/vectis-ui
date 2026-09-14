import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { computed, ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VCheckbox from './VCheckbox.vue'

const t = storyText({
  en: {
    newsletter: 'Receive the newsletter',
    labelAfter: 'Label after (default)',
    labelBefore: 'Label before',
    boxRight: 'Box on the right',
    boxLeft: 'Box on the left',
    selectAll: 'Select all',
    apples: 'Apples',
    pears: 'Pears',
    cherries: 'Cherries',
    disabled: 'Disabled',
    disabledChecked: 'Disabled and checked',
    terms:
      'I accept the terms and conditions as well as the privacy policy, including the processing of my personal data.',
    digest: 'Weekly digest',
    digestHint: 'A summary of the week, every Monday morning.',
    mentions: 'Mentions',
    mentionsHint: 'Only when someone names you.',
    lockedOn: 'Set by your organisation',
    lockedOff: 'Not available on your plan',
  },
  fr: {
    newsletter: 'Recevoir la newsletter',
    labelAfter: 'Libellé après (défaut)',
    labelBefore: 'Libellé avant',
    boxRight: 'Boîte à droite',
    boxLeft: 'Boîte à gauche',
    selectAll: 'Tout sélectionner',
    apples: 'Pommes',
    pears: 'Poires',
    cherries: 'Cerises',
    disabled: 'Désactivée',
    disabledChecked: 'Désactivée cochée',
    terms:
      "J'accepte les conditions générales d'utilisation ainsi que la politique de confidentialité, y compris le traitement de mes données personnelles.",
    digest: 'Résumé hebdomadaire',
    digestHint: 'Un résumé de la semaine, chaque lundi matin.',
    mentions: 'Mentions',
    mentionsHint: 'Seulement quand quelqu’un vous cite.',
    lockedOn: 'Imposé par votre organisation',
    lockedOff: 'Indisponible avec votre formule',
  },
})

const meta = {
  title: 'Components/Checkbox',
  component: VCheckbox,
  argTypes: {
    labelPosition: { control: 'select', options: ['start', 'end'] },
  },
  args: {
    readonly: false,
    indeterminate: false,
    labelPosition: 'end',
    spread: false,
    invalid: false,
    disabled: false,
  },
  render: (args) => ({
    components: { VCheckbox },
    setup: () => ({ args, checked: ref(false), t }),
    template: '<VCheckbox v-bind="args" v-model="checked">{{ t.newsletter }}</VCheckbox>',
  }),
} satisfies Meta<typeof VCheckbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole('checkbox', {
      name: 'Receive the newsletter',
    })
    // the hidden input is pointer-events: none, so the wrapping <label> is clicked,
    // as a real user would
    const label = checkbox.closest('label')!
    await userEvent.click(label)
    await waitFor(() => expect(checkbox).toBeChecked())
    await userEvent.click(label)
    await waitFor(() => expect(checkbox).not.toBeChecked())
  },
}

export const LabelPosition: Story = {
  render: () => ({
    components: { VCheckbox },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 8px; justify-items: start">
        <VCheckbox label-position="end">{{ t.labelAfter }}</VCheckbox>
        <VCheckbox label-position="start">{{ t.labelBefore }}</VCheckbox>
      </div>
    `,
  }),
}

/**
 * `spread`: the root takes the full width, and label and box are pushed to the
 * container's opposite ends.
 */
export const Spread: Story = {
  render: () => ({
    components: { VCheckbox },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 8px; max-width: 320px">
        <VCheckbox spread>{{ t.boxRight }}</VCheckbox>
        <VCheckbox spread label-position="start">{{ t.boxLeft }}</VCheckbox>
      </div>
    `,
  }),
}

export const Indeterminate: Story = {
  render: () => ({
    components: { VCheckbox },
    setup: () => {
      const fruits = ref([true, false, true])
      const all = computed({
        get: () => fruits.value.every(Boolean),
        set: (v: boolean) => {
          fruits.value = fruits.value.map(() => v)
        },
      })
      const some = computed(() => fruits.value.some(Boolean) && !all.value)
      return { fruits, all, some, t }
    },
    template: `
      <div style="display: grid; gap: 8px">
        <VCheckbox v-model="all" :indeterminate="some">{{ t.selectAll }}</VCheckbox>
        <div style="display: grid; gap: 8px; padding-inline-start: 24px">
          <VCheckbox v-model="fruits[0]">{{ t.apples }}</VCheckbox>
          <VCheckbox v-model="fruits[1]">{{ t.pears }}</VCheckbox>
          <VCheckbox v-model="fruits[2]">{{ t.cherries }}</VCheckbox>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const all = canvas.getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement
    await waitFor(() => expect(all.indeterminate).toBe(true))
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Pears' }).closest('label')!)
    await waitFor(() => expect(all.indeterminate).toBe(false))
    await expect(all).toBeChecked()
  },
}

export const Disabled: Story = {
  render: () => ({
    components: { VCheckbox },
    setup: () => ({ on: ref(true), off: ref(false), t }),
    template: `
      <div style="display: grid; gap: 8px">
        <VCheckbox v-model="off" disabled>{{ t.disabled }}</VCheckbox>
        <VCheckbox v-model="on" disabled>{{ t.disabledChecked }}</VCheckbox>
      </div>
    `,
  }),
}

export const LongLabel: Story = {
  render: () => ({
    components: { VCheckbox },
    setup: () => ({ t }),
    template: `
      <div style="max-width: 260px">
        <VCheckbox>{{ t.terms }}</VCheckbox>
      </div>
    `,
  }),
}

/**
 * `label` stands in for the default slot, and `hint` draws a caption under it. The hint
 * sits outside the `<label>`, so it is announced as the description rather than read as
 * part of the name, and it lines up with the text whatever side the box is on.
 */
export const WithHint: Story = {
  render: () => ({
    components: { VCheckbox },
    setup: () => ({ digest: ref(true), mentions: ref(false), t }),
    template: `
      <div style="display: grid; gap: 16px; max-width: 360px">
        <VCheckbox v-model="digest" :label="t.digest" :hint="t.digestHint" />
        <VCheckbox v-model="mentions" :label="t.mentions" :hint="t.mentionsHint" spread label-position="start" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const box = canvas.getByRole('checkbox', { name: 'Weekly digest' })
    await expect(box).toHaveAccessibleDescription('A summary of the week, every Monday morning.')
    // The text and the hint share a track: their start edges are the same pixel.
    const root = box.closest('.v-choice')!
    const label = root.querySelector('.v-choice-label')!.getBoundingClientRect()
    const hint = root.querySelector('.v-choice-hint')!.getBoundingClientRect()
    await expect(Math.abs(label.left - hint.left)).toBeLessThan(1)
    await expect(hint.top).toBeGreaterThanOrEqual(label.bottom - 1)
  },
}

/**
 * `readonly` keeps the box focusable and announced, and refuses the change: a checkbox has
 * no native read-only, so the component cancels the click, which also covers Space.
 */
export const ReadOnly: Story = {
  render: () => ({
    components: { VCheckbox },
    setup: () => ({ on: ref(true), off: ref(false), t }),
    template: `
      <div style="display: grid; gap: 8px">
        <VCheckbox v-model="on" readonly :label="t.lockedOn" />
        <VCheckbox v-model="off" readonly :label="t.lockedOff" />
        <output data-testid="mirror">{{ on }} {{ off }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const on = canvas.getByRole('checkbox', { name: 'Set by your organisation' })
    const off = canvas.getByRole('checkbox', { name: 'Not available on your plan' })
    await expect(on).toHaveAttribute('aria-readonly', 'true')
    await userEvent.click(off.closest('label')!)
    await expect(off).not.toBeChecked()
    on.focus()
    await userEvent.keyboard(' ')
    await expect(on).toBeChecked()
    await expect(on).toHaveFocus()
    await expect(canvas.getByTestId('mirror')).toHaveTextContent('true false')
  },
}
