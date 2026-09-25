import { render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'

import { useFieldPanel } from './useFieldPanel'

/*
 * The panel is driven by hand here: `show` and `close` are stubs, and `open` is written the
 * way VPopover's model would write it once the browser has shown the popover.
 */
function mountPanel() {
  const focusInPanel = vi.fn()
  let api!: ReturnType<typeof useFieldPanel>
  const utils = render(
    defineComponent({
      setup() {
        api = useFieldPanel({
          rootEl: ref(null),
          panelRef: ref({ show: vi.fn(), close: vi.fn() }),
          field: ref(null),
          disabled: () => false,
          focusInPanel,
        })
        return () => h('div')
      },
    }),
  )
  return { ...utils, api, focusInPanel }
}

describe('useFieldPanel', () => {
  afterEach(() => vi.unstubAllGlobals())

  /*
   * The focus is moved into the panel a frame after it opens. A panel closed inside that frame,
   * Escape pressed at once or the field disabled, must not have the focus pulled into it once
   * it is shut.
   */
  it('moves no focus into a panel closed before the frame came', () => {
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => frames.push(fn))
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      frames[id - 1] = () => {}
    })
    const { api, focusInPanel } = mountPanel()
    api.toggleFromIcon()
    api.open.value = true
    api.closeAndFocus()
    for (const frame of frames) frame(0)
    expect(focusInPanel).not.toHaveBeenCalled()
  })

  it('still moves the focus into a panel that stays open', () => {
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => frames.push(fn))
    const { api, focusInPanel } = mountPanel()
    api.toggleFromIcon()
    for (const frame of frames) frame(0)
    expect(focusInPanel).toHaveBeenCalledTimes(1)
  })
})
