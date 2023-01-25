module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es2021: true,
  },
  extends: ["airbnb-base"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    quotes: [2, "double", { avoidEscape: true }],
    camelcase: [0],
    "max-len": [
      "error",
      {
        code: 120,
        tabWidth: 2,
        ignoreComments: true,
      },
    ],
  },
};
