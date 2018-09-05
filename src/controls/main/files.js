import {ipcMain} from 'electron'
import uploadFiles from '../utils/upload-files'
import { logger } from '../../utils'

function basename (path) {
  const parts = path.split('/')
  parts.pop()
  return parts.join('/') || '/'
}

function sort (a, b) {
  if (a.type === 'directory' && b.type !== 'directory') {
    return -1
  } else if (b.type === 'directory' && a.type !== 'directory') {
    return 1
  }

  return a.name > b.name
}

async function listAndSend (opts, root) {
  const {ipfs, send} = opts

  try {
    const files = await ipfs().files.ls(root)

    const res = (await Promise.all(files.map(file => (
      ipfs().files.stat([root, file.name].join('/'))
        .then(stats => Object.assign({}, file, stats))
    )))).sort(sort)

    send('files', {
      root: root,
      contents: res
    })
  } catch (e) {
    logger.error(e.stack)
  }
}

function list (opts) {
  return (_, root) => {
    listAndSend(opts, root)
  }
}

function createDirectory (opts) {
  const { ipfs } = opts

  return async (_, path) => {
    try {
      await ipfs().files.mkdir(path, {parents: true})
      listAndSend(opts, basename(path))
    } catch (e) {
      logger.error(e.stack)
    }
  }
}

function remove (opts) {
  const { ipfs } = opts

  return async (_, path) => {
    try {
      await ipfs().files.rm(path, {recursive: true})
      listAndSend(opts, basename(path))
    } catch (e) {
      logger.error(e.stack)
    }
  }
}

function move (opts) {
  const { ipfs } = opts

  return async (_, from, to) => {
    try {
      await ipfs().files.mv([from, to])
      listAndSend(opts, basename(to))
    } catch (e) {
      logger.error(e.stack)
    }
  }
}

function addByPath (opts) {
  const { ipfs } = opts

  return async (_, hash, path) => {
    if (!hash.startsWith('/ipfs') && !hash.startsWith('/ipns')) {
      hash = `/ipfs/${hash}`
    }

    try {
      await ipfs().files.cp([hash, path])
      listAndSend(opts, basename(path))
    } catch (e) {
      logger.error(e.stack)
    }
  }
}

export default function (opts) {
  const { menubar } = opts

  ipcMain.on('request-files', list(opts))
  ipcMain.on('create-directory', createDirectory(opts))
  ipcMain.on('remove-file', remove(opts))
  ipcMain.on('move-file', move(opts))
  ipcMain.on('add-by-path', addByPath(opts))

  ipcMain.on('drop-files', uploadFiles(opts))
  menubar.tray.on('drop-files', uploadFiles(opts))
}
