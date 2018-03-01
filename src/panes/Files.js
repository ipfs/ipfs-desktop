import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {ipcRenderer} from 'electron'
import {NativeTypes} from 'react-dnd-html5-backend'
import {DropTarget} from 'react-dnd'
import {getHashCopier, getOpener} from '../utils/event-handlers'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Button from '../components/Button'
import File from '../components/File'
import Breadcrumbs from '../components/Breadcrumbs'
import Tab from '../components/Tab'

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
  static propTypes = {
    // Drop Files
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired,
    // Actual Props
    adding: PropTypes.bool,
    files: PropTypes.array.isRequired,
    root: PropTypes.string.isRequired,
    changeRoute: PropTypes.func.isRequired
  }

  selectFileDialog = (event) => {
    ipcRenderer.send('open-file-dialog', this.props.root)
  }

  selectDirectoryDialog = (event) => {
    ipcRenderer.send('open-dir-dialog', this.props.root)
  }

  getNavigator = (name) => () => {
    const root = join(this.props.root, name)
    ipcRenderer.send('request-files', root)
  }

  getRemover = (name) => () => {
    name = join(this.props.root, name)
    ipcRenderer.send('remove-file', name)
  }

  makeBreadcrumbs = () => {
    const navigate = (root) => { ipcRenderer.send('request-files', root) }

    return <Breadcrumbs navigate={navigate} path={this.props.root} />
  }

  getFiles () {
    const files = this.props.files.filter((file) => {
      return !(file.name === '.pinset' && this.props.root === '/')
    })

    if (files.length === 0) {
      return <p className='notice'>
        You do not have any files yet. Add your first one by dropping
        it here or clicking on one of the buttons on the bottom right side.
      </p>
    }

    return files.map((file, index) => {
      let open
      if (file.type === 'directory') {
        open = this.getNavigator(file.name)
      } else {
        open = getOpener(file.hash)
      }

      return (
        <File
          odd={index % 2 === 0 /* it starts with 0 */}
          name={file.name}
          hash={file.hash}
          type={file.type}
          key={`${file.hash}${file.name}`}
          size={file.cumulativeSize}
          remove={this.getRemover(file.name)}
          open={open}
          copy={getHashCopier(file.hash)}
        />
      )
    })
  }

  render () {
    const {connectDropTarget, isOver, canDrop} = this.props

    const dropper = {
      visibility: (isOver && canDrop) ? 'visible' : 'hidden'
    }

    return connectDropTarget(
      <div className='files relative h-100 flex flex-column justify-between mh4 mv0 flex-grow-1'>
        <Header />

        <div>
          <Tab active>Recent files</Tab>
          <Tab onClick={() => { this.props.changeRoute('pins') }}>Pinned files</Tab>
        </div>

        <div className='bg-white w-100 pv2 ph3'>
          {this.makeBreadcrumbs()}
        </div>

        <div className='bg-white w-100 flex-grow-1 overflow-y-scroll'>
          {this.getFiles()}
        </div>

        <div className='dropper' style={dropper}>
          Drop to upload to IPFS
        </div>

        <Footer>
          <div className='right'>
            <Button className='mr2' onClick={this.selectFileDialog}>Add file</Button>
            <Button onClick={this.selectDirectoryDialog}>Add folder</Button>
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
}))(Files)
