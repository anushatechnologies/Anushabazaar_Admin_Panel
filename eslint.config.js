// eslint.config.js
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import globals from "globals"; // ✅ ESM import

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      prettier: prettierPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "prettier/prettier": "error",
    
      // ✅ TypeScript-specific unused variable rule
      "@typescript-eslint/no-unused-vars": [
        "error", // ⛔ Make it an error (not a warning)
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          varsIgnorePattern: "^_", // ✅ Ignore vars starting with "_"
          argsIgnorePattern: "^_", // ✅ Ignore args starting with "_"
          caughtErrors: "none",
        },
      ],
    
      // ✅ Disable base ESLint rule to prevent duplicates
      "no-unused-vars": "off",
    },
    
    settings: {
      react: { version: "detect" },
    },
  },
  prettierConfig,
];
