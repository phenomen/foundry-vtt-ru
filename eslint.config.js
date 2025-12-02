import stylistic from "@stylistic/eslint-plugin";
import json from "@eslint/json";

const stylisticConfig = stylistic.configs.customize({
  quotes: "double",
  semi: true,
  arrowParens: true,
});

stylisticConfig.files = ["**/*.js"];

export default [
  {
    ignores: ["dist/**", "node_modules/**", ".git/**", "package-lock.json"],
  },
  stylisticConfig,
  {
    files: ["**/*.json"],
    language: "json/json",
    plugins: {
      json,
    },
    rules: {
      "json/no-duplicate-keys": "error",
      "json/no-empty-keys": "error",
      "json/no-unnormalized-keys": "error",
      "json/no-unsafe-values": "error",
    },
  },
];
