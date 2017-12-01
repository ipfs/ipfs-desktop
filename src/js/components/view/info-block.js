import React from 'react'
import PropTypes from 'prop-types'
import {clipboard} from 'electron'

import TextButton from '../view/text-button'

export default function InfoBlock (props) {
  let info = null

  if (props.pre) {
    if (Array.isArray(props.info)) {
      info = []
      props.info.forEach((element, index) => {
        info.push((<pre key={index}>{element}</pre>))
      })
    } else {
      info = (<pre>{props.info}</pre>)
    }
  } else {
    if (Array.isArray(props.info)) {
      info = []
      props.info.forEach((element, index) => {
        info.push((<p key={index} className='info'>{element}</p>))
      })
    } else {
      info = (<p className='info'>{props.info}</p>)
    }
  }

  let button = null

  if (props.clipboard !== false) {
    let copy = (props.clipboardMessage === true) ? props.info : props.clipboard

    button = (<div className='button-overlay'>
      <TextButton text={props.clipboardMessage} onClick={() => {
        clipboard.writeText(copy)
      }} />
    </div>)
  }

  return (
    <div className='info-block'>
      <div>
        <p className='label'>{props.title}</p>
        {info}
        {button}
      </div>
    </div>
  )
}

InfoBlock.propTypes = {
  title: PropTypes.string.isRequired,
  info: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ]),
  clipboard: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.string
  ]),
  clipboardMessage: PropTypes.string,
  pre: PropTypes.bool
}

InfoBlock.defaultProps = {
  pre: false,
  clipboard: false,
  clipboardMessage: 'Copy'
}
