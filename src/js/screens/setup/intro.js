import React, {Component} from 'react'
import PropTypes from 'prop-types'

import Heartbeat from '../../components/view/heartbeat'
import TextButton from '../../components/view/text-button'
import Header from '../../components/view/header'
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
          icon='lock'
          data={this.props.keySizes}
          defaultValue={this.props.keySize}
          onChange={this.props.onKeySizeChange}
        />
      ])
    }

    return (
      <div className='intro' style={{display: 'flex'}}>
        <div className='panel left-panel'>
          <Heartbeat />
        </div>
        <div className='panel right-panel'>
          <Header title='Welcome' subtitle='to IPFS' />
          <div className='main'>
            <div>
              {advanced}
            </div>
            <div>
              <TextButton text='Install IPFS' onClick={this.props.onInstallClick} />
              { !this.state.showAdvanced &&
                <a onClick={this.onAdvancedClick} >
                  Advanced Options
                </a>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}
