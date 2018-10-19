import { createRouteBundle } from 'redux-bundler'
import Home from '../home/Home'
import Settings from '../settings/Settings'

export default createRouteBundle({
  '/settings/general': Settings,
  '/settings/backends': Settings,
  '/settings/backends/new': Settings,
  '/': Home,
  '': Home
}, { routeInfoSelector: 'selectHash' })
