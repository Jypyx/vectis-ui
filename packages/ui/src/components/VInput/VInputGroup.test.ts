import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'

import VInput from './VInput.vue'
import VInputGroup from './VInputGroup.vue'

import VButton from '../VButton/VButton.vue'
import VCombobox from '../VCombobox/VCombobox.vue'
import VDateInput from '../VDateInput/VDateInput.vue'
import VFileInput from '../VFileInput/VFileInput.vue'
import VIconButton from '../VIconButton/VIconButton.vue'
import VTextarea from '../VTextarea/VTextarea.vue'
import VTimeInput from '../VTimeInput/VTimeInput.vue'
import VTooltip from '../VTooltip/VTooltip.vue'

/** The group's root, which keeps `class` and `style`. */
const root = (container: Element) => container.querySelector('.v-input-group') as HTMLElement

/** The row, which carries the `group` role and every other consumer attribute. */
const row = (container: Element) => container.querySelector('.v-input-group-row') as HTMLElement

/** The `.v-input` roots in render order, where each resolved prop shows up. */
const fields = (container: Element) => [
  ...container.querySelectorAll<HTMLElement>('.v-input-field'),
]

describe('VInputGroup', () => {
  it('renders a role="group" holding a row', () => {
    const { container, getByRole } = render(VInputGroup, {
      slots: { default: () => h(VInput) },
    })
    expect(getByRole('group')).toBe(row(container))
    expect(container.querySelector('.v-input-group-row')).toBeTruthy()
  })

  it('the segments land inside the row, not on the root', () => {
    const { container } = render(VInputGroup, {
      slots: { default: () => [h(VInput), h(VInput)] },
    })
    const row = container.querySelector('.v-input-group-row') as HTMLElement
    expect([...container.querySelectorAll('.v-input')]).toHaveLength(2)
    for (const field of [...container.querySelectorAll('.v-input')])
      expect(field.parentElement).toBe(row)
  })

  it('the root carries neither v-control nor data-size', () => {
    const { container } = render(VInputGroup, {
      props: { size: 'lg', compact: true },
      slots: { default: () => h(VInput) },
    })
    expect(root(container).classList.contains('v-control')).toBe(false)
    expect(root(container).hasAttribute('data-size')).toBe(false)
  })

  describe('label and hint', () => {
    it('renders the label once, as a span the group is named by', () => {
      const { container } = render(VInputGroup, {
        props: { label: 'Phone' },
        slots: { default: () => h(VInput) },
      })
      const labels = container.querySelectorAll('.v-field-label')
      expect(labels).toHaveLength(1)
      expect(labels[0]!.tagName).toBe('SPAN')
      expect(row(container).getAttribute('aria-labelledby')).toBe(labels[0]!.id)
    })

    it('no label: nothing is named and no aria-labelledby is emitted', () => {
      const { container } = render(VInputGroup, { slots: { default: () => h(VInput) } })
      expect(container.querySelector('.v-field-label')).toBeNull()
      expect(row(container).hasAttribute('aria-labelledby')).toBe(false)
    })

    it('an empty label or hint renders nothing and points at nothing', () => {
      const { container } = render(VInputGroup, {
        props: { label: '', hint: '' },
        slots: { default: () => h(VInput) },
      })
      expect(row(container).hasAttribute('aria-labelledby')).toBe(false)
      expect(row(container).hasAttribute('aria-describedby')).toBe(false)
    })

    // Aria-labelledby wins over aria-label in the name computation, so emitting ours on top of
    // a consumer's aria-label would silently cancel it.
    it('a consumer aria-label holds ours back', () => {
      const { container } = render(VInputGroup, {
        props: { label: 'Phone' },
        attrs: { 'aria-label': 'Contact number' },
        slots: { default: () => h(VInput) },
      })
      expect(row(container).hasAttribute('aria-labelledby')).toBe(false)
      expect(row(container).getAttribute('aria-label')).toBe('Contact number')
    })

    it('a consumer aria-labelledby holds ours back too', () => {
      const { container } = render(VInputGroup, {
        props: { label: 'Phone' },
        attrs: { 'aria-labelledby': 'outside' },
        slots: { default: () => h(VInput) },
      })
      expect(row(container).getAttribute('aria-labelledby')).toBe('outside')
    })

    it('renders the hint once and points aria-describedby at it', () => {
      const { container } = render(VInputGroup, {
        props: { hint: 'Include the country code' },
        slots: { default: () => h(VInput) },
      })
      const hints = container.querySelectorAll('.v-field-hint')
      expect(hints).toHaveLength(1)
      expect(row(container).getAttribute('aria-describedby')).toBe(hints[0]!.id)
    })

    // Aria-describedby is a LIST: the hint is ADDED to whatever the consumer pointed at. Left
    // to fallthrough it would be REPLACED, and the hint would stop being announced.
    it('the hint is added to a consumer aria-describedby, never replacing it', () => {
      const { container } = render(VInputGroup, {
        props: { hint: 'Include the country code' },
        attrs: { 'aria-describedby': 'outside' },
        slots: { default: () => h(VInput) },
      })
      const hintId = (container.querySelector('.v-field-hint') as HTMLElement).id
      expect(row(container).getAttribute('aria-describedby')).toBe(`outside ${hintId}`)
    })

    it('two groups on the page do not share their ids', () => {
      const { container } = render({
        components: { VInputGroup, VInput },
        template: `
          <div>
            <VInputGroup label="A" hint="a"><VInput /></VInputGroup>
            <VInputGroup label="B" hint="b"><VInput /></VInputGroup>
          </div>
        `,
      })
      const [a, b] = [...container.querySelectorAll<HTMLElement>('.v-input-group-row')] as [
        HTMLElement,
        HTMLElement,
      ]
      expect(a.getAttribute('aria-labelledby')).not.toBe(b.getAttribute('aria-labelledby'))
      expect(a.getAttribute('aria-describedby')).not.toBe(b.getAttribute('aria-describedby'))
    })
  })

  describe('attributes', () => {
    it('a consumer class and style land on the root', () => {
      const { container } = render(VInputGroup, {
        attrs: { class: 'mine', style: 'margin-top: 4px' },
        slots: { default: () => h(VInput) },
      })
      expect(root(container).classList.contains('mine')).toBe(true)
      expect(root(container).style.marginTop).toBe('4px')
    })

    it('other native attributes land on the row', () => {
      const { container } = render(VInputGroup, {
        attrs: { id: 'phone-row', 'data-testid': 'row' },
        slots: { default: () => h(VInput) },
      })
      expect(row(container).id).toBe('phone-row')
      expect(row(container).dataset.testid).toBe('row')
    })
  })

  describe('the row hands its shape down', () => {
    it('size, compact and disabled reach a VInput segment', () => {
      const { container } = render(VInputGroup, {
        props: { size: 'lg', compact: true, disabled: true },
        slots: { default: () => h(VInput) },
      })
      const field = fields(container)[0]!
      expect(field.dataset.size).toBe('lg')
      expect(field.hasAttribute('data-compact')).toBe(true)
      expect(field.hasAttribute('data-disabled')).toBe(true)
      expect(container.querySelector<HTMLInputElement>('.v-input-control')?.disabled).toBe(true)
    })

    it('a silent group changes nothing about a segment', () => {
      const { container } = render(VInputGroup, {
        slots: { default: () => h(VInput, { size: 'sm', compact: true }) },
      })
      const field = fields(container)[0]!
      expect(field.dataset.size).toBe('sm')
      expect(field.hasAttribute('data-compact')).toBe(true)
    })

    it('the group wins on size and compact, which are the shape of the control', () => {
      const { container } = render(VInputGroup, {
        props: { size: 'lg' },
        slots: { default: () => h(VInput, { size: 'sm' }) },
      })
      expect(fields(container)[0]!.dataset.size).toBe('lg')
    })

    it('disabled is cumulative: a segment cannot opt back in', () => {
      const { container } = render(VInputGroup, {
        props: { disabled: true },
        slots: { default: () => h(VInput, { disabled: false }) },
      })
      expect(fields(container)[0]!.hasAttribute('data-disabled')).toBe(true)
    })

    it('disabled is cumulative the other way: a silent row does not revive a segment', () => {
      const { container } = render(VInputGroup, {
        slots: { default: () => h(VInput, { disabled: true }) },
      })
      expect(fields(container)[0]!.hasAttribute('data-disabled')).toBe(true)
    })

    it('reaches a segment through a companion wrapper', () => {
      const { container } = render(VInputGroup, {
        props: { size: 'lg' },
        slots: {
          default: () => h(VTooltip, { text: 'Country code' }, { default: () => h(VInput) }),
        },
      })
      expect(fields(container)[0]!.dataset.size).toBe('lg')
    })

    // VButton reads VButtonGroup's context, which the group provides as well, so a button
    // segment follows the row without a line of its own in VButton.
    it('a VButton segment takes the row height and its disabled state', () => {
      const { container } = render(VInputGroup, {
        props: { size: 'lg', disabled: true },
        slots: { default: () => [h(VInput), h(VButton, () => 'Search')] },
      })
      const button = container.querySelector('.v-button') as HTMLButtonElement
      expect(button.dataset.size).toBe('lg')
      expect(button.disabled).toBe(true)
    })

    it('a VIconButton segment follows too', () => {
      const { container } = render(VInputGroup, {
        props: { size: 'sm' },
        slots: { default: () => [h(VInput), h(VIconButton, { icon: 'search', label: 'Search' })] },
      })
      expect((container.querySelector('.v-icon-button') as HTMLElement).dataset.size).toBe('sm')
    })
  })

  describe('composed fields', () => {
    it('VCombobox: the field, the panel and the chips all follow the row', async () => {
      const { container } = render(VInputGroup, {
        props: { size: 'lg' },
        slots: {
          default: () =>
            h(VCombobox, {
              multiple: true,
              modelValue: ['fr'],
              options: [{ value: 'fr', label: 'France' }],
              size: 'sm',
            }),
        },
      })
      expect((container.querySelector('.v-combobox') as HTMLElement).dataset.size).toBe('lg')
      expect(fields(container)[0]!.dataset.size).toBe('lg')
      expect((container.querySelector('.v-chip') as HTMLElement).dataset.size).toBe('sm')
      expect((container.querySelector('.v-combobox-panel') as HTMLElement).dataset.size).toBe('lg')
    })

    it('VDateInput follows the row', () => {
      const { container } = render(VInputGroup, {
        props: { size: 'lg' },
        slots: { default: () => h(VDateInput) },
      })
      expect(fields(container)[0]!.dataset.size).toBe('lg')
    })

    it('VTimeInput follows the row, as one box like any other field', () => {
      const { container } = render(VInputGroup, {
        props: { size: 'lg' },
        slots: { default: () => h(VTimeInput, { format: '12h' }) },
      })
      expect(fields(container)[0]!.dataset.size).toBe('lg')
      expect(container.querySelector('.v-input-field .v-time-input-meridiem')).toBeTruthy()
      expect(container.querySelectorAll('.v-time-input > *')).toHaveLength(1)
    })

    it('VFileInput follows the row', () => {
      const { container } = render(VInputGroup, {
        props: { size: 'lg' },
        slots: { default: () => h(VFileInput) },
      })
      expect((container.querySelector('.v-file-input') as HTMLElement).dataset.size).toBe('lg')
    })

    // The hidden file input is what the FORM submits: left enabled under a disabled row, its
    // `name` still goes out with the form.
    it('VFileInput: a disabled row disables the hidden file input too', () => {
      const { container } = render(VInputGroup, {
        props: { disabled: true },
        slots: { default: () => h(VFileInput, { name: 'attachments' }) },
      })
      expect(container.querySelector<HTMLInputElement>('input[type="file"]')!.disabled).toBe(true)
      expect(container.querySelector('.v-file-input')!.hasAttribute('data-disabled')).toBe(true)
    })

    it('VTextarea is left untouched', () => {
      const { container } = render(VInputGroup, {
        props: { size: 'lg' },
        slots: { default: () => h(VTextarea, { size: 'sm' }) },
      })
      expect((container.querySelector('.v-textarea-field') as HTMLElement).dataset.size).toBe('sm')
    })
  })

  describe('the row stops at a panel', () => {
    it("VDateInput: the calendar's own navigation keeps its size", async () => {
      const { container } = render(VInputGroup, {
        props: { size: 'lg' },
        slots: { default: () => h(VDateInput, { showPicker: true }) },
      })
      await fireEvent.click(container.querySelector('.v-date-input-control') as HTMLElement)

      const navButtons = [
        ...container.querySelectorAll<HTMLElement>(
          '.v-date-picker .v-button, .v-date-picker .v-icon-button',
        ),
      ]
      expect(navButtons.length).toBeGreaterThan(0)
      for (const button of navButtons) expect(button.dataset.size).not.toBe('lg')
    })

    it("VTimeInput: the clock's own cells keep their size", async () => {
      const { container } = render(VInputGroup, {
        props: { size: 'sm' },
        slots: { default: () => h(VTimeInput, { mode: 'picker' }) },
      })
      await fireEvent.click(container.querySelector('.v-time-input-control') as HTMLElement)

      const cells = [...container.querySelectorAll<HTMLElement>('.v-time-picker .v-button')]
      expect(cells.length).toBeGreaterThan(0)
      expect(cells.some((cell) => cell.dataset.size === 'lg')).toBe(true)
    })
  })

  describe('follows a slot the parent replaces', () => {
    /** The block's single template factory (vue/one-component-per-file). */
    const renderTemplate = (template: string, bindings: Record<string, unknown>) =>
      render(defineComponent({ components: { VInputGroup }, setup: () => bindings, template }))

    it('a render-function slot capturing a local', async () => {
      const text = ref('before')
      const Parent = defineComponent(() => () => {
        const captured = text.value
        return h(VInputGroup, null, { default: () => [h('span', captured)] })
      })
      const { container } = render(Parent)
      text.value = 'after'
      await nextTick()
      expect(root(container).textContent).toContain('after')
    })

    it('a v-for whose array is replaced', async () => {
      const rows = ref([{ v: 'before' }])
      const { container } = renderTemplate(
        `<VInputGroup v-for="(row, i) in rows" :key="i"><span>{{ row.v }}</span></VInputGroup>`,
        { rows },
      )
      rows.value = [{ v: 'after' }]
      await nextTick()
      expect(root(container).textContent).toContain('after')
    })

    it('a v-if / v-else between two slot templates', async () => {
      const first = ref(true)
      const { container } = renderTemplate(
        `<VInputGroup><template v-if="first" #default><span>before</span></template><template v-else #default><span>after</span></template></VInputGroup>`,
        { first },
      )
      first.value = false
      await nextTick()
      expect(root(container).textContent).toContain('after')
    })
  })
})
