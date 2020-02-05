export const add = (a: number, b: number) => a + b;
export const subtract = (a: number, b: number) => a - b;
export const multiply = (a: number, b: number) => a * b;
export const divide = (a: number, b: number) => a / b;

/**
 * Always returns the same value supplied to it.
 */
export const identity = <T>(value: T) => value;

/**
 * Returns a function that always returns the same value supplied to it.
 */
export const always = <T>(value: T) => () => value;

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
 * calls with identical input arguments. The cache can be overridden to
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
 * Memoize the result of `fn` after the first invocation.
 */
export function memoize0<T>(fn: () => T) {
  let cached = false;
  let result: T | undefined = undefined;

  return (): T => {
    if (!cached) {
      result = fn();
      cached = true;
    }

    return result!;
  };
}

/**
 * Compare two arrays for equality.
 */
export function arrayEqual<T extends any[]>(prev: T, next: T) {
  const len = next.length;
  if (prev.length !== len) return false;

  for (let i = 0; i < len; i++) {
    if (!Object.is(prev[i], next[i])) return false;
  }

  return true;
}

/**
 * Memoize the result of a function based on the most recent arguments.
 */
export function memoizeOne<T extends any[], R>(fn: (...args: T) => R) {
  let prevArgs: T | undefined;
  let result: R | undefined;

  return (...args: T): R => {
    if (prevArgs === undefined || !arrayEqual(args, prevArgs)) {
      prevArgs = args;
      result = fn(...args);
    }

    return result!;
  };
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
 * Throttle configuration.
 */
export interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
  debounce?: boolean;
}

/**
 * Wrap a function to rate-limit the function executions to once every `ms` milliseconds.
 */
export function throttle<T extends any[]>(
  fn: (...args: T) => void,
  ms: number,
  { leading = true, trailing = true, debounce = false }: ThrottleOptions = {}
) {
  let pending: T | undefined;
  let timeout: any = undefined;

  // Clear timeout.
  function clear() {
    clearTimeout(timeout);
    timeout = undefined;
    pending = undefined;
  }

  // Invoke the function in "pending" state.
  function flush() {
    clearTimeout(timeout);
    return next();
  }

  // Execute `fn` and increment timeout every loop.
  function next() {
    timeout = undefined;
    if (!pending) return;

    const args = pending;
    pending = undefined;
    if (trailing) fn(...args);
    timeout = setTimeout(next, ms);
  }

  // Throttled `fn` wrapper.
  function throttled(...args: T) {
    pending = args;

    if (timeout === undefined) {
      if (leading) {
        pending = undefined;
        fn(...args);
      }

      timeout = setTimeout(next, ms);
      return;
    }

    if (debounce) {
      clearTimeout(timeout);
      timeout = setTimeout(next, ms);
      return;
    }
  }

  return Object.assign(throttled, { flush, clear });
}

/**
 * Given a `fn`, return a wrapper that accepts an array of `fn` arguments.
 */
export function spread<T extends any[], R>(fn: (...args: T) => R) {
  return (args: T) => fn(...args);
}

/**
 * Flip a binary `fn` argument order.
 */
export function flip<T1, T2, R>(fn: (arg1: T1, arg2: T2) => R) {
  return (arg2: T2, arg1: T1) => fn(arg1, arg2);
}

/**
 * Returns a partially applied `fn` with the supplied arguments.
 */
export function partial<U extends any[], R>(
  fn: (...args: U) => R
): (...args: U) => R;
export function partial<T1, U extends any[], R>(
  fn: (arg1: T1, ...args: U) => R,
  arg1: T1
): (...args: U) => R;
export function partial<T1, T2, U extends any[], R>(
  fn: (arg1: T1, arg2: T2, ...args: U) => R,
  arg1: T1,
  arg2: T2
): (...args: U) => R;
export function partial<T1, T2, T3, U extends any[], R>(
  fn: (arg1: T1, arg2: T2, arg3: T3, ...args: U) => R,
  arg1: T1,
  arg2: T2,
  arg3: T3
): (...args: U) => R;
export function partial<T1, T2, T3, T4, U extends any[], R>(
  fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, ...args: U) => R,
  arg1: T1,
  arg2: T2,
  arg3: T3,
  arg4: T4
): (...args: U) => R;
export function partial<T1, T2, T3, T4, T5, U extends any[], R>(
  fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, ...args: U) => R,
  arg1: T1,
  arg2: T2,
  arg3: T3,
  arg4: T4,
  arg5: T5
): (...args: U) => R;
export function partial<R>(fn: (...args: any[]) => R, ...args1: any[]) {
  return (...args2: any[]) => fn(...args1, ...args2);
}

const SEQUENCE_FNS: Record<number, Function | undefined> = Object.create(null);

/**
 * Left-to-right function composition.
 */
export function sequence<T1, T2>(fn1: (arg: T1) => T2): (arg: T1) => T2;
export function sequence<T1, T2, T3>(
  fn1: (arg: T1) => T2,
  fn2: (arg: T2) => T3
): (arg: T1) => T3;
export function sequence<T1, T2, T3, T4>(
  fn1: (arg: T1) => T2,
  fn2: (arg: T2) => T3,
  fn3: (arg: T3) => T4
): (arg: T1) => T4;
export function sequence<T1, T2, T3, T4, T5>(
  fn1: (arg: T1) => T2,
  fn2: (arg: T2) => T3,
  fn3: (arg: T3) => T4,
  fn4: (arg: T4) => T5
): (arg: T1) => T5;
export function sequence<T1, T2, T3, T4, T5, T6>(
  fn1: (arg: T1) => T2,
  fn2: (arg: T2) => T3,
  fn3: (arg: T3) => T4,
  fn4: (arg: T4) => T5,
  fn5: (arg: T5) => T6
): (arg: T1) => T6;
export function sequence<T>(...fns: Array<(arg: T) => T>) {
  const n = fns.length;
  let fn = SEQUENCE_FNS[n];

  if (!fn) {
    const params = fns.map((_, i) => `_${i}`);
    const seq = params.reduce((x, p) => `${p}(${x})`, "x");

    fn = SEQUENCE_FNS[n] = new Function(
      ...params,
      `return function sequence${n}(x) { return ${seq}; }`
    );
  }

  return fn(...fns);
}

const COMPOSE_FNS: Record<number, Function | undefined> = Object.create(null);

/**
 * Right-to-left function composition.
 */
export function compose<T1, T2>(fn1: (arg: T1) => T2): (arg: T1) => T2;
export function compose<T1, T2, T3>(
  fn2: (arg: T2) => T3,
  fn1: (arg: T1) => T2
): (arg: T1) => T3;
export function compose<T1, T2, T3, T4>(
  fn3: (arg: T3) => T4,
  fn2: (arg: T2) => T3,
  fn1: (arg: T1) => T2
): (arg: T1) => T4;
export function compose<T1, T2, T3, T4, T5>(
  fn4: (arg: T4) => T5,
  fn3: (arg: T3) => T4,
  fn2: (arg: T2) => T3,
  fn1: (arg: T1) => T2
): (arg: T1) => T5;
export function compose<T1, T2, T3, T4, T5, T6>(
  fn5: (arg: T5) => T6,
  fn4: (arg: T4) => T5,
  fn3: (arg: T3) => T4,
  fn2: (arg: T2) => T3,
  fn1: (arg: T1) => T2
): (arg: T1) => T6;
export function compose<T>(...fns: Array<(arg: T) => T>) {
  const n = fns.length;
  let fn = COMPOSE_FNS[n];

  if (!fn) {
    const params = fns.map((_, i) => `_${i}`);
    const seq = params.reduceRight((x, p) => `${p}(${x})`, "x");

    fn = COMPOSE_FNS[n] = new Function(
      ...params,
      `return function compose${n}(x) { return ${seq}; }`
    );
  }

  return fn(...fns);
}

const NARY_FNS: Record<number, Function | undefined> = Object.create(null);

/**
 * Fix the number of receivable arguments in `origFn` to `n`.
 */
export function nary<U extends any[], R>(n: 0, origFn: () => R): () => R;
export function nary<T1, U extends any[], R>(
  n: 1,
  origFn: (arg1: T1) => R
): (arg1: T1) => R;
export function nary<T1, T2, U extends any[], R>(
  n: 2,
  origFn: (arg1: T1, arg2: T2) => R
): (arg1: T1, arg2: T2) => R;
export function nary<T1, T2, T3, U extends any[], R>(
  n: 3,
  origFn: (arg1: T1, arg2: T2, arg3: T3) => R
): (arg1: T1, arg2: T2, arg3: T3) => R;
export function nary<T1, T2, T3, T4, U extends any[], R>(
  n: 4,
  origFn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => R
): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => R;
export function nary<T1, T2, T3, T4, T5, U extends any[], R>(
  n: 5,
  origFn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => R
): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => R;
export function nary<T1, T2, T3, T4, T5, T6, U extends any[], R>(
  n: 6,
  origFn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => R
): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => R;
export function nary<U extends any[], R>(n: number, origFn: (...args: U) => R) {
  let fn = NARY_FNS[n];

  if (!fn) {
    const args = Array.from({ length: n }, (_, i) => `_${i}`).join(", ");

    fn = NARY_FNS[n] = new Function(
      "origFn",
      `return function nary${n}(${args}) { return origFn(${args}); }`
    );
  }

  return fn(origFn);
}
