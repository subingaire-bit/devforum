// Licensed under MIT - DevForum Project
import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import nextPlugin from "eslint-config-next";
import prettierConfig from "eslint-config-prettier";

export default [
  eslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    ...nextPlugin,
    rules: {
      ...nextPlugin.rules,
      "react/no-unescaped-entities": "off",
    },
  },
  prettierConfig,
  {
    ignores: [
      "node_modules",
      ".next",
      "out",
      "coverage",
      "prisma/migrations",
      "*.config.js",
      "*.config.mjs",
    ],
  },
];