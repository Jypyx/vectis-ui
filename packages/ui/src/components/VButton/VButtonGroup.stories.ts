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
    lined: 'Lined',
    seamless: 'Seamless',
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
    lined: 'Avec traits',
    seamless: 'Sans traits',
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
    seamless: false,
    fullWidth: false,
    variant: 'outline',
    tone: 'neutral',
  },
  // The buttons carry none of the appearance props: the group does, which is what the
  // controls above drive.
  render: (args) => ({
    components: { VButtonGroup, VButton },
    setup: () => ({ args, t }),
    template: `
      <VButtonGroup v-bind="args" :aria-label="t.alignment">
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
    // One variant per row, named once on the group.
    template: `
      <div style="display: grid; gap: 16px">
        <VButtonGroup variant="solid" aria-label="Solid">
          <VButton>{{ t.day }}</VButton>
          <VButton>{{ t.week }}</VButton>
          <VButton>{{ t.month }}</VButton>
        </VButtonGroup>
        <VButtonGroup variant="outline" tone="neutral" aria-label="Outline">
          <VButton>{{ t.day }}</VButton>
          <VButton>{{ t.week }}</VButton>
          <VButton>{{ t.month }}</VButton>
        </VButtonGroup>
        <VButtonGroup variant="soft" aria-label="Tonal">
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
    // The same row twice: joined, then simply spaced. Detached, each button keeps its own
    // corners and its own borders, and the group is left holding the gap alone.
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <VButtonGroup variant="outline" tone="neutral" :aria-label="t.joined">
          <VButton>{{ t.day }}</VButton>
          <VButton>{{ t.week }}</VButton>
          <VButton>{{ t.month }}</VButton>
        </VButtonGroup>
        <VButtonGroup detached variant="outline" tone="neutral" :aria-label="t.detached">
          <VButton>{{ t.day }}</VButton>
          <VButton>{{ t.week }}</VButton>
          <VButton>{{ t.month }}</VButton>
        </VButtonGroup>
      </div>
    `,
  }),
}

export const Seamless: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 16px; justify-items: start">
        <VButtonGroup variant="outline" tone="neutral" :aria-label="t.lined">
          <VButton>{{ t.day }}</VButton>
          <VButton>{{ t.week }}</VButton>
          <VButton>{{ t.month }}</VButton>
        </VButtonGroup>
        <VButtonGroup seamless variant="outline" tone="neutral" :aria-label="t.seamless">
          <VButton>{{ t.day }}</VButton>
          <VButton>{{ t.week }}</VButton>
          <VButton>{{ t.month }}</VButton>
        </VButtonGroup>
      </div>
    `,
  }),
  /*
   * Two things make a row seamless, and both are asserted: the seam is not generated at
   * all, and NEITHER side of a shared edge is painted, while the outer edges stay. jsdom
   * lays nothing out and computes no style, so this is the only place the rules are
   * reachable.
   *
   * The seam is read as the `content` of the pseudo-element: `""` when it is generated,
   * and whatever the initial value is when the rule never matched — which is the point,
   * so the assertion is written against the generated form rather than against `none`.
   */
  play: async ({ canvasElement }) => {
    const TRANSPARENT = 'rgba(0, 0, 0, 0)'
    const GENERATED = '""'
    const canvas = within(canvasElement)
    const segmentsOf = (name: string) =>
      within(canvas.getByRole('group', { name })).getAllByRole('button')

    const [lined, linedWeek] = segmentsOf('Lined')
    await expect(getComputedStyle(linedWeek!, '::before').content).toBe(GENERATED)
    await expect(getComputedStyle(lined!).borderInlineEndColor).not.toBe(TRANSPARENT)

    const [day, week, month] = segmentsOf('Seamless')
    await expect(getComputedStyle(week!, '::before').content).not.toBe(GENERATED)
    await expect(getComputedStyle(day!).borderInlineEndColor).toBe(TRANSPARENT)
    await expect(getComputedStyle(month!).borderInlineStartColor).toBe(TRANSPARENT)
    // The outer edges are untouched: what goes is the shared ones, and only those.
    await expect(getComputedStyle(day!).borderInlineStartColor).not.toBe(TRANSPARENT)
    await expect(getComputedStyle(month!).borderInlineEndColor).not.toBe(TRANSPARENT)
  },
}

export const ToneOverride: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    setup: () => ({ t }),
    // The tone is the one prop a segment keeps against its group: the row is neutral,
    // the destructive action says so.
    template: `
      <VButtonGroup variant="outline" tone="neutral" :aria-label="t.rowActions">
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
      <VButtonGroup elevated variant="ghost" tone="neutral" :aria-label="t.alignment">
        <VButton>{{ t.left }}</VButton>
        <VButton>{{ t.centre }}</VButton>
        <VButton>{{ t.right }}</VButton>
      </VButtonGroup>
    `,
  }),
  // The shadow is the ROW's: three per-segment shadows would each paint one onto the
  // neighbour they overlap and fill the joints with a dark band. Nothing of this is
  // observable in jsdom, which lays nothing out and computes no style.
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
      <VButtonGroup orientation="vertical" variant="outline" tone="neutral" :aria-label="t.navigation">
        <VButton icon-start="home">{{ t.home }}</VButton>
        <VButton icon-start="folder">{{ t.projects }}</VButton>
        <VButton icon-start="settings">{{ t.settings }}</VButton>
      </VButtonGroup>
    `,
  }),
}

/* The same row twice in one 360px column: as wide as its labels, then filling the
   column with the three segments sharing that width equally. */
export const FullWidth: Story = {
  render: () => ({
    components: { VButtonGroup, VButton },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 16px; inline-size: 360px">
        <div>
          <p style="margin: 0 0 8px; font: inherit">{{ t.naturalWidth }}</p>
          <VButtonGroup variant="outline" tone="neutral" aria-label="Natural width">
            <VButton>{{ t.day }}</VButton>
            <VButton>{{ t.week }}</VButton>
            <VButton>{{ t.month }}</VButton>
          </VButtonGroup>
        </div>
        <div>
          <p style="margin: 0 0 8px; font: inherit">{{ t.fullWidth }}</p>
          <VButtonGroup full-width variant="outline" tone="neutral" aria-label="Full width">
            <VButton>{{ t.day }}</VButton>
            <VButton>{{ t.week }}</VButton>
            <VButton>{{ t.month }}</VButton>
          </VButtonGroup>
        </div>
      </div>
    `,
  }),
  // Neither half is observable in jsdom, which lays nothing out: the row filling its
  // parent and the segments sharing that width are measured here or nowhere.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const natural = canvas.getByRole('group', { name: 'Natural width' })
    const full = canvas.getByRole('group', { name: 'Full width' })

    const parentWidth = full.parentElement!.getBoundingClientRect().width
    await expect(full.getBoundingClientRect().width).toBeCloseTo(parentWidth, 1)
    await expect(natural.getBoundingClientRect().width).toBeLessThan(parentWidth)

    // Equal shares, which is what a `1fr` track buys over the free space alone: the three
    // labels are of different lengths, and the segments are not. The two carrying the
    // negative margin measure exactly one pixel more, and that pixel is the overlap the
    // seam is laid over: it is the whole difference between them.
    const widths = within(full)
      .getAllByRole('button')
      .map((button) => button.getBoundingClientRect().width)
    await expect(widths).toHaveLength(3)
    await expect(widths[1]).toBeCloseTo(widths[0]! + 1, 1)
    await expect(widths[2]).toBeCloseTo(widths[0]! + 1, 1)

    // Nothing of the joining is given up: the segments still overlap by the pixel the
    // seam is laid over, so the three of them measure more than the row they fill.
    await expect(widths[0]! + widths[1]! + widths[2]!).toBeGreaterThan(parentWidth)
  },
}

export const WithIconButton: Story = {
  render: () => ({
    components: { VButtonGroup, VIconButton },
    setup: () => ({ t }),
    // role="toolbar" (overriding the default role): a text-formatting toolbar. The icon
    // buttons take the group's appearance the same way a VButton does.
    template: `
      <VButtonGroup role="toolbar" variant="outline" tone="neutral" :aria-label="t.formatting">
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

/* A segment is not always the button: a VTooltip, a VPopover and a VBadge each put a
   wrapper around what they are attached to, and a VMenu renders its panel as a sibling of
   its trigger. The row is drawn through both shapes, so a tooltip, a badge and a menu can
   be dropped into it without it coming apart. */
export const Companions: Story = {
  render: () => ({
    components: { VButtonGroup, VButton, VIconButton, VTooltip, VBadge, VMenu, VMenuItem },
    setup: () => ({ t }),
    template: `
      <div style="display: grid; gap: 24px; inline-size: 360px">
        <VButtonGroup variant="outline" tone="neutral" :aria-label="t.rowActions">
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
            <template #trigger="{ triggerProps }">
              <VIconButton v-bind="triggerProps" icon="more_horiz" :label="t.moreActions" />
            </template>
            <VMenuItem :label="t.exportCsv" />
            <VMenuItem :label="t.exportPdf" />
          </VMenu>
        </VButtonGroup>

        <VButtonGroup full-width variant="outline" tone="neutral" aria-label="Full width">
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
   * None of this is observable in jsdom, which lays nothing out and computes no style,
   * and each assertion answers one half of the sheet's second branch: the PULL lands on
   * the wrapper, the PAINT on the button inside it.
   *
   * The menu is what the last two assertions are really about. Its panel is a sibling of
   * its trigger, so the trigger is not the group's `:last-child`, and a row reading its
   * end that way would drop the outer corner there with nothing to say why.
   */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const row = canvas.getByRole('group', { name: 'Row actions' })
    const [rename, duplicate, comments, more] = within(row).getAllByRole('button')
    const edges = (el: HTMLElement) => el.getBoundingClientRect()

    // Every segment is pulled onto its neighbour by the pixel the seam is laid over,
    // wrapper or no wrapper: the negative margin is on the flex item the group lays out.
    await expect(edges(rename!).right - edges(duplicate!).left).toBeCloseTo(1, 0)
    await expect(edges(duplicate!).right - edges(comments!).left).toBeCloseTo(1, 0)
    await expect(edges(comments!).right - edges(more!).left).toBeCloseTo(1, 0)

    // The corners and the seam are painted on the BUTTON, one level down.
    await expect(getComputedStyle(duplicate!).borderStartStartRadius).toBe('0px')
    await expect(getComputedStyle(duplicate!, '::before').content).toBe('""')
    await expect(getComputedStyle(comments!).borderStartStartRadius).toBe('0px')

    /*
     * An overlaid badge leans out of its own segment and onto the next one, which is the
     * whole of its placement — and every segment here is positioned, so with the badge
     * left at `z-index: auto` the neighbour, painted later in tree order, would draw its
     * borders straight over it. The reach is asserted first: without it the lift below
     * would be a declaration agreeing with itself.
     */
    const badge = row.querySelector('.v-badge') as HTMLElement
    await expect(badge.getBoundingClientRect().right).toBeGreaterThan(edges(more!).left)
    await expect(getComputedStyle(badge).zIndex).toBe('1')

    // The two ends of the row keep their outer corners, and give up their inner ones.
    await expect(parseFloat(getComputedStyle(rename!).borderStartStartRadius)).toBeGreaterThan(0)
    await expect(getComputedStyle(rename!).borderStartEndRadius).toBe('0px')
    await expect(parseFloat(getComputedStyle(more!).borderStartEndRadius)).toBeGreaterThan(0)
    await expect(getComputedStyle(more!).borderStartStartRadius).toBe('0px')

    /*
     * A wrapped segment takes its equal share of a full-width row like any other, and the
     * button inside fills the share the wrapper was given. This is the assertion the row
     * is shared out in TRACKS for: a flex basis is shared over content boxes, so the
     * wrapped segment came out one button's worth of padding narrower than its
     * neighbours, 34px on this row, which is what makes the two cases comparable at all.
     * The middle and last segments measure a pixel more, the overlap the seam sits on.
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
    // The size is a property of the row, so it is named once, on the group.
    template: `
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap">
        <VButtonGroup size="sm" variant="outline" tone="neutral" aria-label="Small">
          <VButton v-for="l in ['A', 'B', 'C']" :key="l">{{ l }}</VButton>
        </VButtonGroup>
        <VButtonGroup size="md" variant="outline" tone="neutral" aria-label="Medium">
          <VButton v-for="l in ['A', 'B', 'C']" :key="l">{{ l }}</VButton>
        </VButtonGroup>
        <VButtonGroup size="lg" variant="outline" tone="neutral" aria-label="Large">
          <VButton v-for="l in ['A', 'B', 'C']" :key="l">{{ l }}</VButton>
        </VButtonGroup>
        <VButtonGroup size="lg" compact variant="outline" tone="neutral" aria-label="Large compact">
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
        <VButtonGroup variant="outline" tone="neutral" :aria-label="t.alone">
          <VButton>{{ t.singleButton }}</VButton>
        </VButtonGroup>
        <VButtonGroup variant="outline" tone="neutral" :aria-label="t.longLabels">
          <VButton>{{ t.exportCsv }}</VButton>
          <VButton>{{ t.exportPdf }}</VButton>
        </VButtonGroup>
      </div>
    `,
  }),
}

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', { name: 'Alignment' })
    await expect(group).toHaveAttribute('data-orientation', 'horizontal')

    const buttons = within(group).getAllByRole('button')
    await expect(buttons).toHaveLength(3)

    // The buttons are given nothing: what they render is what the group decided.
    for (const button of buttons) {
      await expect(button).toHaveAttribute('data-variant', 'outline')
      await expect(button).toHaveAttribute('data-tone', 'neutral')
    }

    // A focused segment rises for its ring, and it is the only state that does: a raised
    // segment paints over the one pixel its neighbour overlaps it by, and that pixel is
    // the seam. The hover half of the rule cannot be asserted here, `:hover` coming
    // from the browser's own input pipeline rather than from a synthetic pointer event.
    await userEvent.tab()
    await expect(buttons[0]).toHaveFocus()
    await expect(getComputedStyle(buttons[0]!).zIndex).toBe('1')
    await expect(getComputedStyle(buttons[1]!).zIndex).toBe('auto')

    // The seam is a 1px BORDER on a box of its own, and it runs the WHOLE length of the
    // segment: the neighbour's own border would be mitred where it meets the transparent
    // top and bottom ones and end in a notch, and a background would be forced to Canvas
    // under Windows forced-colors, taking the separation away. `content` is what proves
    // the box is generated at all, the properties below computing just as well on a
    // pseudo-element the browser never builds.
    const seam = getComputedStyle(buttons[1]!, '::before')
    await expect(seam.content).toBe('""')
    await expect(seam.borderInlineStartStyle).toBe('solid')
    await expect(seam.borderInlineStartWidth).toBe('1px')
    await expect(seam.backgroundImage).toBe('none')
    await expect(parseFloat(seam.height)).toBeCloseTo(buttons[1]!.getBoundingClientRect().height, 1)
  },
}
