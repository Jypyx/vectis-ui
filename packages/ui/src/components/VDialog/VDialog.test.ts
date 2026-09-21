import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'

import VDialog from './VDialog.vue'
import VDialogAlert from './VDialogAlert.vue'

/**
 * Logic only (jsdom + the showModal/close stub, see vitest.setup.ts). The real browser
 * behaviour (the top layer, ::backdrop, the focus trap, the Escape/backdrop light
 * dismiss, the scroll-state separators) is covered by the Storybook play functions.
 *
 * Lazy mounting: the <dialog> only exists in the DOM while it is open — so the tests
 * open the modal before querying the element.
 */
async function flush() {
  // opening chains rendered=true → nextTick (mounting) → showModal()
  await nextTick()
  await new Promise((r) => setTimeout(r))
  await nextTick()
}

function renderHarness(props: Record<string, unknown> = {}, slots = '') {
  const open = ref((props.open as boolean) ?? false)
  const Harness = defineComponent({
    components: { VDialog },
    setup: () => ({ open, props }),
    template: `
      <button data-testid="ext" @click="open = true">Open</button>
      <VDialog v-model:open="open" v-bind="props">
        <template #trigger="{ triggerProps }">
          <button data-testid="trigger" v-bind="triggerProps">Open</button>
        </template>
        Content of the modal.
        ${slots}
      </VDialog>
    `,
  })
  const utils = render(Harness)
  const getDialog = () => utils.container.querySelector('.v-dialog') as HTMLDialogElement | null
  return { open, getDialog, ...utils }
}

/** Opens the modal and returns the mounted <dialog> element. */
async function openHarness(props: Record<string, unknown> = {}, slots = '') {
  const h = renderHarness(props, slots)
  h.open.value = true
  await flush()
  return { ...h, dialog: h.getDialog() as HTMLDialogElement }
}

describe('VDialog', () => {
  it('sets aria-labelledby/aria-describedby from title/subtitle', async () => {
    const { dialog } = await openHarness({ title: 'Confirm', subtitle: 'An irreversible action' })
    const labelId = dialog.getAttribute('aria-labelledby')
    const descId = dialog.getAttribute('aria-describedby')
    expect(labelId).toBeTruthy()
    expect(descId).toBeTruthy()
    expect(dialog.querySelector(`#${labelId}`)?.textContent).toBe('Confirm')
    expect(dialog.querySelector(`#${descId}`)?.textContent).toBe('An irreversible action')
  })

  it('without title/subtitle, no aria-labelledby/describedby', async () => {
    const { dialog } = await openHarness()
    expect(dialog.hasAttribute('aria-labelledby')).toBe(false)
    expect(dialog.hasAttribute('aria-describedby')).toBe(false)
  })

  it('the trigger opens the modal and synchronizes the v-model', async () => {
    const { open, getDialog, getByTestId } = renderHarness()
    expect(getDialog()).toBeNull()
    getByTestId('trigger').click()
    await flush()
    expect(getDialog()?.open).toBe(true)
    expect(open.value).toBe(true)
  })

  it('opens/closes through the v-model (the source of truth)', async () => {
    const { open, getDialog } = renderHarness()
    open.value = true
    await flush()
    expect(getDialog()?.open).toBe(true)
    open.value = false
    await flush()
    expect(getDialog()).toBeNull()
  })

  it('the cross closes the modal (the close event resynchronizes the v-model)', async () => {
    const { open, getDialog, getByRole } = await openHarness()
    expect(getDialog()?.open).toBe(true)
    getByRole('button', { name: 'Close' }).click()
    await flush()
    expect(open.value).toBe(false)
    expect(getDialog()).toBeNull()
  })

  it('hideClose takes the cross out', async () => {
    const { queryByRole } = await openHarness({ hideClose: true })
    expect(queryByRole('button', { name: 'Close' })).toBeNull()
  })

  it('hideClose keeps the header actions container for the slot that still fills it', async () => {
    // The `v-if` is `!hideClose || $slots["header-actions"]`, not `!(hideClose || …)`: written
    // the second way the container disappears exactly when a consumer fills the slot.
    const { container } = await openHarness(
      { hideClose: true },
      '<template #header-actions><button data-testid="pin">Pin</button></template>',
    )
    expect(container.querySelector('.v-dialog-header-actions')).toBeTruthy()
    expect(container.querySelector('[data-testid="pin"]')).toBeTruthy()
  })

  it("closeLabel customizes the cross's accessible name", async () => {
    const { getByRole } = await openHarness({ closeLabel: 'Cancel' })
    expect(getByRole('button', { name: 'Cancel' })).toBeTruthy()
  })

  it('role=alertdialog is set on the element', async () => {
    const { dialog } = await openHarness({ role: 'alertdialog' })
    expect(dialog.getAttribute('role')).toBe('alertdialog')
  })

  it('the dialog role (the default): no explicit role attribute (the native role)', async () => {
    const { dialog } = await openHarness()
    expect(dialog.hasAttribute('role')).toBe(false)
  })

  it('closedby derived from persistentBackdrop/persistentEscape', async () => {
    expect((await openHarness()).dialog.getAttribute('closedby')).toBe('any')
    expect((await openHarness({ persistentBackdrop: true })).dialog.getAttribute('closedby')).toBe(
      'closerequest',
    )
    expect(
      (await openHarness({ persistentBackdrop: true, persistentEscape: true })).dialog.getAttribute(
        'closedby',
      ),
    ).toBe('none')
    // Escape alone cannot be refused natively: both routes stay open.
    expect((await openHarness({ persistentEscape: true })).dialog.getAttribute('closedby')).toBe(
      'any',
    )
  })

  it('width is set as the inline --dialog-width style', async () => {
    // No width, no inline value: the stylesheet falls back on the dialog-width token.
    expect((await openHarness()).dialog.style.getPropertyValue('--dialog-width')).toBe('')
    expect(
      (await openHarness({ width: '640px' })).dialog.style.getPropertyValue('--dialog-width'),
    ).toBe('640px')
    // A number is read as pixels, as on every free dimension of the design system.
    expect(
      (await openHarness({ width: 560 })).dialog.style.getPropertyValue('--dialog-width'),
    ).toBe('560px')
  })

  it('show() settles once the dialog is showing, the opening landing a tick later', async () => {
    const holder = ref<InstanceType<typeof VDialog> | null>(null)
    render({ setup: () => () => h(VDialog, { ref: holder, title: 'Edit' }, () => 'Body') })
    await nextTick()
    const opened = holder.value?.show()
    expect(holder.value?.el).toBeNull()
    await opened
    expect(holder.value?.el?.open).toBe(true)
  })

  it('the footer is only rendered when the #footer slot is supplied', async () => {
    expect((await openHarness()).dialog.querySelector('.v-dialog-footer')).toBeNull()
    const withFooter = await openHarness({}, '<template #footer><button>OK</button></template>')
    expect(withFooter.dialog.querySelector('.v-dialog-footer')).not.toBeNull()
  })

  it('the fallthrough attributes land on the <dialog>', async () => {
    const { dialog } = await openHarness({ 'data-qa': 'deletion' })
    expect(dialog.getAttribute('data-qa')).toBe('deletion')
  })

  it('lazy mounting: absent when closed, present when open, removed after closing', async () => {
    const { open, getDialog } = renderHarness()
    expect(getDialog()).toBeNull()
    open.value = true
    await flush()
    expect(getDialog()).not.toBeNull()
    open.value = false
    await flush()
    expect(getDialog()).toBeNull()
  })
})

describe('VDialogAlert — the imperative API', () => {
  it('hands through the same three members VDialog exposes', async () => {
    const holder = ref<InstanceType<typeof VDialogAlert> | null>(null)
    const Host = {
      setup: () => () => h(VDialogAlert, { ref: holder, title: 'Delete?' }, () => 'Sure?'),
    }
    render(Host)
    await flush()

    await holder.value?.show()
    expect(holder.value?.el?.open).toBe(true)

    holder.value?.close()
    await flush()
    // The element is unmounted along with the dialog, which is what `el` follows.
    expect(holder.value?.el).toBeNull()
  })
})

describe("VDialog — the consumer's attributes", () => {
  it('a consumer aria-labelledby and aria-describedby are kept', async () => {
    const { dialog } = await openHarness({
      'aria-labelledby': 'my-title',
      'aria-describedby': 'my-body',
    })
    expect(dialog.getAttribute('aria-labelledby')).toBe('my-title')
    expect(dialog.getAttribute('aria-describedby')).toBe('my-body')
  })

  it('they win over the title and subtitle the component names it with', async () => {
    const { dialog } = await openHarness({
      title: 'Title',
      subtitle: 'Subtitle',
      'aria-labelledby': 'my-title',
      'aria-describedby': 'my-body',
    })
    expect(dialog.getAttribute('aria-labelledby')).toBe('my-title')
    expect(dialog.getAttribute('aria-describedby')).toBe('my-body')
  })
})

describe('VDialog — closing, the model and a browser without closedby', () => {
  it('a close event from the element it replaced does not close a dialog just reopened', async () => {
    const { open, dialog: old } = await openHarness()
    open.value = false
    await flush()
    open.value = true
    await flush()
    // What the browser does: the old element's close event arrives in a later task.
    old.dispatchEvent(new Event('close'))
    await nextTick()
    expect(open.value).toBe(true)
  })

  it('unmounted while open, it hands the model back closed', async () => {
    const { open, unmount } = await openHarness()
    unmount()
    expect(open.value).toBe(false)
  })

  describe('where closedby is not implemented', () => {
    // jsdom has no `closedBy`, which is exactly the browser this fallback is for.
    const escape = () => new Event('cancel', { cancelable: true })

    it('a refused Escape is cancelled', async () => {
      const { dialog } = await openHarness({ persistentBackdrop: true, persistentEscape: true })
      const event = escape()
      dialog.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(true)
    })

    it('an allowed Escape is left to the browser', async () => {
      const { dialog } = await openHarness()
      const event = escape()
      dialog.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
    })

    const pointer = (type: string, x: number) =>
      new MouseEvent(type, { bubbles: true, clientX: x, clientY: x })

    it('a click on the backdrop closes a dialog that allows it', async () => {
      const { dialog, open } = await openHarness()
      // jsdom lays nothing out: the dialog's box is empty, so any point is outside it.
      dialog.dispatchEvent(pointer('pointerdown', 5))
      dialog.dispatchEvent(pointer('click', 5))
      await flush()
      expect(open.value).toBe(false)
    })

    it('but not one that is persistent, nor a press that started inside', async () => {
      const persistent = await openHarness({ persistentBackdrop: true })
      persistent.dialog.dispatchEvent(pointer('pointerdown', 5))
      persistent.dialog.dispatchEvent(pointer('click', 5))
      await flush()
      expect(persistent.open.value).toBe(true)

      const dragged = await openHarness()
      const inside = dragged.dialog.firstElementChild as HTMLElement
      inside.dispatchEvent(pointer('pointerdown', 5))
      dragged.dialog.dispatchEvent(pointer('click', 5))
      await flush()
      expect(dragged.open.value).toBe(true)
    })
  })
})
