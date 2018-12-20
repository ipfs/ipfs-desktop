import { ipcRenderer, desktopCapturer } from 'electron'

async function streamHandler (format, stream) {
  return new Promise((resolve, reject) => {
    // Create hidden video tag
    const video = document.createElement('video')
    video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;'

    // Event connected to stream
    video.onloadedmetadata = function () {
      // Set video ORIGINAL height (screenshot)
      video.style.height = this.videoHeight + 'px'
      video.style.width = this.videoWidth + 'px'

      // Create canvas
      const canvas = document.createElement('canvas')
      canvas.width = this.videoWidth
      canvas.height = this.videoHeight
      const ctx = canvas.getContext('2d')
      // Draw video on canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Remove hidden video tag
      video.remove()
      try {
        // Destroy connect to stream
        stream.getTracks()[0].stop()
        resolve(canvas.toDataURL(format))
      } catch (e) {
        reject(e)
      }
    }

    video.src = window.URL.createObjectURL(stream)
    document.body.appendChild(video)
  })
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
