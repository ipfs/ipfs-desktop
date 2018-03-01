import {ipcRenderer, clipboard} from 'electron'

const wrap = (fn) => {
  return (event) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    fn()
  }
}

export const getHashCopier = (hash) => wrap(() => {
  clipboard.writeText(`https://ipfs.io/ipfs/${hash}`)
})

export const getOpener = (hash) => (event) => {
  if (event) event.stopPropagation()
  ipcRenderer.send('open-url', `https://ipfs.io/ipfs/${hash}`)
}
