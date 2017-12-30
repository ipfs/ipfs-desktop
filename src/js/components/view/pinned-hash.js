import React from 'react'
import PropTypes from 'prop-types'
import {ipcRenderer} from 'electron'

import Button from './button'

/**
 * Is a Pinned Hash.
 *
 * @param {Object} props
 *
 * @prop {String}   tag       - The hash tag
 * @prop {String}   hash      - The hash
 * @prop {Function} onChange  - On tag change handler
 *
 * @return {ReactElement}
 */
export default function PinnedHash (props) {
  return (
    <div className='info-block'>
      <div className='wrapper'>
        <div>
          <input
            type='text'
            className='label'
            onChange={props.onChange}
            value={props.tag}
            placeholder='Write here to add a tag' />
          <p className='info'>{props.hash}</p>
        </div>
      </div>
      <div className='button-overlay'>
        <Button text='Unpin' onClick={() => {
          ipcRenderer.send('unpin-hash', props.hash)
        }} />
      </div>
    </div>
  )
}

PinnedHash.propTypes = {
  tag: PropTypes.string.isRequired,
  hash: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}
