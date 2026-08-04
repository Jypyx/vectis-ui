import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'

import VAccordion from './VAccordion.vue'
import VAccordionItem from './VAccordionItem.vue'

/** Raw attributes set on the group and on the first item. */
function renderWith(accordionAttrs = '', firstItemAttrs = '') {
  const Harness = defineComponent({
    components: { VAccordion, VAccordionItem },
    template: `
      <VAccordion ${accordionAttrs}>
        <VAccordionItem title="Premier" ${firstItemAttrs}>Contenu 1</VAccordionItem>
        <VAccordionItem title="Second">Contenu 2</VAccordionItem>
      </VAccordion>
    `,
  })
  return render(Harness)
}

const renderAccordion = (exclusive = true) =>
  renderWith(`:exclusive="${exclusive}"`, 'default-open')

/** Names of the <VIcon> rendered inside an item — `data-icon` is set whatever the
    effective source (embedded SVG, ligature, third-party font). */
function icones(item: Element) {
  return [...item.querySelectorAll<HTMLElement>('summary .v-icon')].map((el) => el.dataset.icon)
}

describe('VAccordion', () => {
  it('exclusive mode: the items share the same native name attribute', () => {
    const { container } = renderAccordion(true)
    const [first, second] = [...container.querySelectorAll('details')]
    expect(first?.getAttribute('name')).toBeTruthy()
    expect(first?.getAttribute('name')).toBe(second?.getAttribute('name'))
  })

  it('exclusive=false: no name, multiple items can be open', () => {
    const { container } = renderAccordion(false)
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

  it('icon-start: a dedicated icon before the title, distinct from the chevron', () => {
    const { container } = renderWith('', 'icon-start="settings"')
    const [first, second] = [...container.querySelectorAll('details')]
    // both icons coexist: the start icon, then the chevron
    expect(icones(first as Element)).toEqual(['settings', 'expand_more'])
    expect(first?.querySelector<HTMLElement>('.v-accordion-icon-start')?.dataset.icon).toBe(
      'settings',
    )
    expect(second?.querySelector('.v-accordion-icon-start')).toBeNull()
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
})
