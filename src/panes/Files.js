import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {ipcRenderer, clipboard} from 'electron'
import {NativeTypes} from 'react-dnd-html5-backend'
import {DropTarget} from 'react-dnd'

import Pane from '../components/Pane'
import Header from '../components/Header'
import Footer from '../components/Footer'
import IconButton from '../components/IconButton'
import FileBlock from '../components/FileBlock'
import Breadcrumbs from '../components/Breadcrumbs'

function join (...parts) {
  const replace = new RegExp('/{1,}', 'g')
  return parts.join('/').replace(replace, '/')
}

const fileTarget = {
  drop (props, monitor, component) {
    const files = monitor.getItem().files
    const filesArray = []
    for (let i = 0; i < files.length; i++) {
      filesArray.push(files[i].path)
    }

    ipcRenderer.send('drop-files', filesArray, component.props.root)
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
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired,
    adding: PropTypes.bool,
    files: PropTypes.array.isRequired,
    root: PropTypes.string.isRequired
  }

  selectFileDialog = (event) => {
    ipcRenderer.send('open-file-dialog', this.props.root)
  }

  selectDirectoryDialog = (event) => {
    ipcRenderer.send('open-dir-dialog', this.props.root)
  }

  toggleStickWindow = (event) => {
    ipcRenderer.send('toggle-sticky')
  }

  open = (name, hash) => {
    ipcRenderer.send('open-url', `https://ipfs.io/ipfs/${hash}`)
  }

  navigate = (name) => {
    const root = join(this.props.root, name)
    ipcRenderer.send('request-files', root)
  }

  trash = (name) => {
    name = join(this.props.root, name)
    ipcRenderer.send('remove-file', name)
  }

  onSticky = (event, sticky) => {
    this.setState({ sticky: sticky })
  }

  copy = (hash) => {
    clipboard.writeText(`https://ipfs.io/ipfs/${hash}`)
  }

  componentDidMount () {
    ipcRenderer.on('sticky-window', this.onSticky)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('sticky-window', this.onSticky)

    if (this.state.sticky) this.toggleStickWindow()
  }

  makeBreadcrumbs = () => {
    const navigate = (root) => { ipcRenderer.send('request-files', root) }

    return <Breadcrumbs navigate={navigate} path={this.props.root} />
  }

  render () {
    const {connectDropTarget, isOver, canDrop} = this.props

    const dropper = {
      visibility: (isOver && canDrop) ? 'visible' : 'hidden'
    }

    let files = this.props.files.filter((file) => {
      return !(file.name === '.pinset' && this.props.root === '/')
    }).map((file) => {
      return (
        <FileBlock
          name={file.name}
          hash={file.hash}
          type={file.type}
          key={`${file.hash}${file.name}`}
          size={file.cumulativeSize}
          remove={this.trash}
          open={this.open}
          copy={this.copy}
          navigate={this.navigate}
        />
      )
    })

    if (files.length === 0) {
      files = (
        <p className='notice'>
          You do not have any files yet. Add your first one by dropping
          it here or clicking on one of the buttons on the bottom right side.
        </p>
      )
    }

    return connectDropTarget(
      <div>
        <Pane className='files'>
          <Header title={this.makeBreadcrumbs()} loading={this.props.adding} />

          <div className='main'>
            {files}
          </div>

          <div className='dropper' style={dropper}>
            Drop to upload to IPFS
          </div>

          <Footer>
            <IconButton active={this.state.sticky} onClick={this.toggleStickWindow} icon='eye' />

            <div className='right'>
              <IconButton onClick={this.selectFileDialog} icon='plus' />
              <IconButton onClick={this.selectDirectoryDialog} icon='folder' />
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
