const ipfsApi = require('ipfs-api')

const urlParams = new URLSearchParams(window.location.search)
const apiAddress = urlParams.get('api')

window.ipfs = ipfsApi(apiAddress)
