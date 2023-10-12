"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
/** @type {import('release-please')} */
// const releasePlease = require('release-please')
const release_please_1 = require("release-please");
const plugin_1 = require("./plugin");
function init(...args) {
    console.log('init called with args: ', args);
    // releasePlease.registerPlugin('test-ipfs-desktop-plugin', (options: any) => new CustomPlugin(options.github, options.targetBranch, options.repositoryConfig))
    (0, release_please_1.registerPlugin)('test-ipfs-desktop-plugin', (options) => new plugin_1.CustomPlugin(options.github, options.targetBranch, options.repositoryConfig));
    // override require so release-please is importing the same release-please as us
    // const oldResult = require.resolve('release-please/build/src/factory')
    // require.cache[oldResult].exports = releasePlease
    console.log('registered test-ipfs-desktop-plugin as a release-please plugin');
    console.log('registered plugins: ', (0, release_please_1.getPluginTypes)());
}
exports.init = init;
init();
//# sourceMappingURL=index.js.map