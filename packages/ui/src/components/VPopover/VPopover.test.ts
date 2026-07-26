import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import VPopover from './VPopover.vue'

/** The file's single component factory (vue/one-component-per-file). */
function renderHarness(template: string, bindings: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { VPopover },
    setup: () => bindings,
    template,
  })
  return render(Harness)
}

const panelOf = (container: Element) => container.querySelector('.v-popover-panel') as HTMLElement

describe('VPopover', () => {
  it('renders a [popover] panel carrying the floating foundation and the default surface', () => {
    const { container } = renderHarness('<VPopover>Contenu</VPopover>')
    const panel = panelOf(container)
    expect(panel.getAttribute('popover')).toBe('auto')
    expect(panel.getAttribute('data-placement')).toBe('bottom-start')
    // closed-panel guard + placements: see styles/floating.css
    expect(panel.classList.contains('v-overlay')).toBe(true)
    expect(panel.classList.contains('v-floating')).toBe(true)
    // default surface (styles/panel.css)
    expect(panel.classList.contains('v-panel')).toBe(true)
  })

  it('surface=false removes the decoration (the consumer supplies its own)', () => {
    const { container } = renderHarness('<VPopover :surface="false">Contenu</VPopover>')
    expect(panelOf(container).classList.contains('v-panel')).toBe(false)
  })

  it('mode=manual switches off the native light dismiss', () => {
    const { container } = renderHarness('<VPopover mode="manual">Contenu</VPopover>')
    expect(panelOf(container).getAttribute('popover')).toBe('manual')
  })

  it('anchor is exposed as an inline variable (position-anchor in CSS)', () => {
    const { container } = renderHarness('<VPopover anchor="--ancre-test">Contenu</VPopover>')
    expect(panelOf(container).style.getPropertyValue('--anchor-name')).toBe('--ancre-test')
  })

  it('with no trigger the wrapper is not anchored (display: contents in CSS)', () => {
    const { container } = renderHarness('<VPopover anchor="--a">Contenu</VPopover>')
    expect(container.querySelector('.v-popover')?.hasAttribute('data-trigger')).toBe(false)
  })

  it('the #trigger slot supplies the disclosure props and marks the wrapper as anchored', async () => {
    const open = ref(false)
    const { container, getByRole } = renderHarness(
      `
        <VPopover v-model:open="open">
          <template #trigger="{ triggerProps }">
            <button v-bind="triggerProps">Open</button>
          </template>
          Content
        </VPopover>
      `,
      { open },
    )
    const panel = panelOf(container)
    const trigger = getByRole('button', { name: 'Open' })

    // the wrapper then carries the anchor-name (see .v-popover[data-trigger])
    expect(container.querySelector('.v-popover')?.hasAttribute('data-trigger')).toBe(true)
    expect(trigger.getAttribute('popovertarget')).toBe(panel.id)
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    open.value = true
    await nextTick()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it("the consumer's id wins over the generated one", () => {
    const { container } = renderHarness('<VPopover id="my-panel">Content</VPopover>')
    expect(panelOf(container).id).toBe('my-panel')
  })

  it('v-model:open drives the panel in both directions', async () => {
    const open = ref(false)
    const { container } = renderHarness('<VPopover v-model:open="open">Content</VPopover>', {
      open,
    })
    const panel = panelOf(container)
    expect(panel.hasAttribute('data-popover-open')).toBe(false)

    open.value = true
    await nextTick()
    expect(panel.hasAttribute('data-popover-open')).toBe(true)

    // DOM → model: light dismiss is what must be able to close the model again
    // (the jsdom stub only emits `toggle`)
    panel.hidePopover()
    await nextTick()
    expect(open.value).toBe(false)

    // idempotence: a second hidePopover() would throw InvalidStateError without
    // usePopover's guard
    expect(() => panel.hidePopover()).not.toThrow()
  })

  it('opens on mount when open is already true', async () => {
    const { container } = renderHarness('<VPopover :open="true">Content</VPopover>')
    await nextTick()
    expect(panelOf(container).hasAttribute('data-popover-open')).toBe(true)
  })

  it("the consumer's attributes land on the panel, not on the wrapper", () => {
    const { container } = renderHarness(
      '<VPopover role="dialog" aria-label="Details" class="v-custom" data-x="1">Content</VPopover>',
    )
    const panel = panelOf(container)
    expect(panel.getAttribute('role')).toBe('dialog')
    expect(panel.getAttribute('aria-label')).toBe('Details')
    expect(panel.getAttribute('data-x')).toBe('1')
    // class/style go on the panel TOO (the wrapper is only an anchor)
    expect(panel.classList.contains('v-custom')).toBe(true)
    expect(container.querySelector('.v-popover')?.classList.contains('v-custom')).toBe(false)
  })
})
