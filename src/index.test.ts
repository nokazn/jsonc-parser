import { describe, expect, test } from "vitest";
import { JsoncParser } from "./index";

type TestCase<I, E = unknown> = {
  name?: string;
  input: I;
  expected: E;
};

describe("JsoncParser", () => {
  test.each<TestCase<string, unknown>>([
    {
      input: `{}`,
      expected: {},
    },
    {
      input: ` {     }  `,
      expected: {},
    },
    {
      input: ` {

            }
              `,
      expected: {},
    },
    {
      input: ` { "a": 1 }`,
      expected: { a: 1 },
    },
    {
      input: ` { "a": 1, "b": 2, "c": 3, "d": 4, }`,
      expected: { a: 1, b: 2, c: 3, d: 4 },
    },
    {
      input: `
      {
        "a": 1,
        "b": 2,
        "c": 3,
        "d": 4
      }`,
      expected: { a: 1, b: 2, c: 3, d: 4 },
    },
    {
      input: `
      {
        "a": 1,
        "b": 2,
        "c": 3,
        "d": 4,
      }`,
      expected: { a: 1, b: 2, c: 3, d: 4 },
    },
    {
      input: `[]`,
      expected: [],
    },
    {
      input: `[1, 2, 3, 4]`,
      expected: [1, 2, 3, 4],
    },
    {
      input: `[1, 2, 3, 4,]`,
      expected: [1, 2, 3, 4],
    },
    {
      input: `[
        1,
        2
        ,
        3,
        4            ]
        `,
      expected: [1, 2, 3, 4],
    },
    {
      input: `["a", "b", "c", "d"]`,
      expected: ["a", "b", "c", "d"],
    },
    {
      input: `[
        "a",
         "b"
         ,
          "c",
             "d"            ]
             `,
      expected: ["a", "b", "c", "d"],
    },
  ])("When got $input, `$expected` is expected", ({ input, expected }) => {
    const parser = new JsoncParser();
    expect(parser.parse(input)).toStrictEqual(expected);
  });
});
