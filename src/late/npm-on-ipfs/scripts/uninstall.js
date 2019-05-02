const { revert } = require('../../../utils/scripts/backup')
const which = require('which')
const argv = require('yargs').argv

const npm = which.sync('npm', { nothrow: true })
if (!npm) {
  revert(argv.data, 'npm', npm)
}

const yarn = which.sync('yarn', { nothrow: true })
if (!yarn) {
  revert(argv.data, 'yarn', yarn)
}
