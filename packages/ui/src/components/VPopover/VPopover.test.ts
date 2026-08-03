import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import Popover from './VPopover.vue'

/** Unique fabrique de composant du fichier (vue/one-component-per-file). */
function renderHarness(template: string, bindings: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { Popover },
    setup: () => bindings,
    template,
  })
  return render(Harness)
}

const panelOf = (container: Element) => container.querySelector('.v-popover-panel') as HTMLElement

describe('Popover', () => {
  it('rend un panneau [popover] portant le socle flottant et la surface par défaut', () => {
    const { container } = renderHarness('<Popover>Contenu</Popover>')
    const panel = panelOf(container)
    expect(panel.getAttribute('popover')).toBe('auto')
    expect(panel.getAttribute('data-placement')).toBe('bottom-start')
    // garde-fou du panneau fermé + placements : cf. styles/floating.css
    expect(panel.classList.contains('v-overlay')).toBe(true)
    expect(panel.classList.contains('v-floating')).toBe(true)
    // habillage par défaut (styles/panel.css)
    expect(panel.classList.contains('v-panel')).toBe(true)
  })

  it('surface=false retire l’habillage (le consommateur pose le sien)', () => {
    const { container } = renderHarness('<Popover :surface="false">Contenu</Popover>')
    expect(panelOf(container).classList.contains('v-panel')).toBe(false)
  })

  it('mode=manual coupe le light dismiss natif', () => {
    const { container } = renderHarness('<Popover mode="manual">Contenu</Popover>')
    expect(panelOf(container).getAttribute('popover')).toBe('manual')
  })

  it('anchor est exposée en variable inline (position-anchor en CSS)', () => {
    const { container } = renderHarness('<Popover anchor="--ancre-test">Contenu</Popover>')
    expect(panelOf(container).style.getPropertyValue('--anchor-name')).toBe('--ancre-test')
  })

  it('sans déclencheur le wrapper n’est pas ancré (display: contents en CSS)', () => {
    const { container } = renderHarness('<Popover anchor="--a">Contenu</Popover>')
    expect(container.querySelector('.v-popover')?.hasAttribute('data-trigger')).toBe(false)
  })

  it('le slot #trigger fournit les props de disclosure et marque le wrapper ancré', async () => {
    const open = ref(false)
    const { container, getByRole } = renderHarness(
      `
        <Popover v-model:open="open">
          <template #trigger="{ triggerProps }">
            <button v-bind="triggerProps">Ouvrir</button>
          </template>
          Contenu
        </Popover>
      `,
      { open },
    )
    const panel = panelOf(container)
    const trigger = getByRole('button', { name: 'Ouvrir' })

    // le wrapper porte alors l'anchor-name (cf. .v-popover[data-trigger])
    expect(container.querySelector('.v-popover')?.hasAttribute('data-trigger')).toBe(true)
    expect(trigger.getAttribute('popovertarget')).toBe(panel.id)
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    open.value = true
    await nextTick()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('l’id du consommateur prime sur l’id généré', () => {
    const { container } = renderHarness('<Popover id="mon-panneau">Contenu</Popover>')
    expect(panelOf(container).id).toBe('mon-panneau')
  })

  it('v-model:open pilote le panneau dans les deux sens', async () => {
    const open = ref(false)
    const { container } = renderHarness('<Popover v-model:open="open">Contenu</Popover>', { open })
    const panel = panelOf(container)
    expect(panel.hasAttribute('data-popover-open')).toBe(false)

    open.value = true
    await nextTick()
    expect(panel.hasAttribute('data-popover-open')).toBe(true)

    // DOM → modèle : c'est le light dismiss qui doit pouvoir refermer le modèle
    // (le stub jsdom n'émet que `toggle`)
    panel.hidePopover()
    await nextTick()
    expect(open.value).toBe(false)

    // idempotence : un second hidePopover() lèverait InvalidStateError sans la
    // garde de usePopover
    expect(() => panel.hidePopover()).not.toThrow()
  })

  it('ouvre au montage quand open vaut déjà true', async () => {
    const { container } = renderHarness('<Popover :open="true">Contenu</Popover>')
    await nextTick()
    expect(panelOf(container).hasAttribute('data-popover-open')).toBe(true)
  })

  it('les attributs du consommateur atterrissent sur le panneau, pas sur le wrapper', () => {
    const { container } = renderHarness(
      '<Popover role="dialog" aria-label="Détails" class="v-perso" data-x="1">Contenu</Popover>',
    )
    const panel = panelOf(container)
    expect(panel.getAttribute('role')).toBe('dialog')
    expect(panel.getAttribute('aria-label')).toBe('Détails')
    expect(panel.getAttribute('data-x')).toBe('1')
    // class/style vont AUSSI sur le panneau (le wrapper n'est qu'une ancre)
    expect(panel.classList.contains('v-perso')).toBe(true)
    expect(container.querySelector('.v-popover')?.classList.contains('v-perso')).toBe(false)
  })
})
