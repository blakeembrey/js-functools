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

Always returns the same value that was used as the argument.

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

See also: `memoize0` for zero-length function arguments.

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

### `throttle(fn: () => void, ms: number, leading = true) => () => void`

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

## TypeScript

This module uses [TypeScript](https://github.com/Microsoft/TypeScript) and publishes type definitions on NPM.

## License

Apache 2.0
