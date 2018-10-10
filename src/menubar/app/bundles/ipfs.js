import { ipcRenderer } from 'electron'

const defaultState = {
  current: null,
  prev: null
}

const bundle = {
  name: 'ipfs',

  reducer: (state = defaultState, action) => {
    if (!action.type.startsWith('IPFS_')) {
      return state
    }

    if (action.type === 'IPFS_STARTED') {
      return {
        ...state,
        current: action.payload
      }
    }

    if (action.type === 'IPFS_STOPPED') {
      return {
        ...state,
        current: null,
        prev: state.current
      }
    }

    if (action.type === 'IPFS_PEERS' && state.current !== null) {
      return {
        ...state,
        current: {
          ...state.current,
          peers: action.payload
        }
      }
    }

    return state
  },

  selectIpfsIsRunning: state => !!state.ipfs.current,

  selectCurrentConfig: state => state.ipfs.current,

  selectPreviousConfig: state => state.ipfs.prev,

  doIpfsStartListening: () => async ({ dispatch }) => {
    ipcRenderer.on('ipfs.started', (_, configId, id, addresses) => {
      dispatch({
        type: 'IPFS_STARTED',
        payload: { configId, id, addresses, peers: 0 }
      })
    })

    ipcRenderer.on('ipfs.stopped', () => {
      dispatch({ type: 'IPFS_STOPPED' })
    })

    ipcRenderer.on('peersCount', (_, count) => {
      dispatch({ type: 'IPFS_PEERS', payload: count })
    })

    ipcRenderer.send('ipfs.running')
  },

  doIpfsToggle: () => async ({ store }) => {
    if (store.selectIpfsIsRunning()) {
      ipcRenderer.send('ipfs.stop')
    } else {
      ipcRenderer.send('ipfs.start')
    }
  }
}

export default bundle
