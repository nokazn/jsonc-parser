import { Optional } from "~/types";
import { NEWLINE_REGEXP, WHITESPACE_REGEXP } from "../syntax";

export const isNewLine = (str: Optional<string>) => {
  return str ? NEWLINE_REGEXP.test(str) : false;
};

export const isWhiteSpace = (str: Optional<string>) => {
  return str ? WHITESPACE_REGEXP.test(str) : false;
};
