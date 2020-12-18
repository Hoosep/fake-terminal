const { override, addBabelPlugin, addDecoratorsLegacy } = require("customize-cra");
const pluginProposalDecorators = require("@babel/plugin-proposal-decorators");
//const a = require("babel-plugin-transform-decorators-legacy");

module.exports = override(
  addDecoratorsLegacy()
)