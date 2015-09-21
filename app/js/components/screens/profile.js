import React, {PropTypes} from 'react'
import {Flex, Block, Inline} from 'jsxstyle'

import SimpleStat from '../simple-stat'

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
          <SimpleStat
            name='peers'
            value={this.props.peers}
            color='#50d2c2'
            />
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
