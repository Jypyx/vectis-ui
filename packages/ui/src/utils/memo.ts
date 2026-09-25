// @core
/**
 * Reads a module-level cache, building the entry on its first miss.
 *
 * The `Intl` helpers in `date.ts`, `time.ts` and `file.ts` all keep one: an `Intl` object
 * costs one to two orders of magnitude more to build than to use, and those helpers are
 * called one value at a time. What each cache holds is the helper's own business; the
 * get-or-build around it is the same everywhere, and written here once.
 *
 * `undefined` is the miss marker, so a builder must never return it. None does, every entry
 * being an object, a string or a number.
 */
export function memo<K, V>(cache: Map<K, V>, key: K, build: () => V): V {
  let value = cache.get(key)
  if (value === undefined) {
    value = build()
    cache.set(key, value)
  }
  return value
}
