import { render } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'

import { useDebouncedSearch } from './useDebouncedSearch'

function mountSearch(options: { delay?: number; active?: () => boolean } = {}) {
  const report = vi.fn()
  let api!: ReturnType<typeof useDebouncedSearch>
  const wrapper = render(
    defineComponent({
      setup() {
        api = useDebouncedSearch({
          delay: () => options.delay ?? 200,
          active: options.active ?? (() => true),
          report,
        })
        return () => h('div')
      },
    }),
  )
  return { api, report, unmount: wrapper.unmount }
}

describe('useDebouncedSearch', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('reports the last term once the reader pauses', () => {
    const { api, report } = mountSearch()
    api.request('p')
    vi.advanceTimersByTime(100)
    api.request('pa')
    vi.advanceTimersByTime(199)
    expect(report).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(report).toHaveBeenCalledExactlyOnceWith('pa')
  })

  it('reports at once when asked to, and never twice for the same term', () => {
    const { api, report } = mountSearch()
    api.request('paris', true)
    expect(report).toHaveBeenCalledExactlyOnceWith('paris')
    api.request('paris', true)
    api.request('paris')
    vi.advanceTimersByTime(500)
    expect(report).toHaveBeenCalledTimes(1)
  })

  it('reports nothing when the panel closed during the wait', () => {
    let open = true
    const { api, report } = mountSearch({ active: () => open })
    api.request('lyon')
    open = false
    vi.advanceTimersByTime(200)
    expect(report).not.toHaveBeenCalled()
    // Not remembered as reported: the same term asks again once the panel is back.
    open = true
    api.request('lyon', true)
    expect(report).toHaveBeenCalledExactlyOnceWith('lyon')
  })

  it('cancel drops a pending report, and so does unmounting', () => {
    const { api, report, unmount } = mountSearch()
    api.request('nice')
    api.cancel()
    vi.advanceTimersByTime(500)
    api.request('nantes')
    unmount()
    vi.advanceTimersByTime(500)
    expect(report).not.toHaveBeenCalled()
  })
})
