import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'

import { storyText } from '../../stories/storyText'
import VButton from '../VButton/VButton.vue'
import VTypography from '../VTypography/VTypography.vue'
import VSeparator from './VSeparator.vue'

const t = storyText({
  en: {
    intro: 'A rule marks a change of subject where a gap alone would be ambiguous.',
    outro: 'Below the rule, the next block starts.',
    tight: 'Tight list',
    airy: 'Airy list',
    first: 'First item',
    second: 'Second item',
    edit: 'Edit',
    share: 'Share',
    delete: 'Delete',
    decorative: 'The rule below is decorative: it is drawn, but never announced.',
  },
  fr: {
    intro: 'Une règle marque un changement de sujet là où un simple écart resterait ambigu.',
    outro: 'Sous la règle, le bloc suivant commence.',
    tight: 'Liste resserrée',
    airy: 'Liste aérée',
    first: 'Premier élément',
    second: 'Deuxième élément',
    edit: 'Modifier',
    share: 'Partager',
    delete: 'Supprimer',
    decorative: 'La règle ci-dessous est décorative : elle est dessinée, jamais annoncée.',
  },
})

const meta = {
  title: 'Components/Separator',
  component: VSeparator,
} satisfies Meta<typeof VSeparator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { VSeparator, VTypography },
    setup: () => ({ args, t }),
    template: `
      <div style="display: grid; gap: var(--vectis-space-4); inline-size: 320px">
        <VTypography>{{ t.intro }}</VTypography>
        <VSeparator v-bind="args" />
        <VTypography>{{ t.outro }}</VTypography>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const rule = within(canvasElement).getByRole('separator')

    // horizontal is the role's implicit orientation: the attribute would be noise
    expect(rule.hasAttribute('aria-orientation')).toBe(false)

    // 1px thick and full width — neither is measurable in jsdom. The block margin
    // proves the UA's 0.5em on <hr> is really cancelled.
    expect(rule.getBoundingClientRect().height).toBeCloseTo(1, 1)
    expect(rule.getBoundingClientRect().width).toBeGreaterThan(0)
    expect(getComputedStyle(rule).marginBlockStart).toBe('0px')
  },
}

export const Vertical: Story = {
  render: () => ({
    components: { VSeparator, VButton },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; align-items: center; gap: var(--vectis-space-3)">
        <VButton variant="ghost" tone="neutral">{{ t.edit }}</VButton>
        <VButton variant="ghost" tone="neutral">{{ t.share }}</VButton>
        <VSeparator orientation="vertical" />
        <VButton variant="ghost" tone="danger">{{ t.delete }}</VButton>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const rule = canvas.getByRole('separator')

    expect(rule).toHaveAttribute('aria-orientation', 'vertical')
    expect(rule.getBoundingClientRect().width).toBeCloseTo(1, 1)

    // the load-bearing assertion: the row is `align-items: center`, so without
    // `align-self: stretch` the <hr> would have zero height — silently.
    expect(rule.getBoundingClientRect().height).toBeCloseTo(
      canvas.getByRole('button', { name: 'Delete' }).getBoundingClientRect().height,
      1,
    )
  },
}

export const Spacing: Story = {
  render: () => ({
    components: { VSeparator, VTypography },
    setup: () => ({ t }),
    template: `
      <div style="display: flex; gap: var(--vectis-space-8)">
        <div style="display: grid; gap: var(--vectis-space-2); inline-size: 180px">
          <VTypography variant="overline">{{ t.tight }}</VTypography>
          <VTypography>{{ t.first }}</VTypography>
          <VSeparator />
          <VTypography>{{ t.second }}</VTypography>
        </div>
        <div style="display: grid; gap: var(--vectis-space-6); inline-size: 180px">
          <VTypography variant="overline">{{ t.airy }}</VTypography>
          <VTypography>{{ t.first }}</VTypography>
          <VSeparator />
          <VTypography>{{ t.second }}</VTypography>
        </div>
      </div>
    `,
  }),
}

export const Decorative: Story = {
  render: () => ({
    components: { VSeparator, VTypography },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: var(--vectis-space-4); inline-size: 320px">
        <VTypography>{{ t.decorative }}</VTypography>
        <!-- horizontal on purpose: aria-orientation is not an allowed attribute on
             role="presentation" -->
        <VSeparator role="presentation" />
        <VTypography>{{ t.outro }}</VTypography>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).queryByRole('separator')).toBeNull()
    expect(canvasElement.querySelector('.v-separator')).not.toBeNull()
  },
}
