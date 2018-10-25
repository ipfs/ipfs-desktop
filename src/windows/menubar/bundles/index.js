import { composeBundles } from 'redux-bundler'
import electron from '../../common/bundles/electron'
import ipfs from './ipfs'

export default composeBundles(
  electron,
  ipfs
)
