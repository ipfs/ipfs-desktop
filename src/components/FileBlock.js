import React from 'react'
import PropTypes from 'prop-types'
import fileExtension from 'file-extension'
import prettyBytes from 'pretty-bytes'

import Block from './Block'
import Icon from './Icon'
import IconButton from './IconButton'

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
export default function FileBlock (props) {
  const extension = fileExtension(props.name)
  let icon = 'file'

  if (props.type === 'directory') {
    icon = 'folder'
  } else if (fileTypes[extension]) {
    icon = fileTypes[extension]
  }

  const open = () => {
    if (props.type === 'directory') {
      props.navigate(props.name, props.hash)
    } else {
      props.open(props.name, props.hash)
    }
  }

  const copy = wrapper(() => { props.copy(props.hash) })
  const remove = wrapper(() => { props.remove(props.name) })

  const wrapped = (
    <div>
      <div className='icon'>
        <Icon name={icon} />
      </div>
      <div>
        <p className='label'>{props.name}</p>
        <p className='info'>{prettyBytes(props.size)} | {props.hash}</p>
      </div>
    </div>
  )

  const unwrapped = (
    <div className='button-overlay'>
      { typeof props.copy === 'function' &&
        <IconButton icon='clipboard' onClick={copy} />
      }
      { typeof props.remove === 'function' &&
        <IconButton icon='trash' onClick={remove} />
      }
    </div>
  )

  return (
    <Block
      {...props.open !== null && { onClick: open }}
      className='file'
      wrapped={wrapped}
      unwrapped={unwrapped} />
  )
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
