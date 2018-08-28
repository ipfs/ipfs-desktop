import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {ipcRenderer} from 'electron'

import Pane from '../components/Pane'
import Button from '../components/Button'
import Icon from '../components/Icon'
import IconDropdownList from '../components/IconDropdownList'

export default class Intro extends Component {
  static propTypes = {
    onInstallClick: PropTypes.func,
    configPath: PropTypes.string
  }

  static defaultProps = {
    onInstallClick () {},
    configPath: '',
    keySizes: [],
    keySize: 0,
    onKeySizeChange () {}
  }

  state = {
    advanced: false,
    type: 'Embedded',
    engine: 'Go',
    keysize: 4096,
    apiAddress: ''
  }

  onTypeChange = type => { this.setState({ type }) }

  onEngineChange = engine => { this.setState({ engine }) }

  onKeySizeChange = keysize => { this.setState({ keysize }) }

  handleApiAddressInput = event => { this.setState({ apiAddress: event.target.value })}

  onAdvancedClick = () => {
    this.setState({ advanced: true })
  }

  onClick = (e) => {
    e.preventDefault()
    ipcRenderer.send('setup-browse-path')
  }

  onInstall = () => {
    const settings = {}

    if (this.state.type === 'Embedded') {
      settings.type = this.state.engine.toLowerCase()
      if (settings.type === 'javascript') {
        settings.type = 'proc'
      }

      settings.path = this.props.configPath
      settings.flags = ['--routing=dhtclient']
      settings.keysize = this.state.keysize
    } else {
      settings.type = 'api'
      settings.apiAddress = this.state.apiAddress
    }

    this.props.onInstallClick(settings)
  }

  render () {
    return (
      <Pane className='intro'>
        <div className='main'>
          <div>
            <p className='title'>Welcome to the Distributed Web</p>
            <p className='subtitle'>You are about to install IPFS, the InterPlanetary File System.</p>
          </div>
          { this.state.advanced &&
            <div>
              <IconDropdownList
                icon='wand'
                data={['Embedded', 'External']}
                defaultValue={'Embedded'}
                onChange={this.onTypeChange}
              />

              { this.state.type === 'Embedded'
                ? (
                  <div>
                    <IconDropdownList
                      icon='package'
                      data={['Go', 'JavaScript']}
                      defaultValue={'Go'}
                      onChange={this.onEngineChange}
                    />

                    <div className='directory-input'>
                      <Icon name='folder' />
                      <a onClick={this.onClick} >
                        {this.props.configPath}
                      </a>
                    </div>

                    <IconDropdownList
                      icon='key'
                      data={[2048, 4096]}
                      defaultValue={this.state.keysize}
                      onChange={this.onKeySizeChange}
                    />
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>Please insert the API address of the node you want to connect to:</p>
                    <input
                      onChange={this.handleApiAddressInput}
                      style={{ width: '100%', borderRadius: '0.2rem', border: 0, outline: 0, padding: '0.5em 1em' }}
                      type='text' />
                  </div>
                )
              }
            </div>
          }
          <div>
            <Button text='Install IPFS' onClick={this.onInstall} />
            { !this.state.advanced &&
              <a className='advanced-options' onClick={this.onAdvancedClick} >
                Advanced Options
              </a>
            }
          </div>
        </div>
      </Pane>
    )
  }
}
