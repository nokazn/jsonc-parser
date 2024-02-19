import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tsEslint from "typescript-eslint";

const parserOptions = Object.freeze({
  project: true,
  tsconfigRootDir: import.meta.dirname,
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
  eslint.configs.recommended,
  ...tsEslint.configs.recommendedTypeChecked,
  eslintConfigPrettier,
  {
    files: [
      "**/*.ts",
      "**/*.mts",
      "**/*.cts",
      "**/*.js",
      "**/*.mjs",
      "**/*.cjs",
    ],
    languageOptions: {
      globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
      },
      parserOptions,
    },
    rules: {},
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },
];
