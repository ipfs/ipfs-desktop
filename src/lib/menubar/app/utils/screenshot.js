import { ipcRenderer, desktopCapturer } from 'electron'

async function streamHandler (format, stream) {
  const track = stream.getVideoTracks()[0]
  const imageCapture = new window.ImageCapture(track)
  const bitmap = await imageCapture.grabFrame()
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height)
  return canvas.toDataURL(format)
}

async function screenshot (format) {
  format = format || 'image/png'

  const sources = await new Promise((resolve, reject) => {
    desktopCapturer.getSources({ types: ['screen'] }, (error, sources) => {
      if (error) return reject(error)
      resolve(sources)
    })
  })

  const output = []

  for (const source of sources) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: source.id,
          minWidth: 1280,
          maxWidth: 4000,
          minHeight: 720,
          maxHeight: 4000
        }
      }
    })

    const image = await streamHandler(format, stream)

    output.push({
      name: source.name,
      image: image
    })
  }

  return output
}

export default function () {
  ipcRenderer.on('screenshot', async () => {
    const out = await screenshot()
    ipcRenderer.send('screenshot', out)
  })
}
