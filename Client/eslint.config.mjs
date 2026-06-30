// ESLint flat config (ESM) for the Next.js client application.
// Uses the new `eslint.config.mjs` convention (ESLint v9+ flat config system).
// Composes Next.js recommended rules with performance-aware "core-web-vitals" rules
// and TypeScript-aware linting, then globally excludes build artifacts and generated types.

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  // Spread Next.js core-web-vitals preset: enforces patterns that avoid
  // regressions in LCP / CLS / INP by flagging problematic patterns in
  // client components, image usage, and link behaviour.
  ...nextVitals,

  // Spread Next.js TypeScript preset: adds @typescript-eslint rules scoped
  // to the Next.js plugin ecosystem (e.g. no-unescaped-entities, etc.).
  ...nextTs,

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // Project-wide rule relaxations. These currently fire across much of the
  // existing UI code (explicit `any`, and the React-Compiler hook rules
  // shipped with eslint-config-next 16). Downgraded to warnings so they stay
  // visible without blocking CI; tighten back to "error" and fix incrementally.
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/incompatible-library": "warn",
    },
  },
]);

export default eslintConfig;
