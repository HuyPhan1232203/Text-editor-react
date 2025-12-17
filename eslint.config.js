import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import neostandard, { plugins } from "neostandard";

export default [
  ...tseslint.configs.recommended,

  ...neostandard({
    ts: true,
    ignores: [
      "dist/**",
      "build/**",
      "node_modules/**",
      "*.config.js",
      "*.config.ts",
      "*.config.mjs",
      "vite-env.d.ts",
      ".cache/**",
      "public/**",
      "src/components/ui/**",
      ".env*",
      ".git/**",
    ],
  }),

  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "@stylistic": plugins["@stylistic"],
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "off",
        { allowConstantExport: true },
      ],
      "comma-dangle": ["error", "never"],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@stylistic/indent": [
        "error",
        2,
        {
          SwitchCase: 1,
          VariableDeclarator: "first",
          outerIIFEBody: 1,
          MemberExpression: 1,
          FunctionDeclaration: { parameters: "first" },
          FunctionExpression: { parameters: "first" },
          CallExpression: { arguments: "first" },
          ArrayExpression: "first",
          ObjectExpression: "first",
          ImportDeclaration: "first",
          flatTernaryExpressions: false,
          ignoreComments: false,
        },
      ],
      "@stylistic/quotes": [
        "error",
        "single",
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
      "@stylistic/semi": ["error", "never"],
      "@stylistic/comma-spacing": ["error", { before: false, after: true }],
      "@stylistic/key-spacing": [
        "error",
        { beforeColon: false, afterColon: true, mode: "strict" },
      ],
      "@stylistic/type-annotation-spacing": [
        "error",
        {
          before: false,
          after: true,
          overrides: { arrow: { before: true, after: true } },
        },
      ],
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/array-bracket-spacing": ["error", "never"],
      "@stylistic/space-before-blocks": ["error", "always"],
      "@stylistic/keyword-spacing": ["error", { before: true, after: true }],
      "@stylistic/space-infix-ops": "error",
      "@stylistic/arrow-spacing": ["error", { before: true, after: true }],
      "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
      "@stylistic/member-delimiter-style": [
        "error",
        {
          multiline: { delimiter: "none", requireLast: true },
          singleline: { delimiter: "comma", requireLast: false },
        },
      ],
      "@stylistic/padding-line-between-statements": [
        "error",
        {
          blankLine: "always",
          prev: "*",
          next: ["interface", "type", "function", "class", "export"],
        },
        {
          blankLine: "always",
          prev: ["interface", "type", "function", "class"],
          next: "*",
        },
        { blankLine: "always", prev: "import", next: "*" },
        { blankLine: "any", prev: "import", next: "import" },
        { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
        {
          blankLine: "any",
          prev: ["const", "let", "var"],
          next: ["const", "let", "var"],
        },
      ],
      "@stylistic/max-len": [
        "warn",
        {
          code: 120,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],
      "@stylistic/multiline-ternary": ["error", "always-multiline"],
      "@stylistic/operator-linebreak": [
        "error",
        "before",
        {
          overrides: { "=": "none", "+=": "none", "-=": "none" },
        },
      ],
    },
  },
];
