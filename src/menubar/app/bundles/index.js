import { composeBundles } from 'redux-bundler'
import electron from './electron'
import ipfs from './ipfs'
import redirects from './redirects'
import routes from './routes'
import settings from './settings'

export default composeBundles(
  electron,
  routes,
  redirects,
  ipfs,
  settings
)
