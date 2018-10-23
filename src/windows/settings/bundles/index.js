import { composeBundles } from 'redux-bundler'
import electron from '../../common/bundles/electron'
import redirects from './redirects'
import routes from './routes'
import settings from './settings'

export default composeBundles(
  electron,
  routes,
  redirects,
  settings
)
