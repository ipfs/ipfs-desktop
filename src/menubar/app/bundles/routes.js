import { createRouteBundle } from 'redux-bundler'
import Home from '../home/Home'
import Settings from '../settings/Settings'

export default createRouteBundle({
  '/settings': Settings,
  '/': Home,
  '': Home
}, { routeInfoSelector: 'selectHash' })
