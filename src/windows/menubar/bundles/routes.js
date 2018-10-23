import { createRouteBundle } from 'redux-bundler'
import Home from '../home/Home'

export default createRouteBundle({
  '/': Home,
  '': Home
}, { routeInfoSelector: 'selectHash' })
