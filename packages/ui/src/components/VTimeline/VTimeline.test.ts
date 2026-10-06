import { render } from '@testing-library/vue'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'

import { check } from '../VIcon/icons/check'
import { setLocale } from '../../i18n/state'
import VTimeline from './VTimeline.vue'
import VTimelineItem from './VTimelineItem.vue'
import { formatTimelineDate } from './datetime'

function renderHarness(template: string, bindings: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { VTimeline, VTimelineItem },
    setup: () => bindings,
    template,
  })
  return render(Harness)
}

afterEach(() => setLocale('en-US'))

describe('formatTimelineDate', () => {
  it('writes each precision out at that precision', () => {
    expect(formatTimelineDate('2019', 'en-US')).toBe('2019')
    expect(formatTimelineDate('2026-10', 'en-US')).toBe('October 2026')
    expect(formatTimelineDate('2026-10-06', 'en-US')).toBe('Oct 6, 2026')
    expect(formatTimelineDate('2026-10-06T14:30', 'en-US')).toMatch(/^Oct 6, 2026, 2:30\sPM$/)
  })

  it('reads a day at local time, never a day off', () => {
    expect(formatTimelineDate('2026-01-01', 'fr-FR')).toBe('1 janv. 2026')
  })

  it('options replace the format of days and moments, not of years and months', () => {
    const options: Intl.DateTimeFormatOptions = { dateStyle: 'full' }
    expect(formatTimelineDate('2026-10-06', 'en-US', options)).toBe('Tuesday, October 6, 2026')
    expect(formatTimelineDate('2026-10', 'en-US', options)).toBe('October 2026')
    expect(
      formatTimelineDate('2026-10-06T14:30Z', 'en-US', { timeStyle: 'short', timeZone: 'UTC' }),
    ).toMatch(/^2:30\sPM$/)
  })

  it('shows a value it cannot read as it is', () => {
    expect(formatTimelineDate('2026-13', 'en-US')).toBe('2026-13')
    expect(formatTimelineDate('2026-02-30', 'en-US')).toBe('2026-02-30')
    expect(formatTimelineDate('last week', 'en-US')).toBe('last week')
  })
})

describe('VTimeline', () => {
  it('renders an ordered list of events with their date, title and content', () => {
    const { container, getByRole, getByText } = renderHarness(`
      <VTimeline>
        <VTimelineItem datetime="2026-10-06" title="Order shipped">Left the warehouse.</VTimelineItem>
        <VTimelineItem datetime="2026-10-04" title="Order placed" />
      </VTimeline>
    `)
    const list = getByRole('list')
    expect(list.tagName).toBe('OL')
    expect(list.querySelectorAll(':scope > li')).toHaveLength(2)
    const time = container.querySelector('time')!
    expect(time.getAttribute('datetime')).toBe('2026-10-06')
    expect(time.textContent?.trim()).toBe('Oct 6, 2026')
    expect(getByText('Order shipped').tagName).toBe('P')
    expect(getByText('Left the warehouse.')).toBeTruthy()
  })

  it('leaves out the parts an event is not given', () => {
    const { container } = renderHarness('<VTimeline><VTimelineItem title="Created" /></VTimeline>')
    const item = container.querySelector('.v-timeline-item')!
    expect(item.querySelector('.v-timeline-time')).toBeNull()
    expect(item.querySelector('.v-timeline-content')).toBeNull()
    expect(item.querySelector('.v-timeline-dot')).not.toBeNull()
  })

  it('timeText replaces the visible date and keeps the machine one', () => {
    const { container } = renderHarness(`
      <VTimeline>
        <VTimelineItem datetime="2026-10-06T12:00" time-text="2 hours ago" title="Comment" />
        <VTimelineItem time-text="Long ago" title="Founded" />
      </VTimeline>
    `)
    const [first, second] = container.querySelectorAll('.v-timeline-time')
    expect(first?.tagName).toBe('TIME')
    expect(first?.getAttribute('datetime')).toBe('2026-10-06T12:00')
    expect(first?.textContent?.trim()).toBe('2 hours ago')
    // Without a machine-readable date, the text is not a <time>.
    expect(second?.tagName).toBe('SPAN')
    expect(second?.hasAttribute('datetime')).toBe(false)
  })

  it('writes dates in the locale of the timeline, or the design system locale', async () => {
    setLocale('fr-FR')
    const { container, rerender } = render(VTimeline, {
      props: { locale: undefined },
      slots: { default: () => [h(VTimelineItem, { datetime: '2026-10' })] },
    })
    expect(container.querySelector('time')?.textContent?.trim()).toBe('octobre 2026')
    await rerender({ locale: 'de-DE' })
    expect(container.querySelector('time')?.textContent?.trim()).toBe('Oktober 2026')
  })

  it('formatOptions changes how days are written', () => {
    const { container } = renderHarness(
      `<VTimeline :format-options="options"><VTimelineItem datetime="2026-10-06" /></VTimeline>`,
      { options: { day: 'numeric', month: 'short' } },
    )
    expect(container.querySelector('time')?.textContent?.trim()).toBe('Oct 6')
  })

  it('headingLevel renders the titles as headings', () => {
    const { getByRole } = renderHarness(`
      <VTimeline :heading-level="3"><VTimelineItem title="Released" /></VTimeline>
    `)
    expect(getByRole('heading', { level: 3, name: 'Released' })).toBeTruthy()
  })

  it('the #title slot replaces the title', () => {
    const { getByRole } = renderHarness(`
      <VTimeline>
        <VTimelineItem><template #title><a href="#pr">Pull request merged</a></template></VTimelineItem>
      </VTimeline>
    `)
    expect(
      getByRole('link', { name: 'Pull request merged' }).closest('.v-timeline-title'),
    ).toBeTruthy()
  })

  it('hides the marker from assistive technology, an icon drawn in a badge', () => {
    const { container } = renderHarness(
      `<VTimeline><VTimelineItem title="Done" :icon="check" tone="success" /></VTimeline>`,
      { check },
    )
    const item = container.querySelector('.v-timeline-item')!
    expect(item.getAttribute('data-tone')).toBe('success')
    expect(item.getAttribute('data-marker')).toBe('icon')
    const marker = item.querySelector('.v-timeline-marker')!
    expect(marker.getAttribute('aria-hidden')).toBe('true')
    expect(marker.querySelector('.v-timeline-icon svg')).not.toBeNull()
    expect(item.querySelector('.v-timeline-connector')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('the #marker slot replaces the dot and the icon', () => {
    const { container } = renderHarness(`
      <VTimeline>
        <VTimelineItem title="Reviewed" icon="check"><template #marker><img alt="" src="data:," /></template></VTimelineItem>
      </VTimeline>
    `)
    const item = container.querySelector('.v-timeline-item')!
    expect(item.getAttribute('data-marker')).toBe('custom')
    expect(item.querySelector('.v-timeline-marker img')).not.toBeNull()
    expect(item.querySelector('.v-timeline-icon, .v-timeline-dot')).toBeNull()
  })

  it('marks its layout on the wrapper and on each event', () => {
    const { container } = renderHarness(`
      <VTimeline layout="alternate" size="sm"><VTimelineItem title="One" /></VTimeline>
    `)
    const root = container.querySelector('.v-timeline')!
    expect(root.getAttribute('data-orientation')).toBe('vertical')
    expect(root.getAttribute('data-layout')).toBe('alternate')
    expect(root.getAttribute('data-size')).toBe('sm')
    const item = container.querySelector('.v-timeline-item')!
    expect(item.getAttribute('data-layout')).toBe('alternate')
    expect(container.querySelector('ol')?.hasAttribute('tabindex')).toBe(false)
  })

  it('a horizontal timeline drops the layout and makes its scrolling list focusable', () => {
    const { container } = renderHarness(`
      <VTimeline orientation="horizontal" layout="alternate"><VTimelineItem title="One" /></VTimeline>
    `)
    const root = container.querySelector('.v-timeline')!
    expect(root.getAttribute('data-orientation')).toBe('horizontal')
    expect(root.hasAttribute('data-layout')).toBe(false)
    expect(container.querySelector('ol')?.getAttribute('tabindex')).toBe('0')
    expect(container.querySelector('.v-timeline-item')?.getAttribute('data-orientation')).toBe(
      'horizontal',
    )
  })

  it('keeps class and style on the wrapper and forwards other attributes to the list', () => {
    const { container, getByRole } = renderHarness(`
      <VTimeline class="history" style="max-width: 30rem" aria-label="Order history" tabindex="-1">
        <VTimelineItem title="One" />
      </VTimeline>
    `)
    const root = container.querySelector('.v-timeline') as HTMLElement
    expect(root.classList.contains('history')).toBe(true)
    expect(root.style.maxWidth).toBe('30rem')
    expect(root.hasAttribute('aria-label')).toBe(false)
    const list = getByRole('list', { name: 'Order history' })
    expect(list.classList.contains('history')).toBe(false)
    expect(list.getAttribute('tabindex')).toBe('-1')
  })

  it('an event outside a timeline renders as a stacked vertical event', () => {
    const { container } = render(VTimelineItem, { props: { title: 'Alone', datetime: '2019' } })
    const item = container.querySelector('.v-timeline-item')!
    expect(item.getAttribute('data-orientation')).toBe('vertical')
    expect(item.getAttribute('data-layout')).toBe('stacked')
    expect(item.querySelector('time')?.textContent?.trim()).toBe('2019')
  })
})
