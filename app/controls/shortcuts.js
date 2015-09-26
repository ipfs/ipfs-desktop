import globalShortcut from 'global-shortcut'

globalShortcut.register('ctrl+alt+d', () => {
  console.log('ctrl+alt+d is pressed')
  // check if node is on, if it is, download the file
})

globalShortcut.register('ctrl+alt+u', () => {
  console.log('ctrl+alt+u is pressed')
  // upload files selected
})

// TODO future

globalShortcut.register('ctrl+alt+s', () => {
  console.log('ctrl+alt+s is pressed')
  // screenshot the screen
})

globalShortcut.register('ctrl+alt+p', () => {
  console.log('ctrl+alt+p is pressed')
  // screenshot part of the screen
})
