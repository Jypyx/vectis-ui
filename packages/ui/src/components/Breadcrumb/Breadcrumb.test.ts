import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'

import Breadcrumb from './Breadcrumb.vue'
import BreadcrumbItem from './BreadcrumbItem.vue'

describe('Breadcrumb', () => {
  it('rend une navigation nommée avec liste ordonnée et aria-current', () => {
    const Harness = defineComponent({
      components: { Breadcrumb, BreadcrumbItem },
      template: `
        <Breadcrumb>
          <BreadcrumbItem href="/">Accueil</BreadcrumbItem>
          <BreadcrumbItem current>Paramètres</BreadcrumbItem>
        </Breadcrumb>
      `,
    })
    const { getByRole, getByText } = render(Harness)
    expect(getByRole('navigation', { name: "Fil d'Ariane" })).toBeTruthy()
    expect(getByRole('list').tagName).toBe('OL')
    expect(getByRole('link', { name: 'Accueil' }).getAttribute('href')).toBe('/')
    expect(getByText('Paramètres').getAttribute('aria-current')).toBe('page')
  })

  it('sans href : rend un span (pas de lien)', () => {
    const { queryByRole, getByText } = render(BreadcrumbItem, {
      slots: { default: 'Texte' },
    })
    expect(queryByRole('link')).toBeNull()
    expect(getByText('Texte').tagName).toBe('SPAN')
  })
})
