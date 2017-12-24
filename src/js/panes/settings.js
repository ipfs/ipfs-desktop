import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {ipcRenderer} from 'electron'

import Pane from '../components/view/Pane'
import Header from '../components/view/header'
import Footer from '../components/view/footer'
import IconButton from '../components/view/icon-button'

const options = [
  'screenshotShortcut'
]

export default class Settings extends Component {
  constructor (props) {
    super(props)
    this.state = {
      screenshotShortcut: false
    }
  }

  static propTypes = {
    changeRoute: PropTypes.func.isRequired
  }

  goToInfo = () => {
    this.props.changeRoute('info')
  }

  _onSettingValue = (event, key, value) => {
    this.setState({ key: value })
  }

  componentDidMount () {
    ipcRenderer.on('setting-update', this._onSettingValue)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('setting-update', this._onSettingValue)
  }

  render () {
    return (
      <Pane class={'node right-pane'}>
        <Header title='Settings' />

        <div className='main'>
          <input type='checkbox' id='screenshotShortcut' value={this.state.screenshotShortcut} />
          <label htmlFor='screenshotShortcut'>Screenshot Shortcut</label>
        </div>

        <Footer>
          <div className='right'>
            <IconButton onClick={this.goToInfo} icon='ti-info' />
          </div>
        </Footer>
      </Pane>
    )
  }
}
