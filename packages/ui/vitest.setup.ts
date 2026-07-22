/**
 * jsdom n'implémente pas la Popover API. Stub minimal pour tester la LOGIQUE
 * des composants (sync v-model, focus, ARIA) — le comportement navigateur
 * réel (top-layer, light dismiss) est couvert par les play functions
 * Storybook. Le marqueur `data-popover-open` remplace `:popover-open`,
 * qu'aucun sélecteur jsdom ne sait évaluer.
 */
if (!('showPopover' in HTMLElement.prototype)) {
  const fireToggle = (el: HTMLElement, newState: 'open' | 'closed') => {
    const event = new Event('toggle')
    Object.assign(event, { newState, oldState: newState === 'open' ? 'closed' : 'open' })
    el.dispatchEvent(event)
  }
  Object.assign(HTMLElement.prototype, {
    showPopover(this: HTMLElement) {
      if (this.hasAttribute('data-popover-open')) return
      this.setAttribute('data-popover-open', '')
      // contre le style UA `[popover] { display: none }` : rend le panneau
      // visible pour les requêtes par rôle de testing-library
      this.style.display = 'block'
      fireToggle(this, 'open')
    },
    hidePopover(this: HTMLElement) {
      if (!this.hasAttribute('data-popover-open')) return
      // cascade de la pile : fermer un popover ferme ses popovers descendants
      // (fidèle au spec pour nos panneaux imbriqués, qui sont des descendants DOM)
      this.querySelectorAll<HTMLElement>('[data-popover-open]').forEach((el) => el.hidePopover())
      this.removeAttribute('data-popover-open')
      this.style.display = ''
      fireToggle(this, 'closed')
    },
  })
}
