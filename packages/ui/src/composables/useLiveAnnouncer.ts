// @a11y
/**
 * Mount live regions before writing messages. Clear before rewriting identical text and batch
 * same-tick announcements so none overwrite each other.
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
    if (queue.length > 1) return
    region.value = ''
    void nextTick(() => {
      region.value = queue.join('\n')
      queue.length = 0
    })
  }

  return { polite, assertive, announce }
}
