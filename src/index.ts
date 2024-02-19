import { ExpectedError, ExpectedValueError, UnexpectedNewlineError } from "./errors.js";
import { isWhiteSpace } from "./internals/string.js";
import { BOOLEAN, NEWLINE_REGEXP, NULL, NUMBER_REGEXP, TOKEN } from "./syntax.js";

import type { ArrayType, ObjectType, ValueType } from "./syntax.js";
import type { Optional, ValueOf } from "./types.js";

type ConsumeResult = {
  hasValue: true;
} | {
  hasValue: false;
  // TODO: fix this
  actual: Optional<string>;
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

  #isCurrentEqualTo(expected: ValueOf<typeof TOKEN>): boolean {
    return this.#current === expected;
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

  /**
   * @throws {ExpectedError}
   */
  #consumeColon(): ConsumeResult {
    const actual = this.#current;
    if (actual !== TOKEN.SEPARATOR) {
      throw new ExpectedError({
        actual,
        expected: "`:`",
      });
    }
    this.#readNext();
    return { hasValue: true };
  }

  /**
   * doesn't throw an error if the next token is not a comma
   */
  #consumeComma(): ConsumeResult {
    const actual = this.#current;
    if (actual === TOKEN.COMMA) {
      this.#readNext();
      return { hasValue: true };
    }
    return { actual, hasValue: false };
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
    if (!this.#isCurrentEqualTo(TOKEN.START_ARRAY)) {
      return undefined;
    }
    const result: ArrayType = [];

    this.#readNext();
    this.#skipWhitespace();
    for (
      let isInitialValue = true,
        commaResult: ConsumeResult = { hasValue: true };
      !this.#isCurrentEqualTo(TOKEN.END_ARRAY);
    ) {
      if (!isInitialValue) {
        commaResult = this.#consumeComma();
        this.#skipWhitespace();
      }
      const value = this.#parseValue();
      if (value === undefined) {
        if (!this.#isCurrentEqualTo(TOKEN.END_ARRAY)) {
          throw new ExpectedError({
            actual: this.#current,
            expected: "boolean, string, number, array, object, or null",
          });
        }
        break;
      }
      if (commaResult.hasValue) {
        result.push(value);
      } else {
        throw new ExpectedError({
          actual: commaResult.actual ?? value?.toString(),
          expected: "`,`",
        });
      }

      isInitialValue = false;
    }
    this.#readNext();
    return result;
  }

  #parseObject(): Optional<ObjectType> {
    if (!this.#isCurrentEqualTo(TOKEN.START_OBJECT)) {
      return undefined;
    }
    const result: ObjectType = {};

    this.#readNext();
    this.#skipWhitespace();
    for (
      let isInitialKey = true,
        commaResult: ConsumeResult = { hasValue: true };
      !this.#isCurrentEqualTo(TOKEN.END_OBJECT);
    ) {
      if (!isInitialKey) {
        commaResult = this.#consumeComma();
        this.#skipWhitespace();
      }
      const key = this.#parseString();
      this.#skipWhitespace();
      if (key === undefined) {
        if (!this.#isCurrentEqualTo(TOKEN.END_OBJECT)) {
          throw new ExpectedError({
            actual: this.#current,
            expected: "double-quoted string key",
          });
        }
        break;
      } else {
        if (!commaResult.hasValue) {
          throw new ExpectedError({
            actual: commaResult.actual ?? key,
            expected: "`,`",
          });
        }
      }
      this.#consumeColon();
      const value = this.#parseValue();
      if (value === undefined) {
        throw new ExpectedValueError();
      }

      result[key] = value;
      isInitialKey = false;
    }
    this.#readNext();

    return result;
  }

  #parseValue(): Optional<ValueType> {
    this.#skipWhitespace();
    const value = this.#parseTrue()
      ?? this.#parseFalse()
      ?? this.#parseString()
      ?? this.#parseNumber()
      ?? this.#parseArray()
      ?? this.#parseObject()
      ?? this.#parseNull();
    this.#skipWhitespace();
    return value;
  }

  parse(input: string) {
    this.#input = input;
    return this.#parseValue();
  }
}

export { JsoncParser };
