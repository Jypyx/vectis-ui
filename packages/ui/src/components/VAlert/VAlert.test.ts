import { fireEvent, render } from '@testing-library/vue'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import { registerMessages, setLocale } from '../../i18n/state'
import { fr } from '../../i18n/fr'
import VAlert from './VAlert.vue'

/** The file's single component factory (vue/one-component-per-file). */
function renderHarness(template: string, bindings: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { VAlert },
    setup: () => bindings,
    template,
  })
  return render(Harness)
}

afterEach(() => {
  setLocale('en-US')
})

describe('VAlert', () => {
  it('renders the message in a .v-alert carrying the soft accent defaults', () => {
    const { container, getByText } = render(VAlert, {
      slots: { default: 'Your changes are saved.' },
    })
    const root = container.firstElementChild!
    expect(root.classList.contains('v-alert')).toBe(true)
    expect(root.classList.contains('v-tone')).toBe(true)
    expect(root.getAttribute('data-variant')).toBe('soft')
    expect(root.getAttribute('data-tone')).toBe('accent')
    expect(getByText('Your changes are saved.')).toBeTruthy()
  })

  it('mirrors variant and tone as data attributes', () => {
    const { container } = render(VAlert, { props: { variant: 'outline', tone: 'danger' } })
    const root = container.firstElementChild!
    expect(root.getAttribute('data-variant')).toBe('outline')
    expect(root.getAttribute('data-tone')).toBe('danger')
  })

  it('draws a title from the prop, and the #title slot replaces it', () => {
    const fromProp = render(VAlert, { props: { title: 'Saved' } })
    expect(fromProp.container.querySelector('.v-alert-title')!.textContent).toBe('Saved')

    const fromSlot = render(VAlert, {
      props: { title: 'Saved' },
      slots: { title: '<em>Saved twice</em>' },
    })
    expect(fromSlot.container.querySelector('.v-alert-title em')!.textContent).toBe('Saved twice')

    const none = render(VAlert, { slots: { default: 'Message' } })
    expect(none.container.querySelector('.v-alert-title')).toBeNull()
  })

  it('draws the tone icon by default, the given one instead, and none with hideIcon', () => {
    const byTone = render(VAlert, { props: { tone: 'success' } })
    expect(byTone.container.querySelector('.v-alert-icon')).not.toBeNull()

    const given = render(VAlert, { props: { icon: { text: '★' } } })
    expect(given.container.querySelector('.v-alert-icon')!.textContent).toContain('★')

    const hidden = render(VAlert, { props: { icon: { text: '★' }, hideIcon: true } })
    expect(hidden.container.querySelector('.v-alert-icon')).toBeNull()
  })

  it('wraps the #actions slot only when it is given', () => {
    const without = render(VAlert, { slots: { default: 'Message' } })
    expect(without.container.querySelector('.v-alert-actions')).toBeNull()

    const withActions = render(VAlert, {
      slots: { actions: '<button type="button">Retry</button>' },
    })
    expect(withActions.getByRole('button', { name: 'Retry' }).parentElement!.className).toBe(
      'v-alert-actions',
    )
  })

  it('has no role by default; live gives status, or alert for the danger tone', () => {
    const stat = render(VAlert)
    expect(stat.container.firstElementChild!.hasAttribute('role')).toBe(false)

    const polite = render(VAlert, { props: { live: true, tone: 'warning' } })
    expect(polite.getByRole('status')).toBeTruthy()

    const urgent = render(VAlert, { props: { live: true, tone: 'danger' } })
    expect(urgent.getByRole('alert')).toBeTruthy()
  })

  it('offers a close cross only when closable', () => {
    const plain = render(VAlert)
    expect(plain.queryByRole('button')).toBeNull()

    const closable = render(VAlert, { props: { closable: true } })
    expect(closable.getByRole('button', { name: 'Close' })).toBeTruthy()
  })

  it('names the cross from closeLabel, or from the active dictionary', () => {
    const custom = render(VAlert, { props: { closable: true, closeLabel: 'Dismiss the notice' } })
    expect(custom.getByRole('button', { name: 'Dismiss the notice' })).toBeTruthy()

    registerMessages('fr', fr)
    setLocale('fr-FR')
    const translated = render(VAlert, { props: { closable: true } })
    expect(translated.getByRole('button', { name: 'Fermer' })).toBeTruthy()
  })

  it('closing hides the alert, emits close and updates v-model:open', async () => {
    const open = ref(true)
    const closes: unknown[][] = []
    const { container, getByRole } = renderHarness(
      '<VAlert v-model:open="open" closable @close="onClose">Message</VAlert>',
      { open, onClose: (...args: unknown[]) => closes.push(args) },
    )

    await fireEvent.click(getByRole('button', { name: 'Close' }))
    expect(open.value).toBe(false)
    expect(closes).toEqual([[]])
    expect(container.querySelector('.v-alert')).toBeNull()
  })

  it('stays hidden after closing when the model is not bound, and reopens through it', async () => {
    const unbound = render(VAlert, { props: { closable: true } })
    await fireEvent.click(unbound.getByRole('button', { name: 'Close' }))
    expect(unbound.container.querySelector('.v-alert')).toBeNull()

    const open = ref(false)
    const bound = renderHarness('<VAlert v-model:open="open">Message</VAlert>', { open })
    expect(bound.container.querySelector('.v-alert')).toBeNull()
    open.value = true
    await nextTick()
    expect(bound.container.querySelector('.v-alert')).not.toBeNull()
  })

  it('lets native attributes fall through to the root, consumer role included', () => {
    const { container } = render(VAlert, {
      props: { live: true },
      attrs: { id: 'notice', 'data-test': 'x', role: 'note' },
    })
    const root = container.firstElementChild!
    expect(root.id).toBe('notice')
    expect(root.getAttribute('data-test')).toBe('x')
    expect(root.getAttribute('role')).toBe('note')
  })
})
