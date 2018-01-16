import {ipcMain} from 'electron'
import uploadFiles from '../utils/upload-files'

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

function listAndSend (opts, root) {
  const {debug, ipfs, send} = opts

  ipfs().files.ls(root)
    .then(files => {
      Promise.all(files.map(file => {
        return ipfs().files.stat([root, file.name].join('/'))
          .then(stats => Object.assign({}, file, stats))
      }))
        .then(res => res.sort(sort))
        .then(res => send('files', {
          root: root,
          contents: res
        }))
        .catch(e => { debug(e.stack) })
    })
}

function list (opts) {
  return (event, root) => {
    listAndSend(opts, root)
  }
}

function createDirectory (opts) {
  const {ipfs, debug} = opts

  return (event, path) => {
    ipfs().files.mkdir(path, {parents: true})
      .then(() => { listAndSend(opts, basename(path)) })
      .catch(e => { debug(e.stack) })
  }
}

function remove (opts) {
  const {ipfs, debug} = opts

  return (event, path) => {
    ipfs().files.rm(path, {recursive: true})
      .then(() => { listAndSend(opts, basename(path)) })
      .catch(e => { debug(e.stack) })
  }
}

function move (opts) {
  const {ipfs, debug} = opts

  return (event, from, to) => {
    ipfs().files.mv([from, to])
      .then(() => { listAndSend(opts, basename(to)) })
      .catch(e => { debug(e.stack) })
  }
}

export default function (opts) {
  const {menubar} = opts

  ipcMain.on('request-files', list(opts))
  ipcMain.on('create-directory', createDirectory(opts))
  ipcMain.on('remove-file', remove(opts))
  ipcMain.on('move-file', move(opts))

  ipcMain.on('drop-files', uploadFiles(opts))
  menubar.tray.on('drop-files', uploadFiles(opts))
}
