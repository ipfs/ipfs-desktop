import React from 'react'
import PropTypes from 'prop-types'

export default function IconButton (props) {
  const styles = {
    button: {
      color: 'rgba(255, 255, 255, 0.8)',
      background: 'none',
      border: 'none',
      flex: '1',
      padding: '0 10px',
      textAlign: 'center',
      fontSize: '12px',
      textTransform: 'uppercase',
      transition: 'color 0.3s ease-in-out',
      cursor: 'pointer',
      ':focus': {
        outline: 'none'
      },
      ':hover': {
        color: 'rgba(255, 255, 255, 1)',
        cursor: 'pointer'
      },
      ...props.style
    }
  }

  return (
    <button onClick={props.onClick} style={styles.button}>
      <div
        className={`icon-${props.icon}`}
        style={{fontSize: '28px', paddingBottom: '5px', ...props.iconStyle}} />
      {props.name}
    </button>
  )
}

IconButton.propTypes = {
  name: PropTypes.string,
  icon: PropTypes.string,
  onClick: PropTypes.func,
  style: PropTypes.object,
  iconStyle: PropTypes.object
}

IconButton.defaultProps = {
  name: null,
  icon: '',
  onClick () {},
  style: {},
  iconStyle: {}
}
