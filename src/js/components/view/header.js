import React from 'react'
import PropTypes from 'prop-types'

/**
 * Is a Pane's Header.
 *
 * @param {Object} props
 *
 * @prop {String} title       - The title of the pane
 * @prop {String} [subtitle]  - Subtitle of the pane
 * @prop {Node}   [children]  - Header children (e.g.: buttons)
 * @prop {Bool}   [loading]   - Show a loading animation
 *
 * @return {ReactElement}
 */
export default function Header (props) {
  let className = 'header'
  if (props.loading) {
    className += ' loading'
  }

  return (
    <div className={className}>
      <div>
        <p className='title'>{props.title}</p>
        { props.subtitle !== '' &&
          <p className='subtitle'>{props.subtitle}</p>
        }
      </div>
      <div>
        {props.children}
      </div>
    </div>
  )
}

Header.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  loading: PropTypes.bool,
  subtitle: PropTypes.string
}

Header.defaultProps = {
  title: '',
  loading: false,
  subtitle: ''
}
