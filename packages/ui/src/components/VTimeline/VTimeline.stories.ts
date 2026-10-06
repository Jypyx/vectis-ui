import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'

import { storyText } from '../../stories/storyText'
import VAvatar from '../VAvatar/VAvatar.vue'
import VTimeline from './VTimeline.vue'
import VTimelineItem from './VTimelineItem.vue'

const t = storyText({
  en: {
    shipped: 'Order shipped',
    shippedText: 'The parcel left our warehouse in Lyon.',
    paid: 'Payment confirmed',
    paidText: 'Paid by card ending in 4242.',
    placed: 'Order placed',
    placedText: 'Three items, delivered to Paris.',
    started: 'Project started',
    startedText: 'A handful of components for an internal tool.',
    preview: 'First public preview',
    previewText: 'Published on npm with twelve components.',
    stable: 'Version 1.0',
    stableText: 'A stable API, documented in English and French.',
    current: 'Version 2.0',
    currentText: 'Design tokens, dark theme and nineteen new components.',
    deployed: 'Deployed to production',
    deployedText: 'Release 2.0.1 is live.',
    flaky: 'Tests retried',
    flakyText: 'Two browser tests passed on the second attempt.',
    failed: 'Build failed',
    failedText: 'Type error in the date input.',
    pushed: 'Commit pushed',
    pushedText: 'fix: keep the focus ring in forced colours',
    commented: 'Camille commented',
    commentedText: 'Looks good once the French catalogue is updated.',
    reviewed: 'Sam approved the changes',
    opened: 'Alex opened the pull request',
    justNow: 'Just now',
    hoursAgo: '2 hours ago',
    yesterday: 'Yesterday',
    research: 'Research',
    design: 'Design',
    build: 'Build',
    beta: 'Beta',
    launch: 'Launch',
  },
  fr: {
    shipped: 'Commande expédiée',
    shippedText: 'Le colis a quitté notre entrepôt de Lyon.',
    paid: 'Paiement confirmé',
    paidText: 'Payé par la carte se terminant par 4242.',
    placed: 'Commande passée',
    placedText: 'Trois articles, livrés à Paris.',
    started: 'Début du projet',
    startedText: 'Quelques composants pour un outil interne.',
    preview: 'Première préversion publique',
    previewText: 'Publiée sur npm avec douze composants.',
    stable: 'Version 1.0',
    stableText: 'Une API stable, documentée en anglais et en français.',
    current: 'Version 2.0',
    currentText: 'Tokens de design, thème sombre et dix-neuf nouveaux composants.',
    deployed: 'Déployé en production',
    deployedText: 'La version 2.0.1 est en ligne.',
    flaky: 'Tests relancés',
    flakyText: 'Deux tests navigateur sont passés au second essai.',
    failed: 'Échec de la construction',
    failedText: 'Erreur de type dans le champ de date.',
    pushed: 'Commit poussé',
    pushedText: 'fix: keep the focus ring in forced colours',
    commented: 'Camille a commenté',
    commentedText: 'Parfait une fois le catalogue français à jour.',
    reviewed: 'Sam a approuvé les modifications',
    opened: 'Alex a ouvert la pull request',
    justNow: 'À l’instant',
    hoursAgo: 'Il y a 2 heures',
    yesterday: 'Hier',
    research: 'Recherche',
    design: 'Conception',
    build: 'Développement',
    beta: 'Bêta',
    launch: 'Lancement',
  },
})

const ORDER = `
  <VTimelineItem datetime="2026-10-06T09:15" :title="t.shipped">{{ t.shippedText }}</VTimelineItem>
  <VTimelineItem datetime="2026-10-05T16:40" :title="t.paid">{{ t.paidText }}</VTimelineItem>
  <VTimelineItem datetime="2026-10-05T16:32" :title="t.placed">{{ t.placedText }}</VTimelineItem>
`

const HISTORY = `
  <VTimelineItem datetime="2019" :title="t.started">{{ t.startedText }}</VTimelineItem>
  <VTimelineItem datetime="2021-03" :title="t.preview">{{ t.previewText }}</VTimelineItem>
  <VTimelineItem datetime="2024-09" :title="t.stable">{{ t.stableText }}</VTimelineItem>
  <VTimelineItem datetime="2026-10" :title="t.current">{{ t.currentText }}</VTimelineItem>
`

/** The horizontal centre of an element, or of the line drawn by its border. */
const centreX = (el: Element) => {
  const box = el.getBoundingClientRect()
  return box.left + box.width / 2
}
const centreY = (el: Element) => {
  const box = el.getBoundingClientRect()
  return box.top + box.height / 2
}

const meta = {
  title: 'Components/Timeline',
  component: VTimeline,
  subcomponents: { VTimelineItem },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    layout: { control: 'inline-radio', options: ['stacked', 'split', 'alternate'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    headingLevel: { control: 'select', options: [undefined, 2, 3, 4, 5, 6] },
    locale: { control: 'text' },
  },
  args: {
    orientation: 'vertical',
    layout: 'stacked',
    size: 'md',
    headingLevel: undefined,
    locale: undefined,
  },
  render: (args) => ({
    components: { VTimeline, VTimelineItem },
    setup: () => ({ args, t }),
    template: `<VTimeline v-bind="args" style="max-width: 640px">${ORDER}</VTimeline>`,
  }),
} satisfies Meta<typeof VTimeline>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const list = canvas.getByRole('list')
    expect(list.tagName).toBe('OL')
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
    const time = list.querySelector('time')!
    expect(time).toHaveAttribute('datetime', '2026-10-06T09:15')
    expect(time.textContent?.trim()).toMatch(/^Oct 6, 2026, 9:15\sAM$/)
    // The dot is centred on the first line beside it, and the line runs through every dot.
    const items = [...list.querySelectorAll('.v-timeline-item')]
    for (const item of items) {
      const dot = item.querySelector('.v-timeline-dot')!
      const first = item.querySelector('.v-timeline-time')!
      expect(Math.abs(centreY(dot) - centreY(first))).toBeLessThanOrEqual(1)
    }
    const lines = items.slice(0, -1).map((item) => item.querySelector('.v-timeline-connector')!)
    for (const line of lines) {
      expect(line.getBoundingClientRect().height).toBeGreaterThan(0)
      expect(
        Math.abs(centreX(line) - centreX(items[0]!.querySelector('.v-timeline-dot')!)),
      ).toBeLessThanOrEqual(1)
    }
    expect(getComputedStyle(items.at(-1)!.querySelector('.v-timeline-connector')!).display).toBe(
      'none',
    )
  },
}

/** `layout="split"` puts the dates in a column of their own, across the line from the titles. */
export const Split: Story = {
  args: { layout: 'split' },
  play: async ({ canvasElement }) => {
    const item = canvasElement.querySelector('.v-timeline-item')!
    const time = item.querySelector('.v-timeline-time')!
    const dot = item.querySelector('.v-timeline-dot')!
    const title = within(item as HTMLElement).getByText('Order shipped')
    expect(time.getBoundingClientRect().right).toBeLessThanOrEqual(dot.getBoundingClientRect().left)
    expect(title.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      dot.getBoundingClientRect().right,
    )
    expect(Math.abs(centreY(time) - centreY(title))).toBeLessThanOrEqual(1)
    // Every date column ends at the same place: the column fits the longest date.
    const ends = [...canvasElement.querySelectorAll('.v-timeline-time')].map(
      (el) => el.getBoundingClientRect().right,
    )
    expect(new Set(ends.map(Math.round)).size).toBe(1)
  },
}

/**
 * `layout="alternate"` sends every other event across the line. A year and a month are written at
 * that precision.
 */
export const Alternate: Story = {
  args: { layout: 'alternate' },
  render: (args) => ({
    components: { VTimeline, VTimelineItem },
    setup: () => ({ args, t }),
    template: `<VTimeline v-bind="args" style="max-width: 720px">${HISTORY}</VTimeline>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const line = centreX(canvasElement.querySelector('.v-timeline-dot')!)
    expect(canvas.getByText('Project started').getBoundingClientRect().left).toBeGreaterThan(line)
    expect(canvas.getByText('First public preview').getBoundingClientRect().right).toBeLessThan(
      line,
    )
    expect(canvas.getByText('March 2021').getBoundingClientRect().left).toBeGreaterThan(line)
    expect(canvas.getByText('2019')).toHaveAttribute('datetime', '2019')
  },
}

/** In a narrow space, `split` and `alternate` fall back to `stacked`: the date above the title. */
export const NarrowSpace: Story = {
  args: { layout: 'alternate' },
  render: (args) => ({
    components: { VTimeline, VTimelineItem },
    setup: () => ({ args, t }),
    template: `<div style="width: 320px"><VTimeline v-bind="args">${HISTORY}</VTimeline></div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const line = centreX(canvasElement.querySelector('.v-timeline-dot')!)
    const time = canvas.getByText('March 2021')
    const title = canvas.getByText('First public preview')
    expect(title.getBoundingClientRect().left).toBeGreaterThan(line)
    expect(time.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      title.getBoundingClientRect().top,
    )
  },
}

/**
 * `orientation="horizontal"` lays the events across. When they no longer fit, the list scrolls
 * and takes keyboard focus so that the arrow keys can scroll it.
 */
export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  render: (args) => ({
    components: { VTimeline, VTimelineItem },
    setup: () => ({ args, t }),
    template: `
      <VTimeline v-bind="args" aria-label="Roadmap" style="max-width: 640px">
        <VTimelineItem datetime="2026-01" :title="t.research" tone="neutral" />
        <VTimelineItem datetime="2026-03" :title="t.design" tone="neutral" />
        <VTimelineItem datetime="2026-06" :title="t.build" icon="code" />
        <VTimelineItem datetime="2026-09" :title="t.beta" />
        <VTimelineItem datetime="2026-11" :title="t.launch" />
      </VTimeline>
    `,
  }),
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('list', { name: 'Roadmap' })
    expect(list.scrollWidth).toBeGreaterThan(list.clientWidth)
    await userEvent.tab()
    expect(list).toHaveFocus()
    // Dots and the icon badge share a row: the line runs straight across.
    const markers = [...list.querySelectorAll('.v-timeline-dot, .v-timeline-icon')]
    const rows = new Set(markers.map((el) => Math.round(centreY(el))))
    expect(rows.size).toBe(1)
    const titles = [...list.querySelectorAll('.v-timeline-title')]
    expect(new Set(titles.map((el) => Math.round(el.getBoundingClientRect().top))).size).toBe(1)
  },
}

/**
 * `tone` paints the marker and `icon` draws it in a badge. The line stays straight through dots
 * and badges. Say in words what the tone means: the marker is hidden from screen readers.
 */
export const IconsAndTones: Story = {
  render: (args) => ({
    components: { VTimeline, VTimelineItem },
    setup: () => ({ args, t }),
    template: `
      <VTimeline v-bind="args" style="max-width: 640px">
        <VTimelineItem datetime="2026-10-06T10:02" :title="t.deployed" tone="success" icon="check_circle">{{ t.deployedText }}</VTimelineItem>
        <VTimelineItem datetime="2026-10-06T09:48" :title="t.flaky" tone="warning">{{ t.flakyText }}</VTimelineItem>
        <VTimelineItem datetime="2026-10-06T09:30" :title="t.failed" tone="danger" icon="error">{{ t.failedText }}</VTimelineItem>
        <VTimelineItem datetime="2026-10-06T09:12" :title="t.pushed" tone="neutral" icon="code">
          <code>{{ t.pushedText }}</code>
        </VTimelineItem>
      </VTimeline>
    `,
  }),
  play: async ({ canvasElement }) => {
    const badge = canvasElement.querySelector('.v-timeline-icon')!
    const dot = canvasElement.querySelector('.v-timeline-dot')!
    expect(Math.abs(centreX(badge) - centreX(dot))).toBeLessThanOrEqual(1)
    expect(badge.closest('[aria-hidden="true"]')).not.toBeNull()
    // The badge is centred on the date and reaches past it: the texts keep the spacing of a dot.
    const gaps = [...canvasElement.querySelectorAll('.v-timeline-item')].map((item) => {
      const time = item.querySelector('.v-timeline-time')!.getBoundingClientRect()
      return Math.round(
        item.querySelector('.v-timeline-title')!.getBoundingClientRect().top - time.top,
      )
    })
    expect(new Set(gaps).size).toBe(1)
    expect(
      Math.abs(centreY(badge) - centreY(badge.closest('li')!.querySelector('time')!)),
    ).toBeLessThanOrEqual(1)
  },
}

/** `timeText` shows a relative date; the `<time>` keeps the exact one in `datetime`. */
export const RelativeDates: Story = {
  render: (args) => ({
    components: { VTimeline, VTimelineItem },
    setup: () => ({ args, t }),
    template: `
      <VTimeline v-bind="args" style="max-width: 640px">
        <VTimelineItem datetime="2026-10-06T11:58" :time-text="t.justNow" :title="t.commented">{{ t.commentedText }}</VTimelineItem>
        <VTimelineItem datetime="2026-10-06T10:00" :time-text="t.hoursAgo" :title="t.reviewed" />
        <VTimelineItem datetime="2026-10-05T17:20" :time-text="t.yesterday" :title="t.opened" />
      </VTimeline>
    `,
  }),
  play: async ({ canvasElement }) => {
    const time = within(canvasElement).getByText('2 hours ago')
    expect(time.tagName).toBe('TIME')
    expect(time).toHaveAttribute('datetime', '2026-10-06T10:00')
  },
}

/** The `#marker` slot replaces the dot, with an avatar for instance. */
export const CustomMarker: Story = {
  render: (args) => ({
    components: { VTimeline, VTimelineItem, VAvatar },
    setup: () => ({ args, t }),
    template: `
      <VTimeline v-bind="args" style="max-width: 640px">
        <VTimelineItem datetime="2026-10-06T11:58" :title="t.commented">
          <template #marker><VAvatar name="Camille Martin" size="sm" /></template>
          {{ t.commentedText }}
        </VTimelineItem>
        <VTimelineItem datetime="2026-10-06T10:00" :title="t.reviewed">
          <template #marker><VAvatar name="Sam Lee" size="sm" /></template>
        </VTimelineItem>
        <VTimelineItem datetime="2026-10-05T17:20" :title="t.opened" />
      </VTimeline>
    `,
  }),
}

/** `size="sm"` tightens the spacing, the markers and the content text. */
export const Small: Story = {
  args: { size: 'sm' },
  render: (args) => ({
    components: { VTimeline, VTimelineItem },
    setup: () => ({ args, t }),
    template: `
      <VTimeline v-bind="args" style="max-width: 480px">
        <VTimelineItem datetime="2026-10-06T10:02" :title="t.deployed" tone="success" icon="check_circle">{{ t.deployedText }}</VTimelineItem>
        <VTimelineItem datetime="2026-10-06T09:30" :title="t.failed" tone="danger">{{ t.failedText }}</VTimelineItem>
        <VTimelineItem datetime="2026-10-06T09:12" :title="t.pushed" tone="neutral" />
      </VTimeline>
    `,
  }),
}
