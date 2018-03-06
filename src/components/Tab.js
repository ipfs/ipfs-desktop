import React from 'react'
import PropTypes from 'prop-types'

export default function Tab (props) {
  let classList = 'button-reset outline-0 pointer ph3 pv2 bn '
  if (props.active) {
    classList += 'bg-white black-80'
  } else {
    classList += 'bg-transparent charcoal-muted'
  }

  return <button className={classList} onClick={props.onClick}>{props.children}</button>
}

Tab.propTypes = {
  children: PropTypes.any.isRequired,
  onClick: PropTypes.func,
  active: PropTypes.bool
}

Tab.defaultProps = {
  onClick: () => {}
}
