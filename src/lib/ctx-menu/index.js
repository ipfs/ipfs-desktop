export default () => {
  switch (process.platform) {
    case 'win32':
    case 'win64':
      return require('./windows').default
    case 'darwin':
      return require('./macos').default
    default:
      return require('./linux').default
  }
}
