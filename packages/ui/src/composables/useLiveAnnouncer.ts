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
 * TRAP: messages said in the SAME tick are written together, one per line. Each used to
 * schedule its own write into the same region, and only the last ever reached the page: two
 * notifications raised by one handler were announced as one.
 *
 * Consumed by VToaster, VSnackbar and VCalendar.
 */
import { nextTick, ref } from 'vue'

export function useLiveAnnouncer() {
  const polite = ref('')
  const assertive = ref('')
  const pending = { polite: [] as string[], assertive: [] as string[] }

  /** Says `text`, interrupting what is being read when `urgent`, waiting for a pause otherwise. */
  function announce(text: string, urgent: boolean) {
    const region = urgent ? assertive : polite
    const queue = urgent ? pending.assertive : pending.polite
    queue.push(text)
    // A write is already on its way this tick: this message joins it.
    if (queue.length > 1) return
    region.value = ''
    void nextTick(() => {
      region.value = queue.join('\n')
      queue.length = 0
    })
  }

  return { polite, assertive, announce }
}
