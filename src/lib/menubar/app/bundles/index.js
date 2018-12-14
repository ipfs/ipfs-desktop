import { composeBundles } from 'redux-bundler'
import electron from './electron'
import ipfs from './ipfs'

export default composeBundles(
  electron,
  ipfs
)
