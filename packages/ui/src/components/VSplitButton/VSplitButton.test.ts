import { fireEvent, render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import { registerMessages, setLocale } from '../../i18n/state'
import { fr } from '../../i18n/fr'
import VMenuItem from '../VMenu/VMenuItem.vue'
import VSplitButton from './VSplitButton.vue'

function renderHarness(template: string, bindings: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { VSplitButton, VMenuItem },
    setup: () => bindings,
    template,
  })
  return render(Harness)
}

const items = '<VMenuItem label="Save as draft" /><VMenuItem label="Save and close" />'

afterEach(() => {
  setLocale('en-US')
})

describe('VSplitButton', () => {
  it('joins the main action and a menu button in a group', () => {
    const { getByRole, container } = renderHarness(
      `<VSplitButton label="Save">${items}</VSplitButton>`,
    )
    const group = getByRole('group')
    expect(group.classList.contains('v-split-button')).toBe(true)
    expect(group.hasAttribute('data-bordered')).toBe(true)

    const main = getByRole('button', { name: 'Save' })
    expect(main.getAttribute('type')).toBe('button')
    expect(main.hasAttribute('aria-haspopup')).toBe(false)

    const trigger = getByRole('button', { name: 'More options' })
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    const menu = container.querySelector('[role="menu"]')!
    expect(trigger.getAttribute('aria-controls')).toBe(menu.id)
    expect(trigger.querySelector('[data-icon]')!.getAttribute('data-icon')).toBe('expand_more')
  })

  it('variant, tone, size, compact and elevated reach both halves', () => {
    const { getByRole } = renderHarness(
      `<VSplitButton label="Save" variant="outline" tone="danger" size="lg" compact elevated>
        ${items}
      </VSplitButton>`,
    )
    for (const button of [
      getByRole('button', { name: 'Save' }),
      getByRole('button', { name: 'More options' }),
    ]) {
      expect(button.dataset.variant).toBe('outline')
      expect(button.dataset.tone).toBe('danger')
      expect(button.dataset.size).toBe('lg')
      expect(button.hasAttribute('data-compact')).toBe(true)
      expect(button.hasAttribute('data-elevated')).toBe(true)
    }
  })

  it('defaults to a solid accent control of medium size', () => {
    const { getByRole } = renderHarness(`<VSplitButton label="Save">${items}</VSplitButton>`)
    for (const name of ['Save', 'More options']) {
      const button = getByRole('button', { name })
      expect(button.dataset.variant).toBe('solid')
      expect(button.dataset.tone).toBe('accent')
      expect(button.dataset.size).toBe('md')
    }
  })

  it('emits click from the main action only, once', async () => {
    const onClick = vi.fn()
    const { getByRole } = renderHarness(
      `<VSplitButton label="Save" @click="onClick">${items}</VSplitButton>`,
      { onClick },
    )
    await fireEvent.click(getByRole('button', { name: 'Save' }))
    expect(onClick).toHaveBeenCalledOnce()
    expect(onClick.mock.calls[0]![0]).toBeInstanceOf(MouseEvent)
    await fireEvent.click(getByRole('button', { name: 'More options' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('disabled disables both halves', () => {
    const onClick = vi.fn()
    const { getByRole } = renderHarness(
      `<VSplitButton label="Save" disabled @click="onClick">${items}</VSplitButton>`,
      { onClick },
    )
    const main = getByRole('button', { name: 'Save' }) as HTMLButtonElement
    expect(main.disabled).toBe(true)
    expect((getByRole('button', { name: 'More options' }) as HTMLButtonElement).disabled).toBe(true)
    // `click()` and not `fireEvent`: jsdom dispatches a synthetic event to a disabled button,
    // where the activation behaviour a browser applies is what `click()` follows.
    main.click()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('loading marks the main action busy and disables the menu button', () => {
    const { getByRole, container } = renderHarness(
      `<VSplitButton label="Save" loading>${items}</VSplitButton>`,
    )
    const main = getByRole('button', { name: 'Save' }) as HTMLButtonElement
    expect(main.getAttribute('aria-busy')).toBe('true')
    expect(main.disabled).toBe(true)
    expect(container.querySelector('.v-button-spinner')).not.toBeNull()
    expect((getByRole('button', { name: 'More options' }) as HTMLButtonElement).disabled).toBe(true)
    // The stylesheet keeps the menu button in the main action's paint from this.
    expect(getByRole('group').hasAttribute('data-loading')).toBe(true)
  })

  it('href makes the main action a link, inert while loading', async () => {
    const view = renderHarness(`<VSplitButton label="Open" href="/report">${items}</VSplitButton>`)
    expect(view.getByRole('link', { name: 'Open' }).getAttribute('href')).toBe('/report')
    view.unmount()

    const onClick = vi.fn()
    const inert = renderHarness(
      `<VSplitButton label="Open" href="/report" loading @click="onClick">${items}</VSplitButton>`,
      { onClick },
    )
    const link = inert.getByRole('link', { name: 'Open' })
    expect(link.hasAttribute('href')).toBe(false)
    expect(link.getAttribute('aria-disabled')).toBe('true')
    await fireEvent.click(link)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('icons and the native type reach the main action', () => {
    const { getByRole } = renderHarness(
      `<VSplitButton label="Send" type="submit" icon-start="check" icon-end="add">
        ${items}
      </VSplitButton>`,
    )
    const main = getByRole('button', { name: 'Send' })
    expect(main.getAttribute('type')).toBe('submit')
    const icons = [...main.querySelectorAll('[data-icon]')].map((icon) =>
      icon.getAttribute('data-icon'),
    )
    expect(icons).toEqual(['check', 'add'])
  })

  it('class and style stay on the group, other attributes go to the main action', () => {
    const { getByRole } = renderHarness(
      `<VSplitButton label="Save" class="extra" style="margin: 4px" data-x="1" aria-describedby="h">
        ${items}
      </VSplitButton>`,
    )
    const group = getByRole('group')
    expect(group.classList.contains('extra')).toBe(true)
    expect(group.style.margin).toBe('4px')
    expect(group.hasAttribute('data-x')).toBe(false)
    const main = getByRole('button', { name: 'Save' })
    expect(main.dataset.x).toBe('1')
    expect(main.getAttribute('aria-describedby')).toBe('h')
    expect(main.classList.contains('extra')).toBe(false)
  })

  it('menu props reach the panel', () => {
    const { container } = renderHarness(
      `<VSplitButton label="Save" menu-size="md" menu-width="16rem" match-trigger>
        ${items}
      </VSplitButton>`,
    )
    const menu = container.querySelector('[role="menu"]') as HTMLElement
    expect(menu.dataset.size).toBe('md')
    expect(menu.style.getPropertyValue('--menu-width')).toBe('16rem')
    expect(menu.hasAttribute('data-match-trigger')).toBe(true)
  })

  it('full width is reflected on the group', () => {
    const { getByRole } = renderHarness(
      `<VSplitButton label="Save" full-width>${items}</VSplitButton>`,
    )
    expect(getByRole('group').hasAttribute('data-full-width')).toBe(true)
  })

  it('v-model:open follows the menu both ways', async () => {
    const open = ref(false)
    const { getByRole, container } = renderHarness(
      `<VSplitButton v-model:open="open" label="Save">${items}</VSplitButton>`,
      { open },
    )
    const menu = container.querySelector('[role="menu"]') as HTMLElement
    open.value = true
    await nextTick()
    await nextTick()
    expect(menu.hasAttribute('data-popover-open')).toBe(true)
    expect(getByRole('button', { name: 'More options' }).getAttribute('aria-expanded')).toBe('true')

    menu.hidePopover()
    await nextTick()
    expect(open.value).toBe(false)
  })

  it('menuLabel and menuIcon replace the defaults', () => {
    const { getByRole } = renderHarness(
      `<VSplitButton label="Save" menu-label="Other ways to save" menu-icon="arrow_drop_down">
        ${items}
      </VSplitButton>`,
    )
    const trigger = getByRole('button', { name: 'Other ways to save' })
    expect(trigger.querySelector('[data-icon]')!.getAttribute('data-icon')).toBe('arrow_drop_down')
  })

  it('names the menu button from the dictionary', async () => {
    registerMessages('fr', fr)
    setLocale('fr-FR')
    const { findByRole } = renderHarness(
      `<VSplitButton label="Enregistrer">${items}</VSplitButton>`,
    )
    expect(await findByRole('button', { name: 'Plus d’options' })).toBeTruthy()
  })

  it('exposes focus() and el for the main action', () => {
    const split = ref<InstanceType<typeof VSplitButton> | null>(null)
    const { getByRole } = renderHarness(
      `<VSplitButton ref="split" label="Save">${items}</VSplitButton>`,
      { split },
    )
    const main = getByRole('button', { name: 'Save' })
    expect(split.value!.el).toBe(main)
    split.value!.focus()
    expect(document.activeElement).toBe(main)
  })
})
