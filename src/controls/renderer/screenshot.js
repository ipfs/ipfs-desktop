import { ipcRenderer, desktopCapturer } from 'electron'

function screenshot (format) {
  format = format || 'image/png'

  return new Promise((resolve, reject) => {
    let handleStream = (stream) => {
      // Create hidden video tag
      var video = document.createElement('video')
      video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;'

      // Event connected to stream
      video.onloadedmetadata = function () {
        // Set video ORIGINAL height (screenshot)
        video.style.height = this.videoHeight + 'px'
        video.style.width = this.videoWidth + 'px'

        // Create canvas
        var canvas = document.createElement('canvas')
        canvas.width = this.videoWidth
        canvas.height = this.videoHeight
        var ctx = canvas.getContext('2d')
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
    }

    // Filter only screen type
    desktopCapturer.getSources({
      types: ['screen']
    }, (error, sources) => {
      if (error) throw error
      // console.log(sources);
      for (let i = 0; i < sources.length; ++i) {
        // Filter: main screen
        if (sources[i].name === 'Entire screen') {
          navigator.webkitGetUserMedia({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: sources[i].id,
                minWidth: 1280,
                maxWidth: 4000,
                minHeight: 720,
                maxHeight: 4000
              }
            }
          }, handleStream, reject)

          return
        }
      }
    })
  })
}

export default function () {
  ipcRenderer.on('screenshot', () => {
    screenshot()
      .then(image => {
        ipcRenderer.send('screenshot', image)
      })
  })
}
