import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'

import { useRootAttrs } from './useRootAttrs'

// Minimal wrapper-root component: a root carrying class/style, a functional child
// carrying everything else.
const Wrapper = defineComponent({
  inheritAttrs: false,
  setup() {
    const { rootClass, rootStyle, forwardedAttrs } = useRootAttrs()
    return () =>
      h('div', { class: ['v-root', rootClass.value], style: rootStyle.value }, [
        h('input', { class: 'v-control', ...forwardedAttrs.value }),
      ])
  },
})

describe('useRootAttrs', () => {
  it('keeps class/style on the root and forwards the rest to the control', () => {
    const { container } = render(Wrapper, {
      attrs: { class: 'custom', style: 'color: red', name: 'field', required: '' },
    })
    const root = container.querySelector('.v-root') as HTMLElement
    const control = container.querySelector('.v-control') as HTMLInputElement

    expect(root.classList.contains('custom')).toBe(true)
    expect(root.style.color).toBe('red')
    // the name and the constraint must land on the control, not on the wrapper
    expect(root.hasAttribute('name')).toBe(false)
    expect(control.getAttribute('name')).toBe('field')
    expect(control.hasAttribute('required')).toBe(true)
    expect(control.hasAttribute('class')).toBe(true)
  })
})
