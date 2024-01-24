type ErrorInitBase = {
  message: string;
  options?: ErrorOptions;
};

type ExpectedErrorInitBase = {
  actual: string | undefined;
  expected: string;
  options?: ErrorOptions;
};

type ExpectedErrorInit = ErrorInitBase | ExpectedErrorInitBase;

export class ExpectedError extends Error {
  constructor(init: ExpectedErrorInit) {
    if ("message" in init) {
      super(init.message, init.options);
      return this;
    }
    const actual = `\`${init.actual}\`` ?? "`` (empty string)";
    const message = `Expected ${init.expected}, but got ${actual}`;
    super(message, init.options);
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
