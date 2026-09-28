// @core
/** undefined marks a cache miss; builders must return a defined value. */
export function memo<K, V>(cache: Map<K, V>, key: K, build: () => V): V {
  let value = cache.get(key)
  if (value === undefined) {
    value = build()
    cache.set(key, value)
  }
  return value
}
