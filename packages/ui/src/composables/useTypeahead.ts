import { normalizeText } from '../utils/text'

import { useTimer } from './useTimer'

// @keyboard
/**
 * Type-to-find, as a native list does, for VSelect and VTreeView: the letters typed within half a
 * second add up to a prefix, and the same letter repeated cycles through the items it starts.
 */
export function useTypeahead(): {
  /**
   * Adds a key to the prefix and returns the index it leads to, searching from `from`, or -1.
   * `labelAt` gives an item's label already normalized, or nothing for one to skip.
   */
  find: (
    key: string,
    count: number,
    from: number,
    labelAt: (index: number) => string | undefined,
  ) => number
  /** Whether a prefix is being typed, so that a space belongs to it: "New York". */
  typing: () => boolean
} {
  const timer = useTimer()
  let typed = ''

  function find(
    key: string,
    count: number,
    from: number,
    labelAt: (index: number) => string | undefined,
  ): number {
    typed += normalizeText(key)
    timer.start(() => (typed = ''), 500)
    if (!typed) return -1
    const cycling = [...typed].every((char) => char === typed[0])
    const needle = cycling ? typed[0]! : typed
    // A new prefix may match the current item itself; a cycle moves on from it.
    const start = Math.max(from + (cycling ? 1 : 0), 0)
    for (let step = 0; step < count; step++) {
      const index = (start + step) % count
      if (labelAt(index)?.startsWith(needle)) return index
    }
    return -1
  }

  return { find, typing: () => typed !== '' }
}
