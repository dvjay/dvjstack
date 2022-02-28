module.exports = {
  extends: "../.eslintrc.js",
  ignorePatterns: ["!**/*"],
  overrides: [
    {
      files: ["*.ts"],
      parserOptions: {
        project: [
          "lib/tsconfig.lib.json",
          "lib/tsconfig.spec.json"
        ],
        createDefaultProgram: true,
      },
      rules: {
        "@angular-eslint/component-selector": [
          "error",
          {
            type: "element",
            prefix: "lib",
            style: "kebab-case"
          },
        ],
        "@angular-eslint/directive-selector": [
          "error",
          {
            type: "attribute",
            prefix: "lib",
            style: "camelCase"
          },
        ],
      },
    },
    {
      files: ["*.html"],
      rules: {},
    },
  ],
};