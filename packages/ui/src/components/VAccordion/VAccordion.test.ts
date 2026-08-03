import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'

import Accordion from './Accordion.vue'
import AccordionItem from './AccordionItem.vue'

/** Attributs bruts posés sur le groupe et sur le 1er item. */
function renderWith(accordionAttrs = '', firstItemAttrs = '') {
  const Harness = defineComponent({
    components: { Accordion, AccordionItem },
    template: `
      <Accordion ${accordionAttrs}>
        <AccordionItem title="Premier" ${firstItemAttrs}>Contenu 1</AccordionItem>
        <AccordionItem title="Second">Contenu 2</AccordionItem>
      </Accordion>
    `,
  })
  return render(Harness)
}

const renderAccordion = (exclusive = true) =>
  renderWith(`:exclusive="${exclusive}"`, 'default-open')

/** Noms des <Icon> rendues dans un item — `data-icon` est posé quelle que soit
    la source effective (SVG intégré, ligature, police tierce). */
function icones(item: Element) {
  return [...item.querySelectorAll<HTMLElement>('summary .v-icon')].map((el) => el.dataset.icon)
}

describe('Accordion', () => {
  it('mode exclusif : les items partagent le même attribut name natif', () => {
    const { container } = renderAccordion(true)
    const [first, second] = [...container.querySelectorAll('details')]
    expect(first?.getAttribute('name')).toBeTruthy()
    expect(first?.getAttribute('name')).toBe(second?.getAttribute('name'))
  })

  it('exclusive=false : aucun name, ouvertures multiples possibles', () => {
    const { container } = renderAccordion(false)
    for (const details of container.querySelectorAll('details')) {
      expect(details.hasAttribute('name')).toBe(false)
    }
  })

  it('default-open ouvre au premier rendu', () => {
    const { container } = renderAccordion()
    const [first, second] = [...container.querySelectorAll('details')]
    expect(first?.open).toBe(true)
    expect(second?.open).toBe(false)
  })

  it('icône par défaut : une seule icône expand_more par item (rotation CSS)', () => {
    const { container } = renderWith()
    for (const details of container.querySelectorAll('details')) {
      expect(icones(details)).toEqual(['expand_more'])
      expect(details.hasAttribute('data-swap')).toBe(false)
    }
  })

  it('expand-icon/collapse-icon : deux icônes rendues et marqueur data-swap', () => {
    const { container } = renderWith('expand-icon="add" collapse-icon="remove"')
    for (const details of container.querySelectorAll('details')) {
      expect(icones(details)).toEqual(['add', 'remove'])
      expect(details.hasAttribute('data-swap')).toBe(true)
    }
  })

  it('subtitle : rendu sous le titre, absent sans prop ni slot', () => {
    const { container } = renderWith('', 'subtitle="Sous-titre du premier"')
    const [first, second] = [...container.querySelectorAll('details')]
    expect(first?.querySelector('.v-accordion-subtitle')?.textContent).toBe('Sous-titre du premier')
    expect(second?.querySelector('.v-accordion-subtitle')).toBeNull()
  })

  it('icon-start : icône dédiée devant le titre, distincte du chevron', () => {
    const { container } = renderWith('', 'icon-start="settings"')
    const [first, second] = [...container.querySelectorAll('details')]
    // les deux icônes cohabitent : icône de début puis chevron
    expect(icones(first as Element)).toEqual(['settings', 'expand_more'])
    expect(first?.querySelector<HTMLElement>('.v-accordion-icon-start')?.dataset.icon).toBe(
      'settings',
    )
    expect(second?.querySelector('.v-accordion-icon-start')).toBeNull()
  })

  it('variant : data-variant posé sur la racine, flat par défaut', () => {
    const variantOf = (attrs = '') =>
      renderWith(attrs).container.querySelector('.v-accordion')?.getAttribute('data-variant')
    expect(variantOf()).toBe('flat')
    expect(variantOf('variant="outlined"')).toBe('outlined')
  })

  it('compact : data-compact posé sur la racine seulement si demandé', () => {
    expect(renderWith().container.querySelector('.v-accordion')?.hasAttribute('data-compact')).toBe(
      false,
    )
    expect(
      renderWith('compact').container.querySelector('.v-accordion')?.hasAttribute('data-compact'),
    ).toBe(true)
  })

  it('disabled : summary inerte (aria-disabled, hors tabulation, clic annulé)', () => {
    const { container } = renderWith('', 'disabled')
    const [first, second] = [...container.querySelectorAll('summary')]
    expect(first?.getAttribute('aria-disabled')).toBe('true')
    expect(first?.getAttribute('tabindex')).toBe('-1')
    expect(second?.hasAttribute('aria-disabled')).toBe(false)
    expect(second?.hasAttribute('tabindex')).toBe(false)

    // <summary> n'a pas de `disabled` natif : le clic est annulé par preventDefault
    const clickOn = (el: Element) => {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      el.dispatchEvent(event)
      return event.defaultPrevented
    }
    expect(clickOn(first as Element)).toBe(true)
    expect(clickOn(second as Element)).toBe(false)
  })
})
