/* This is a fallback script used when ipfs cli fails or is not available
 * More details: https://github.com/ipfs-shipyard/ipfs-webui/issues/843
 */
const tar = require('tar')
const request = require('request')
const progress = require('request-progress')

const cid = process.argv[2]
const destination = process.argv[3]

// pick random preloader
const no = Math.round(Math.random()) // 0 or 1
const url = 'https://node' + no + '.preload.ipfs.io/api/v0/get?arg=' + cid + '&archive=true&compress=true'

console.log('Fallback to HTTP GET from: ' + url)

progress(request(url), { lengthHeader: 'x-content-length', delay: 10000 })
  .on('progress', (state) => console.log(`progress: ${Math.round(state.percent)} %, transferred: ${state.size.transferred}`, state))
  .on('response', (response) => console.log('Status Code', response.statusCode))
  .on('error', (error) => console.log('Download Error', error))
  .on('close', () => console.log('Done! webui extracted to: ' + destination))
  .pipe(
    tar.extract({
      strip: 1,
      C: destination
    })
  )
