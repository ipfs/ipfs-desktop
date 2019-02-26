import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'redux-bundler-react'
import { ipcRenderer } from 'electron'
import App from './App'
import getStore from './bundles'
import registerScreenshot from './utils/screenshot'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../../utils/i18n'

ReactDOM.render(
  <Provider store={getStore()}>
    <I18nextProvider i18n={i18n} >
      <App />
    </I18nextProvider>
  </Provider>, document.getElementById('root'))

ipcRenderer.on('languageUpdated', (_, lang) => {
  i18n.changeLanguage(lang)
})

registerScreenshot()
