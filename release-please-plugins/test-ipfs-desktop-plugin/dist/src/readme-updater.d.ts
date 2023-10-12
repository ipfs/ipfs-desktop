import { DefaultUpdater, type UpdateOptions } from 'release-please/build/src/updaters/default';
import { type Logger } from 'release-please/build/src/util/logger';
export declare class UpdateVersionsInReadme extends DefaultUpdater {
    constructor(options: UpdateOptions);
    getRegex(oldVersion: string): RegExp;
    updateContent(content: string, logger?: Logger): string;
}
//# sourceMappingURL=readme-updater.d.ts.map