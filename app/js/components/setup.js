import React from 'react/addons'
import Radium from 'radium'
import ipc from 'electron-safe-ipc/guest'

import Intro from './screens/setup/intro'
import Loader from './loader'

import 'normalize.css'
import 'css-box-sizing-border-box/index.css'
import 'react-widgets/dist/css/react-widgets.css'
import '../../styles/common.css'
import '../../styles/fonts.css'
import '../../styles/setup.less'

const {CSSTransitionGroup} = React.addons

const INTRO = 'intro'
const INTITIALZING = 'initializing'
const ERROR = 'error'

const KEY_SIZES = [2048, 4096]

@Radium
export default class Setup extends React.Component {

  state = {
    status: INTRO,
    error: void 0,
    configPath: '',
    keySize: KEY_SIZES[1]
  }

  _onInitializing = () => {
    this.setState({status: INTITIALZING})
  }

  _onError = error => {
    this.setState({
      status: ERROR,
      error
    })
  }

  _onConfigPath = path => {
    this.setState({configPath: path})
  }

  componentDidMount () {
    ipc.on('initializing', this._onInitializing)
    ipc.on('initialization-error', this._onError)
    ipc.on('setup-config-path', this._onConfigPath)
  }

  componentWillUnmount () {
    ipc.removeListener('initializing', this._onInitializing)
    ipc.removeListener('initialization-error', this._onError)
    ipc.removeListener('setup-config-path', this._onConfigPath)
  }

  _onContinue (event) {
    event.preventDefault()
    console.log('continue')
    ipc.send('initialize')
  }

  _getScreen () {
    switch (this.state.status) {
      case INTRO:
        return (
          <Intro />
        )
      case ERROR:
        return (
          <div>{this.state.error}</div>
        )
      default:
        return <Loader />
    }
  }

  render () {
    return (
      <CSSTransitionGroup transitionName='fade'>
        {this._getScreen()}
      </CSSTransitionGroup>
    )
  }
}
