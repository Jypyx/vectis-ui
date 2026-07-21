import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'

import Accordion from './Accordion.vue'
import AccordionItem from './AccordionItem.vue'

function renderAccordion(exclusive = true) {
  const Harness = defineComponent({
    components: { Accordion, AccordionItem },
    setup: () => ({ exclusive }),
    template: `
      <Accordion :exclusive="exclusive">
        <AccordionItem title="Premier" default-open>Contenu 1</AccordionItem>
        <AccordionItem title="Second">Contenu 2</AccordionItem>
      </Accordion>
    `,
  })
  return render(Harness)
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
})
