import React, {Component, PropTypes} from 'react'
import Radium from 'radium'

import Button from '../../components/view/button'
import Header from '../../components/view/header'

import 'normalize.css'
import 'css-box-sizing-border-box/index.css'
import '../../../styles/common.less'
import '../../../styles/fonts.less'

@Radium
export default class StartScreen extends Component {

  static propTypes = {
    onStartClick: PropTypes.func,
    onCloseClick: PropTypes.func
  }

  static defaultProps = {
    onStartClick () {},
    onCloseClick () {}
  }

  render () {
    const styles = {
      wrapper: {
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: '#19b5fe',
        color: '#FFFFFF',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 20 20'
      },
      content: {
        display: 'flex',
        flex: '1',
        margin: '40px 0',
        flexDirection: 'column'
      },
      text: {
        padding: '40px 0',
        textAlign: 'center'
      }
    }

    return (
      <div style={styles.wrapper}>
        <Header onCloseClick={this.props.onCloseClick} />
        <div style={styles.content}>
          <image
            src={require('../../../img/offline-icon.png')}
            width='64'
            height='64'
            style={{margin: '0 auto'}}
          />
          <div style={styles.text}>
            Oh snap, it looks like your node<br />
            is not running yet. Let’s change<br />
            that by clicking that button
          </div>
        </div>
        <Button onClick={this.props.onStartClick}>
          Start Node
        </Button>
      </div>
    )
  }
}
