import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'

import { useRootAttrs } from './useRootAttrs'

// Composant minimal en pattern wrapper-root : racine porteuse de class/style,
// enfant fonctionnel porteur de tout le reste.
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
  it('garde class/style sur la racine et reporte le reste sur le contrôle', () => {
    const { container } = render(Wrapper, {
      attrs: { class: 'custom', style: 'color: red', name: 'champ', required: '' },
    })
    const root = container.querySelector('.v-root') as HTMLElement
    const control = container.querySelector('.v-control') as HTMLInputElement

    expect(root.classList.contains('custom')).toBe(true)
    expect(root.style.color).toBe('red')
    // le nom et la contrainte doivent atterrir sur le contrôle, pas sur le wrapper
    expect(root.hasAttribute('name')).toBe(false)
    expect(control.getAttribute('name')).toBe('champ')
    expect(control.hasAttribute('required')).toBe(true)
    expect(control.hasAttribute('class')).toBe(true)
  })
})
