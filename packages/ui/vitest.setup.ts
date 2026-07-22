/**
 * jsdom does not implement the Popover API. A minimal stub, to test component
 * LOGIC (v-model sync, focus, ARIA) — the real browser behaviour (top layer,
 * light dismiss) is covered by the Storybook play functions. The
 * `data-popover-open` marker stands in for `:popover-open`, which no jsdom
 * selector can evaluate.
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
      // counters the UA style `[popover] { display: none }`: makes the panel
      // visible to testing-library's role queries
      this.style.display = 'block'
      fireToggle(this, 'open')
    },
    hidePopover(this: HTMLElement) {
      if (!this.hasAttribute('data-popover-open')) return
      // stack cascade: closing a popover closes its descendant popovers (faithful
      // to the spec for our nested panels, which are DOM descendants)
      this.querySelectorAll<HTMLElement>('[data-popover-open]').forEach((el) => el.hidePopover())
      this.removeAttribute('data-popover-open')
      this.style.display = ''
      fireToggle(this, 'closed')
    },
  })
}

/**
 * jsdom does not know `HTMLDialogElement.prototype.showModal` ("Not
 * implemented"). A minimal stub, to test the LOGIC of <VDialog> (v-model ↔ .open
 * sync, ARIA, close cross) — the real browser behaviour (top layer, ::backdrop,
 * focus trap, light dismiss, scroll state) stays covered by the Storybook play
 * functions.
 */
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
