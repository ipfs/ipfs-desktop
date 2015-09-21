import React, {PropTypes} from 'react'
import {Flex, Inline, curry} from 'jsxstyle'

import 'normalize.css'
import 'css-box-sizing-border-box/index.css'
import '../../../styles/common.css'
import '../../../styles/fonts.css'

const StartButton = curry(Inline, {
  component: 'button',
  color: '#000000',
  border: 'none',
  backgroundColor: 'white',
  width: '100%',
  padding: '10px'
})

export default class StartScreen extends React.Component {

  static propTypes = {
    onStartClick: PropTypes.func
  }

  static defaultProps = {
    onStartClick () {}
  }

  render () {
    return (
      <Flex
        width='100%'
        height='100%'
        backgroundColor='#19b5fe'
        color='#FFFFFF'
        flexDirection='column'
        alignItems='center'
        padding='20'
        >
        <Inline textAlign='center' marginBottom='20px'>
          IPFS
        </Inline>
        <Flex flex='1' margin='40px 0' flexDirection='column'>
          <image
           src={require('file!../../../img/offline-icon.png')}
           width='64'
           height='64'
           style={{margin: '0 auto'}}
        />
        <Inline padding='40px 0' textAlign='center'>
          Oh snap, it looks like your node<br/>
          is not running yet. Let’s change<br/>
          that by clicking that button
        </Inline>
        </Flex>
        <StartButton props={{onClick: this.props.onStartClick}}>
          Start Node
        </StartButton>
      </Flex>
    )
  }
}
