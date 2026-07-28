import { render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import Listbox from './Listbox.vue'
import ListboxOption from './ListboxOption.vue'

/** Unique fabrique de composant du fichier (vue/one-component-per-file). */
function renderHarness(template: string, bindings: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { Listbox, ListboxOption },
    setup: () => bindings,
    template,
  })
  return render(Harness)
}

/**
 * Ouvre le panneau (stub popover jsdom) : fermé, `[popover]` est display:none
 * et ses options sortent de l'arbre interrogeable par rôle.
 */
async function openPanel(container: Element): Promise<HTMLElement> {
  const panel = container.querySelector('[role="listbox"]') as HTMLElement
  panel.showPopover()
  await nextTick()
  return panel
}

function renderListbox(attrs = '', onSelect = vi.fn()) {
  return {
    onSelect,
    ...renderHarness(
      `
        <Listbox id="liste" anchor="--ancre-test" ${attrs}>
          <ListboxOption label="Paris" selected />
          <ListboxOption label="Lyon" active />
          <ListboxOption label="Nice" disabled />
        </Listbox>
      `,
      { onSelect },
    ),
  }
}

describe('Listbox', () => {
  it('rend un panneau role="listbox" popover manual portant l’id du consommateur', () => {
    const { container } = renderListbox()
    const panel = container.querySelector('[role="listbox"]') as HTMLElement
    expect(panel.id).toBe('liste')
    // manual : pas de light dismiss, la fermeture appartient au consommateur
    expect(panel.getAttribute('popover')).toBe('manual')
    // garde-fou du panneau fermé (cf. .ds-floating:not(:popover-open))
    expect(panel.classList.contains('ds-floating')).toBe(true)
    expect(panel.classList.contains('ds-panel')).toBe(true)
  })

  it('multiselectable pose aria-multiselectable (absent sinon)', () => {
    const { container } = renderListbox()
    expect(container.querySelector('[role="listbox"]')?.hasAttribute('aria-multiselectable')).toBe(
      false,
    )

    const { container: multi } = renderListbox('multiselectable')
    expect(multi.querySelector('[role="listbox"]')?.getAttribute('aria-multiselectable')).toBe(
      'true',
    )
  })

  it('anchor est exposée en variable inline (position-anchor en CSS)', () => {
    const { container } = renderListbox()
    const panel = container.querySelector('[role="listbox"]') as HTMLElement
    expect(panel.style.getPropertyValue('--_anchor')).toBe('--ancre-test')
  })

  it('size/compact posent data-size/data-compact sur le panneau', () => {
    const { container } = renderListbox('size="md" compact')
    const panel = container.querySelector('[role="listbox"]') as HTMLElement
    expect(panel.getAttribute('data-size')).toBe('md')
    expect(panel.hasAttribute('data-compact')).toBe(true)
  })

  it('v-model:open pilote le panneau dans les deux sens', async () => {
    const open = ref(false)
    const { container } = renderHarness(
      `
        <Listbox id="liste" anchor="--a" v-model:open="open">
          <ListboxOption label="Paris" />
        </Listbox>
      `,
      { open },
    )
    const panel = container.querySelector('[role="listbox"]') as HTMLElement
    expect(panel.hasAttribute('data-popover-open')).toBe(false)

    // modèle → DOM
    open.value = true
    await nextTick()
    expect(panel.hasAttribute('data-popover-open')).toBe(true)

    // DOM → modèle (le stub jsdom n'émet que `toggle`)
    panel.hidePopover()
    await nextTick()
    expect(open.value).toBe(false)

    // idempotence : un second hidePopover() lèverait InvalidStateError sans la
    // garde de usePopover
    expect(() => panel.hidePopover()).not.toThrow()
  })

  it("n'a aucun gestionnaire clavier : le contrôle externe pilote tout", async () => {
    const { container } = renderListbox()
    const panel = await openPanel(container)

    const before = document.activeElement
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
    // aucune option n'a pris le focus : le focus reste où il était
    expect(document.activeElement).toBe(before)
  })

  it('mousedown est annulé : le clic sur une option ne vole pas le focus du champ', async () => {
    const { container, getByRole } = renderListbox()
    await openPanel(container)
    const option = getByRole('option', { name: /Lyon/ })
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    option.dispatchEvent(event)
    // sans cela, le focusout du consommateur fermerait le panneau avant @select
    expect(event.defaultPrevented).toBe(true)
  })

  describe('ListboxOption', () => {
    it('pose role="option" et aria-selected TOUJOURS (true comme false)', async () => {
      const { container, getByRole } = renderListbox()
      await openPanel(container)
      expect(getByRole('option', { name: /Paris/ }).getAttribute('aria-selected')).toBe('true')
      expect(getByRole('option', { name: /Lyon/ }).getAttribute('aria-selected')).toBe('false')
    })

    it('active pose data-active (surbrillance pilotée de l’extérieur)', async () => {
      const { container, getByRole } = renderListbox()
      await openPanel(container)
      expect(getByRole('option', { name: /Lyon/ }).hasAttribute('data-active')).toBe(true)
      expect(getByRole('option', { name: /Paris/ }).hasAttribute('data-active')).toBe(false)
    })

    it('disabled passe par aria-disabled, jamais par l’attribut natif', async () => {
      const { container, getByRole } = renderListbox()
      await openPanel(container)
      const disabled = getByRole('option', { name: /Nice/ }) as HTMLButtonElement
      expect(disabled.getAttribute('aria-disabled')).toBe('true')
      // l'option doit rester dans l'arbre a11y parcouru par le champ
      expect(disabled.disabled).toBe(false)
    })

    it('émet select au clic, sauf si désactivée', async () => {
      const onSelect = vi.fn()
      const { container, getByRole } = renderHarness(
        `
          <Listbox id="liste" anchor="--a">
            <ListboxOption label="Paris" @select="onSelect" />
            <ListboxOption label="Nice" disabled @select="onSelect" />
          </Listbox>
        `,
        { onSelect },
      )
      await openPanel(container)
      getByRole('option', { name: /Paris/ }).click()
      expect(onSelect).toHaveBeenCalledOnce()
      getByRole('option', { name: /Nice/ }).click()
      expect(onSelect).toHaveBeenCalledOnce()
    })

    it('la coche remplace l’emplacement de fin quand l’option est sélectionnée', async () => {
      const { container, getByRole } = renderHarness(`
        <Listbox id="liste" anchor="--a">
          <ListboxOption label="Paris" selected icon-end="star" />
          <ListboxOption label="Lyon" icon-end="star" />
        </Listbox>
      `)
      await openPanel(container)
      const selected = getByRole('option', { name: /Paris/ })
      expect(selected.querySelector('.ds-listbox-option-check')?.textContent).toBe('check')
      const symbols = [...selected.querySelectorAll('.ds-icon-symbol')].map((el) => el.textContent)
      expect(symbols).not.toContain('star')

      const other = getByRole('option', { name: /Lyon/ })
      expect(other.querySelector('.ds-listbox-option-check')).toBeNull()
      expect([...other.querySelectorAll('.ds-icon-symbol')].map((el) => el.textContent)).toContain(
        'star',
      )
    })
  })
})
