import path from 'path'

function join (...parts) {
  const replace = new RegExp('/{1,}', 'g')
  return parts.join('/').replace(replace, '/')
}

let adding = 0

async function add (files, root, ipfs) {
  for (const file of files) {
    const res = await ipfs().add([file], {recursive: true, wrap: true})
    const f = res[res.length - 1]
    const src = `/ipfs/${f.hash}`
    const dst = join(root, path.basename(f.path))

    await ipfs().files.cp([src, dst])
  }
}

export default function uploadFiles (opts) {
  let {ipfs, debug, send} = opts

  const sendAdding = () => { send('adding', adding > 0) }
  const inc = () => { adding++; sendAdding() }
  const dec = () => { adding--; sendAdding() }

  const anyway = () => {
    dec()
    send('files-updated')
  }

  return (event, files, root = '/') => {
    debug('Uploading files', {files})
    inc()

    add(files, root, ipfs)
      .then(anyway)
      .catch((e) => { anyway(); debug(e.stack) })
  }
}
