import React, {Component, PropTypes} from 'react'
import Radium from 'radium'

@Radium
export default class SimpleStat extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    color: PropTypes.string
  }

  static defaultProps = {
    color: '#50d2c2'
  }

  render () {
    const styles = {
      wrapper: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      },
      ring: {
        width: '16px',
        height: '16px',
        borderRadius: '8px',
        border: `3px solid ${this.props.color}`,
        margin: '0 auto'
      },
      label: {
        textTransform: 'uppercase',
        color: 'rgba(0, 0, 0, 0.5)',
        padding: '10px 0 5px',
        fontSize: '13px',
        fontWeight: '500'
      },
      value: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '20px'
      }
    }

    return (
      <div style={styles.wrapper}>
        <div style={styles.ring} />
        <div style={styles.label}>
          {this.props.name}
        </div>
        <div style={styles.value}>
          {this.props.value}
        </div>
      </div>
    )
  }
}
