const { app } = require('electron')

const electronAppReady = async () => {
  const sugar = app.whenReady()
  const event = new Promise((resolve, reject) => {
    app.on('ready', (event, info) => {
      resolve({ event, info })
    })
  })
  await Promise.race([sugar, event])
  return await event // app.whenReady() returns void
}

module.exports = electronAppReady
