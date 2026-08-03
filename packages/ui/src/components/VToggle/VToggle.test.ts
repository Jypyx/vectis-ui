import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'

import Toggle from './Toggle.vue'
import type { ToggleModelValue } from './Toggle.vue'
import ToggleItem from './ToggleItem.vue'

/**
 * Harnais : le v-model doit être vivant (sans ref locale, cliquer un item ne
 * changerait rien) et la ref est renvoyée pour asserter la valeur émise.
 */
function mount(
  options: {
    /** Attributs bruts posés sur <Toggle>. */
    toggleAttrs?: string
    /** Corps du slot par défaut ; par défaut trois items a/b/c. */
    items?: string
    initial?: ToggleModelValue
  } = {},
) {
  const model = ref<ToggleModelValue>(options.initial ?? null)
  const items =
    options.items ??
    `<ToggleItem value="a" label="Un" />
     <ToggleItem value="b" label="Deux" />
     <ToggleItem value="c" label="Trois" />`

  const Harness = defineComponent({
    components: { Toggle, ToggleItem },
    setup: () => ({ model }),
    template: `
      <Toggle v-model="model" ${options.toggleAttrs ?? ''}>
        ${items}
      </Toggle>
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

describe('Toggle', () => {
  describe('accessibilité', () => {
    it('rend un groupe nommé de boutons bascule', () => {
      const { container } = mount({ toggleAttrs: 'label="Alignement"' })
      const group = container.querySelector('[role="group"]')
      expect(group?.getAttribute('aria-label')).toBe('Alignement')
      expect(pressedOf(container)).toEqual(['false', 'false', 'false'])
    })

    it('marque l’item sélectionné aria-pressed', () => {
      const { container } = mount({ initial: 'b' })
      expect(pressedOf(container)).toEqual(['false', 'true', 'false'])
    })

    it('un aria-label du consommateur remplace la prop label', () => {
      const { container } = mount({ toggleAttrs: 'label="Alignement" aria-label="Style"' })
      expect(container.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Style')
    })

    it('un aria-labelledby du consommateur supprime l’aria-label par défaut', () => {
      const { container } = mount({ toggleAttrs: 'label="Alignement" aria-labelledby="titre"' })
      const group = container.querySelector('[role="group"]')
      expect(group?.hasAttribute('aria-label')).toBe(false)
      expect(group?.getAttribute('aria-labelledby')).toBe('titre')
    })

    it('chaque item reste un .v-button (classes fusionnées, pas remplacées)', () => {
      const { container } = mount()
      for (const item of itemsOf(container)) {
        expect(item.classList.contains('v-button')).toBe(true)
        expect(item.tagName).toBe('BUTTON')
      }
    })
  })

  describe('structure', () => {
    it('attached (défaut) : les items sont enfants DIRECTS du ButtonGroup (couture)', () => {
      const { container } = mount()
      expect(container.querySelector('.v-toggle.v-button-group')).not.toBeNull()
      // garde structurelle : un wrapper intercalé casserait silencieusement la couture
      expect(container.querySelector('.v-button-group > .v-toggle-item')).not.toBeNull()
    })

    it('attached : l’orientation transite par la prop de ButtonGroup', () => {
      const { container } = mount({ toggleAttrs: 'orientation="vertical"' })
      expect(container.querySelector('.v-button-group')?.getAttribute('data-orientation')).toBe(
        'vertical',
      )
    })

    it('détaché : un simple div porte le rôle et data-orientation', () => {
      const { container } = mount({ toggleAttrs: ':attached="false" orientation="vertical"' })
      expect(container.querySelector('.v-button-group')).toBeNull()
      const group = container.querySelector('.v-toggle')
      expect(group?.getAttribute('role')).toBe('group')
      expect(group?.getAttribute('data-orientation')).toBe('vertical')
    })
  })

  describe('v-model simple', () => {
    it('un clic sélectionne l’item', async () => {
      const { container, model } = mount()
      await fireEvent.click(itemsOf(container)[1] as HTMLElement)
      expect(model.value).toBe('b')
      expect(pressedOf(container)).toEqual(['false', 'true', 'false'])
    })

    it('un clic sur un autre item bascule la sélection', async () => {
      const { container, model } = mount({ initial: 'a' })
      await fireEvent.click(itemsOf(container)[2] as HTMLElement)
      expect(model.value).toBe('c')
    })

    it('re-cliquer l’item sélectionné le désélectionne', async () => {
      const { container, model } = mount({ initial: 'a' })
      await fireEvent.click(itemsOf(container)[0] as HTMLElement)
      expect(model.value).toBeNull()
    })

    it('mandatory : la dernière valeur ne se désélectionne pas', async () => {
      const { container, model } = mount({ initial: 'a', toggleAttrs: 'mandatory' })
      await fireEvent.click(itemsOf(container)[0] as HTMLElement)
      expect(model.value).toBe('a')
      // mais changer d'item reste possible
      await fireEvent.click(itemsOf(container)[1] as HTMLElement)
      expect(model.value).toBe('b')
    })
  })

  describe('v-model multiple', () => {
    it('normalise un v-model null en tableau à la première sélection', async () => {
      const { container, model } = mount({ toggleAttrs: 'multiple' })
      await fireEvent.click(itemsOf(container)[0] as HTMLElement)
      expect(model.value).toEqual(['a'])
    })

    it('cumule puis retire des valeurs', async () => {
      const { container, model } = mount({ initial: ['a'], toggleAttrs: 'multiple' })
      await fireEvent.click(itemsOf(container)[1] as HTMLElement)
      expect(model.value).toEqual(['a', 'b'])
      expect(pressedOf(container)).toEqual(['true', 'true', 'false'])

      await fireEvent.click(itemsOf(container)[0] as HTMLElement)
      expect(model.value).toEqual(['b'])
    })

    it('mandatory : le dernier élément ne se retire pas', async () => {
      const { container, model } = mount({ initial: ['a'], toggleAttrs: 'multiple mandatory' })
      await fireEvent.click(itemsOf(container)[0] as HTMLElement)
      expect(model.value).toEqual(['a'])
    })

    it('chaque écriture produit une nouvelle référence de tableau', async () => {
      const initial: ToggleModelValue = ['a']
      const { container, model } = mount({ initial, toggleAttrs: 'multiple' })
      await fireEvent.click(itemsOf(container)[1] as HTMLElement)
      expect(model.value).not.toBe(initial)
      expect(initial).toEqual(['a'])
    })
  })

  describe('variantes et tones', () => {
    it('l’item sélectionné est solid au tone du groupe, les autres au variant neutre', () => {
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

  describe('propagation du contexte', () => {
    it('size et compact atteignent chaque bouton', () => {
      const { container } = mount({ toggleAttrs: 'size="sm" compact' })
      const items = itemsOf(container)
      expect(items.every((el) => el.dataset.size === 'sm')).toBe(true)
      expect(items.every((el) => el.hasAttribute('data-compact'))).toBe(true)
    })

    it('disabled de groupe désactive tous les items, disabled d’item un seul', () => {
      const grouped = mount({ toggleAttrs: 'disabled' })
      expect(itemsOf(grouped.container).every((el) => (el as HTMLButtonElement).disabled)).toBe(
        true,
      )
      grouped.unmount()

      const { container } = mount({
        items: `<ToggleItem value="a" label="Un" />
                <ToggleItem value="b" label="Deux" disabled />`,
      })
      const [first, second] = itemsOf(container) as HTMLButtonElement[]
      expect(first?.disabled).toBe(false)
      expect(second?.disabled).toBe(true)
    })
  })

  describe('icônes', () => {
    const iconItems = `<ToggleItem value="a" icon="favorite" label="Un" />
                       <ToggleItem value="b" icon="star" label="Deux" />`

    it('selectedIconFilled remplit l’icône du seul item sélectionné', () => {
      const { container } = mount({
        initial: 'a',
        toggleAttrs: 'selected-icon-filled',
        items: iconItems,
      })
      const [first, second] = itemsOf(container)
      expect(first?.querySelector('.v-icon')?.hasAttribute('data-filled')).toBe(true)
      expect(second?.querySelector('.v-icon')?.hasAttribute('data-filled')).toBe(false)
    })

    it('sans la prop, l’icône sélectionnée reste creuse', () => {
      const { container } = mount({ initial: 'a', items: iconItems })
      expect(itemsOf(container)[0]?.querySelector('.v-icon')?.hasAttribute('data-filled')).toBe(
        false,
      )
    })

    it('icône seule : item carré, nom accessible par fallthrough', () => {
      const { container } = mount({
        items: `<ToggleItem value="a" icon="favorite" aria-label="Favori" />`,
      })
      const item = itemsOf(container)[0]
      expect(item?.hasAttribute('data-icon-only')).toBe(true)
      expect(item?.getAttribute('aria-label')).toBe('Favori')
    })

    it('un libellé annule le mode icône seule', () => {
      const { container } = mount({
        items: `<ToggleItem value="a" icon="favorite" label="Favori" />`,
      })
      expect(itemsOf(container)[0]?.hasAttribute('data-icon-only')).toBe(false)
    })
  })

  describe('navigation clavier', () => {
    it('les flèches déplacent le focus sans rien sélectionner', async () => {
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

    it('boucle aux extrémités et répond à Home/End', async () => {
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

    it('saute les items désactivés', async () => {
      const { container } = mount({
        items: `<ToggleItem value="a" label="Un" />
                <ToggleItem value="b" label="Deux" disabled />
                <ToggleItem value="c" label="Trois" />`,
      })
      const items = itemsOf(container)
      const group = container.querySelector('[role="group"]') as HTMLElement
      items[0]?.focus()
      await fireEvent.keyDown(group, { key: 'ArrowRight' })
      expect(document.activeElement).toBe(items[2])
    })

    it('en vertical, seules les flèches haut/bas agissent', async () => {
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

  describe('hors contexte', () => {
    it('un ToggleItem seul se rend, jamais sélectionné, sans erreur au clic', async () => {
      const { container } = render(ToggleItem, { props: { value: 'a', label: 'Seul' } })
      const item = container.querySelector('.v-toggle-item')
      expect(item?.getAttribute('aria-pressed')).toBe('false')
      await fireEvent.click(item as HTMLElement)
      expect(item?.getAttribute('aria-pressed')).toBe('false')
    })
  })
})
