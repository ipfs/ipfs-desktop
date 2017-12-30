import React, {Component} from 'react'
import PropTypes from 'prop-types'

import IconButton from '../view/icon-button'

/**
 * Is a New Pinned Hash form.
 *
 * @prop {Function} onSubmit - the on submit handler.
 * @prop {Bool}     hidden - should the box be hidden?
 */
export default class NewPinnedHash extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    hidden: PropTypes.bool.isRequired
  }

  state = {
    tag: '',
    hash: ''
  }

  /**
   * KeyUp event handler.
   * @param {Event} event
   * @returns {Void}
   */
  keyUp = (event) => {
    if (event.keyCode === 13) {
      event.preventDefault()
      this.submit()
    }
  }

  /**
   * Tag change event handler.
   * @param {Event} event
   * @returns {Void}
   */
  tagChange = (event) => {
    this.setState({tag: event.target.value})
  }

  /**
   * Hash change event handler.
   * @param {Event} event
   * @returns {Void}
   */
  hashChange = (event) => {
    this.setState({hash: event.target.value})
  }

  /**
   * Resets the hash and tag.
   * @returns {Void}
   */
  reset = () => {
    this.setState({
      hash: '',
      tag: ''
    })
  }

  /**
   * Submits the hash and tag.
   * @returns {Void}
   */
  submit = () => {
    const {hash, tag} = this.state

    if (hash) {
      this.props.onSubmit(hash, tag)
      this.reset()
    } else {
      this.hashInput.focus()
    }
  }

  componentDidUpdate (prevProps) {
    if (!this.props.hidden && prevProps.hidden) {
      this.tagInput.focus()
    }

    if (this.props.hidden && !prevProps.hidden) {
      this.reset()
    }
  }

  /**
   * Render function.
   * @returns {ReactElement}
   */
  render () {
    let className = 'info-block new-pinned'
    if (this.props.hidden) {
      className += ' hide'
    }

    return (
      <div className={className}>
        <div className='wrapper'>
          <div>
            <input
              type='text'
              className='label'
              placeholder='Untagged'
              ref={(input) => { this.tagInput = input }}
              onChange={this.tagChange}
              onKeyUp={this.keyUp}
              value={this.state.tag} />
            <input
              type='text'
              className='info'
              ref={(input) => { this.hashInput = input }}
              onChange={this.hashChange}
              onKeyUp={this.keyUp}
              value={this.state.hash}
              placeholder='Hash' />
          </div>
          <div className='right'>
            <IconButton icon='check' onClick={this.submit} />
          </div>
        </div>
      </div>
    )
  }
}
