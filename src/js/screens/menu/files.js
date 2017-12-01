import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {ipcRenderer} from 'electron'
import {NativeTypes} from 'react-dnd-html5-backend'
import {DropTarget} from 'react-dnd'

import Header from '../../components/view/header'
import Footer from '../../components/view/footer'
import File from '../../components/view/file'
import IconButton from '../../components/view/icon-button'

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

class FilesScreen extends Component {
  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    changeRoute: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired,
    files: PropTypes.array
  }

  static defaultProps = {
    files: [],
    onConsoleClick () {},
    onBrowserClick () {}
  }

  render () {
    const {connectDropTarget, isOver, canDrop} = this.props

    const styles = {
      dropper: {
        visibility: (isOver && canDrop) ? 'visible' : 'hidden',
        position: 'fixed',
        top: '0',
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
      }
    }

    let files = this.props.files.map(file => {
      return (<File {...file} />)
    })

    return connectDropTarget(
      <div>
        <Header title='Your Files' />

        <div className='main'>
          {files}
        </div>

        <div style={styles.dropper}>
          Drop to upload to IPFS
        </div>

        <Footer>
          <IconButton onClick={() => { this.props.changeRoute('info') }} icon='pulse' />

          <div className='right'>
            <IconButton onClick={() => {}} icon='plus' />
            <IconButton onClick={() => {}} icon='folder' />
          </div>
        </Footer>
      </div>
    )
  }
}

export default DropTarget(NativeTypes.FILE, fileTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(FilesScreen)
