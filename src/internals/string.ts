import { Optional } from "~/types.js";
import { NEWLINE_REGEXP, WHITESPACE_REGEXP } from "../syntax.js";

export const isNewLine = (str: Optional<string>) => {
  return str ? NEWLINE_REGEXP.test(str) : false;
};

export const isWhiteSpace = (str: Optional<string>) => {
  return str ? WHITESPACE_REGEXP.test(str) : false;
};
