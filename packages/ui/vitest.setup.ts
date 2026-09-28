/**
 * Stub Popover API state for jsdom logic tests. Real top-layer placement and light dismissal
 * belong to browser play functions.
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
      // Counters the UA style `[popover] { display: none }`: makes the panel visible to
      // testing-library's role queries
      this.style.display = 'block'
      fireToggle(this, 'open')
    },
    hidePopover(this: HTMLElement) {
      if (!this.hasAttribute('data-popover-open')) return
      // Stack cascade: closing a popover closes its descendant popovers (faithful to the spec
      // for our nested panels, which are DOM descendants)
      this.querySelectorAll<HTMLElement>('[data-popover-open]').forEach((el) => el.hidePopover())
      this.removeAttribute('data-popover-open')
      this.style.display = ''
      fireToggle(this, 'closed')
    },
  })
}

/** Jsdom does not know `HTMLDialogElement.prototype.showModal` ("Not implemented"). */
if (typeof HTMLDialogElement !== 'undefined') {
  const dispatchClose = (el: HTMLDialogElement) => el.dispatchEvent(new Event('close'))
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    if (this.open) return
    this.open = true
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.show = function (this: HTMLDialogElement) {
    if (this.open) return
    this.open = true
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement, returnValue?: string) {
    if (!this.open) return
    this.open = false
    this.removeAttribute('open')
    if (returnValue !== undefined) this.returnValue = returnValue
    dispatchClose(this)
  }
}
