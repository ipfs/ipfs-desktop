import { composeBundles } from 'redux-bundler'
import electron from '../../common/bundles/electron'
import ipfs from './ipfs'
import redirects from './redirects'
import routes from './routes'

export default composeBundles(
  electron,
  routes,
  redirects,
  ipfs
)
