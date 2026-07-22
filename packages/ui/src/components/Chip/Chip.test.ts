import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import Chip from './Chip.vue'

describe('Chip', () => {
  it('statique sans interaction : aucun bouton ni lien, action rendue en span', () => {
    const { container, queryByRole, getByText } = render(Chip, {
      slots: { default: 'Étiquette' },
    })
    expect(queryByRole('button')).toBeNull()
    expect(queryByRole('link')).toBeNull()
    expect(container.querySelector('.ds-chip-action')?.tagName).toBe('SPAN')
    expect(getByText('Étiquette')).toBeTruthy()
  })

  it('clickable : bouton natif, le @click fallthrough atterrit sur le bouton', async () => {
    const onClick = vi.fn()
    const { getByRole } = render(Chip, {
      props: { clickable: true },
      attrs: { onClick },
      slots: { default: 'Action' },
    })
    const button = getByRole('button', { name: 'Action' })
    expect(button.getAttribute('type')).toBe('button')
    await fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('clickable disabled : attribut disabled natif posé', () => {
    const { getByRole } = render(Chip, {
      props: { clickable: true, disabled: true },
      slots: { default: 'Action' },
    })
    expect((getByRole('button') as HTMLButtonElement).disabled).toBe(true)
  })

  it('href : rendu <a>, les attrs target/rel tombent sur le lien', () => {
    const { getByRole } = render(Chip, {
      props: { href: '/docs' },
      attrs: { target: '_blank', rel: 'noopener' },
      slots: { default: 'Docs' },
    })
    const link = getByRole('link', { name: 'Docs' })
    expect(link.getAttribute('href')).toBe('/docs')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener')
  })

  it('lien inerte : disabled retire le href, pose aria-disabled et filtre onClick', async () => {
    const onClick = vi.fn()
    const { container } = render(Chip, {
      props: { href: '/docs', disabled: true },
      attrs: { onClick },
      slots: { default: 'Docs' },
    })
    const action = container.querySelector('.ds-chip-action')!
    expect(action.tagName).toBe('A')
    expect(action.hasAttribute('href')).toBe(false)
    expect(action.getAttribute('aria-disabled')).toBe('true')
    await fireEvent.click(action)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('priorité selectable > href : bouton aria-pressed, pas de lien', () => {
    const { getByRole, queryByRole } = render(Chip, {
      props: { selectable: true, href: '/docs' },
      slots: { default: 'Filtre' },
    })
    expect(queryByRole('link')).toBeNull()
    expect(getByRole('button', { name: 'Filtre' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('selectable : bouton aria-pressed synchronisé avec v-model:selected', async () => {
    const { getByRole, emitted } = render(Chip, {
      props: { selectable: true, selected: false },
      slots: { default: 'Filtre' },
    })
    const button = getByRole('button', { name: 'Filtre' })
    expect(button.getAttribute('aria-pressed')).toBe('false')
    await fireEvent.click(button)
    expect(emitted('update:selected')).toEqual([[true]])
  })

  it('selectable disabled : aucun update:selected émis', async () => {
    const { getByRole, emitted } = render(Chip, {
      props: { selectable: true, selected: false, disabled: true },
      slots: { default: 'Filtre' },
    })
    await fireEvent.click(getByRole('button'))
    expect(emitted('update:selected')).toBeUndefined()
  })

  it('check : remplace iconStart quand sélectionné', async () => {
    const { queryByText, rerender } = render(Chip, {
      props: { selectable: true, check: true, iconStart: 'star', selected: true },
      slots: { default: 'Filtre' },
    })
    expect(queryByText('check')).toBeTruthy()
    expect(queryByText('star')).toBeNull()
    await rerender({ selected: false })
    expect(queryByText('check')).toBeNull()
    expect(queryByText('star')).toBeTruthy()
  })

  it('dismissible : émet dismiss sans imbriquer de boutons', async () => {
    const { getAllByRole, emitted } = render(Chip, {
      props: { selectable: true, dismissible: true, selected: true },
      slots: { default: 'Tag' },
    })
    const buttons = getAllByRole('button')
    expect(buttons).toHaveLength(2)
    for (const b of buttons) expect(b.closest('button')).toBe(b)
    await fireEvent.click(getAllByRole('button', { name: 'Retirer' })[0]!)
    expect(emitted('dismiss')).toHaveLength(1)
  })

  it('dismissIcon : ligature Material par défaut (close), URL rendue en <img>', () => {
    const { container, rerender } = render(Chip, {
      props: { dismissible: true },
      slots: { default: 'Tag' },
    })
    expect(container.querySelector('.ds-chip-remove .ds-icon-symbol')?.textContent).toBe('close')
    return rerender({ dismissIcon: 'https://example.com/x.svg' }).then(() => {
      expect(container.querySelector('.ds-chip-remove img')?.getAttribute('src')).toBe(
        'https://example.com/x.svg',
      )
    })
  })

  it('slots #start/#end priment sur iconStart/iconEnd', () => {
    const { queryByText, getByText } = render(Chip, {
      props: { iconStart: 'star', iconEnd: 'cancel' },
      slots: { default: 'Tag', start: '<b>S</b>', end: '<b>E</b>' },
    })
    expect(getByText('S')).toBeTruthy()
    expect(getByText('E')).toBeTruthy()
    expect(queryByText('star')).toBeNull()
    expect(queryByText('cancel')).toBeNull()
  })

  it('icône seule : data-icon-only posé seulement sans libellé', () => {
    const { container } = render(Chip, { props: { iconStart: 'favorite' } })
    expect(container.querySelector('.ds-chip')?.hasAttribute('data-icon-only')).toBe(true)
    const withLabel = render(Chip, { props: { iconStart: 'favorite' }, slots: { default: 'Tag' } })
    expect(withLabel.container.querySelector('.ds-chip')?.hasAttribute('data-icon-only')).toBe(
      false,
    )
    const noIcon = render(Chip, {})
    expect(noIcon.container.querySelector('.ds-chip')?.hasAttribute('data-icon-only')).toBe(false)
  })

  it('répartit les attrs : class/style sur la racine, le reste sur l’action', () => {
    const { container } = render(Chip, {
      props: { clickable: true },
      attrs: { class: 'extra', style: 'margin: 4px;', 'data-x': '1' },
      slots: { default: 'Tag' },
    })
    const root = container.querySelector('.ds-chip') as HTMLElement
    const action = container.querySelector('.ds-chip-action') as HTMLElement
    expect(root.classList.contains('extra')).toBe(true)
    expect(root.style.margin).toBe('4px')
    expect(root.hasAttribute('data-x')).toBe(false)
    expect(action.getAttribute('data-x')).toBe('1')
    expect(action.classList.contains('extra')).toBe(false)
  })

  it('data-attributes par défaut, couleur custom en --_custom inline', () => {
    const { container, rerender } = render(Chip, { slots: { default: 'Tag' } })
    const root = container.querySelector('.ds-chip') as HTMLElement
    expect(root.getAttribute('data-variant')).toBe('tonal')
    expect(root.getAttribute('data-tone')).toBe('neutral')
    expect(root.getAttribute('data-shape')).toBe('chip')
    expect(root.hasAttribute('data-custom')).toBe(false)
    return rerender({ color: 'hotpink', shape: 'pill', variant: 'solid' }).then(() => {
      expect(root.getAttribute('data-variant')).toBe('solid')
      expect(root.getAttribute('data-shape')).toBe('pill')
      expect(root.hasAttribute('data-custom')).toBe(true)
      expect(root.style.getPropertyValue('--_custom')).toBe('hotpink')
    })
  })

  it('pose data-size/data-compact sur la racine ds-control (défaut xs)', () => {
    const { container, rerender } = render(Chip, { slots: { default: 'Tag' } })
    const root = container.querySelector('.ds-chip') as HTMLElement
    expect(root.classList.contains('ds-control')).toBe(true)
    expect(root.getAttribute('data-size')).toBe('xs')
    expect(root.hasAttribute('data-compact')).toBe(false)
    return rerender({ size: 'sm', compact: true }).then(() => {
      expect(root.getAttribute('data-size')).toBe('sm')
      expect(root.hasAttribute('data-compact')).toBe(true)
    })
  })
})
