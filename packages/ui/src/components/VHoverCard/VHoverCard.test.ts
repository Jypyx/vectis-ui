import { render } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import VHoverCard from './VHoverCard.vue'

function renderHarness(template: string, bindings: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { VHoverCard },
    setup: () => bindings,
    template,
  })
  return render(Harness)
}

const basic = (attrs = '') => `
  <VHoverCard ${attrs}>
    <template #default="{ triggerProps }">
      <a href="/users/ada" data-testid="trigger" v-bind="triggerProps">@ada</a>
    </template>
    <template #content>
      <p>Ada Lovelace</p>
      <button type="button">Follow</button>
    </template>
  </VHoverCard>
`

function setup(attrs = '', bindings: Record<string, unknown> = {}) {
  const utils = renderHarness(basic(attrs), bindings)
  const root = utils.container.querySelector('.v-hover-card') as HTMLElement
  const panel = utils.container.querySelector('.v-hover-card-panel') as HTMLElement
  const trigger = utils.getByTestId('trigger')
  const isOpen = () => panel.hasAttribute('data-popover-open')
  return { ...utils, root, panel, trigger, isOpen }
}

function pointer(type: string, pointerType = 'mouse') {
  const event = new Event(type, { bubbles: type === 'pointerdown' })
  return Object.assign(event, { pointerType })
}

// The keyboard branch is chosen by hand (see utils/focus): what this locks is that the
// component asks `:focus-visible`, never jsdom's answer to it.
function keyboardFocus(el: HTMLElement) {
  vi.spyOn(el, 'matches').mockImplementation((selector) => selector === ':focus-visible')
  el.focus()
}

describe('VHoverCard', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('links the trigger to the card through aria-details, in a manual popover', () => {
    const { trigger, panel } = setup()
    expect(trigger.getAttribute('aria-details')).toBe(panel.id)
    expect(panel.getAttribute('popover')).toBe('manual')
    expect(panel.dataset.placement).toBe('bottom')
    expect(panel.classList.contains('v-panel')).toBe(true)
  })

  it('renders a phrasing-only card, its content mounted on first opening and kept', async () => {
    const { root, panel, queryByText, isOpen } = setup(':open-delay="0" :close-delay="0"')
    expect(panel.tagName).toBe('SPAN')
    expect(queryByText('Ada Lovelace')).toBeNull()

    root.dispatchEvent(pointer('pointerenter'))
    await nextTick()
    expect(queryByText('Ada Lovelace')).not.toBeNull()

    root.dispatchEvent(pointer('pointerleave'))
    await nextTick()
    expect(isOpen()).toBe(false)
    expect(queryByText('Ada Lovelace')).not.toBeNull()
  })

  it('opens on hover after openDelay, not before', () => {
    const { root, isOpen } = setup()
    root.dispatchEvent(pointer('pointerenter'))
    vi.advanceTimersByTime(450)
    expect(isOpen()).toBe(false)
    vi.advanceTimersByTime(100)
    expect(isOpen()).toBe(true)
  })

  it('closes closeDelay after the pointer leaves, and stays when it comes back in time', () => {
    const { root, isOpen } = setup()
    root.dispatchEvent(pointer('pointerenter'))
    vi.advanceTimersByTime(500)
    expect(isOpen()).toBe(true)

    // Crossing the gap to the card: leave, then enter again through the card
    root.dispatchEvent(pointer('pointerleave'))
    vi.advanceTimersByTime(200)
    root.dispatchEvent(pointer('pointerenter'))
    vi.advanceTimersByTime(500)
    expect(isOpen()).toBe(true)

    root.dispatchEvent(pointer('pointerleave'))
    vi.advanceTimersByTime(250)
    expect(isOpen()).toBe(true)
    vi.advanceTimersByTime(100)
    expect(isOpen()).toBe(false)
  })

  it('honours custom delays', () => {
    const { root, isOpen } = setup(':open-delay="100" :close-delay="50"')
    root.dispatchEvent(pointer('pointerenter'))
    vi.advanceTimersByTime(100)
    expect(isOpen()).toBe(true)
    root.dispatchEvent(pointer('pointerleave'))
    vi.advanceTimersByTime(50)
    expect(isOpen()).toBe(false)
  })

  it('cancels a pending opening when the pointer leaves first', () => {
    const { root, isOpen } = setup()
    root.dispatchEvent(pointer('pointerenter'))
    root.dispatchEvent(pointer('pointerleave'))
    vi.advanceTimersByTime(1000)
    expect(isOpen()).toBe(false)
  })

  it('ignores touch pointers', () => {
    const { root, isOpen } = setup()
    root.dispatchEvent(pointer('pointerenter', 'touch'))
    vi.advanceTimersByTime(1000)
    expect(isOpen()).toBe(false)
  })

  it('opens on keyboard focus after openDelay and closes when the focus leaves', () => {
    const { trigger, isOpen } = setup()
    keyboardFocus(trigger)
    vi.advanceTimersByTime(499)
    expect(isOpen()).toBe(false)
    vi.advanceTimersByTime(1)
    expect(isOpen()).toBe(true)

    trigger.blur()
    expect(isOpen()).toBe(false)
  })

  it('ignores a focus the keyboard did not give', () => {
    const { trigger, isOpen } = setup()
    vi.spyOn(trigger, 'matches').mockReturnValue(false)
    trigger.focus()
    vi.advanceTimersByTime(1000)
    expect(isOpen()).toBe(false)
  })

  it('stays open while the focus moves into the card or the pointer leaves', async () => {
    const { trigger, root, getByRole, isOpen } = setup()
    keyboardFocus(trigger)
    vi.advanceTimersByTime(500)
    await nextTick()
    getByRole('button', { name: 'Follow' }).focus()
    root.dispatchEvent(pointer('pointerleave'))
    vi.advanceTimersByTime(1000)
    expect(isOpen()).toBe(true)
  })

  it('Escape closes from anywhere, spends the key and returns the focus to the trigger', async () => {
    const { trigger, getByRole, isOpen } = setup()
    keyboardFocus(trigger)
    vi.advanceTimersByTime(500)
    await nextTick()
    const follow = getByRole('button', { name: 'Follow' })
    follow.focus()

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    follow.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(isOpen()).toBe(false)
    expect(document.activeElement).toBe(trigger)

    // The focus handed back does not reopen the card
    vi.advanceTimersByTime(1000)
    expect(isOpen()).toBe(false)
  })

  it('leaves Escape alone when closed or already handled', () => {
    setup()
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    document.body.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
  })

  it('pressing the trigger closes the card; pressing inside the card keeps it', async () => {
    const { root, trigger, getByRole, isOpen } = setup(':open-delay="0"')
    root.dispatchEvent(pointer('pointerenter'))
    expect(isOpen()).toBe(true)
    await nextTick()

    getByRole('button', { name: 'Follow' }).dispatchEvent(pointer('pointerdown'))
    expect(isOpen()).toBe(true)

    trigger.dispatchEvent(pointer('pointerdown'))
    expect(isOpen()).toBe(false)
  })

  it('v-model:open opens and closes without delay, and reports hover openings', async () => {
    const open = ref(false)
    const { root, isOpen } = setup('v-model:open="open"', { open })
    open.value = true
    await nextTick()
    expect(isOpen()).toBe(true)

    open.value = false
    await nextTick()
    expect(isOpen()).toBe(false)

    root.dispatchEvent(pointer('pointerenter'))
    vi.advanceTimersByTime(500)
    expect(open.value).toBe(true)
  })

  it('a model closing the card hands a focus inside it back to the trigger', async () => {
    const open = ref(true)
    const { trigger, getByRole, isOpen } = setup('v-model:open="open"', { open })
    await nextTick()
    expect(isOpen()).toBe(true)
    getByRole('button', { name: 'Follow' }).focus()
    open.value = false
    await nextTick()
    expect(document.activeElement).toBe(trigger)
  })

  it('exposes show, close and el', async () => {
    const card = ref<InstanceType<typeof VHoverCard> | null>(null)
    const { panel, isOpen } = setup('ref="card"', { card })
    card.value!.show()
    expect(isOpen()).toBe(true)
    card.value!.close()
    expect(isOpen()).toBe(false)
    expect(card.value!.el).toBe(panel)
  })

  it('reflects placement and falls attributes through to the wrapper', () => {
    const { root, panel } = setup('placement="right-start" class="extra" data-x="1"')
    expect(panel.dataset.placement).toBe('right-start')
    expect(root.classList.contains('extra')).toBe(true)
    expect(root.dataset.x).toBe('1')
  })
})
