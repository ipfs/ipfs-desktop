import React from 'react'
import PropTypes from 'prop-types'

export default function Button (props) {
  const styles = {
    color: 'rgba(0, 0, 0, .7)',
    border: 'none',
    backgroundColor: 'white',
    width: '100%',
    padding: '10px',
    transition: 'color 0.3s ease-in-out',
    fontWeight: '600',
    textAlign: 'center',
    borderRadius: '2px',
    cursor: 'pointer',
    ':hover': {
      color: 'rgba(0, 0, 0, 1)'
    },
    ':focus': {
      outline: 'none'
    },
    ...props.style
  }

  return (
    <button style={styles} onClick={props.onClick}>
      {props.children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  style: PropTypes.object
}

Button.defaultProps = {
  onClick () {},
  style: {}
}
