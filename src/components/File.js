import React, {Component} from 'react'
import PropTypes from 'prop-types'
import prettyBytes from '../utils/pretty-bytes'

import Icon from './Icon'
import IconButton from './IconButton'
import Button from './Button'

const wrapper = (fn) => {
  return (event) => {
    event.preventDefault()
    event.stopPropagation()
    fn()
  }
}

/**
 * Is a File Block.
 *
 * @param {Object} props
 *
 * @prop {String} name - file name
 * @prop {String} date - date when the file was modified/uploaded
 * @prop {String} hash - file's hash in IPFS system
 *
 * @return {ReactElement}
 */
export default class File extends Component {
  constructor (props) {
    super(props)

    let icon = 'document'

    if (this.props.type === 'directory') {
      icon = 'folder'
    }

    this.state = {
      icon: icon,
      deleting: false
    }
  }

  open = () => {
    if (this.props.type === 'directory') {
      this.props.navigate(this.props.name, this.props.hash)
    } else {
      this.props.open(this.props.name, this.props.hash)
    }
  }

  copy = wrapper(() => {
    this.props.copy(this.props.hash)
  })

  remove = wrapper(() => {
    this.props.remove(this.props.name)
  })

  delete = wrapper(() => {
    this.setState({ deleting: true })
  })

  undelete = () => {
    this.setState({ deleting: false })
  }

  render () {
    const wrapped = (
      <div>
        <div>
          <p className='label'>{this.props.name}</p>
          { this.state.deleting &&
            <p className='info'>Are you sure? This is permanent.</p>
          }
          { !this.state.deleting &&
            <p className='info'>{prettyBytes(this.props.size)} | {this.props.hash}</p>
          }
        </div>
      </div>
    )

    let unwrapped = null

    if (this.state.deleting) {
      unwrapped = (
        <div className='button-overlay'>
          <Button text='Cancel' onClick={this.undelete} />
          <Button text='Delete' onClick={this.remove} />
        </div>
      )
    } else {
      unwrapped = (
        <div className='button-overlay'>
          { typeof this.props.copy === 'function' &&
            <IconButton icon='clipboard' onClick={this.copy} />
          }
          { typeof this.props.remove === 'function' &&
            <IconButton icon='trash' color='#F44336' onClick={this.delete} />
          }
        </div>
      )
    }

    let className = 'flex pointer charcoal-muted items-center hover-bg-aqua-muted hover-navy transition-all ph3'
    if (this.props.odd) {
      className += ' bg-snow-muted'
    }

    return (
      <div {...this.props.open !== null && !this.state.deleting && { onClick: this.open }}
        className={className}>

        <Icon stroke className='w1 mr3' color='charcoal-muted' name={this.state.icon} />
        <p className='ma0 pv2 w-40'>{this.props.name}</p>
        <p className='ma0 pv2 w-15'>{prettyBytes(this.props.size)}</p>

      </div>
    )
  }
}

File.propTypes = {
  odd: PropTypes.bool,
  name: PropTypes.string.isRequired,
  hash: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  navigate: PropTypes.func,
  copy: PropTypes.func,
  remove: PropTypes.func,
  type: PropTypes.string,
  open: PropTypes.func
}

File.defaultProps = {
  odd: false,
  type: 'file'
}
