module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore les fichiers compilés.
    "/generated/**/*", 
    "eslint.config.js",
  ],
  plugins: [
    "@typescript-eslint",
  ],
  rules: {
    "quotes": ["error", "double"],
    "indent": ["error", 2],
    "@typescript-eslint/no-explicit-any": "off", // Évite de bloquer sur les types 'any' (comme dans le catch)
    "@typescript-eslint/no-unused-vars": "warn", // Les variables inutilisées afficheront un avertissement au lieu de bloquer
  },
};