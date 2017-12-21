import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {ipcRenderer} from 'electron'
import {NativeTypes} from 'react-dnd-html5-backend'
import {DropTarget} from 'react-dnd'

import Pane from '../components/view/pane'
import Header from '../components/view/header'
import Footer from '../components/view/footer'
import File from '../components/view/file'
import IconButton from '../components/view/icon-button'

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

class Files extends Component {
  constructor (props) {
    super(props)
    this.state = {
      sticky: false
    }
  }

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

  _selectFileDialog (event) {
    ipcRenderer.send('open-file-dialog')
  }

  _selectDirectoryDialog (event) {
    ipcRenderer.send('open-dir-dialog')
  }

  _toggleStickWindow = (event) => {
    ipcRenderer.send('toggle-sticky')
  }

  _onSticky = (event, sticky) => {
    this.setState({ sticky: sticky })
  }

  componentDidMount () {
    ipcRenderer.on('sticky-window', this._onSticky)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('sticky-window', this._onSticky)
    if (this.state.sticky) this._toggleStickWindow()
  }

  render () {
    const {connectDropTarget, isOver, canDrop} = this.props

    const dropper = {
      visibility: (isOver && canDrop) ? 'visible' : 'hidden'
    }

    const files = this.props.files.map(file => {
      return (<File {...file} />)
    })

    return connectDropTarget(
      <div>
        <Pane class='left-pane files'>
          <Header title='Your Files' />

          <div className='main'>
            {files}
          </div>

          <div className='dropper' style={dropper}>
            Drop to upload to IPFS
          </div>

          <Footer>
            <IconButton onClick={() => { this.props.changeRoute('peers') }} icon='pulse' />
            <IconButton active={this.state.sticky} onClick={this._toggleStickWindow} icon='eye' />

            <div className='right'>
              <IconButton onClick={this._selectFileDialog} icon='plus' />
              <IconButton onClick={this._selectDirectoryDialog} icon='folder' />
            </div>
          </Footer>
        </Pane>
      </div>
    )
  }
}

export default DropTarget(NativeTypes.FILE, fileTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(Files)
