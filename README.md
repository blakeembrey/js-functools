# Functools

[![NPM version](https://img.shields.io/npm/v/functools.svg?style=flat)](https://npmjs.org/package/functools)
[![NPM downloads](https://img.shields.io/npm/dm/functools.svg?style=flat)](https://npmjs.org/package/functools)
[![Build status](https://img.shields.io/travis/blakeembrey/js-functools.svg?style=flat)](https://travis-ci.org/blakeembrey/js-functools)
[![Test coverage](https://img.shields.io/coveralls/blakeembrey/js-functools.svg?style=flat)](https://coveralls.io/r/blakeembrey/js-functools?branch=master)

> Utilities for working with functions in JavaScript, with TypeScript.

_(Inspired by [functools](https://docs.python.org/2/library/functools.html) of the same name)_

## Installation

```
npm install functools --save
```

## Usage

### `identity<T>(arg: T) => T`

Always returns the same value supplied to it.

```js
identity(42); //=> 42
```

### `always<T>(arg: T) => () => T`

Returns a function that always returns the same value supplied to it.

```js
identity(42); //=> 42
```

### `memoize<T, U>(fn: (x: T) => U, cache?: Cache) => (x: T) => U`

Optimize a function to speed up consecutive calls by caching the result of calls with identical input arguments. The cache can be overridden for features such as an LRU cache.

```js
let i = 0;
const fn = memoize(() => ++i);

fn("foo"); //=> 1
fn("foo"); //=> 1

fn("bar"); //=> 2
fn("bar"); //=> 2
```

**See also:** `memoize0` for zero-length function arguments.

### `prop<K>(key: K) => (obj: T) => T[K]`

Return a function that fetches `key` from its operand.

```js
prop("foo")({ foo: 123 }); //=> 123
```

### `invoke<K, A, T>(key: K, ...args: A) => (obj: T) => ReturnType<T[K]>`

Return a function that calls the method name on its operand. If additional arguments are given, they will be given to the method as well.

```js
invoke("add", 5, 5)({ add: (a, b) => a + b }); //=> 10
```

### `throttle<T>(fn: (...args: T) => void, ms: number, { leading, trailing, debounce }) => (...args: T) => void`

Wrap a function to rate-limit the function executions to once every `ms` milliseconds.

```js
let i = 0
const fn = throttle(() => ++i, 100)

fn() // i == 1
fn() // i == 1
fn() // i == 1

setTimeout(() => /* i == 2 */, 200)
```

**Tip:** Use `fn.clear` and `fn.flush` for finer execution control.

- `fn.clear` Unconditionally clears the current timeout
- `fn.flush` When `fn` is pending, executes `fn()` and starts a new interval

### `spread<T, R>(fn: (...args: T) => R) => (args: T) => R`

Given a `fn`, return a wrapper that accepts an array of `fn` arguments.

```js
Promise.all([1, 2, 3]).then(spread(add));
```

### `flip<T1, T2, R>(fn: (arg1: T1, arg2: T2) => R) => (arg2: T2, arg1: T1) => R`

Flip a binary `fn` argument order.

```js
flip(subtract)(5, 10); //=> 5
```

### `partial<T, U, R>(fn: (...args1: T, ...args2: U) => R) => (...args: U) => R`

Returns a partially applied `fn` with the supplied arguments.

```js
partial(subtract, 10)(5); //=> 5
```

### `sequence<T>(...fns: Array<(input: T) => T>) => (input: T) => T`

Left-to-right function composition.

```js
sequence(partial(add, 10), partial(multiply, 5))(5); //=> 75
```

### `compose<T>(...fns: Array<(input: T) => T>) => (input: T) => T`

Right-to-left function composition.

```js
compose(
  partial(add, 10),
  partial(multiply, 5)
)(5); //=> 35
```

### `nary<T, R>(n: number, fn: (...args: T) => R) => (...args: T) => R`

Fix the number of receivable arguments in `origFn` to `n`.

```js
["1", "2", "3"].map(nary(1, fn)); //=> [1, 2, 3]
```

## TypeScript

This module uses [TypeScript](https://github.com/Microsoft/TypeScript) and publishes type definitions on NPM.

## License

Apache 2.0
