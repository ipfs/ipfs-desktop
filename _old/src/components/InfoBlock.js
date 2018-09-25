import React from 'react'
import PropTypes from 'prop-types'
import Button from './Button'
import Block from './Block'

/**
 * Is an information block.
 *
 * @param {Object} props
 *
 * @prop {(String|Array)} info                  - information to be shown
 * @prop {String}         title                 - title describing the info
 * @prop {Function}       [onClick]             - triggered when clicking the button or the block
 * @prop {Bool}           [button=true]         - sets 'onClick' to be triggered when clicking a button.
 *                                                Otherwise it triggeres when clicking the whole block.
 * @prop {String}         [buttonMessage=Copy]  - sets the button message.
 *
 * @return {ReactElement}
 */
export default function InfoBlock (props) {
  let info = null

  if (Array.isArray(props.info)) {
    info = []
    props.info.forEach((element, index) => {
      info.push((<p key={index} className='info'>{element}</p>))
    })
  } else {
    info = (<p className='info'>{props.info}</p>)
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
    <Block
      {...clickable && {onClick: props.onClick}}
      unwrapped={button}
      wrapped={(
        <div>
          <p className='label'>{props.title}</p>
          {info}
        </div>
      )} />
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
  buttonMessage: PropTypes.string
}

InfoBlock.defaultProps = {
  button: true,
  buttonMessage: 'Copy',
  onClick: null
}
