import React from 'react'
import PropTypes from 'prop-types'
import {clipboard} from 'electron'
import moment from 'moment'
import fileExtension from 'file-extension'

import TextButton from './text-button'
import Icon from './icon'

export default function File (props) {
  const extension = fileExtension(props.name)
  let icon = 'file'
  if (fileTypes[extension]) {
    icon = fileTypes[extension]
  }

  return (
    <div className='info-block file'>
      <div>
        <div className='icon'>
          <Icon name={icon} />
        </div>
        <div>
          <p className='label'>{props.name}</p>
          <p className='info'>{moment(props.date).fromNow()}</p>
        </div>
        <div className='button-overlay'>
          <TextButton text='Copy Link' onClick={() => {
            clipboard.writeText(`https://ipfs.io/ipfs/${props.hash}`)
          }} />
        </div>
      </div>
    </div>
  )
}

File.propTypes = {
  name: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  hash: PropTypes.string.isRequired
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
