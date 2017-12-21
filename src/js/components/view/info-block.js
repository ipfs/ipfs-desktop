import React from 'react'
import PropTypes from 'prop-types'

import Button from '../view/button'

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

  if (props.onClick) {
    if (props.button) {
      button = (<div className='button-overlay'>
        <Button text={props.buttonMessage} onClick={props.onClick} />
      </div>)
    }
  }

  let clickable = props.onClick && !props.button

  return (
    <div className={`info-block${clickable ? ' clickable' : ''}`} {...clickable && { onClick: props.onClick }}>
      <div>
        <p className='label'>{props.title}</p>
        {info}
        {button}
      </div>
    </div>
  )
}

InfoBlock.propTypes = {
  info: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ]).isRequired,
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  button: PropTypes.bool,
  buttonMessage: PropTypes.string,
  pre: PropTypes.bool
}

InfoBlock.defaultProps = {
  pre: false,
  button: true,
  buttonMessage: 'Copy',
  onClick: null
}
