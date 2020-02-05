import * as functools from "./index";

describe("functools", () => {
  describe("identity", () => {
    it("should return the input", () => {
      expect(functools.identity(42)).toEqual(42);
    });
  });

  describe("always", () => {
    it("should return a function that returns the input", () => {
      const fn = functools.always(42);

      expect(fn()).toEqual(42);
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

  describe("memoizeOne", () => {
    it("should memoize a zero-length function", () => {
      let i = 0;
      const fn = functools.memoizeOne((x: string) => ++i);

      expect(fn("foo")).toEqual(1);
      expect(fn("foo")).toEqual(1);

      expect(fn("bar")).toEqual(2);
      expect(fn("bar")).toEqual(2);

      expect(fn("foo")).toEqual(3);
      expect(fn("foo")).toEqual(3);
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
      }, 10);

      setTimeout(() => {
        fn(); // Works after timeout.
        expect(i).toEqual(2);
        return done();
      }, 100);
    });

    it("should throttle function calls without leading call", done => {
      let i = 0;
      const fn = functools.throttle(() => ++i, 100, { leading: false });

      fn(); // Leading invoke disabled.
      expect(i).toEqual(0);

      setTimeout(() => fn(), 50); // Noop.

      setTimeout(() => {
        expect(i).toEqual(1);
        return done();
      }, 110);
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

      fn(); // Enqueue `fn` after last flush.
      expect(i).toEqual(3);

      setTimeout(() => {
        expect(i).toEqual(3);
        return done();
      }, 100);
    });

    it("should skip trailing calls", done => {
      let i = 0;
      const fn = functools.throttle(() => ++i, 100, {
        trailing: false
      });

      fn();

      expect(i).toEqual(1);

      // Tracks `pending` for first "event loop".
      setTimeout(() => fn(), 20);
      setTimeout(() => fn(), 40);
      setTimeout(() => fn(), 60);
      setTimeout(() => fn(), 80);

      // Nothing happened between loops with `lagging` set.
      setTimeout(() => expect(i).toEqual(1), 150);

      setTimeout(() => {
        expect(i).toEqual(1); // Executed the second timeout.
        return done();
      }, 210);
    });

    it("should debounce function execution", done => {
      let i = 0;
      const fn = functools.throttle(() => ++i, 100, {
        leading: false,
        debounce: true
      });

      fn();

      expect(i).toEqual(0);

      // Tracks `pending` for first "event loop".
      setTimeout(() => fn(), 20);
      setTimeout(() => fn(), 40);
      setTimeout(() => fn(), 60);
      setTimeout(() => fn(), 80);

      // Nothing happened between loops with `debounce` set.
      setTimeout(() => expect(i).toEqual(0), 130);

      setTimeout(() => {
        expect(i).toEqual(1); // Executed after debounce.
        return done();
      }, 190);
    });
  });

  describe("spread", () => {
    it("should spread function arguments", () => {
      const fn = functools.spread(functools.add);

      expect(fn([1, 2])).toEqual(3);
    });
  });

  describe("compose", () => {
    it("should compose a list of functions", () => {
      const fn = functools.compose(
        functools.partial(functools.multiply, 5),
        functools.partial(functools.flip(functools.subtract), 3)
      );

      expect(fn(10)).toEqual(35);
    });
  });

  describe("sequence", () => {
    it("should sequence a list of functions", () => {
      const fn = functools.sequence(
        functools.partial(functools.flip(functools.divide), 5),
        functools.partial(functools.add, 3)
      );

      expect(fn(10)).toEqual(5);
    });
  });

  describe("nary", () => {
    it("should restrict function arity", () => {
      const fn = functools.nary(1, parseInt);

      expect(["1", "2", "3"].map(fn)).toEqual([1, 2, 3]);
    });
  });
});
