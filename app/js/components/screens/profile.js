import React, {PropTypes} from 'react'
import FileDrop from 'react-file-drop'
import ipc from 'electron-safe-ipc/guest'
import Radium from 'radium'

import SimpleStat from '../simple-stat'
import IconButton from '../icon-button'
import Header from '../header'
import Icon from '../icon'

import 'normalize.css'
import 'css-box-sizing-border-box/index.css'
import '../../../styles/common.less'
import '../../../styles/fonts.less'
import '../../../styles/file-drop.less'

@Radium
export default class ProfileScreen extends React.Component {

  static propTypes = {
    peers: PropTypes.number,
    location: PropTypes.string,
    onStopClick: PropTypes.func,
    onConsoleClick: PropTypes.func,
    onBrowserClick: PropTypes.func,
    onSettingsClick: PropTypes.func,
    onCloseClick: PropTypes.func
  }

  static defaultProps = {
    peers: 0,
    location: '',
    onStopClick () {},
    onConsoleClick () {},
    onBrowserClick () {},
    onSettingsClick () {},
    onCloseClick () {}
  }

  _onFileDrop = (files, event) => {
    const filesArray = []
    for (let i = 0; i < files.length; i++) {
      filesArray.push(files[i].path)
    }

    ipc.send('drop-files', null, filesArray)
  }

  render () {
    const styles = {
      wrapper: {
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: '#19b5fe',
        color: '#FFFFFF',
        flexDirection: 'column',
        alignItems: 'center'
      },
      image: {
        display: 'flex',
        flex: '1',
        color: '#FFFFFF',
        backgroundImage: `url(${require('../../../img/stars.png')})`,
        backgroundSize: 'cover',
        backgroundPosition: '0 0',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      },
      stats: {
        display: 'flex',
        flex: '1',
        backgroundColor: '#FFFFFF',
        color: '#000000',
        width: '100%',
        height: '30%',
        justifyContent: 'space-around'
      },
      footer: {
        display: 'flex',
        height: '70px',
        justifyContent: 'space-around',
        width: '100%'
      }
    }

    return (
      <div style={styles.wrapper}>
        <FileDrop
          onDrop={this._onFileDrop}
          />
        <Header onCloseClick={this.props.onCloseClick}/>
        <div style={styles.image}>
          <Icon name='location' style={{padding: '10px 0', fontSize: '32px'}}/>
          <div style={{margin: '0 auto'}}>
            {this.props.location}
          </div>
        </div>
        <div style={styles.stats}>
          <SimpleStat
            name='peers'
            value={this.props.peers}
            color='#50d2c2'
            />
        </div>
        <div style={styles.footer}>
          <IconButton
            name='Console'
            icon='gaming'
            onClick={this.props.onConsoleClick}
            />
          <IconButton
            name='Browser'
            icon='window'
            onClick={this.props.onBrowserClick}
            />
          <IconButton
            name='Stop'
            icon='media-stop'
            onClick={this.props.onStopClick}
            />
        </div>
      </div>
    )
  }
}
