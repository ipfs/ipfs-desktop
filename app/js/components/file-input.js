import React, {PropTypes} from 'react'

export default class FileInput extends React.Component {

  static propTypes = {
    value: PropTypes.string,
    name: PropTypes.string,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    directory: PropTypes.bool,
    disabled: PropTypes.bool,
    accept: PropTypes.string,
    onChange: PropTypes.func
  }

  static defaultProps = {
    value: '',
    name: '',
    className: '',
    placeholder: '',
    directory: false,
    disabled: false,
    accept: '',
    onChange () {}
  }

  state = {
    value: this.props.value,
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

  componentDidMount () {
    if (this.props.directory) {
      const input = this.refs.fileInput.getDOMNode()
      input.setAttribute('directory', true)
      input.setAttribute('webkitdirectory', true)
    }
  }

  _onChange = e => {
    this.setState({
      value: e.target.value.split(/(\\|\/)/g).pop()
    })

    this.props.onChange(e)
  }

  render () {
    return (
      <div style={this.state.styles.parent}>
        <input
          type='file'
          ref='fileInput'
          name={this.props.name}
          className={this.props.className}
          multiple={this.props.directory}
          onChange={this._onChange}
          disabled={this.props.disabled}
          accept={this.props.accept}
          style={this.state.styles.file}
          />
        <input
          type='text'
          tabIndex='-1'
          name={this.props.name + '_filename'}
          value={this.state.value}
          className={this.props.className}
          onChange={() => {}}
          placeholder={this.props.placeholder}
          disabled={this.props.disabled}
          style={this.state.styles.text}
          />
      </div>
    )
  }
}
