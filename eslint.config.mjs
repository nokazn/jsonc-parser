import { FlatCompat } from "@eslint/eslintrc";
import typeScriptESLintPlugin from "@typescript-eslint/eslint-plugin";
import typeScriptESLintParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";

// See https://github.com/typescript-eslint/typescript-eslint/issues/7694
const compat = new FlatCompat();
const parserOptions = Object.freeze({
  sourceType: "module",
  ecmaVersion: 2023,
});

/**
 * @type {import("eslint").Linter.FlatConfig}
 */
export default [
  {
    ignores: [
      "**/node_modules",
      "dist",
      "coverage",
    ],
  },
  eslintConfigPrettier,
  ...compat.extends(
    "plugin:@typescript-eslint/eslint-recommended",
  ),
  ...compat.config(
    {
      extends: "plugin:@typescript-eslint/eslint-recommended",
      parser: "@typescript-eslint/parser",
      parserOptions,
    },
  ),
  {
    files: [
      "**/*.ts",
      "**/*.mts",
      "**/*.cts",
      "**/*.js",
      "**/*.mjs",
      "**/*.cjs",
    ],
    plugins: {
      typeScriptESLintPlugin,
    },
    languageOptions: {
      globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
      },
      parser: typeScriptESLintParser,
      parserOptions,
    },
    rules: {},
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },
];
