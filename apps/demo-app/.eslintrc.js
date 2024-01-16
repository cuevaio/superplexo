/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@superplexo/eslint-config/next.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
};
