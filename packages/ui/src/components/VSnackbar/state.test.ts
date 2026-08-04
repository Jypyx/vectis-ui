import { beforeEach, describe, expect, it } from 'vitest'

import { current, dismissSnackbar, snackbar } from './state'

describe('snackbar state', () => {
  // The state is module-global and survives from one test to the next.
  beforeEach(() => dismissSnackbar())

  it('hands back an increasing id', () => {
    const first = snackbar({ message: 'A' })
    const second = snackbar({ message: 'B' })
    expect(second).toBeGreaterThan(first)
  })

  it('a new confirmation REPLACES the one showing', () => {
    snackbar({ message: 'A' })
    snackbar({ message: 'B' })
    expect(current.value?.message).toBe('B')
  })

  it('fills in the tone and leaves the VSnackbar-owned options alone', () => {
    snackbar({ message: 'Deleted' })
    expect(current.value).toMatchObject({ message: 'Deleted', tone: 'neutral' })
    // Resolved at render time, so that the component stays the source of truth for its
    // own settings.
    expect(current.value?.duration).toBeUndefined()
    expect(current.value?.placement).toBeUndefined()
  })

  it('keeps every option it is given', () => {
    const action = () => {}
    snackbar({
      message: 'Gone',
      tone: 'danger',
      icon: 'delete',
      duration: 0,
      placement: 'bottom-left',
      action,
      actionLabel: 'Restore',
    })
    expect(current.value).toMatchObject({
      message: 'Gone',
      tone: 'danger',
      icon: 'delete',
      duration: 0,
      placement: 'bottom-left',
      action,
      actionLabel: 'Restore',
    })
  })

  it('dismisses by id, and is idempotent', () => {
    const id = snackbar({ message: 'A' })
    dismissSnackbar(id)
    expect(current.value).toBeNull()
    dismissSnackbar(id)
    expect(current.value).toBeNull()
  })

  it('IGNORES a stale id, so a late timer cannot close the bar that replaced its own', () => {
    const stale = snackbar({ message: 'A' })
    snackbar({ message: 'B' })
    dismissSnackbar(stale)
    expect(current.value?.message).toBe('B')
  })

  it('dismisses whatever is showing when called with no argument', () => {
    snackbar({ message: 'A' })
    dismissSnackbar()
    expect(current.value).toBeNull()
  })
})
