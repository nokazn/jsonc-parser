import { ExpectedColonError, ExpectedKeyError, ExpectedValueError, UnexpectedNewlineError } from "./errors";
import { BOOLEAN, NEWLINE_REGEXP, NULL, NUMBER_REGEXP, TOKEN, WHITESPACE_REGEXP } from "./syntax";

import type { ArrayType, ObjectType, ValueType } from "./syntax";
import type { Optional } from "./types";

type ConsumeOptionalTokenInit = {
  optional: true;
};

type ReadNextInit = {
  count?: number;
  disallowNewLine?: true;
};

class JsoncParser {
  #index = 0;
  #input = "";

  constructor() {}

  get #current(): Optional<string> {
    return this.#input.at(this.#index);
  }

  get #isWhiteSpace(): boolean {
    return this.#current
      ? WHITESPACE_REGEXP.test(this.#current)
      : false;
  }

  #getCurrent(count?: number): Optional<string> {
    const index = this.#index;
    return count
      ? this.#input.slice(index, index + count)
      : this.#current;
  }

  #readNext(init?: ReadNextInit): void {
    this.#index += init?.count || 1;
    const current = this.#current;
    if (current === undefined) {
      throw new UnexpectedNewlineError();
    }
    if (init?.disallowNewLine && NEWLINE_REGEXP.test(current)) {
      // TODO: better error message
      throw new Error("Unexpected new line");
    }
  }

  #skipWhitespace(): void {
    while (this.#isWhiteSpace) {
      this.#readNext();
    }
  }

  #consumeColon(): void {
    const actual = this.#current;
    if (actual !== TOKEN.SEPARATOR) {
      throw new ExpectedColonError({ actual });
    }
    this.#readNext();
  }

  #consumeComma(init?: ConsumeOptionalTokenInit): void {
    const actual = this.#current;
    if (!init?.optional && actual !== TOKEN.COMMA) {
      throw new ExpectedColonError({ actual });
    }
    this.#readNext();
  }

  #parseKeyword<V>(keyword: string, value: V): Optional<V> {
    const length = keyword.length;
    if (this.#getCurrent(length) === keyword) {
      this.#readNext({ count: length });
      return value;
    }
    return undefined;
  }

  #parseNull(): Optional<null> {
    return this.#parseKeyword(NULL, null);
  }

  #parseTrue(): Optional<true> {
    return this.#parseKeyword(BOOLEAN.TRUE, true);
  }

  #parseFalse(): Optional<false> {
    return this.#parseKeyword(BOOLEAN.FALSE, false);
  }

  #parseString(): Optional<string> {
    if (this.#current !== TOKEN.STRING_DELIMITER) {
      return undefined;
    }

    let result = "";

    this.#readNext({ disallowNewLine: true });
    while (this.#current === TOKEN.STRING_DELIMITER) {
      result += this.#current;
      this.#readNext({ disallowNewLine: true });
    }
    return result;
  }

  // TODO: adjust for negative numbers, decimals, etc.
  #parseNumber(): Optional<number> {
    let result = "";
    while (NUMBER_REGEXP.test(this.#current ?? "")) {
      result += this.#current;
      this.#readNext({ disallowNewLine: true });
    }
    if (result) {
      // TODO: fix this
      const num = Number(result);
      return Number.isNaN(num)
        ? undefined
        : num;
    }
    return undefined;
  }

  #parseArray(): Optional<ArrayType> {
    if (this.#current !== TOKEN.START_ARRAY) {
      return undefined;
    }
    const result = [];
    let isInitialValue = true;

    this.#readNext();
    this.#skipWhitespace();
    // @ts-expect-error: TODO: fix this
    while (this.#current !== TOKEN.END_ARRAY) {
      if (!isInitialValue) {
        this.#consumeComma();
        this.#skipWhitespace();
      }
      const value = this.#parseValue();
      result.push(value);
      isInitialValue = false;
    }
    this.#readNext();
    return result;
  }

  #parseObject(): Optional<ObjectType> {
    if (this.#current !== TOKEN.START_OBJECT) {
      return undefined;
    }
    const result: ObjectType = {};
    let isInitialKey = true;

    this.#readNext();
    this.#skipWhitespace();
    while (this.#current !== TOKEN.END_OBJECT) {
      if (!isInitialKey) {
        this.#consumeComma();
        this.#skipWhitespace();
      }
      const key = this.#parseString();
      if (key === undefined) {
        throw new ExpectedKeyError();
      }

      this.#skipWhitespace();
      this.#consumeColon();
      const value = this.#parseValue();

      result[key] = value;
      isInitialKey = false;
    }
    this.#readNext();

    return result;
  }

  #parseValue(): ValueType {
    this.#skipWhitespace();
    const value = this.#parseTrue()
      ?? this.#parseFalse()
      ?? this.#parseString()
      ?? this.#parseNumber()
      ?? this.#parseArray()
      ?? this.#parseObject()
      ?? this.#parseNull();
    if (value === undefined) {
      throw new ExpectedValueError();
    }
    this.#skipWhitespace();
    return value;
  }

  parse(input: string) {
    this.#input = input;
    //  TODO: implement this
  }
}

export { JsoncParser };
