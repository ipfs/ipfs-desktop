import React, {PropTypes} from 'react'
import ipc from 'electron-safe-ipc/guest'

export default class DirectoryInput extends React.Component {

  static propTypes = {
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    onChange: PropTypes.func
  }

  static defaultProps = {
    placeholder: '',
    disabled: false,
    onChange () {}
  }

  state = {
    value: '',
    styles: {
      parent: {
        position: 'relative'
      },
      file: {
        position: 'absolute',
        top: 0,
        left: 0,
        opacity: 0,
        width: '100%',
        zIndex: 2
      },
      text: {
        position: 'relative',
        zIndex: 1
      }
    }
  }

  _onClick = e => {
    e.preventDefault()

    ipc.send('setup-browse-path')
  }

  render () {
    return (
      <div style={this.state.styles.parent}>
        <input
          type='text'
          value={this.state.value}
          disabled={this.props.disabled}
          style={this.state.styles.text}
          />
        <button
          onClick={this._onClick}
          >
          Browse
        </button>
      </div>
    )
  }
}
