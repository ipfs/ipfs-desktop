import React from 'react'
import PropTypes from 'prop-types'

/**
 * Is a Pane's Header.
 *
 * @param {Object} props
 *
 * @prop {String|Node} title       - The title of the pane
 * @prop {String|Node} [subtitle]  - Subtitle of the pane
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
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node)
  ]).isRequired,
  subtitle: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node)
  ]).isRequired,
  children: PropTypes.node,
  loading: PropTypes.bool
}

Header.defaultProps = {
  title: '',
  loading: false,
  subtitle: ''
}
