import { readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'

const pathToReadme = resolve(__dirname, '..', '..', './README.md')
const args = process.argv.slice(2)
const oldVersion = args[0]
const newVersion = args[1]

const regExToReplace: RegExp = new RegExp(`((?:ipfs-desktop|IPFS-Desktop-Setup|ipfs-desktop/releases/tag|ipfs-desktop/releases/download)[-/]v?)${oldVersion}`, 'gm');

(async () => {
  const data = await readFile(pathToReadme, 'utf8')
  const result = data.replace(regExToReplace, `$1${newVersion}`)
  await writeFile(pathToReadme, result, 'utf8')
})()
