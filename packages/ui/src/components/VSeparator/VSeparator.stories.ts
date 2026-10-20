import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'

import { builtinIcons as icons } from '../VIcon/icons'
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
    or: 'or',
    featured: 'Featured',
    end: 'End of list',
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
    or: 'ou',
    featured: 'À la une',
    end: 'Fin de la liste',
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

    expect(rule.hasAttribute('aria-orientation')).toBe(false)

    // 1px thick and full width; neither is measurable in jsdom. The block margin proves the
    // UA's 0.5em on <hr> is really cancelled.
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

    // The load-bearing assertion: the row is `align-items: center`, so without
    // `align-self: stretch` the <hr> would have zero height; silently.
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

export const WithContent: Story = {
  render: () => ({
    components: { VSeparator, VButton },
    setup: () => ({ icons, t }),
    template: `
      <div style="display: grid; gap: var(--vectis-space-6); inline-size: 320px">
        <VSeparator :label="t.or" />
        <VSeparator :icon="icons.star" content-position="start" />
        <VSeparator :icon="icons.star" :label="t.featured" content-position="end" />
        <div style="display: flex; gap: var(--vectis-space-3); block-size: 120px">
          <VButton variant="ghost" tone="neutral">{{ t.edit }}</VButton>
          <VSeparator orientation="vertical" :label="t.or" />
          <VButton variant="ghost" tone="neutral">{{ t.share }}</VButton>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const [labelled, iconOnly, , vertical] = within(canvasElement).getAllByRole('separator') as [
      HTMLElement,
      HTMLElement,
      HTMLElement,
      HTMLElement,
    ]

    // The label is repeated as the name: a separator's own text is presentational.
    expect(labelled).toHaveAccessibleName('or')
    expect(iconOnly).not.toHaveAttribute('aria-label')

    // 1px on the stroke's side and nothing elsewhere: the initial border width is 3px.
    const stroke = getComputedStyle(labelled, '::before')
    expect(stroke.borderBlockStartWidth).toBe('1px')
    expect(stroke.borderBlockEndWidth).toBe('0px')
    expect(stroke.borderInlineStartWidth).toBe('0px')
    expect(getComputedStyle(iconOnly, '::before').display).toBe('none')

    // Flush at the start: the icon begins where the rule does.
    expect(iconOnly.querySelector('svg')!.getBoundingClientRect().left).toBeCloseTo(
      iconOnly.getBoundingClientRect().left,
      0,
    )

    // Stretched by its flex row, with a stroke above and below the label.
    expect(vertical).toHaveAttribute('aria-orientation', 'vertical')
    expect(vertical.getBoundingClientRect().height).toBeCloseTo(120, 0)
    expect(getComputedStyle(vertical, '::after').borderInlineStartWidth).toBe('1px')
    expect(getComputedStyle(vertical, '::after').borderInlineEndWidth).toBe('0px')
  },
}

export const VariantsAndColour: Story = {
  name: 'Variants, size and colour',
  render: () => ({
    components: { VSeparator },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: var(--vectis-space-6); inline-size: 320px">
        <VSeparator />
        <VSeparator variant="dashed" />
        <VSeparator variant="dotted" />
        <VSeparator variant="dotted" size="md" />
        <VSeparator size="lg" color="oklch(0.6 0.2 260)" />
        <VSeparator variant="dashed" size="md" color="oklch(0.6 0.2 260)" :label="t.end" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const [solid, dashed, dotted, medium, large, coloured] = within(canvasElement).getAllByRole(
      'separator',
    ) as [HTMLElement, HTMLElement, HTMLElement, HTMLElement, HTMLElement, HTMLElement]

    expect(getComputedStyle(dashed).borderBlockStartStyle).toBe('dashed')
    expect(getComputedStyle(dotted).borderBlockStartStyle).toBe('dotted')

    expect(medium.getBoundingClientRect().height).toBeCloseTo(2, 1)
    expect(large.getBoundingClientRect().height).toBeCloseTo(4, 1)
    // The thickness reaches the pseudo-element strokes, and only their stroke side.
    expect(getComputedStyle(coloured, '::before').borderBlockStartWidth).toBe('2px')
    expect(getComputedStyle(coloured, '::before').borderBlockEndWidth).toBe('0px')

    // The custom colour paints the strokes, never the label.
    expect(getComputedStyle(coloured, '::after').borderBlockStartStyle).toBe('dashed')
    expect(getComputedStyle(coloured, '::after').borderBlockStartColor).not.toBe(
      getComputedStyle(solid).borderBlockStartColor,
    )
    expect(getComputedStyle(coloured).color).not.toBe(
      getComputedStyle(coloured, '::after').borderBlockStartColor,
    )
  },
}
