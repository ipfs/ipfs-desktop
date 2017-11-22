import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Radium from 'radium'
import {DropdownList} from 'react-widgets'

import Icon from './icon'

class IconDropdownList extends Component {
  static propTypes = {
    icon: PropTypes.string.isRequired,
    data: PropTypes.array,
    onChange: PropTypes.func,
    defaultValue: PropTypes.any
  }

  static defaultProps = {
    data: [],
    onChange () {}
  }

  render () {
    const styles = {
      icon: {
        position: 'absolute',
        marginTop: '10px',
        marginLeft: '20px',
        fontSize: '20px'
      }
    }
    return (
      <div>
        <Icon
          name={this.props.icon}
          style={styles.icon}
          />
        <DropdownList
          data={this.props.data}
          defaultValue={this.props.defaultValue}
          onChange={this.props.onChange}
          />
      </div>
    )
  }
}

export default Radium(IconDropdownList)
