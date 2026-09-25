import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { useLiveAnnouncer } from './useLiveAnnouncer'

describe('useLiveAnnouncer', () => {
  it('empties the region, then writes the message on the next tick', async () => {
    const { polite, announce } = useLiveAnnouncer()
    polite.value = 'Before'
    announce('Saved', false)
    expect(polite.value).toBe('')
    await nextTick()
    expect(polite.value).toBe('Saved')
  })

  it('sends an urgent message to the assertive region alone', async () => {
    const { polite, assertive, announce } = useLiveAnnouncer()
    announce('Failed', true)
    await nextTick()
    expect(assertive.value).toBe('Failed')
    expect(polite.value).toBe('')
  })

  /*
   * Two notifications raised in one handler write the same region in the same tick. Only the
   * last value ever reached the page, so the first was never announced at all.
   */
  it('keeps every message said in the same tick', async () => {
    const { polite, announce } = useLiveAnnouncer()
    announce('Saved', false)
    announce('Deleted', false)
    await nextTick()
    expect(polite.value).toContain('Saved')
    expect(polite.value).toContain('Deleted')
  })

  it('starts afresh on the tick after', async () => {
    const { polite, announce } = useLiveAnnouncer()
    announce('Saved', false)
    await nextTick()
    announce('Deleted', false)
    await nextTick()
    expect(polite.value).toBe('Deleted')
  })
})
