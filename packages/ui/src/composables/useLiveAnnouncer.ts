// @a11y
/**
 * Two live regions that are ALREADY on the page, and a way to say something through them.
 *
 * A live region inserted at the same time as its text is not reliably announced: screen
 * readers watch regions for CHANGES, and a region that did not exist a moment ago has no
 * before to change from. A notification card or a snackbar bar is exactly that, created
 * with its message, so the message was announced sometimes and dropped at others. The
 * components render the two regions permanently (a polite `status`, an assertive `alert`),
 * visually hidden and outside their popover containers, and hand each message to them.
 *
 * The text is cleared first and written on the next tick, so the same message raised twice
 * in a row is a change the second time too.
 *
 * Consumed by VToaster and VSnackbar.
 */
import { nextTick, ref } from 'vue'

export function useLiveAnnouncer() {
  const polite = ref('')
  const assertive = ref('')

  /** Says `text`, interrupting what is being read when `urgent`, waiting for a pause otherwise. */
  function announce(text: string, urgent: boolean) {
    const region = urgent ? assertive : polite
    region.value = ''
    void nextTick(() => {
      region.value = text
    })
  }

  return { polite, assertive, announce }
}
