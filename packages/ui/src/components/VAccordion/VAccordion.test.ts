import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'

import VAccordion from './VAccordion.vue'
import VAccordionItem from './VAccordionItem.vue'

/** Raw attributes set on the group and on the first item, plus the bindings they read. */
function renderWith(accordionAttrs = '', firstItemAttrs = '', state: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { VAccordion, VAccordionItem },
    setup: () => state,
    template: `
      <VAccordion ${accordionAttrs}>
        <VAccordionItem title="Premier" ${firstItemAttrs}>Contenu 1</VAccordionItem>
        <VAccordionItem title="Second">Contenu 2</VAccordionItem>
      </VAccordion>
    `,
  })
  return render(Harness)
}

// The default must MATCH the component's, or `renderAccordion()` below silently exercises
// the other mode and its assertions go on passing while covering nothing.
const renderAccordion = (multiple = false) => renderWith(`:multiple="${multiple}"`, 'default-open')

/** Names of the <VIcon> rendered inside an item — `data-icon` is set whatever the
    effective source (embedded SVG, ligature, third-party font). */
function icones(item: Element) {
  return [...item.querySelectorAll<HTMLElement>('summary .v-icon')].map((el) => el.dataset.icon)
}

describe('VAccordion', () => {
  it('one at a time (the default): the items share the same native name attribute', () => {
    const { container } = renderAccordion(false)
    const [first, second] = [...container.querySelectorAll('details')]
    expect(first?.getAttribute('name')).toBeTruthy()
    expect(first?.getAttribute('name')).toBe(second?.getAttribute('name'))
  })

  it('multiple: no name, so several items may stay open', () => {
    const { container } = renderAccordion(true)
    for (const details of container.querySelectorAll('details')) {
      expect(details.hasAttribute('name')).toBe(false)
    }
  })

  it('default-open opens on the first render', () => {
    const { container } = renderAccordion()
    const [first, second] = [...container.querySelectorAll('details')]
    expect(first?.open).toBe(true)
    expect(second?.open).toBe(false)
  })

  it('default-open is read once: changing it later leaves the section as it is', async () => {
    const initial = ref(true)
    const { container } = renderWith('', ':default-open="initial"', { initial })
    const details = container.querySelector('details')!
    expect(details.open).toBe(true)
    initial.value = false
    await nextTick()
    expect(details.open).toBe(true)
  })

  it('v-model:open: driven from the parent, and rewritten by the native `toggle` event', async () => {
    const open = ref<boolean | null>(false)
    const { container } = renderWith('multiple', 'v-model:open="open"', { open })
    const details = container.querySelector('details')!
    expect(details.open).toBe(false)

    open.value = true
    await nextTick()
    expect(details.open).toBe(true)

    // the element is the source of truth: the model is fed by `toggle`
    details.open = false
    await fireEvent(details, new Event('toggle'))
    expect(open.value).toBe(false)
  })

  it('an empty subtitle still renders its line (presence, not truthiness)', () => {
    const { container } = renderWith('', 'subtitle=""')
    expect(container.querySelector('.v-accordion-subtitle')).not.toBeNull()
  })

  it('default icon: a single expand_more icon per item (CSS rotation)', () => {
    const { container } = renderWith()
    for (const details of container.querySelectorAll('details')) {
      expect(icones(details)).toEqual(['expand_more'])
      expect(details.hasAttribute('data-swap')).toBe(false)
    }
  })

  it('expand-icon/collapse-icon: two icons rendered and a data-swap marker', () => {
    const { container } = renderWith('expand-icon="add" collapse-icon="remove"')
    for (const details of container.querySelectorAll('details')) {
      expect(icones(details)).toEqual(['add', 'remove'])
      expect(details.hasAttribute('data-swap')).toBe(true)
    }
  })

  it('subtitle: rendered under the title, absent with neither prop nor slot', () => {
    const { container } = renderWith('', 'subtitle="The first subtitle"')
    const [first, second] = [...container.querySelectorAll('details')]
    expect(first?.querySelector('.v-accordion-subtitle')?.textContent).toBe('The first subtitle')
    expect(second?.querySelector('.v-accordion-subtitle')).toBeNull()
  })

  it('icon: a dedicated icon before the title, distinct from the chevron', () => {
    const { container } = renderWith('', 'icon="settings"')
    const [first, second] = [...container.querySelectorAll('details')]
    // both icons coexist: the start icon, then the chevron
    expect(icones(first as Element)).toEqual(['settings', 'expand_more'])
    expect(first?.querySelector<HTMLElement>('.v-accordion-icon')?.dataset.icon).toBe('settings')
    expect(second?.querySelector('.v-accordion-icon')).toBeNull()
  })

  it('variant: data-variant set on the root, flat by default', () => {
    const variantOf = (attrs = '') =>
      renderWith(attrs).container.querySelector('.v-accordion')?.getAttribute('data-variant')
    expect(variantOf()).toBe('flat')
    expect(variantOf('variant="outlined"')).toBe('outlined')
  })

  it('compact: data-compact set on the root only when requested', () => {
    expect(renderWith().container.querySelector('.v-accordion')?.hasAttribute('data-compact')).toBe(
      false,
    )
    expect(
      renderWith('compact').container.querySelector('.v-accordion')?.hasAttribute('data-compact'),
    ).toBe(true)
  })

  it('disabled: an inert summary (aria-disabled, out of the tab order, click cancelled)', () => {
    const { container } = renderWith('', 'disabled')
    const [first, second] = [...container.querySelectorAll('summary')]
    expect(first?.getAttribute('aria-disabled')).toBe('true')
    expect(first?.getAttribute('tabindex')).toBe('-1')
    // the marker sits on the row, as on VSideNavigationItem, not on the <details>
    expect(first?.hasAttribute('data-disabled')).toBe(true)
    expect(first?.parentElement?.hasAttribute('data-disabled')).toBe(false)
    expect(second?.hasAttribute('aria-disabled')).toBe(false)
    expect(second?.hasAttribute('tabindex')).toBe(false)

    // <summary> has no native `disabled`: the click is cancelled by preventDefault
    const clickOn = (el: Element) => {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      el.dispatchEvent(event)
      return event.defaultPrevented
    }
    expect(clickOn(first as Element)).toBe(true)
    expect(clickOn(second as Element)).toBe(false)
  })

  describe('robustness', () => {
    it('closes the element again when a controlled model refuses to open', async () => {
      const { container } = renderWith('', ':open="false" @update:open="() => {}"')
      const details = container.querySelector('details') as HTMLDetailsElement
      details.open = true
      await fireEvent(details, new Event('toggle'))
      await nextTick()
      await nextTick()
      expect(details.open).toBe(false)
    })

    it('an item nested in another item does not join the outer group', () => {
      const { container } = render(VAccordion, {
        slots: {
          default: () =>
            h(VAccordionItem, { title: 'Outer' }, () =>
              h(VAccordionItem, { title: 'Inner' }, () => 'x'),
            ),
        },
      })
      const [outer, inner] = [...container.querySelectorAll('details')]
      expect(outer?.getAttribute('name')).toBeTruthy()
      expect(inner?.hasAttribute('name')).toBe(false)
    })
  })
})
