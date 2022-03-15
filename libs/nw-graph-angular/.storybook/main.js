const path = require('path');

module.exports = {
  stories: [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-knobs"
  ],
  framework: "@storybook/angular",
  core: {
    "builder": "webpack5"
  },
  server: {
    port: 1337,
    host: 'localhost',
    static: {
      '/': 'assets',
    },
    ssl: {
      ca: [],
      cert: '',
      key: '',
    },
    middleware: async (app, server) => {},
  }
}