/**
 * Minimum required cache interface.
 */
export interface Cache <T, U> {
  get (key: T): U
  set (key: T, value: U): void
  has (key: T): boolean
}

/**
 * Optimize a function to speed up consecutive calls by caching the result of
 * calls with identical input arguments. The cache can be overrriden to
 * implement features such as LRU eviction.
 */
export function memoize <T, U> (fn: (arg: T) => U, cache: Cache<T, U> = new Map()) {
  return function (arg: T): U {
    if (cache.has(arg)) return cache.get(arg)

    const result = fn(arg)
    cache.set(arg, result)
    return result
  }
}

/**
 * Always returns the same value that was used as the argument.
 */
export function identity <T> (value: T) {
  return value
}
