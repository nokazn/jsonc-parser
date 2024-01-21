import { ValueOf } from "./types";

export const NEWLINE_REGEXP = /\r\n|\r|\n/;
export const WHITESPACE_REGEXP = new RegExp(`\\s|\\t|${NEWLINE_REGEXP}`);
export const NUMBER_REGEXP = /\d/;

export const BOOLEAN = Object.freeze({
  TRUE: "true",
  FALSE: "false",
});
export type BooleanLiteral = ValueOf<typeof BOOLEAN>;

export const NULL = "null";
export type NullLiteral = typeof NULL;

export type ObjectType = Record<string, ValueType>;
export type ArrayType = unknown[];

export type ValueType =
  | null
  | boolean
  | string
  | number
  | { [key: string]: ValueType }
  | ArrayType;

export const TOKEN = Object.freeze({
  START_OBJECT: "{",
  END_OBJECT: "}",
  START_ARRAY: "[",
  END_ARRAY: "]",
  STRING_DELIMITER: "\"",
  SEPARATOR: ":",
  COMMA: ",",
  SPACE: " ",
});
