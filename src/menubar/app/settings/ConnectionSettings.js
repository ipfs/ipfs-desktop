import React from 'react'
import Button from '../components/button/Button'
import Connection from './Connection'
import { connect } from 'redux-bundler-react'

const ConnectionSettings = ({ currentConfig, doUpdateHash, settings: { configs, defaultConfig } }) => (
  <div className='pa2'>
    { Object.keys(configs).map(k => {
      return <Connection
        isDefault={defaultConfig === k}
        running={currentConfig && currentConfig.configId === k}
        key={k}
        id={k} {...configs[k]} />
    })}

    <div className='flex mt2'>
      <Button
        onClick={() => doUpdateHash('/settings/connections/new')}
        minWidth={0}
        className='w-100 mr1'
        title='New Connection'>New Connection</Button>
    </div>
  </div>
)

export default connect(
  'selectCurrentConfig',
  'selectSettings',
  'doUpdateHash',
  ConnectionSettings
)

/*

NEW conn

 { showNewConnection ? (
    <Connection open isNew onCancel={() => this.setState({
      showNewConnection: false,
      newConnectionId: null
    })} key={newConnectionId} id={newConnectionId} />
  ) : (
  
  )}

*/
