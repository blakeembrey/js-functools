import * as functools from './index'

describe('functools', () => {
  describe('identity', () => {
    it('should return the input', () => {
      expect(functools.identity(42)).toEqual(42)
    })
  })

  describe('memoize', () => {
    it('should cache return values by input argument', () => {
      let i = 0
      const fn = functools.memoize(() => ++i)

      expect(fn('foo')).toEqual(1)
      expect(fn('foo')).toEqual(1)
      expect(fn('bar')).toEqual(2)
      expect(fn('bar')).toEqual(2)
    })
  })

  describe('prop', () => {
    const getter = functools.prop('foo')

    expect(getter({ foo: 123 })).toEqual(123)
    expect(getter({})).toEqual(undefined)
  })

  describe('invoke', () => {
    expect(functools.invoke('foo')({ foo: () => 123 })).toEqual(123)
    expect(functools.invoke('add', 3, 7)({ add: (a, b) => a + b })).toEqual(10)
  })
})
