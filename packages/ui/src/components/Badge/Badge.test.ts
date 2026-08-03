import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Badge from './Badge.vue'

describe('Badge', () => {
  it('standalone par défaut : racine .v-badge seule, tone accent, count rendu', () => {
    const { container, getByText } = render(Badge, { props: { count: 3 } })
    const root = container.firstElementChild!
    expect(root.classList.contains('v-badge')).toBe(true)
    expect(container.querySelector('.v-badge-host')).toBeNull()
    expect(root.getAttribute('data-tone')).toBe('accent')
    expect(getByText('3')).toBeTruthy()
  })

  it('tone explicite posé en data-tone', () => {
    const { container } = render(Badge, { props: { tone: 'danger', count: 3 } })
    expect(container.querySelector('.v-badge')!.getAttribute('data-tone')).toBe('danger')
  })

  it('color : data-custom + --custom-color inline ; absents sans color', () => {
    const { container } = render(Badge, { props: { color: 'hotpink', count: 3 } })
    const badge = container.querySelector('.v-badge')!
    expect(badge.hasAttribute('data-custom')).toBe(true)
    expect(badge.getAttribute('style')).toContain('--custom-color: hotpink')

    const { container: bare } = render(Badge, { props: { count: 3 } })
    const bareBadge = bare.querySelector('.v-badge')!
    expect(bareBadge.hasAttribute('data-custom')).toBe(false)
    expect(bareBadge.getAttribute('style')).toBeNull()
  })

  it('plafonnement : count > 99 affiché « 99+ », 99 inchangé', () => {
    const { container } = render(Badge, { props: { count: 100 } })
    expect(container.querySelector('.v-badge')!.textContent).toBe('99+')

    const { container: at99 } = render(Badge, { props: { count: 99 } })
    expect(at99.querySelector('.v-badge')!.textContent).toBe('99')
  })

  it('icon : data-icon-only, .v-icon rendu, prime sur count', () => {
    const { container } = render(Badge, { props: { icon: 'notifications', count: 3 } })
    const badge = container.querySelector('.v-badge')!
    expect(badge.hasAttribute('data-icon-only')).toBe(true)
    expect(badge.querySelector('.v-icon')).toBeTruthy()
    expect(badge.textContent).not.toContain('3')
  })

  it('dot : data-dot, aucun contenu, icon et count ignorés', () => {
    const { container } = render(Badge, {
      props: { dot: true, icon: 'notifications', count: 3 },
    })
    const badge = container.querySelector('.v-badge')!
    expect(badge.hasAttribute('data-dot')).toBe(true)
    expect(badge.hasAttribute('data-icon-only')).toBe(false)
    expect(badge.querySelector('.v-icon')).toBeNull()
    expect(badge.textContent).toBe('')
  })

  it('slot défaut : racine .v-badge-host, cible rendue, badge en dernier enfant', () => {
    const { container, getByText } = render(Badge, {
      props: { count: 3 },
      slots: { default: '<button type="button">Messages</button>' },
    })
    const host = container.firstElementChild!
    expect(host.classList.contains('v-badge-host')).toBe(true)
    expect(host.hasAttribute('data-overlay')).toBe(false)
    expect(getByText('Messages')).toBeTruthy()
    expect(host.lastElementChild!.classList.contains('v-badge')).toBe(true)
  })

  it('overlay : data-overlay posé sur le host', () => {
    const { container } = render(Badge, {
      props: { count: 3, overlay: true },
      slots: { default: '<span>Cible</span>' },
    })
    expect(container.querySelector('.v-badge-host')!.hasAttribute('data-overlay')).toBe(true)
  })

  it('bordered : data-bordered posé sur le badge', () => {
    const { container } = render(Badge, { props: { count: 3, bordered: true } })
    expect(container.querySelector('.v-badge')!.hasAttribute('data-bordered')).toBe(true)
  })

  it('fallthrough : class sur .v-badge en standalone, sur .v-badge-host avec cible', () => {
    const { container } = render(Badge, {
      props: { count: 3 },
      attrs: { class: 'extra', 'data-testid': 'seul' },
    })
    const badge = container.querySelector('.v-badge')!
    expect(badge.classList.contains('extra')).toBe(true)
    expect(badge.getAttribute('data-testid')).toBe('seul')

    const { container: hosted } = render(Badge, {
      props: { count: 3 },
      attrs: { class: 'extra' },
      slots: { default: '<span>Cible</span>' },
    })
    expect(hosted.querySelector('.v-badge-host')!.classList.contains('extra')).toBe(true)
    expect(hosted.querySelector('.v-badge')!.classList.contains('extra')).toBe(false)
  })
})
