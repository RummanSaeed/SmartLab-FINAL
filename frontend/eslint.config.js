const js = require("@eslint/js")
const globals = require("globals")
const tseslint = require("typescript-eslint")
const nextPlugin = require("@next/eslint-plugin-next")
const reactHooks = require("eslint-plugin-react-hooks")

module.exports = [
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "**/out/**",
      "**/dist/**",
      "**/build/**",
      "public/sims/**",
      "eslint.config.js",
      "prisma/seed.js",
    ],
  },

  js.configs.recommended,

  // TypeScript (non type-aware by default)
  ...tseslint.configs.recommended,

  // Next.js rules
  {
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactHooks.configs.recommended.rules,
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },

  // Project language options
  {
    files: ["**/*.{js,cjs,mjs,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // Relax common friction rules in app-router projects
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  // JS files (including CommonJS scripts)
  {
    files: ["**/*.js", "**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]
