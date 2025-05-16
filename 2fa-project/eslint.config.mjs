// eslint.config.js (project root)
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  // Inherit Next.js defaults
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      // Turn these off (or to "warn") so they no longer error your build:
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "prefer-const": "off",
      "@typescript-eslint/no-require-imports": "off",

    },
  },
];
