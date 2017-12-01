import React from 'react'
import PropTypes from 'prop-types'
import {clipboard} from 'electron'
import moment from 'moment'

import TextButton from './text-button'
import Icon from './icon'

const fileTypes = {
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  mp3: 'music-alt',
  mp4: 'video-clapper'
}

export default function File (props) {
  let icon = 'file'
  let extension = props.name.split('.').pop()
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
