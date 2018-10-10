import React from 'react'
import Button from '../components/button/Button'
import Connection from './connection/Connection'

import GeneralSettings from './general-settings/GeneralSettings'
import shortid from 'shortid'

const TABS = {
  GENERAL: 'general',
  CONNECTIONS: 'connections'
}

export default class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      tab: TABS.GENERAL,
      showNewConnection: false,
      newConnectionId: null
    }
    this.changeTab = this.changeTab.bind(this)
    this.generateTab = this.generateTab.bind(this)
  }

  changeTab (tab) {
    this.setState({ tab })
  }

  componentDidUpdate (prevProps) {
    if (this.props.configs.length !== prevProps.configs.length) {
      this.setState({ newConnectionKey: shortid.generate() })
    }
  }

  generateTab (tab, label) {
    return (
      <a className={`dib pointer tc w-50 ph2 pv3 b ${this.state.tab !== tab ? 'bg-snow' : ''}`}
        onClick={() => this.changeTab(tab)}>{label}</a>
    )
  }

  render () {
    const { tab, showNewConnection, newConnectionId } = this.state
    const { defaultConfig, runningId, configs } = this.props

    return (
      <div className='f6'>
        <div className='flex'>
          {this.generateTab(TABS.GENERAL, 'General')}
          {this.generateTab(TABS.CONNECTIONS, 'Connections')}
        </div>

        { tab === TABS.GENERAL ? (
          <GeneralSettings {...this.props} />
        ) : (
          <div className='pa2'>
            { Object.keys(configs).map(k => {
              return <Connection
                isDefault={defaultConfig === k}
                running={runningId === k}
                key={k}
                id={k} {...configs[k]} />
            })}

            { showNewConnection ? (
              <Connection open isNew onCancel={() => this.setState({
                showNewConnection: false,
                newConnectionId: null
              })} key={newConnectionId} id={newConnectionId} />
            ) : (
              <div className='flex mt2'>
                <Button
                  onClick={() => {
                    this.setState({
                      showNewConnection: true,
                      newConnectionId: shortid.generate()
                    })
                  }}
                  minWidth={0}
                  className='w-100 mr1'
                  title='New Connection'>New Connection</Button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
}
