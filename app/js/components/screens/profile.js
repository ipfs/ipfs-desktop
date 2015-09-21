import React, {PropTypes} from 'react'
import {Flex, Block, Inline} from 'jsxstyle'

import 'normalize.css'
import 'css-box-sizing-border-box/index.css'
import '../../../styles/common.css'
import '../../../styles/fonts.css'

export default class ProfileScreen extends React.Component {

  static propTypes = {
    peers: PropTypes.number
  }

  static defaultProps = {
    peers: 0
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
        >
        <Inline textAlign='center' marginBottom='20px'>
          IPFS
        </Inline>
        <Flex
          flex='1'
          background-color='#FFFFFF'
          color='#000000'
          width='100%'
          height='30%'
          justifyContent='space-around'
          >
          <Flex flexDirection='column' justifyContent='center'>
            <Block
              width='20px'
              height='20px'
              borderRadius='10px'
              border='3px solid #50d2c2'
              margin='0 auto'
              />
            <Block
              textTransform='uppercase'
              color='rgba(0, 0, 0, 0.5)'
              padding='10px 0'>
              peers
            </Block>
            <Block textAlign='center'>
              {this.props.peers}
            </Block>
          </Flex>
        </Flex>
        <Flex
          height='60px'
          justifyContent='space-around'
          width='100%'
          >
          <Block flex='1' padding='0 10px'>
            Console
          </Block>
          <Block flex='1' padding='0 10px'>
            Browser
          </Block>
          <Block flex='1' padding='0 10px'>
            Settings
          </Block>
        </Flex>
      </Flex>
    )
  }
}
