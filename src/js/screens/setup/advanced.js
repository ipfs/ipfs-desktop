import React, {Component, PropTypes} from 'react'
import Radium from 'radium'

import Icon from '../../components/view/icon'
import Button from '../../components/view/button'
import DirectoryInput from '../../components/view/directory-input'
import IconDropdownList from '../../components/view/icon-dropdown-list'

class Intro extends Component {

  static propTypes = {
    onInstallClick: PropTypes.func,
    configPath: PropTypes.string,
    keySizes: PropTypes.arrayOf(PropTypes.number),
    keySize: PropTypes.number,
    onKeySizeChange: PropTypes.func
  }

  static defaultProps = {
    onInstallClick () {},
    configPath: '',
    keySizes: [],
    keySize: 0,
    onKeySizeChange () {}
  }

  render () {
    const styles = {
      base: {
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundImage: `url('../img/jellyfish-blur.png')`,
        backgroundSize: '100%',
        backgroundPosition: '0 0',
        color: '#FFFFFF',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20',
        justifyContent: 'space-between'
      },
      headline: {
        textAlign: 'center',
        marginBottom: '20px',
        fontSize: '38px'
      },
      inputs: {
        flex: '0 0 110px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      },
      button: {
        width: '300px',
        marginBottom: '30px'
      },
      icon: {
        display: 'inline',
        color: '#19b5fe',
        marginRight: '10px',
        fontSize: '20px'
      }
    }

    return (
      <div style={styles.base}>
        <span style={styles.headline}>
          Advanced Options
        </span>
        <div style={styles.inputs}>
          <DirectoryInput path={this.props.configPath} />
          <IconDropdownList
            icon='lock'
            data={this.props.keySizes}
            defaultValue={this.props.keySize}
            onChange={this.props.onKeySizeChange}
            />
        </div>
        <Button style={styles.button} onClick={this.props.onInstallClick}>
          <Icon name='download' style={styles.icon} /> Install IPFS
        </Button>
      </div>
    )
  }
}

export default Radium(Intro)
