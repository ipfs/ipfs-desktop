import path from 'path'
import fs from 'fs'

function join (...parts) {
  const replace = new RegExp('/{1,}', 'g')
  return parts.join('/').replace(replace, '/')
}

function clean (files, root) {
  const res = []

  files.forEach((file) => {
    const stat = fs.lstatSync(file)
    const dst = join(root, path.basename(file))

    if (stat.isDirectory()) {
      const files = clean(fs.readdirSync(file).map(f => path.join(file, f)), dst)
      res.push({dir: true, dst: dst}, ...files)
    } else {
      res.push({
        dst: dst,
        src: file
      })
    }
  })

  return res
}

export default function uploadFiles (opts) {
  let {ipfs, debug, send} = opts
  let adding = 0

  const sendAdding = () => { send('adding', adding > 0) }
  const inc = () => { adding++; sendAdding() }
  const dec = () => { adding--; sendAdding() }

  return (event, files, root = '/') => {
    debug('Uploading files', {files})
    files = clean(files, root)

    inc()
    Promise.all(files.map(file => {
      if (file.dir) {
        return ipfs().files.mkdir(file.dst)
      }

      return ipfs().files.write(file.dst, file.src, {create: true})
    })).then(() => {
      dec()
      send('files-updated')
    }).catch((e) => {
      debug(e.stack)
    })
  }
}
