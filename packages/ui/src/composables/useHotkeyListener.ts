import { onActivated, onBeforeUnmount, onDeactivated, onMounted, watch } from 'vue'

import { isEditableTarget, matchesEvent } from '../components/VHotkeys/platform'
import type { HotkeysPlatform } from '../components/VHotkeys/platform'

// @keyboard @core
/**
 * Listens on the document for one keyboard shortcut, shared by VHotkeys and VCommandPalette. The
 * listener exists only while `enabled` holds and the component is mounted and active, so a page
 * displaying fifty shortcuts installs no listener at all.
 */
export function useHotkeyListener(options: {
  /** The combination, as `parseHotkeys` returns it. */
  tokens: () => string[]
  platform: () => HotkeysPlatform
  enabled: () => boolean
  /** Lets the browser go on doing whatever the combination normally does. */
  allowDefault?: () => boolean
  /** Fires even when the reader is typing in a field. */
  allowInInput?: () => boolean
  onTrigger: (event: KeyboardEvent) => void
}) {
  let listening = false

  function onKeydown(event: KeyboardEvent) {
    /* A held-down combination repeats at the system's auto-repeat rate, which would
       reopen the consumer's palette a dozen times a second; only the first press
       counts. */
    if (!options.enabled() || event.repeat) return
    /* A key another handler has already dealt with (a menu's arrow, a field's Enter) is not
       a shortcut any more. And the Enter that confirms an input method's candidate is the
       end of a word being typed, not a command. */
    if (event.defaultPrevented || event.isComposing) return
    /* The document sees a key typed inside a shadow root as coming from the shadow HOST, a
       plain element: the field itself is the first entry of the composed path. */
    if (!options.allowInInput?.() && isEditableTarget(event.composedPath()[0] ?? event.target)) {
      return
    }
    const tokens = options.tokens()
    if (!matchesEvent(event, tokens, options.platform())) return
    /*
     * Escape is never cancelled. A cancelled Escape is not turned into a close request, so every
     * open dialog and light-dismiss popover on the page would stop closing on it.
     */
    if (!options.allowDefault?.() && !tokens.includes('esc')) event.preventDefault()
    options.onTrigger(event)
  }

  function attach() {
    if (listening || typeof document === 'undefined') return
    document.addEventListener('keydown', onKeydown)
    listening = true
  }

  function detach() {
    if (!listening) return
    document.removeEventListener('keydown', onKeydown)
    listening = false
  }

  onMounted(() => {
    if (options.enabled()) attach()
  })
  watch(options.enabled, (on) => (on ? attach() : detach()))
  onBeforeUnmount(detach)
  /* A view kept alive by <KeepAlive> is never unmounted, only put aside: its shortcut must
     stop with it, or a hidden page would go on answering the keyboard. */
  onDeactivated(detach)
  onActivated(() => {
    if (options.enabled()) attach()
  })
}
