import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {ipcRenderer} from 'electron'
import {NativeTypes} from 'react-dnd-html5-backend'
import {DropTarget} from 'react-dnd'

import SimpleStat from '../../components/view/simple-stat'
import IconButton from '../../components/view/icon-button'
import Header from '../../components/view/header'
import Icon from '../../components/view/icon'

const fileTarget = {
  drop (props, monitor) {
    const files = monitor.getItem().files
    const filesArray = []
    for (let i = 0; i < files.length; i++) {
      filesArray.push(files[i].path)
    }

    ipcRenderer.send('drop-files', filesArray)
  }
}

class ProfileScreen extends Component {
  static propTypes = {
    peers: PropTypes.number,
    location: PropTypes.string,
    onStopClick: PropTypes.func,
    onConsoleClick: PropTypes.func,
    onBrowserClick: PropTypes.func,
    onCloseClick: PropTypes.func,
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired
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

  render () {
    const {connectDropTarget, isOver, canDrop} = this.props

    const styles = {
      dropper: {
        visibility: (isOver && canDrop) ? 'visible' : 'hidden',
        background: 'rgba(255, 255, 255, 0.8)',
        position: 'absolute',
        top: '40px',
        left: 0,
        right: 0,
        bottom: '70px',
        height: '100%',
        width: '100%',
        color: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      },
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
        backgroundImage: `url('../img/stars.png')`,
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

    return connectDropTarget(
      <div style={styles.wrapper}>
        <div style={styles.dropper}>
          Drop to upload to IPFS
        </div>
        <Header onCloseClick={this.props.onCloseClick} />
        <div style={styles.image}>
          <Icon
            name='location'
            style={{padding: '10px 0', fontSize: '32px'}}
          />
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

export default DropTarget(NativeTypes.FILE, fileTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(ProfileScreen)
