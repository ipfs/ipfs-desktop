import React, {PropTypes} from 'react'
import Radium from 'radium'

import Icon from '../../icon'
import Button from '../../button'
import DirectoryInput from '../../directory-input'

@Radium
export default class Intro extends React.Component {

  static propTypes = {
    onInstallClick: PropTypes.func,
    configPath: PropTypes.string
  }

  static defaultProps = {
    onInstallClick () {},
    configPath: ''
  }

  render () {
    const styles = {
      base: {
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundImage: `url(${require('../../../../img/jellyfish-blur.png')})`,
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
        <div>
          <DirectoryInput path={this.props.configPath}/>
        </div>
        <Button style={styles.button} onClick={this.props.onInstallClick}>
          <Icon name='download' style={styles.icon}/> Install IPFS
        </Button>
      </div>
    )
  }
}
