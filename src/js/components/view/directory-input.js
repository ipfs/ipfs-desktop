import React from 'react'
import PropTypes from 'prop-types'
import {ipcRenderer} from 'electron'

import Icon from './icon'

const onClick = (e) => {
  e.preventDefault()
  ipcRenderer.send('setup-browse-path')
}

export default function DirectoryInput (props) {
  return (
    <div>
      <div className='directory-input'>
        <Icon name='folder' />
        <a onClick={onClick} >
          {props.path}
        </a>
      </div>
    </div>
  )
}

DirectoryInput.propTypes = {
  path: PropTypes.string.isRequired
}

DirectoryInput.defaultProps = {
  placeholder: '',
  disabled: false
}
