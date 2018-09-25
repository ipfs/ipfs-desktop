import React, {Component} from 'react'
import PropTypes from 'prop-types'
import fileExtension from 'file-extension'
import prettyBytes from 'pretty-bytes'

import Block from './Block'
import Icon from './Icon'
import IconButton from './IconButton'
import Button from './Button'

const wrapper = (fn) => {
  return (event) => {
    event.preventDefault()
    event.stopPropagation()
    fn()
  }
}

/**
 * Is a File Block.
 *
 * @param {Object} props
 *
 * @prop {String} name - file name
 * @prop {String} date - date when the file was modified/uploaded
 * @prop {String} hash - file's hash in IPFS system
 *
 * @return {ReactElement}
 */
export default class FileBlock extends Component {
  constructor (props) {
    super(props)

    const extension = fileExtension(this.props.name)
    let icon = 'file'

    if (this.props.type === 'directory') {
      icon = 'folder'
    } else if (fileTypes[extension]) {
      icon = fileTypes[extension]
    }

    this.state = {
      icon: icon,
      deleting: false
    }
  }

  open = () => {
    if (this.props.type === 'directory') {
      this.props.navigate(this.props.name, this.props.hash)
    } else {
      this.props.open(this.props.name, this.props.hash)
    }
  }

  copy = wrapper(() => {
    this.props.copy(this.props.hash)
  })

  remove = wrapper(() => {
    this.props.remove(this.props.name)
  })

  delete = wrapper(() => {
    this.setState({ deleting: true })
  })

  undelete = () => {
    this.setState({ deleting: false })
  }

  render () {
    const wrapped = (
      <div>
        <div className='icon'>
          <Icon name={this.state.icon} />
        </div>
        <div>
          <p className='label'>{this.props.name}</p>
          { this.state.deleting &&
            <p className='info'>Are you sure? This is permanent.</p>
          }
          { !this.state.deleting &&
            <p className='info'>{prettyBytes(this.props.size)} | {this.props.hash}</p>
          }
        </div>
      </div>
    )

    let unwrapped = null

    if (this.state.deleting) {
      unwrapped = (
        <div className='button-overlay'>
          <Button text='Cancel' onClick={this.undelete} />
          <Button text='Delete' onClick={this.remove} />
        </div>
      )
    } else {
      unwrapped = (
        <div className='button-overlay'>
          { typeof this.props.copy === 'function' &&
            <IconButton icon='clipboard' onClick={this.copy} />
          }
          { typeof this.props.remove === 'function' &&
            <IconButton icon='trash' color='#F44336' onClick={this.delete} />
          }
        </div>
      )
    }

    let className = 'file'
    if (this.state.deleting) {
      className += ' deleting'
    }

    return (
      <Block
        {...this.props.open !== null && !this.state.deleting && { onClick: this.open }}
        className={className}
        wrapped={wrapped}
        unwrapped={unwrapped} />
    )
  }
}

FileBlock.propTypes = {
  name: PropTypes.string.isRequired,
  hash: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  navigate: PropTypes.func,
  copy: PropTypes.func,
  remove: PropTypes.func,
  type: PropTypes.string,
  open: PropTypes.func
}

FileBlock.defaultProps = {
  type: 'file'
}

const fileTypes = {
  png: 'image',
  jpg: 'image',
  tif: 'image',
  tiff: 'image',
  bmp: 'image',
  gif: 'image',
  eps: 'image',
  raw: 'image',
  cr2: 'image',
  nef: 'image',
  orf: 'image',
  sr2: 'image',
  jpeg: 'image',
  mp3: 'music-alt',
  flac: 'music-alt',
  ogg: 'music-alt',
  oga: 'music-alt',
  aa: 'music-alt',
  aac: 'music-alt',
  m4p: 'music-alt',
  webm: 'music-alt',
  mp4: 'video-clapper',
  mkv: 'video-clapper',
  avi: 'video-clapper',
  asf: 'video-clapper',
  flv: 'video-clapper'
}
