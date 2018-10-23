import { createRouteBundle } from 'redux-bundler'

import GeneralSettings from '../general/General'
import BackendsSettings from '../backend/Backend'
import NewBackend from '../new-backend/NewBackend'

export default createRouteBundle({
  '/general': GeneralSettings,
  '/backends': BackendsSettings,
  '/backends/new': NewBackend,
  '/': GeneralSettings,
  '': GeneralSettings
}, { routeInfoSelector: 'selectHash' })
