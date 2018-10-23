import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'redux-bundler-react'
import App from './App'
import getStore from './bundles'

ReactDOM.render(
  <Provider store={getStore()}>
    <App />
  </Provider>, document.getElementById('root'))
