import { composeBundles } from 'redux-bundler'
import ipfs from './ipfs'
import redirects from './redirects'
import routes from './routes'
import settings from './settings'

export default composeBundles(
  routes,
  redirects,
  ipfs,
  settings
)
