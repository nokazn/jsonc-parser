type ErrorInitBase = {
  message: string;
  options?: ErrorOptions;
};

type CustomConsumerErrorInitBase = {
  actual: string | undefined;
  expected: string;
  options?: ErrorOptions;
};

type ConsumerErrorInit = ErrorInitBase | CustomConsumerErrorInitBase;

type ExpectedErrorInit = ErrorInitBase | Omit<CustomConsumerErrorInitBase, "expected">;

class ConsumerError extends Error {
  constructor(init: ConsumerErrorInit) {
    if ("message" in init) {
      super(init.message, init.options);
      return this;
    }
    const actual = `\`${init.actual}\`` ?? "`` (empty string)";
    const message = `Expected ${init.expected} \`:\`, but got ${actual}`;
    super(message, init.options);
  }
}

export class ExpectedColonError extends ConsumerError {
  constructor(init: ExpectedErrorInit) {
    super({
      ...init,
      expected: "colon",
    });
  }
}

export class ExpectedCommaError extends ConsumerError {
  constructor(init: ExpectedErrorInit) {
    super({
      ...init,
      expected: "comma",
    });
  }
}

export class ExpectedValueError extends Error {
  constructor() {
    // TODO: refine error message
    super("Expected a value, but got nothing");
  }
}

export class UnexpectedNewlineError extends Error {
  constructor() {
    // TODO: refine error message
    super("Unexpected new line");
  }
}
