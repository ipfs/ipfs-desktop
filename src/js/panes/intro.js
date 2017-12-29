import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {ipcRenderer} from 'electron'

import Pane from '../components/view/pane'
import Button from '../components/view/button'
import Icon from '../components/view/icon'
import IconDropdownList from '../components/view/icon-dropdown-list'

export default class Intro extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showAdvanced: false
    }
  }

  static propTypes = {
    onInstallClick: PropTypes.func,
    configPath: PropTypes.string,
    keySizes: PropTypes.arrayOf(PropTypes.number),
    keySize: PropTypes.number,
    onKeySizeChange: PropTypes.func
  }

  static defaultProps = {
    onInstallClick () {},
    configPath: '',
    keySizes: [],
    keySize: 0,
    onKeySizeChange () {}
  }

  onAdvancedClick = () => {
    this.setState({ showAdvanced: true })
  }

  onClick = (e) => {
    e.preventDefault()
    ipcRenderer.send('setup-browse-path')
  }

  render () {
    let advanced = null
    if (this.state.showAdvanced) {
      advanced = ([
        <div className='directory-input'>
          <Icon name='folder' />
          <a onClick={this.onClick} >
            {this.props.configPath}
          </a>
        </div>,
        <IconDropdownList
          icon='key'
          data={this.props.keySizes}
          defaultValue={this.props.keySize}
          onChange={this.props.onKeySizeChange}
        />
      ])
    }

    return (
      <Pane class='intro'>
        <div className='main'>
          <div>
            <p className='title'>Welcome to the Distributed Web</p>
            <p className='subtitle'>You are about to install IPFS, the InterPlanetary File System.</p>
          </div>
          <div>
            {advanced}
          </div>
          <div>
            <Button text='Install IPFS' onClick={this.props.onInstallClick} />
            { !this.state.showAdvanced &&
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
