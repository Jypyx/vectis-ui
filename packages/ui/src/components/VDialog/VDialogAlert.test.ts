import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import VDialogAlert from './VDialogAlert.vue'

async function flush() {
  await nextTick()
  await new Promise((r) => setTimeout(r))
  await nextTick()
}

async function openHarness(props: Record<string, unknown> = {}, slots = '') {
  const open = ref(true)
  const Harness = defineComponent({
    components: { VDialogAlert },
    setup: () => ({ open, props }),
    template: `
      <VDialogAlert v-model:open="open" v-bind="props">
        Do you really want to delete?
        <template #footer><button>Confirm</button></template>
        ${slots}
      </VDialogAlert>
    `,
  })
  const utils = render(Harness)
  await flush()
  const dialog = utils.container.querySelector('.v-dialog') as HTMLDialogElement
  return { open, dialog, ...utils }
}

describe('VDialogAlert', () => {
  it('sets role="alertdialog"', async () => {
    expect((await openHarness()).dialog.getAttribute('role')).toBe('alertdialog')
  })

  it('has no close cross', async () => {
    const { queryByRole } = await openHarness()
    expect(queryByRole('button', { name: 'Close' })).toBeNull()
  })

  it('cuts off every light dismiss (closedby="none")', async () => {
    expect((await openHarness()).dialog.getAttribute('closedby')).toBe('none')
  })

  // The default width is the token's, read by the stylesheet: nothing is written inline, so
  // the alert cannot drift from VDialog's own default.
  it('leaves the width to the token unless one is given', async () => {
    expect((await openHarness()).dialog.style.getPropertyValue('--dialog-width')).toBe('')
    expect(
      (await openHarness({ width: 320 })).dialog.style.getPropertyValue('--dialog-width'),
    ).toBe('320px')
  })

  it('relays the #header-actions slot', async () => {
    const { container } = await openHarness(
      { title: 'Delete?' },
      '<template #header-actions><a data-testid="help" href="#help">Help</a></template>',
    )
    const actions = container.querySelector('.v-dialog-header-actions')
    expect(actions?.querySelector('[data-testid="help"]')).toBeTruthy()
  })

  it('stays driven by the v-model (an action button closes it)', async () => {
    const { open, container } = await openHarness()
    expect(container.querySelector('.v-dialog')).not.toBeNull()
    open.value = false
    await flush()
    expect(container.querySelector('.v-dialog')).toBeNull()
  })
})
