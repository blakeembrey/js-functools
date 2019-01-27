/**
 * Minimum required cache interface.
 */
export interface Cache<T, U> {
  get(key: T): U | undefined;
  set(key: T, value: U): void;
  has(key: T): boolean;
}

/**
 * Optimize a function to speed up consecutive calls by caching the result of
 * calls with identical input arguments. The cache can be overrriden to
 * implement features such as LRU eviction.
 */
export function memoize<T, U>(
  fn: (arg: T) => U,
  cache: Cache<T, U> = new Map()
) {
  return function(arg: T): U {
    if (cache.has(arg)) return cache.get(arg)!;

    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}

/**
 * Memoize a 0-arg function call.
 */
export function memoize0<T>(fn: () => T) {
  let cached = false;
  let result: T | undefined = undefined;

  return () => {
    if (!cached) {
      result = fn();
      cached = true;
    }

    return result;
  };
}

/**
 * Always returns the same value that was used as the argument.
 */
export function identity<T>(value: T) {
  return value;
}

/**
 * Return a function that fetches `key` from its operand.
 */
export function prop<K extends string | number | symbol>(key: K) {
  return <T extends { [T in K]?: any }>(obj: T): T[K] => obj[key];
}

export type InvokeResult<
  T extends (...args: A) => any,
  A extends any[]
> = T extends (...args: A) => infer R ? R : never;

/**
 * Return a function that calls the method name on its operand. If additional
 * arguments are given, they will be given to the method as well.
 */
export function invoke<K extends string | number | symbol, A extends any[]>(
  key: K,
  ...args: A
) {
  return <T extends Record<K, (...args: A) => any>>(
    obj: T
  ): InvokeResult<T[K], A> => obj[key](...args);
}

/**
 * Wrap a function to rate-limit the function executions to once every `ms` milliseconds.
 */
export function throttle(fn: () => void, ms: number, leading = true) {
  let pending = false;
  let timeout: any = undefined;

  // Clear timeout.
  function clear() {
    pending = false;
    clearTimeout(timeout);
    timeout = undefined;
  }

  // Wait for the next interval.
  function wait() {
    timeout = setTimeout(_next, ms);
  }

  // Invoke the function in "pending" state.
  function flush() {
    if (pending) return _next();
  }

  // Clear timeout or flush next function call.
  function _next() {
    // When no pending, remove `timeout`.
    if (!pending) {
      timeout = undefined;
      return;
    }

    clear(); // Clear existing timeout.
    fn(); // Execute pending function.
    wait(); // Start new interval.
  }

  return Object.assign(
    () => {
      pending = true;

      if (timeout === undefined) {
        if (leading === true) return _next();
        return wait();
      }
    },
    { flush, clear }
  );
}
