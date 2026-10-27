import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/**",
      "build/**",
      "node_modules/**",
      "src/**/*.backup",
      "src/**/* 2.js",
      "src/**/*.d.ts",
    ],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react, "react-hooks": reactHooks },
    settings: { react: { version: "detect" } },
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-empty": "off",
      "no-useless-escape": "off",
      "no-redeclare": "off",
      "no-case-declarations": "off",
      "no-prototype-builtins": "off",
      "no-control-regex": "off",
      "no-sparse-arrays": "off",
      "no-constant-condition": "off",
      "no-extra-boolean-cast": "off",
      "no-async-promise-executor": "off",
      "no-irregular-whitespace": "off",
      "no-fallthrough": "off",
      "no-cond-assign": "off",
      "no-self-assign": "off",
      "no-func-assign": "off",
      "no-unsafe-finally": "off",
      "no-misleading-character-class": "off",
      "no-loss-of-precision": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-no-target-blank": "off",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    plugins: { react, "react-hooks": reactHooks },
    settings: { react: { version: "detect" } },
    rules: {
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-undef": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
];
