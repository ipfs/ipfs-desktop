import { DefaultUpdater, type UpdateOptions } from 'release-please/build/src/updaters/default'
import { logger as defaultLogger, type Logger } from 'release-please/build/src/util/logger';

// const oldVersion = args[0]
// const newVersion = args[1]


// (async () => {
//   const data = await readFile(pathToReadme, 'utf8')
//   const result = data.replace(regExToReplace, `$1${newVersion}`)
//   await writeFile(pathToReadme, result, 'utf8')
// })()


export class ReadmeUpdater extends DefaultUpdater {
  constructor(options: UpdateOptions) {
    super(options)
  }
  getRegex(oldVersion: string): RegExp {
    return new RegExp(`((?:ipfs-desktop|IPFS-Desktop-Setup|ipfs-desktop/releases/tag|ipfs-desktop/releases/download)[-/]v?)${oldVersion}`, 'gm');
  }

  updateContent(content: string, logger: Logger = defaultLogger): string {
    const newVersion = this.version.toString();
    logger.info(`this.versionsMap: `, this.versionsMap);
    const oldVersion = this.versionsMap?.get('oldVersion')?.toString() ?? '0.0.0';

    const result = content.replace(this.getRegex(oldVersion), `$1${newVersion}`)
    // logger.info(`updating from ${parsed.version} to ${this.version}`);
    // parsed.version = this.version.toString();
    // return jsonStringify(parsed, content);
    return result
  }
}
