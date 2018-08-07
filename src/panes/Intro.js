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
    configPath: PropTypes.string,
    keySizes: PropTypes.arrayOf(PropTypes.number),
    defaultKeySize: PropTypes.number
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
    keysize: 2048
  }

  onTypeChange = type => { this.setState({ type }) }

  onEngineChange = engine => { this.setState({ engine }) }

  onKeySizeChange = keysize => { this.setState({ keysize }) }

  onAdvancedClick = () => {
    this.setState({ advanced: true })
  }

  onClick = (e) => {
    e.preventDefault()
    ipcRenderer.send('setup-browse-path')
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
                      data={this.props.keySizes}
                      defaultValue={this.props.defaultKeySize}
                      onChange={this.onKeySizeChange}
                    />
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>Please insert the API address of the node you want to connect to:</p>
                    <input
                      style={{ width: '100%', borderRadius: '0.2rem', border: 0, outline: 0, padding: '0.5em 1em' }}
                      type='text' />
                  </div>
                )
              }
            </div>
          }
          <div>
            <Button text='Install IPFS' onClick={this.props.onInstallClick} />
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
