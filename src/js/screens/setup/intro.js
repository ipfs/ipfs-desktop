import React, {Component} from 'react'
import PropTypes from 'prop-types'

import PaneContainer from '../../components/view/pane-container'
import Pane from '../../components/view/pane'
import Heartbeat from '../../components/view/heartbeat'
import Button from '../../components/view/button'
import DirectoryInput from '../../components/view/directory-input'
import IconDropdownList from '../../components/view/icon-dropdown-list'

export default class Intro extends Component {
  constructor (props) {
    super(props)
    this.state = {showAdvanced: false}
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

  render () {
    let advanced = null
    if (this.state.showAdvanced) {
      advanced = ([
        <DirectoryInput path={this.props.configPath} />,
        <IconDropdownList
          icon='key'
          data={this.props.keySizes}
          defaultValue={this.props.keySize}
          onChange={this.props.onKeySizeChange}
        />
      ])
    }

    return (
      <PaneContainer>
        <Pane class='intro left-pane'>
          <Heartbeat />
        </Pane>
        <Pane class='intro right-pane'>
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
      </PaneContainer>
    )
  }
}
