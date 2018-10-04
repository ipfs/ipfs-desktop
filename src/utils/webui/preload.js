// This preload script creates the window.ipfs object with
// the apiAddress in the URL.
const urlParams = new URLSearchParams(window.location.search)
const apiAddress = urlParams.get('api')

// Inject api address
window.localStorage.setItem('ipfsApi', apiAddress)
