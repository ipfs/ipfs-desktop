import { ipcRenderer } from 'electron'

const bundle = {
  name: 'settings',

  reducer: (state = {}, action) => {
    if (!action.type.startsWith('SETTINGS_')) {
      return state
    }

    if (action.type === 'SETTINGS_CHANGED') {
      return action.payload
    }

    return state
  },

  selectSettings: state => state.settings,

  doSettingsStartListening: () => async ({ dispatch }) => {
    ipcRenderer.on('config.changed', (_, config) => {
      dispatch({
        type: 'SETTINGS_CHANGED',
        payload: config
      })
    })

    ipcRenderer.send('config.get')
  }
}

export default bundle
