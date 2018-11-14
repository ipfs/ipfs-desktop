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

    if (action.type === 'IPFS_REPO_SIZE' && state.current !== null) {
      return {
        ...state,
        current: {
          ...state.current,
          repoSize: action.payload
        }
      }
    }

    return state
  },

  selectIpfsIsRunning: state => !!state.ipfs.current,

  selectCurrentConfig: state => state.ipfs.current,

  doIpfsStartListening: () => async ({ dispatch }) => {
    ipcRenderer.on('ipfs.started', (_, id, addresses) => {
      dispatch({
        type: 'IPFS_STARTED',
        payload: { id, addresses, peers: 0 }
      })
    })

    ipcRenderer.on('ipfs.stopped', () => {
      dispatch({ type: 'IPFS_STOPPED' })
    })

    ipcRenderer.on('peersCount', (_, count) => {
      dispatch({ type: 'IPFS_PEERS', payload: count })
    })

    ipcRenderer.on('repoSize', (_, size) => {
      dispatch({ type: 'IPFS_REPO_SIZE', payload: size })
    })

    ipcRenderer.send('ipfs.running')
  },

  doIpfsToggle: () => async ({ store }) => {
    if (store.selectIpfsIsRunning()) {
      ipcRenderer.send('ipfs.stop')
    } else {
      ipcRenderer.send('ipfs.start')
    }
  },

  init: store => {
    store.doIpfsStartListening()
  }
}

export default bundle
