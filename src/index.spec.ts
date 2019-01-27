import * as functools from "./index";

describe("functools", () => {
  describe("identity", () => {
    it("should return the input", () => {
      expect(functools.identity(42)).toEqual(42);
    });
  });

  describe("memoize", () => {
    it("should cache return values by input argument", () => {
      let i = 0;
      const fn = functools.memoize(() => ++i);

      expect(fn("foo")).toEqual(1);
      expect(fn("foo")).toEqual(1);
      expect(fn("bar")).toEqual(2);
      expect(fn("bar")).toEqual(2);
    });
  });

  describe("memoize0", () => {
    it("should memoize a zero-length function", () => {
      let i = 0;
      const fn = functools.memoize0(() => ++i);

      expect(fn()).toEqual(1);
      expect(fn()).toEqual(1);
    });
  });

  describe("prop", () => {
    const getter = functools.prop("foo");

    expect(getter({ foo: 123 })).toEqual(123);
    expect(getter({})).toEqual(undefined);
  });

  describe("invoke", () => {
    expect(functools.invoke("foo")({ foo: () => 123 })).toEqual(123);
    expect(functools.invoke("add", 3, 7)({ add: (a, b) => a + b })).toEqual(10);
  });

  describe("throttle", () => {
    it("should throttle function calls", done => {
      let i = 0;
      const fn = functools.throttle(() => ++i, 100);

      fn(); // Leading invoke.

      expect(i).toEqual(1);

      setTimeout(() => {
        fn(); // Doesn't invoke.

        expect(i).toEqual(1);

        setTimeout(() => {
          fn(); // Works after timeout.

          expect(i).toEqual(2);

          return done();
        }, 100);
      }, 10);
    });

    it("should throttle function calls without leading call", done => {
      let i = 0;
      const fn = functools.throttle(() => ++i, 100, false);

      fn(); // Leading invoke disabled.

      expect(i).toEqual(0);

      setTimeout(() => {
        expect(i).toEqual(1);

        return done();
      }, 200);
    });

    it("should flush the function call", done => {
      let i = 0;
      const fn = functools.throttle(() => ++i, 100);

      fn.flush(); // Nothing to execute.

      expect(i).toEqual(0);

      fn(); // Execute leading `fn`.
      fn(); // Pending `fn`.
      expect(i).toEqual(1);

      fn.flush(); // Flush pending `fn`.
      expect(i).toEqual(2);

      fn.flush(); // Does nothing, no pending `fn`.
      expect(i).toEqual(2);

      fn(); // Enqueue `fn` after last flush (no leading since has run).
      expect(i).toEqual(2);

      setTimeout(() => {
        expect(i).toEqual(3);
        return done();
      }, 100);
    });
  });
});
