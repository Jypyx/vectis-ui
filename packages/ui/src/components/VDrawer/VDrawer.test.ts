import { render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'

import VDrawer from './VDrawer.vue'

/** Logic only (jsdom + the showModal/close and getAnimations stubs, see vitest.setup.ts). */
async function flush() {
  await nextTick()
  await new Promise((r) => setTimeout(r))
  await nextTick()
}

function renderHarness(props: Record<string, unknown> = {}, slots = '') {
  const open = ref((props.open as boolean) ?? false)
  const Harness = defineComponent({
    components: { VDrawer },
    setup: () => ({ open, props }),
    template: `
      <VDrawer v-model:open="open" v-bind="props">
        <template #trigger="{ triggerProps }">
          <button data-testid="trigger" v-bind="triggerProps">Open</button>
        </template>
        Content of the drawer.
        ${slots}
      </VDrawer>
    `,
  })
  const utils = render(Harness)
  const getDrawer = () => utils.container.querySelector('.v-drawer') as HTMLDialogElement | null
  return { open, getDrawer, ...utils }
}

async function openHarness(props: Record<string, unknown> = {}, slots = '') {
  const h = renderHarness(props, slots)
  h.open.value = true
  await flush()
  return { ...h, drawer: h.getDrawer() as HTMLDialogElement }
}

/** An exit transition the test ends by hand, as the browser would once it has played. */
function holdExit() {
  let finish = () => {}
  const finished = new Promise<void>((resolve) => (finish = resolve))
  const spy = vi
    .spyOn(Element.prototype, 'getAnimations')
    .mockReturnValue([{ finished } as unknown as Animation])
  return { finish, spy }
}

afterEach(() => vi.restoreAllMocks())

describe('VDrawer', () => {
  it('the trigger opens the drawer and synchronizes the v-model', async () => {
    const { open, getDrawer, getByTestId } = renderHarness()
    expect(getDrawer()).toBeNull()
    expect(getByTestId('trigger').getAttribute('aria-haspopup')).toBe('dialog')
    getByTestId('trigger').click()
    await flush()
    expect(getDrawer()?.open).toBe(true)
    expect(open.value).toBe(true)
  })

  it('names and describes itself from title and subtitle', async () => {
    const { drawer } = await openHarness({ title: 'Filters', subtitle: 'Narrow the results' })
    const labelId = drawer.getAttribute('aria-labelledby')
    const descId = drawer.getAttribute('aria-describedby')
    expect(drawer.querySelector(`#${labelId}`)?.textContent).toBe('Filters')
    expect(drawer.querySelector(`#${descId}`)?.textContent).toBe('Narrow the results')
  })

  it('without title or subtitle, no aria-labelledby or aria-describedby', async () => {
    const { drawer } = await openHarness()
    expect(drawer.hasAttribute('aria-labelledby')).toBe(false)
    expect(drawer.hasAttribute('aria-describedby')).toBe(false)
  })

  it('a consumer aria-labelledby wins over the title', async () => {
    const { drawer } = await openHarness({ title: 'Filters', 'aria-labelledby': 'mine' })
    expect(drawer.getAttribute('aria-labelledby')).toBe('mine')
  })

  it('side and size default to end and md, and are exposed as data attributes', async () => {
    const { drawer } = await openHarness()
    expect(drawer.dataset.side).toBe('end')
    expect(drawer.dataset.size).toBe('md')
    const other = await openHarness({ side: 'bottom', size: 'lg' })
    expect(other.drawer.dataset.side).toBe('bottom')
    expect(other.drawer.dataset.size).toBe('lg')
  })

  it('extent is set as the inline --drawer-extent style', async () => {
    expect((await openHarness()).drawer.style.getPropertyValue('--drawer-extent')).toBe('')
    expect(
      (await openHarness({ extent: '30vw' })).drawer.style.getPropertyValue('--drawer-extent'),
    ).toBe('30vw')
    expect(
      (await openHarness({ extent: 480 })).drawer.style.getPropertyValue('--drawer-extent'),
    ).toBe('480px')
  })

  it('the cross closes the drawer and hands the model back', async () => {
    const { open, getDrawer, getByRole } = await openHarness()
    getByRole('button', { name: 'Close' }).click()
    await flush()
    expect(open.value).toBe(false)
    expect(getDrawer()).toBeNull()
  })

  it('hideClose takes the cross out, closeLabel renames it', async () => {
    expect((await openHarness({ hideClose: true })).queryByRole('button', { name: 'Close' })).toBe(
      null,
    )
    expect(
      (await openHarness({ closeLabel: 'Done' })).getByRole('button', { name: 'Done' }),
    ).toBeTruthy()
  })

  it('the footer is only rendered when the #footer slot is supplied', async () => {
    expect((await openHarness()).drawer.querySelector('.v-drawer-footer')).toBeNull()
    const withFooter = await openHarness({}, '<template #footer><button>OK</button></template>')
    expect(withFooter.drawer.querySelector('.v-drawer-footer')).not.toBeNull()
  })

  it('closedby derives from persistentBackdrop and persistentEscape', async () => {
    expect((await openHarness()).drawer.getAttribute('closedby')).toBe('any')
    expect((await openHarness({ persistentBackdrop: true })).drawer.getAttribute('closedby')).toBe(
      'closerequest',
    )
    expect(
      (await openHarness({ persistentBackdrop: true, persistentEscape: true })).drawer.getAttribute(
        'closedby',
      ),
    ).toBe('none')
  })

  it('the fallthrough attributes land on the <dialog>', async () => {
    const { drawer } = await openHarness({ 'data-qa': 'filters', class: 'mine' })
    expect(drawer.getAttribute('data-qa')).toBe('filters')
    expect(drawer.classList.contains('mine')).toBe(true)
  })

  it('show() settles once the drawer is showing', async () => {
    const holder = ref<InstanceType<typeof VDrawer> | null>(null)
    render({ setup: () => () => h(VDrawer, { ref: holder, title: 'Edit' }, () => 'Body') })
    await nextTick()
    await holder.value?.show()
    expect(holder.value?.el?.open).toBe(true)
    holder.value?.close()
    await flush()
    expect(holder.value?.el).toBeNull()
  })

  it('unmounted while open, it hands the model back closed', async () => {
    const { open, unmount } = await openHarness()
    unmount()
    expect(open.value).toBe(false)
  })
})

describe('VDrawer — the exit', () => {
  it('stays in the page, closed, until its exit transitions have finished', async () => {
    const { open, getDrawer, drawer } = await openHarness()
    const exit = holdExit()
    open.value = false
    await flush()
    expect(getDrawer()).toBe(drawer)
    expect(drawer.open).toBe(false)
    exit.finish()
    await flush()
    expect(getDrawer()).toBeNull()
  })

  it('reopened during its exit, the same element is shown again and stays', async () => {
    const { open, getDrawer, drawer } = await openHarness()
    const exit = holdExit()
    open.value = false
    await flush()
    open.value = true
    await flush()
    expect(getDrawer()).toBe(drawer)
    expect(drawer.open).toBe(true)
    exit.finish()
    await flush()
    expect(getDrawer()).toBe(drawer)
  })

  it('the end of an interrupted exit does not cut the next one short', async () => {
    const { open, getDrawer } = await openHarness()
    const first = holdExit()
    open.value = false
    await flush()
    open.value = true
    await flush()
    const second = holdExit()
    open.value = false
    await flush()
    first.finish()
    await flush()
    expect(getDrawer()).not.toBeNull()
    second.finish()
    await flush()
    expect(getDrawer()).toBeNull()
  })
})
