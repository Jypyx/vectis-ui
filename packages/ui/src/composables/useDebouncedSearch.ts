import { useTimer } from './useTimer'

// @core
/**
 * Reports a search term to an outside source, as VCombobox and VCommandPalette do: after a delay
 * that each keystroke re-arms, never twice for the same term, so reopening on an unchanged term
 * asks nothing again, and not at all once the panel has closed during the wait. The panel's state
 * is read when the delay runs out rather than when it is armed.
 */
export function useDebouncedSearch(options: {
  /** How long to wait after the last keystroke, in milliseconds. */
  delay: () => number
  /** Whether the panel the results go to is still open. */
  active: () => boolean
  /** Reports the term. */
  report: (term: string) => void
}): { request: (term: string, immediate?: boolean) => void; cancel: () => void } {
  const timer = useTimer()
  let lastReported: string | undefined

  function request(term: string, immediate = false) {
    timer.cancel()
    if (term === lastReported) return
    timer.start(
      () => {
        if (!options.active()) return
        lastReported = term
        options.report(term)
      },
      immediate ? 0 : options.delay(),
    )
  }

  return { request, cancel: timer.cancel }
}
