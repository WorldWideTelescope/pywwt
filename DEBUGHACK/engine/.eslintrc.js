module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    "eslint:recommended"
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
  },
  globals: {
    globalThis: true, // eventually aim to remove this
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    // Temporary while we get the codebase up to speed:
    "no-constant-condition": "off",
    "no-empty": "off",
    "no-extra-boolean-cast": "off",
    "no-redeclare": "off",
    "no-unused-vars": "off",
  }
};
