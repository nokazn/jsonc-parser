// @ts-expect-error: TODO: fix later
import { ExpectedColonError, ExpectedCommaError, ExpectedKeyError, UnexpectedNewlineError } from "./errors";
import { isWhiteSpace } from "./internals/string";
import { BOOLEAN, NEWLINE_REGEXP, NULL, NUMBER_REGEXP, TOKEN } from "./syntax";

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
    return isWhiteSpace(this.#current);
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
      return;
    }
    if (init?.disallowNewLine && NEWLINE_REGEXP.test(current)) {
      throw new UnexpectedNewlineError();
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
      throw new ExpectedCommaError({ actual });
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

  // TODO: adjust for escape characters
  #parseString(): Optional<string> {
    if (this.#current !== TOKEN.STRING_DELIMITER) {
      return undefined;
    }

    let result = "";
    this.#readNext({ disallowNewLine: true });
    while (this.#current !== TOKEN.STRING_DELIMITER) {
      result += this.#current;
      this.#readNext({ disallowNewLine: true });
    }
    this.#readNext();
    return result;
  }

  // TODO: adjust for negative numbers, decimals, etc.
  #parseNumber(): Optional<number> {
    let result = "";
    while (NUMBER_REGEXP.test(this.#current ?? "")) {
      result += this.#current;
      this.#readNext();
    }
    if (result) {
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
    const result: ArrayType = [];
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
    // @ts-expect-error: TODO: fix later
    while (this.#current !== TOKEN.END_OBJECT) {
      if (!isInitialKey) {
        this.#consumeComma();
        this.#skipWhitespace();
      }
      const key = this.#parseString();
      if (key === undefined) {
        break;
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
    this.#skipWhitespace();
    // @ts-expect-error: TODO: fix later
    return value;
  }

  parse(input: string) {
    this.#input = input;
    return this.#parseValue();
  }
}

export { JsoncParser };
