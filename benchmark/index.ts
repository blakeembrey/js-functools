function benchmark(
  group: string,
  checks: Array<{ name: string; test: () => () => void }>,
  iterations = 1_000_000
) {
  const tests = checks.map((x, i) => [i, x.test()] as const).sort(() => Math.random() - 0.5);

  for (let i = 0; i < tests.length; i++) {
    const [index, test] = tests[i];
    const { name } = checks[index];
    const label = ``;

    const start = process.hrtime();
    for (let i = 0; i < iterations; i++) test();
    const time = process.hrtime(start);
    const ms = (time[0]* 1000000000 + time[1]) / 1000000;
    console.log(`${group}: ${name}: ${ms}ms`)
  }
}

benchmark("memoize0", [
  {
    name: "sentinel",
    test: () => {
      const SENTINEL = Symbol("SENTINEL");

      function memoize0<T>(fn: () => T): () => T {
        let result: T | typeof SENTINEL = SENTINEL;

        return (): T => {
          if (result === SENTINEL) result = fn();
          return result;
        };
      }

      return memoize0(() => 1);
    },
  },
  {
    name: "variable",
    test: () => {
      function memoize0<T>(fn: () => T): () => T {
        let cached = false;
        let result: T | undefined = undefined;

        return (): T => {
          if (!cached) {
            result = fn();
            cached = true;
          }

          return result as T;
        };
      }

      return memoize0(() => 1);
    },
  },
  {
    name: "function",
    test: () => {
      function memoize0<T>(fn: () => T): () => T {
        let cached = () => {
          const result = fn();
          cached = () => result;
          return result;
        };

        return () => cached();
      }

      return memoize0(() => 1);
    },
  },
]);
