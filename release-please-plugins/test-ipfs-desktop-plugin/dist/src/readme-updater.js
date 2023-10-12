"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVersionsInReadme = void 0;
const default_1 = require("release-please/build/src/updaters/default");
const logger_1 = require("release-please/build/src/util/logger");
class UpdateVersionsInReadme extends default_1.DefaultUpdater {
    constructor(options) {
        super(options);
    }
    getRegex(oldVersion) {
        return new RegExp(`((?:ipfs-desktop|IPFS-Desktop-Setup|ipfs-desktop/releases/tag|ipfs-desktop/releases/download)[-/]v?)${oldVersion}`, 'gm');
    }
    updateContent(content, logger = logger_1.logger) {
        var _a;
        const newVersion = this.version.toString();
        /**
         * look for a string "like ipfs-desktop-0.31.0-mac.dmg" and get the version(e.g. 0.31.0) from it
         * TODO: We need a better way to get the old version
         */
        const match = content.match(/ipfs\/ipfs-desktop\/releases\/tag\/v(?<version>[^)]+)/);
        const oldVersion = (_a = match === null || match === void 0 ? void 0 : match.groups) === null || _a === void 0 ? void 0 : _a.version;
        if (!oldVersion) {
            throw new Error(`could not find old version in provided README.md content`);
        }
        const result = content.replace(this.getRegex(oldVersion), `$1${newVersion}`);
        // logger.info(`updating from ${parsed.version} to ${this.version}`);
        // parsed.version = this.version.toString();
        // return jsonStringify(parsed, content);
        return result;
    }
}
exports.UpdateVersionsInReadme = UpdateVersionsInReadme;
//# sourceMappingURL=readme-updater.js.map