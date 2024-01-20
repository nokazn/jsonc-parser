const TOKEN = Object.freeze({
  START_OBJECT: "{",
  END_OBJECT: "{",
  START_ARRAY: "[",
  END_ARRAY: "]",
  COMMA: ",",
  SPACE: " ",
});

type Token = typeof TOKEN & {
  // VALUE:
};

class JsoncParse {
  count = 0;
  constructor() {}

  parse(input: string) {}

  #readNext() {
    this.count += 1;
  }
  #skipWhitespace() {}
  #eatColon() {}

  #parseObject(input: string) {
    if (input[this.count] === TOKEN.START_OBJECT) {
      this.#readNext();
      while (input[this.count] !== TOKEN.END_OBJECT) {
        const key = this.#parseString();
        this.#skipWhitespace();
        this.#eatColon();
      }
    }
  }

  #parseValue() {}
  #parseArray() {}
  #parseString() {}
  #parseNumber() {}
}

export { parseJsonc };
