/** @type {import('aegir/types').PartialOptions} */
module.exports = {
  build: {
    config: {
      platform: 'node',
      format: 'cjs',
      external: [
        'esprima',
        'node-gyp'
      ]
    }
  }
}
