import { beforeEach, describe, expect, it, vi } from 'vitest'

import { dismissToast, toast, toasts } from './state'

describe('toast (module state)', () => {
  // the state is global to the module: explicit isolation between tests
  beforeEach(() => dismissToast())

  it('returns increasing ids and appends to the queue', () => {
    const first = toast({ message: 'One' })
    const second = toast({ message: 'Two' })
    expect(second).toBe(first + 1)
    expect(toasts.map((item) => item.message)).toEqual(['One', 'Two'])
  })

  it('normalizes the defaults that do not depend on the VToaster', () => {
    toast({ message: 'Defaults' })
    expect(toasts[0]).toMatchObject({
      tone: 'neutral',
      variant: 'soft',
      hideClose: false,
    })
    // placement and duration stay undefined: they are resolved by the VToaster
    expect(toasts[0]?.placement).toBeUndefined()
    expect(toasts[0]?.duration).toBeUndefined()
  })

  it('keeps the explicit options', () => {
    toast({
      message: 'Options',
      title: 'Title',
      tone: 'danger',
      variant: 'solid',
      icon: false,
      duration: 0,
      placement: 'top-center',
      hideClose: true,
      width: '30rem',
    })
    expect(toasts[0]).toMatchObject({
      title: 'Title',
      tone: 'danger',
      variant: 'solid',
      icon: false,
      duration: 0,
      placement: 'top-center',
      hideClose: true,
      width: '30rem',
    })
  })

  it('dismissToast(id) removes the right toast', () => {
    const first = toast({ message: 'One' })
    toast({ message: 'Two' })
    dismissToast(first)
    expect(toasts.map((item) => item.message)).toEqual(['Two'])
    dismissToast(first)
    expect(toasts).toHaveLength(1)
  })

  it('dismissToast() with no argument empties the whole queue', () => {
    toast({ message: 'One' })
    toast({ message: 'Two' })
    dismissToast()
    expect(toasts).toHaveLength(0)
  })
})

describe('toast() and snackbar() on a server', () => {
  it('say so in development, the queue being shared by every request', async () => {
    const { snackbar, dismissSnackbar } = await import('../VSnackbar/state')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('document', undefined)
    try {
      toast({ message: 'A' })
      snackbar({ message: 'B' })
    } finally {
      vi.unstubAllGlobals()
    }
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[toast]'))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[snackbar]'))
    warn.mockRestore()
    dismissToast()
    dismissSnackbar()
  })
})
