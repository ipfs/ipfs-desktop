import React from 'react'
import PropTypes from 'prop-types'
import fs from 'fs'

function getSVG (pkg, stroke) {
  const path = `./node_modules/ipfs-css/icons/${stroke ? 'stroke' : 'glyph'}_${pkg}.svg`

  if (fs.existsSync(path)) {
    return fs.readFileSync(path)
  } else {
    return fs.readFileSync(path.replace(stroke ? 'stroke' : 'glyph', stroke ? 'glyph' : 'stroke'))
  }
}

/**
 * Is an Icon.
 *
 * @param {Object} props
 *
 * @prop {String} name
 * @prop {String} color
 *
 * @return {ReactElement}
 */
export default function Icon (props) {
  let style = {}
  if (props.color) {
    style.color = props.color
  }

  const options = Object.assign({}, props, {
    stroke: undefined,
    className: undefined,
    name: undefined,
    color: undefined
  })

  return <div
    {...options}
    className={`${props.color ? 'fill-' + props.color : ''} ${props.className}`}
    dangerouslySetInnerHTML={{__html: getSVG(props.name, props.stroke)}} />
}

Icon.propTypes = {
  stroke: PropTypes.bool,
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  color: PropTypes.string
}

Icon.defaultProps = {
  className: '',
  stroke: false
}
