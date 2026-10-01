import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { storyText } from '../../stories/storyText'
import VBadge from '../VBadge/VBadge.vue'
import VIconButton from '../VIconButton/VIconButton.vue'
import VMenu from '../VMenu/VMenu.vue'
import VMenuItem from '../VMenu/VMenuItem.vue'
import VTooltip from '../VTooltip/VTooltip.vue'
import VButton from './VButton.vue'
import VButtonGroup from './VButtonGroup.vue'

const t = storyText({
  en: {
    alignment: 'Alignment',
    left: 'Left',
    centre: 'Centre',
    right: 'Right',
    day: 'Day',
    week: 'Week',
    month: 'Month',
    navigation: 'Navigation',
    home: 'Home',
    projects: 'Projects',
    settings: 'Settings',
    formatting: 'Formatting',
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    joined: 'Joined',
    detached: 'Detached',
    naturalWidth: 'As wide as its labels',
    fullWidth: 'Filling the column',
    seamless: 'Seamless',
    bordered: 'Bordered',
    alone: 'Alone',
    singleButton: 'Single button',
    longLabels: 'Long labels',
    exportCsv: 'Export as CSV',
    exportPdf: 'Export as PDF',
    rowActions: 'Row actions',
    rename: 'Rename',
    duplicate: 'Duplicate',
    remove: 'Delete',
    duplicateHint: 'Copies it into the same folder',
    comments: 'Comments',
    moreActions: 'More actions',
    weekHint: 'Monday to Sunday',
    moreHint: 'Everything else this row can do',
  },
  fr: {
    alignment: 'Alignement',
    left: 'Gauche',
    centre: 'Centre',
    right: 'Droite',
    day: 'Jour',
    week: 'Semaine',
    month: 'Mois',
    navigation: 'Navigation',
    home: 'Accueil',
    projects: 'Projets',
    settings: 'Réglages',
    formatting: 'Mise en forme',
    bold: 'Gras',
    italic: 'Italique',
    underline: 'Souligné',
    joined: 'Joints',
    detached: 'Séparés',
    naturalWidth: 'À la largeur de ses libellés',
    fullWidth: 'Remplissant la colonne',
    seamless: 'Sans traits',
    bordered: 'Avec traits',
    alone: 'Seul',
    singleButton: 'Bouton unique',
    longLabels: 'Libellés longs',
    exportCsv: 'Exporter en CSV',
    exportPdf: 'Exporter en PDF',
    rowActions: 'Actions de ligne',
    rename: 'Renommer',
    duplicate: 'Dupliquer',
    remove: 'Supprimer',
    duplicateHint: 'Copie dans le même dossier',
    comments: 'Commentaires',
    moreActions: 'Autres actions',
    weekHint: 'Du lundi au dimanche',
    moreHint: 'Tout ce que cette rangée sait faire d’autre',
  },
})

const meta = {
  title: 'Components/ButtonGroup',
  component: VButtonGroup,
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    variant: { control: 'inline-radio', options: ['solid', 'outline', 'ghost', 'soft'] },
    tone: { control: 'inline-radio', options: ['accent', 'neutral', 'danger'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
  args: {
    orientation: 'horizontal',
    detached: false,
    bordered: false,
    fullWidth: false,
    variant: 'outline',
    tone: 'neutral',
  },
  render: (args) => ({
    components: { VButtonGroup, VButton },
    setup: () => ({ args, t }),
    template: `
      <VButtonGroup v-bind="args" :label="t.alignment">
        <VButton>{{ t.left }}</VButton>
        <VButton>{{ t.centre }}</VButton>
        <VButton>{{ t.right }}</VButton>
      </VButtonGroup>
    `,
  }),
} satisfies Meta<typeof VButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 16px">
        <VButtonGroup variant="solid" label="Solid">
          <VButton>{{ t.day }}</VButton>
          <VButton>{{ t.week }}</VButton>
          <VButton>{{ t.month }}</VButton>
        </VButtonGroup>
        <VButtonGroup variant="outline" tone="neutral" label="Outline">
          <VButton>{{ t.day }}</VButton>
          <VButton>{{ t.week }}</VButton>
          <VButton>{{ t.month }}</VButton>
        </VButtonGroup>
        <VButtonGroup variant="soft" label="Tonal">
          <VButton>{{ t.day }}</VButton>
          <VButton>{{ t.week }}</VButton>
          <VButton>{{ t.month }}</VButton>
        </VButtonGroup>
      </div>
    `,
  }),
}

export const Detached: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <VButtonGroup variant="outline" tone="neutral" :label="t.joined">
          <VButton>{{ t.day }}</VButton>
          <VButton>{{ t.week }}</VButton>
          <VButton>{{ t.month }}</VButton>
        </VButtonGroup>
        <VButtonGroup detached variant="outline" tone="neutral" :label="t.detached">
          <VButton>{{ t.day }}</VButton>
          <VButton>{{ t.week }}</VButton>
          <VButton>{{ t.month }}</VButton>
        </VButtonGroup>
      </div>
    `,
  }),
}

export const Bordered: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <VButtonGroup variant="outline" tone="neutral" :label="t.seamless">
          <VButton>{{ t.day }}</VButton>
          <VButton>{{ t.week }}</VButton>
          <VButton>{{ t.month }}</VButton>
        </VButtonGroup>
        <VButtonGroup bordered variant="outline" tone="neutral" :label="t.bordered">
          <VButton>{{ t.day }}</VButton>
          <VButton>{{ t.week }}</VButton>
          <VButton>{{ t.month }}</VButton>
        </VButtonGroup>
      </div>
    `,
  }),
  /*
   * Assert computed seams in the browser: jsdom cannot verify either pseudo-elements or border
   * geometry.
   */
  play: async ({ canvasElement }) => {
    const TRANSPARENT = 'rgba(0, 0, 0, 0)'
    const GENERATED = '""'
    const canvas = within(canvasElement)
    const segmentsOf = (name: string) =>
      within(canvas.getByRole('group', { name })).getAllByRole('button')

    const [bordered, borderedWeek] = segmentsOf('Bordered')
    await expect(getComputedStyle(borderedWeek!, '::before').content).toBe(GENERATED)
    await expect(getComputedStyle(bordered!).borderInlineEndColor).not.toBe(TRANSPARENT)

    const [day, week, month] = segmentsOf('Seamless')
    await expect(getComputedStyle(week!, '::before').content).not.toBe(GENERATED)
    await expect(getComputedStyle(day!).borderInlineEndColor).toBe(TRANSPARENT)
    await expect(getComputedStyle(month!).borderInlineStartColor).toBe(TRANSPARENT)
    await expect(getComputedStyle(day!).borderInlineStartColor).not.toBe(TRANSPARENT)
    await expect(getComputedStyle(month!).borderInlineEndColor).not.toBe(TRANSPARENT)
  },
}

export const ToneOverride: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    setup: () => ({ t }),
    template: `
      <VButtonGroup variant="outline" tone="neutral" :label="t.rowActions">
        <VButton>{{ t.rename }}</VButton>
        <VButton>{{ t.duplicate }}</VButton>
        <VButton tone="danger">{{ t.remove }}</VButton>
      </VButtonGroup>
    `,
  }),
}

export const Elevated: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    setup: () => ({ t }),
    template: `
      <VButtonGroup elevated variant="ghost" tone="neutral" :label="t.alignment">
        <VButton>{{ t.left }}</VButton>
        <VButton>{{ t.centre }}</VButton>
        <VButton>{{ t.right }}</VButton>
      </VButtonGroup>
    `,
  }),
  // Nothing of this is observable in jsdom, which lays nothing out and computes no style.
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', { name: 'Alignment' })
    await expect(getComputedStyle(group).boxShadow).not.toBe('none')

    for (const button of within(group).getAllByRole('button')) {
      await expect(getComputedStyle(button).boxShadow).toBe('none')
    }
  },
}

export const Vertical: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    setup: () => ({ t }),
    template: `
      <VButtonGroup orientation="vertical" variant="outline" tone="neutral" :label="t.navigation">
        <VButton icon-start="home">{{ t.home }}</VButton>
        <VButton icon-start="folder">{{ t.projects }}</VButton>
        <VButton icon-start="settings">{{ t.settings }}</VButton>
      </VButtonGroup>
    `,
  }),
}

export const FullWidth: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 16px; inline-size: 360px">
        <div>
          <p style="margin: 0 0 8px; font: inherit">{{ t.naturalWidth }}</p>
          <VButtonGroup variant="outline" tone="neutral" label="Natural width">
            <VButton>{{ t.day }}</VButton>
            <VButton>{{ t.week }}</VButton>
            <VButton>{{ t.month }}</VButton>
          </VButtonGroup>
        </div>
        <div>
          <p style="margin: 0 0 8px; font: inherit">{{ t.fullWidth }}</p>
          <VButtonGroup full-width variant="outline" tone="neutral" label="Full width">
            <VButton>{{ t.day }}</VButton>
            <VButton>{{ t.week }}</VButton>
            <VButton>{{ t.month }}</VButton>
          </VButtonGroup>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const natural = canvas.getByRole('group', { name: 'Natural width' })
    const full = canvas.getByRole('group', { name: 'Full width' })

    const parentWidth = full.parentElement!.getBoundingClientRect().width
    await expect(full.getBoundingClientRect().width).toBeCloseTo(parentWidth, 1)
    await expect(natural.getBoundingClientRect().width).toBeLessThan(parentWidth)

    const widths = within(full)
      .getAllByRole('button')
      .map((button) => button.getBoundingClientRect().width)
    await expect(widths).toHaveLength(3)
    await expect(widths[1]).toBeCloseTo(widths[0]! + 1, 1)
    await expect(widths[2]).toBeCloseTo(widths[0]! + 1, 1)

    await expect(widths[0]! + widths[1]! + widths[2]!).toBeGreaterThan(parentWidth)
  },
}

export const WithIconButton: Story = {
  render: () => ({
    components: { VButtonGroup, VIconButton },
    setup: () => ({ t }),
    template: `
      <VButtonGroup role="toolbar" variant="outline" tone="neutral" :label="t.formatting">
        <VIconButton :label="t.bold">
          <span style="font-weight: 700">B</span>
        </VIconButton>
        <VIconButton :label="t.italic">
          <span style="font-style: italic">I</span>
        </VIconButton>
        <VIconButton :label="t.underline">
          <span style="text-decoration: underline">U</span>
        </VIconButton>
      </VButtonGroup>
    `,
  }),
}

export const Companions: Story = {
  render: () => ({
    components: { VButtonGroup, VButton, VIconButton, VTooltip, VBadge, VMenu, VMenuItem },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 24px; inline-size: 360px">
        <VButtonGroup bordered variant="outline" tone="neutral" :label="t.rowActions">
          <VButton>{{ t.rename }}</VButton>
          <VTooltip :text="t.duplicateHint">
            <template #default="{ triggerProps }">
              <VButton v-bind="triggerProps">{{ t.duplicate }}</VButton>
            </template>
          </VTooltip>
          <VBadge :count="3" overlay>
            <VButton>{{ t.comments }}</VButton>
          </VBadge>
          <VMenu>
            <template #trigger="{ triggerProps: menuProps }">
              <VTooltip :text="t.moreHint">
                <template #default="{ triggerProps: tooltipProps }">
                  <VBadge :count="2" overlay>
                    <VIconButton
                      v-bind="{ ...menuProps, ...tooltipProps }"
                      icon="more_horiz"
                      :label="t.moreActions"
                    />
                  </VBadge>
                </template>
              </VTooltip>
            </template>
            <VMenuItem :label="t.exportCsv" />
            <VMenuItem :label="t.exportPdf" />
          </VMenu>
        </VButtonGroup>

        <VButtonGroup full-width variant="outline" tone="neutral" label="Full width">
          <VButton>{{ t.day }}</VButton>
          <VTooltip :text="t.weekHint">
            <template #default="{ triggerProps }">
              <VButton v-bind="triggerProps">{{ t.week }}</VButton>
            </template>
          </VTooltip>
          <VButton>{{ t.month }}</VButton>
        </VButtonGroup>
      </div>
    `,
  }),
  /*
   * None of this is observable in jsdom, which lays nothing out and computes no style, and each
   * assertion answers one half of the sheet's second branch: the PULL lands on the wrapper, the
   * PAINT on the button inside it. The menu is what the last two assertions are really about.
   */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const row = canvas.getByRole('group', { name: 'Row actions' })
    const [rename, duplicate, comments, more] = within(row).getAllByRole('button')
    const edges = (el: HTMLElement) => el.getBoundingClientRect()

    await expect(edges(rename!).right - edges(duplicate!).left).toBeCloseTo(1, 0)
    await expect(edges(duplicate!).right - edges(comments!).left).toBeCloseTo(1, 0)
    await expect(edges(comments!).right - edges(more!).left).toBeCloseTo(1, 0)

    await expect(getComputedStyle(duplicate!).borderStartStartRadius).toBe('0px')
    await expect(getComputedStyle(duplicate!, '::before').content).toBe('""')
    await expect(getComputedStyle(comments!).borderStartStartRadius).toBe('0px')

    /*
     * The reach is asserted first: without it the lift below would be a declaration agreeing
     * with itself.
     */
    const badge = row.querySelector('.v-badge') as HTMLElement
    await expect(badge.getBoundingClientRect().right).toBeGreaterThan(edges(more!).left)
    await expect(getComputedStyle(badge).zIndex).toBe('1')

    /*
     * The last segment carries all three at once: the menu outermost, since it renders
     * its panel as a sibling of what it wraps nothing in, then the tooltip, then the
     * badge, with the button two wrappers down. Everything asserted on it, here and
     * below, therefore travels that depth.
     */
    const stacked = more!.closest('.v-tooltip') as HTMLElement
    await expect(more!.closest('.v-badge-host')).not.toBeNull()
    await expect(stacked.parentElement).toBe(row)

    // Nothing is stretched in a plain row, so nothing overrides it; remove the guard on that
    // rule and this button collapses to the width of its glyph.
    const square = more!.getBoundingClientRect()
    await expect(square.width).toBeCloseTo(square.height, 1)
    await expect(square.width).toBeCloseTo(40, 1)

    await expect(parseFloat(getComputedStyle(rename!).borderStartStartRadius)).toBeGreaterThan(0)
    await expect(getComputedStyle(rename!).borderStartEndRadius).toBe('0px')
    await expect(parseFloat(getComputedStyle(more!).borderStartEndRadius)).toBeGreaterThan(0)
    await expect(getComputedStyle(more!).borderStartStartRadius).toBe('0px')

    /*
     * A wrapped segment takes its equal share of a full-width row like any other, and the
     * button inside fills the share the wrapper was given. The middle and last segments measure
     * a pixel more, the overlap the seam sits on.
     */
    const widths = within(canvas.getByRole('group', { name: 'Full width' }))
      .getAllByRole('button')
      .map((button) => button.getBoundingClientRect().width)
    await expect(widths).toHaveLength(3)
    await expect(widths[1]).toBeCloseTo(widths[0]! + 1, 1)
    await expect(widths[2]).toBeCloseTo(widths[0]! + 1, 1)

    // The story ends with the panel open: axe audits what is left on screen, and this is
    // the one place a menu panel is a child of a row it must not be counted a segment of.
    await userEvent.click(more!)
    await waitFor(() => expect(canvas.getByRole('menu')).toBeVisible())
  },
}

export const Sizes: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    template: `
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap">
        <VButtonGroup size="sm" variant="outline" tone="neutral" label="Small">
          <VButton v-for="l in ['A', 'B', 'C']" :key="l">{{ l }}</VButton>
        </VButtonGroup>
        <VButtonGroup size="md" variant="outline" tone="neutral" label="Medium">
          <VButton v-for="l in ['A', 'B', 'C']" :key="l">{{ l }}</VButton>
        </VButtonGroup>
        <VButtonGroup size="lg" variant="outline" tone="neutral" label="Large">
          <VButton v-for="l in ['A', 'B', 'C']" :key="l">{{ l }}</VButton>
        </VButtonGroup>
        <VButtonGroup size="lg" compact variant="outline" tone="neutral" label="Large compact">
          <VButton v-for="l in ['A', 'B', 'C']" :key="l">{{ l }}</VButton>
        </VButtonGroup>
      </div>
    `,
  }),
}

export const EdgeCases: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 16px; max-width: 420px">
        <VButtonGroup variant="outline" tone="neutral" :label="t.alone">
          <VButton>{{ t.singleButton }}</VButton>
        </VButtonGroup>
        <VButtonGroup variant="outline" tone="neutral" :label="t.longLabels">
          <VButton>{{ t.exportCsv }}</VButton>
          <VButton>{{ t.exportPdf }}</VButton>
        </VButtonGroup>
      </div>
    `,
  }),
}

export const Playground: Story = {
  args: { bordered: true },
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', { name: 'Alignment' })
    await expect(group).toHaveAttribute('data-orientation', 'horizontal')

    const buttons = within(group).getAllByRole('button')
    await expect(buttons).toHaveLength(3)

    for (const button of buttons) {
      await expect(button).toHaveAttribute('data-variant', 'outline')
      await expect(button).toHaveAttribute('data-tone', 'neutral')
    }

    // The hover half of the rule cannot be asserted here, `:hover` coming from the browser's
    // own input pipeline rather than from a synthetic pointer event.
    await userEvent.tab()
    await expect(buttons[0]).toHaveFocus()
    await expect(getComputedStyle(buttons[0]!).zIndex).toBe('1')
    await expect(getComputedStyle(buttons[1]!).zIndex).toBe('auto')

    // `content` is what proves the box is generated at all, the properties below computing just
    // as well on a pseudo-element the browser never builds.
    const seam = getComputedStyle(buttons[1]!, '::before')
    await expect(seam.content).toBe('""')
    await expect(seam.borderInlineStartStyle).toBe('solid')
    await expect(seam.borderInlineStartWidth).toBe('1px')
    await expect(seam.backgroundImage).toBe('none')
    await expect(parseFloat(seam.height)).toBeCloseTo(buttons[1]!.getBoundingClientRect().height, 1)
  },
}
