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
})
