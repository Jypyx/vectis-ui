import { fireEvent, render } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import VSnackbar from './VSnackbar.vue'
import { current, dismissSnackbar, snackbar } from './state'

const getHost = (container: Element) => container.querySelector('.v-snackbar-host') as HTMLElement

describe('VSnackbar', () => {
  beforeEach(() => {
    dismissSnackbar()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('opens the container when a confirmation is raised, and closes it when it goes', async () => {
    const { container, getByText } = render(VSnackbar)
    const host = getHost(container)
    expect(host.hasAttribute('data-popover-open')).toBe(false)

    snackbar({ message: 'Message deleted' })
    await nextTick()
    expect(host.hasAttribute('data-popover-open')).toBe(true)
    expect(getByText('Message deleted')).toBeTruthy()

    dismissSnackbar()
    await nextTick()
    expect(host.hasAttribute('data-popover-open')).toBe(false)
  })

  it('announces politely by default and interrupts on the danger tone', async () => {
    const { container } = render(VSnackbar)

    snackbar({ message: 'Saved' })
    await nextTick()
    expect(container.querySelector('.v-snackbar')?.getAttribute('role')).toBe('status')

    snackbar({ message: 'Failed', tone: 'danger' })
    await nextTick()
    expect(container.querySelector('.v-snackbar')?.getAttribute('role')).toBe('alert')
  })

  it('mirrors the tone as data-tone for the CSS', async () => {
    const { container } = render(VSnackbar)
    snackbar({ message: 'Failed', tone: 'danger' })
    await nextTick()
    expect(container.querySelector('.v-snackbar')?.getAttribute('data-tone')).toBe('danger')
  })

  it("the confirmation's placement wins over the VSnackbar's prop", async () => {
    const { container } = render(VSnackbar, { props: { placement: 'bottom-left' } })
    snackbar({ message: 'A' })
    await nextTick()
    expect(getHost(container).getAttribute('data-placement')).toBe('bottom-left')

    snackbar({ message: 'B', placement: 'bottom-right' })
    await nextTick()
    expect(getHost(container).getAttribute('data-placement')).toBe('bottom-right')
  })

  it('carries NO close cross, ever', async () => {
    const { queryByRole } = render(VSnackbar)
    snackbar({ message: 'Nothing to close', duration: 0 })
    await nextTick()
    expect(queryByRole('button')).toBeNull()
  })

  it('renders no action button when the confirmation offers no action', async () => {
    const { queryByRole } = render(VSnackbar)
    snackbar({ message: 'Saved', duration: 0 })
    await nextTick()
    expect(queryByRole('button')).toBeNull()
  })

  it('names the action from the dictionary, and lets the confirmation rename it', async () => {
    const { queryByRole, getByRole } = render(VSnackbar)

    snackbar({ message: 'Deleted', duration: 0, action: () => {} })
    await nextTick()
    expect(getByRole('button', { name: 'Undo' })).toBeTruthy()

    snackbar({ message: 'Deleted', duration: 0, action: () => {}, actionLabel: 'Restore' })
    await nextTick()
    expect(getByRole('button', { name: 'Restore' })).toBeTruthy()
    expect(queryByRole('button', { name: 'Undo' })).toBeNull()
  })

  it('the actionLabel prop replaces the dictionary default', async () => {
    const { getByRole } = render(VSnackbar, { props: { actionLabel: 'Revert' } })
    snackbar({ message: 'Deleted', duration: 0, action: () => {} })
    await nextTick()
    expect(getByRole('button', { name: 'Revert' })).toBeTruthy()
  })

  it('the action runs the callback AND takes the bar away', async () => {
    const action = vi.fn()
    const { getByRole } = render(VSnackbar)
    snackbar({ message: 'Deleted', duration: 0, action })
    await nextTick()

    await fireEvent.click(getByRole('button', { name: 'Undo' }))
    expect(action).toHaveBeenCalledOnce()
    expect(current.value).toBeNull()
  })

  it('dismisses automatically after the default duration (4000 ms)', async () => {
    render(VSnackbar)
    snackbar({ message: 'Ephemeral' })
    await nextTick()

    vi.advanceTimersByTime(3999)
    await nextTick()
    expect(current.value).not.toBeNull()

    vi.advanceTimersByTime(1)
    await nextTick()
    expect(current.value).toBeNull()
  })

  it('duration: 0 makes the confirmation persistent', async () => {
    render(VSnackbar)
    snackbar({ message: 'Persistent', duration: 0 })
    await nextTick()
    vi.advanceTimersByTime(60_000)
    await nextTick()
    expect(current.value).not.toBeNull()
  })

  it("the duration prop replaces the default; the confirmation's own wins over both", async () => {
    render(VSnackbar, { props: { duration: 1000 } })

    snackbar({ message: 'Short' })
    await nextTick()
    vi.advanceTimersByTime(1000)
    await nextTick()
    expect(current.value).toBeNull()

    snackbar({ message: 'Long', duration: 3000 })
    await nextTick()
    vi.advanceTimersByTime(1000)
    await nextTick()
    expect(current.value?.message).toBe('Long')
    vi.advanceTimersByTime(2000)
    await nextTick()
    expect(current.value).toBeNull()
  })

  it("a replacement restarts the countdown — the outgoing bar's timer cannot take it away", async () => {
    render(VSnackbar)
    snackbar({ message: 'A' })
    await nextTick()

    vi.advanceTimersByTime(3900)
    snackbar({ message: 'B' })
    await nextTick()

    // The first bar's 4000 ms would fall here; the second must survive it.
    vi.advanceTimersByTime(200)
    await nextTick()
    expect(current.value?.message).toBe('B')

    vi.advanceTimersByTime(3800)
    await nextTick()
    expect(current.value).toBeNull()
  })

  it('hovering suspends the countdown, leaving re-arms it at the full duration', async () => {
    const { container } = render(VSnackbar)
    snackbar({ message: 'Hovered' })
    await nextTick()
    const host = getHost(container)

    host.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(60_000)
    await nextTick()
    expect(current.value).not.toBeNull()

    host.dispatchEvent(new Event('pointerleave'))
    vi.advanceTimersByTime(3999)
    await nextTick()
    expect(current.value).not.toBeNull()
    vi.advanceTimersByTime(1)
    await nextTick()
    expect(current.value).toBeNull()
  })

  /*
   * The half the notifications do not need: the action is a real button, so a reader
   * tabbing towards it must not watch the bar vanish from under the focus ring. Verified
   * red by removing `@focusin` from the template.
   */
  it('moving the keyboard into the bar suspends the countdown, leaving re-arms it', async () => {
    const { container } = render(VSnackbar)
    snackbar({ message: 'Focused', action: () => {} })
    await nextTick()
    const host = getHost(container)

    await fireEvent.focusIn(host)
    vi.advanceTimersByTime(60_000)
    await nextTick()
    expect(current.value).not.toBeNull()

    await fireEvent.focusOut(host)
    vi.advanceTimersByTime(4000)
    await nextTick()
    expect(current.value).toBeNull()
  })

  it('a pointer still resting on the bar keeps it after the focus leaves', async () => {
    const { container } = render(VSnackbar)
    snackbar({ message: 'Both', action: () => {} })
    await nextTick()
    const host = getHost(container)

    host.dispatchEvent(new Event('pointerenter'))
    await fireEvent.focusIn(host)
    await fireEvent.focusOut(host)

    vi.advanceTimersByTime(60_000)
    await nextTick()
    expect(current.value).not.toBeNull()
  })

  it('a confirmation raised BEFORE mounting shows up on mount (and its countdown starts)', async () => {
    snackbar({ message: 'Early' })
    const { container, getByText } = render(VSnackbar)
    await nextTick()
    expect(getHost(container).hasAttribute('data-popover-open')).toBe(true)
    expect(getByText('Early')).toBeTruthy()

    vi.advanceTimersByTime(4000)
    await nextTick()
    expect(current.value).toBeNull()
  })

  it('renders an icon only when one is asked for', async () => {
    const { container } = render(VSnackbar)

    snackbar({ message: 'No icon', duration: 0 })
    await nextTick()
    expect(container.querySelector('.v-snackbar-icon')).toBeNull()

    snackbar({ message: 'With icon', duration: 0, icon: 'delete' })
    await nextTick()
    expect((container.querySelector('.v-snackbar-icon') as HTMLElement).dataset.icon).toBe('delete')
  })

  it('sets role="region" and the accessible label on the container', () => {
    const { container } = render(VSnackbar, { props: { label: 'Confirmations' } })
    const host = getHost(container)
    expect(host.getAttribute('role')).toBe('region')
    expect(host.getAttribute('aria-label')).toBe('Confirmations')
  })
})
