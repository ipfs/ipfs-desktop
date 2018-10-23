import React from 'react'
import Button from '../../common/components/button/Button'
import Connection from '../components/connection/Connection'
import { connect } from 'redux-bundler-react'

const BackendsSettings = ({ doUpdateHash, settings: { configs, defaultConfig } }) => (
  <div className='pa2'>
    { Object.keys(configs).map(k => {
      return <Connection
        isDefault={defaultConfig === k}
        key={k}
        id={k} {...configs[k]} />
    })}

    <div className='flex mt2'>
      <Button
        onClick={() => doUpdateHash('/backends/new')}
        minWidth={0}
        className='w-100 mr1'
        title='New Backend'>New Backend</Button>
    </div>
  </div>
)

export default connect(
  'selectSettings',
  'doUpdateHash',
  BackendsSettings
)
