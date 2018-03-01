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

    this.state = {
      icon: (props.type === 'directory') ? 'folder' : 'document',
      deleting: false
    }
  }

  remove = wrapper(() => {
    this.props.remove(this.props.name)
  })

  delete = wrapper(() => {
    this.setState({ deleting: true })
  })

  undelete = () => {
    this.setState({ deleting: false })
  }

  getContent () {
    if (this.state.deleting) {
      return [
        <p key='question' className='ma0 pv2 w-20'>Are you sure?</p>,
        <div key='actions-delete' className='ml-auto flex'>
          <Icon className='w1-5 mr2 bg-white br-100' color='red' name='tick' onClick={this.props.remove} />
          <Icon className='w1-5 mr2 bg-white br-100' color='red' name='cancel' onClick={this.undelete} />
        </div>
      ]
    }

    return [
      <p key='size' className='ma0 pv2 w-20'>{prettyBytes(this.props.size)}</p>,
      <div key='actions' className='actions ml-auto flex o-0 transition-all'>
        <Icon className='w1-5 mr2 bg-aqua br-100' color='white' name='pencil' />
        <Icon className='w1-5 mr2 bg-aqua br-100' color='white' name='link' onClick={this.props.copy} />
        <Icon className='w1-5 mr2 bg-red br-100' color='white' name='trash' onClick={this.delete} />
      </div>
    ]
  }

  render () {
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
          { typeof this.props.remove === 'function' &&
            <IconButton icon='trash' color='#F44336' onClick={this.delete} />
          }
        </div>
      )
    }

    let className = 'file flex pointer items-center transition-all ph3'
    if (this.props.odd && !this.state.deleting) {
      className += ' bg-snow-muted'
    }

    if (this.state.deleting) {
      className += ' bg-red-muted white'
    } else {
      className += ' hover-navy charcoal-muted'
    }

    return (
      <div {...this.props.open !== null && !this.state.deleting && { onClick: this.props.open }}
        className={className}>

        <Icon stroke className='w1-5 mr2' color={this.state.deleting ? 'white' : 'charcoal-muted'} name={this.state.icon} />
        <p className='ma0 mr2 pv2 w-50 truncate'>{this.props.name}</p>
        {this.getContent()}
      </div>
    )
  }
}

File.propTypes = {
  odd: PropTypes.bool,
  name: PropTypes.string.isRequired,
  hash: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  copy: PropTypes.func,
  remove: PropTypes.func,
  type: PropTypes.string,
  open: PropTypes.func
}

File.defaultProps = {
  odd: false,
  type: 'file'
}
