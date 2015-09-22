import React, {PropTypes} from 'react'
import {Block, curry} from 'jsxstyle'

const Button = curry(Block, {
  component: 'button',
  background: 'none',
  border: 'none',
  flex: '1',
  padding: '0 10px',
  textAlign: 'center',
  fontSize: '12px',
  textTransform: 'uppercase'
})

export default class IconButton extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    icon: PropTypes.string,
    onClick: PropTypes.func,
    style: PropTypes.object,
    iconStyle: PropTypes.object
  }

  static defaultProps = {
    name: null,
    icon: '',
    onClick () {},
    style: {},
    iconStyle: {}
  }

  render () {
    const buttonProps = {
      onClick: this.props.onClick
    }

    return (
      <Button props={buttonProps} {...this.props.style}>
        <div
          className={`icon-${this.props.icon}`}
          style={{fontSize: '28px', paddingBottom: '5px', ...this.props.iconStyle}}
          >
        </div>
        {this.props.name}
      </Button>
    )
  }
}
