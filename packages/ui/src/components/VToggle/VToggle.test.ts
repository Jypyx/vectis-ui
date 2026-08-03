import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'

import VToggle from './VToggle.vue'
import type { ToggleModelValue } from './VToggle.vue'
import VToggleItem from './VToggleItem.vue'

/**
 * Harness: the v-model must be live (without a local ref, clicking an item would
 * change nothing) and the ref is returned so the emitted value can be asserted.
 */
function mount(
  options: {
    /** Raw attributes set on <VToggle>. */
    toggleAttrs?: string
    /** Body of the default slot; three a/b/c items by default. */
    items?: string
    initial?: ToggleModelValue
  } = {},
) {
  const model = ref<ToggleModelValue>(options.initial ?? null)
  const items =
    options.items ??
    `<VToggleItem value="a" label="Un" />
     <VToggleItem value="b" label="Deux" />
     <VToggleItem value="c" label="Trois" />`

  const Harness = defineComponent({
    components: { VToggle, VToggleItem },
    setup: () => ({ model }),
    template: `
      <VToggle v-model="model" ${options.toggleAttrs ?? ''}>
        ${items}
      </VToggle>
    `,
  })
  return { model, ...render(Harness) }
}

/** Items dans l'ordre du DOM. */
const itemsOf = (container: Element) => [
  ...container.querySelectorAll<HTMLElement>('.v-toggle-item'),
]

const pressedOf = (container: Element) =>
  itemsOf(container).map((el) => el.getAttribute('aria-pressed'))

describe('VToggle', () => {
  describe('accessibility', () => {
    it('renders a named group of toggle buttons', () => {
      const { container } = mount({ toggleAttrs: 'label="Alignement"' })
      const group = container.querySelector('[role="group"]')
      expect(group?.getAttribute('aria-label')).toBe('Alignement')
      expect(pressedOf(container)).toEqual(['false', 'false', 'false'])
    })

    it('marks the selected item aria-pressed', () => {
      const { container } = mount({ initial: 'b' })
      expect(pressedOf(container)).toEqual(['false', 'true', 'false'])
    })

    it('a consumer aria-label replaces the label prop', () => {
      const { container } = mount({ toggleAttrs: 'label="Alignement" aria-label="Style"' })
      expect(container.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Style')
    })

    it('a consumer aria-labelledby removes the default aria-label', () => {
      const { container } = mount({ toggleAttrs: 'label="Alignement" aria-labelledby="titre"' })
      const group = container.querySelector('[role="group"]')
      expect(group?.hasAttribute('aria-label')).toBe(false)
      expect(group?.getAttribute('aria-labelledby')).toBe('titre')
    })

    it('every item stays a .v-button (classes merged, not replaced)', () => {
      const { container } = mount()
      for (const item of itemsOf(container)) {
        expect(item.classList.contains('v-button')).toBe(true)
        expect(item.tagName).toBe('BUTTON')
      }
    })
  })

  describe('structure', () => {
    it('attached (the default): the items are DIRECT children of the VButtonGroup (the seam)', () => {
      const { container } = mount()
      expect(container.querySelector('.v-toggle.v-button-group')).not.toBeNull()
      // structural guard: an intervening wrapper would silently break the seam
      expect(container.querySelector('.v-button-group > .v-toggle-item')).not.toBeNull()
    })

    it("attached: the orientation travels through VButtonGroup's prop", () => {
      const { container } = mount({ toggleAttrs: 'orientation="vertical"' })
      expect(container.querySelector('.v-button-group')?.getAttribute('data-orientation')).toBe(
        'vertical',
      )
    })

    it('detached: a plain div carries the role and data-orientation', () => {
      const { container } = mount({ toggleAttrs: ':attached="false" orientation="vertical"' })
      expect(container.querySelector('.v-button-group')).toBeNull()
      const group = container.querySelector('.v-toggle')
      expect(group?.getAttribute('role')).toBe('group')
      expect(group?.getAttribute('data-orientation')).toBe('vertical')
    })
  })

  describe('single v-model', () => {
    it('a click selects the item', async () => {
      const { container, model } = mount()
      await fireEvent.click(itemsOf(container)[1] as HTMLElement)
      expect(model.value).toBe('b')
      expect(pressedOf(container)).toEqual(['false', 'true', 'false'])
    })

    it('a click on another item moves the selection', async () => {
      const { container, model } = mount({ initial: 'a' })
      await fireEvent.click(itemsOf(container)[2] as HTMLElement)
      expect(model.value).toBe('c')
    })

    it('clicking the selected item again deselects it', async () => {
      const { container, model } = mount({ initial: 'a' })
      await fireEvent.click(itemsOf(container)[0] as HTMLElement)
      expect(model.value).toBeNull()
    })

    it('mandatory: the last value cannot be deselected', async () => {
      const { container, model } = mount({ initial: 'a', toggleAttrs: 'mandatory' })
      await fireEvent.click(itemsOf(container)[0] as HTMLElement)
      expect(model.value).toBe('a')
      // mais changer d'item reste possible
      await fireEvent.click(itemsOf(container)[1] as HTMLElement)
      expect(model.value).toBe('b')
    })
  })

  describe('multiple v-model', () => {
    it('normalizes a null v-model to an array on the first selection', async () => {
      const { container, model } = mount({ toggleAttrs: 'multiple' })
      await fireEvent.click(itemsOf(container)[0] as HTMLElement)
      expect(model.value).toEqual(['a'])
    })

    it('accumulates then removes values', async () => {
      const { container, model } = mount({ initial: ['a'], toggleAttrs: 'multiple' })
      await fireEvent.click(itemsOf(container)[1] as HTMLElement)
      expect(model.value).toEqual(['a', 'b'])
      expect(pressedOf(container)).toEqual(['true', 'true', 'false'])

      await fireEvent.click(itemsOf(container)[0] as HTMLElement)
      expect(model.value).toEqual(['b'])
    })

    it('mandatory: the last element cannot be removed', async () => {
      const { container, model } = mount({ initial: ['a'], toggleAttrs: 'multiple mandatory' })
      await fireEvent.click(itemsOf(container)[0] as HTMLElement)
      expect(model.value).toEqual(['a'])
    })

    it('every write produces a new array reference', async () => {
      const initial: ToggleModelValue = ['a']
      const { container, model } = mount({ initial, toggleAttrs: 'multiple' })
      await fireEvent.click(itemsOf(container)[1] as HTMLElement)
      expect(model.value).not.toBe(initial)
      expect(initial).toEqual(['a'])
    })
  })

  describe('variants and tones', () => {
    it("the selected item is solid in the group's tone, the others in the neutral variant", () => {
      const { container } = mount({
        initial: 'b',
        toggleAttrs: 'variant="outline" tone="danger"',
      })
      const [first, second] = itemsOf(container)
      expect(second?.dataset.variant).toBe('solid')
      expect(second?.dataset.tone).toBe('danger')
      expect(first?.dataset.variant).toBe('outline')
      expect(first?.dataset.tone).toBe('neutral')
    })
  })

  describe('context propagation', () => {
    it('size and compact reach every button', () => {
      const { container } = mount({ toggleAttrs: 'size="sm" compact' })
      const items = itemsOf(container)
      expect(items.every((el) => el.dataset.size === 'sm')).toBe(true)
      expect(items.every((el) => el.hasAttribute('data-compact'))).toBe(true)
    })

    it('a group disabled disables every item, an item disabled only one', () => {
      const grouped = mount({ toggleAttrs: 'disabled' })
      expect(itemsOf(grouped.container).every((el) => (el as HTMLButtonElement).disabled)).toBe(
        true,
      )
      grouped.unmount()

      const { container } = mount({
        items: `<VToggleItem value="a" label="Un" />
                <VToggleItem value="b" label="Deux" disabled />`,
      })
      const [first, second] = itemsOf(container) as HTMLButtonElement[]
      expect(first?.disabled).toBe(false)
      expect(second?.disabled).toBe(true)
    })
  })

  describe('icons', () => {
    const iconItems = `<VToggleItem value="a" icon="favorite" label="Un" />
                       <VToggleItem value="b" icon="star" label="Deux" />`

    it('selectedIconFilled fills the icon of the selected item alone', () => {
      const { container } = mount({
        initial: 'a',
        toggleAttrs: 'selected-icon-filled',
        items: iconItems,
      })
      const [first, second] = itemsOf(container)
      expect(first?.querySelector('.v-icon')?.hasAttribute('data-filled')).toBe(true)
      expect(second?.querySelector('.v-icon')?.hasAttribute('data-filled')).toBe(false)
    })

    it('without the prop, the selected icon stays hollow', () => {
      const { container } = mount({ initial: 'a', items: iconItems })
      expect(itemsOf(container)[0]?.querySelector('.v-icon')?.hasAttribute('data-filled')).toBe(
        false,
      )
    })

    it('icon only: a square item, accessible name through fallthrough', () => {
      const { container } = mount({
        items: `<VToggleItem value="a" icon="favorite" aria-label="Favori" />`,
      })
      const item = itemsOf(container)[0]
      expect(item?.hasAttribute('data-icon-only')).toBe(true)
      expect(item?.getAttribute('aria-label')).toBe('Favori')
    })

    it('a label cancels icon-only mode', () => {
      const { container } = mount({
        items: `<VToggleItem value="a" icon="favorite" label="Favori" />`,
      })
      expect(itemsOf(container)[0]?.hasAttribute('data-icon-only')).toBe(false)
    })
  })

  describe('keyboard navigation', () => {
    it('the arrows move focus without selecting anything', async () => {
      const { container, model } = mount()
      const items = itemsOf(container)
      const group = container.querySelector('[role="group"]') as HTMLElement
      items[0]?.focus()

      await fireEvent.keyDown(group, { key: 'ArrowRight' })
      expect(document.activeElement).toBe(items[1])
      expect(model.value).toBeNull()

      await fireEvent.keyDown(group, { key: 'ArrowLeft' })
      expect(document.activeElement).toBe(items[0])
    })

    it('wraps at the ends and responds to Home/End', async () => {
      const { container } = mount()
      const items = itemsOf(container)
      const group = container.querySelector('[role="group"]') as HTMLElement

      items[2]?.focus()
      await fireEvent.keyDown(group, { key: 'ArrowRight' })
      expect(document.activeElement).toBe(items[0])

      await fireEvent.keyDown(group, { key: 'End' })
      expect(document.activeElement).toBe(items[2])
      await fireEvent.keyDown(group, { key: 'Home' })
      expect(document.activeElement).toBe(items[0])
    })

    it('skips the disabled items', async () => {
      const { container } = mount({
        items: `<VToggleItem value="a" label="Un" />
                <VToggleItem value="b" label="Deux" disabled />
                <VToggleItem value="c" label="Trois" />`,
      })
      const items = itemsOf(container)
      const group = container.querySelector('[role="group"]') as HTMLElement
      items[0]?.focus()
      await fireEvent.keyDown(group, { key: 'ArrowRight' })
      expect(document.activeElement).toBe(items[2])
    })

    it('in vertical mode, only the up/down arrows act', async () => {
      const { container } = mount({ toggleAttrs: 'orientation="vertical"' })
      const items = itemsOf(container)
      const group = container.querySelector('[role="group"]') as HTMLElement
      items[0]?.focus()

      await fireEvent.keyDown(group, { key: 'ArrowRight' })
      expect(document.activeElement).toBe(items[0])

      await fireEvent.keyDown(group, { key: 'ArrowDown' })
      expect(document.activeElement).toBe(items[1])
      await fireEvent.keyDown(group, { key: 'ArrowUp' })
      expect(document.activeElement).toBe(items[0])
    })
  })

  describe('outside a context', () => {
    it('a lone VToggleItem renders, never selected, with no error on click', async () => {
      const { container } = render(VToggleItem, { props: { value: 'a', label: 'Seul' } })
      const item = container.querySelector('.v-toggle-item')
      expect(item?.getAttribute('aria-pressed')).toBe('false')
      await fireEvent.click(item as HTMLElement)
      expect(item?.getAttribute('aria-pressed')).toBe('false')
    })
  })
})
